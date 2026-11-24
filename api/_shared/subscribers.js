/**
 * ODIPA Subscriber Store, Azure Table Storage
 * First-party persistence for newsletter signups. No third party ever
 * stores or processes subscriber data. Requires app settings
 * SUBSCRIBERS_TABLE_CONNECTION and NEWSLETTER_TOKEN_SECRET.
 */

const crypto = require('crypto')
const { TableClient } = require('@azure/data-tables')

const TABLE = 'subscribers'

function getTable() {
  const conn = process.env.SUBSCRIBERS_TABLE_CONNECTION || process.env.AzureWebJobsStorage
  if (!conn) throw new Error('SUBSCRIBERS_TABLE_CONNECTION is not set.')
  return TableClient.fromConnectionString(conn, TABLE)
}

async function ensureTable(client) {
  try { await client.createTable() } catch (e) { /* already exists */ }
}

function emailKey(email) {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
}

function makeToken(email, action) {
  const secret = process.env.NEWSLETTER_TOKEN_SECRET
  if (!secret) throw new Error('NEWSLETTER_TOKEN_SECRET is not set.')
  return crypto.createHmac('sha256', secret).update(`${action}:${email.toLowerCase()}`).digest('hex')
}

function verifyToken(email, action, token) {
  const expected = makeToken(email, action)
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(String(token || ''), 'hex'))
  } catch (e) { return false }
}

function siteUrl() {
  return (process.env.PUBLIC_SITE_URL || 'https://www.odipa.org').replace(/\/$/, '')
}

function confirmLink(email) {
  const e = Buffer.from(email.toLowerCase()).toString('base64url')
  return `${siteUrl()}/api/newsletter-confirm?e=${e}&t=${makeToken(email, 'confirm')}`
}

function unsubscribeLink(email) {
  const e = Buffer.from(email.toLowerCase()).toString('base64url')
  return `${siteUrl()}/api/newsletter-unsubscribe?e=${e}&t=${makeToken(email, 'unsubscribe')}`
}

async function upsertPending({ email, name, source }) {
  const client = getTable()
  await ensureTable(client)
  const rowKey = emailKey(email)
  let existing = null
  try { existing = await client.getEntity('sub', rowKey) } catch (e) { /* not found */ }
  // Never downgrade a confirmed subscriber back to pending
  if (existing && existing.status === 'confirmed') return { status: 'confirmed', existed: true }
  await client.upsertEntity({
    partitionKey: 'sub',
    rowKey,
    email: email.toLowerCase(),
    name: name || '',
    source: source || 'Website',
    status: 'pending',
    createdAt: (existing && existing.createdAt) || new Date().toISOString(),
  }, 'Merge')
  return { status: 'pending', existed: !!existing }
}

async function setStatus(email, status) {
  const client = getTable()
  await ensureTable(client)
  const rowKey = emailKey(email)
  let existing = null
  try { existing = await client.getEntity('sub', rowKey) } catch (e) { return false }
  const stamp = status === 'confirmed' ? { confirmedAt: new Date().toISOString() }
              : status === 'unsubscribed' ? { unsubscribedAt: new Date().toISOString() } : {}
  await client.upsertEntity(Object.assign({ partitionKey: 'sub', rowKey, email: email.toLowerCase(), status }, stamp), 'Merge')
  return true
}

async function getSubscriber(email) {
  const client = getTable()
  await ensureTable(client)
  try { return await client.getEntity('sub', emailKey(email)) } catch (e) { return null }
}

/**
 * Record that a subscriber joined as a free, non-voting community member and
 * accepted a specific version of the Community Member Terms. Works for new
 * (pending) and already-confirmed subscribers, and never changes their status.
 *
 * The member's name is written here, not only in upsertPending, because a person
 * who was already a confirmed newsletter subscriber skips upsertPending's write.
 * Membership requires a name, so the name given at join time always wins.
 */
async function recordMembership(email, { termsVersion, firstName, lastName }) {
  const client = getTable()
  await ensureTable(client)
  const rowKey = emailKey(email)
  let existing = null
  try { existing = await client.getEntity('sub', rowKey) } catch (e) { /* not found */ }
  const now = new Date().toISOString()
  const first = String(firstName || '').trim(), last = String(lastName || '').trim()
  const nameFields = first || last ? { firstName: first, lastName: last, name: `${first} ${last}`.trim() } : {}
  await client.upsertEntity(Object.assign({
    partitionKey: 'sub',
    rowKey,
    email: email.toLowerCase(),
    member: true,
    memberSince: (existing && existing.memberSince) || now,
    memberTermsVersion: termsVersion || '',
    memberTermsAcceptedAt: now,
  }, nameFields), 'Merge')
}

async function listByStatus(status) {
  const client = getTable()
  await ensureTable(client)
  const out = []
  const iter = client.listEntities({ queryOptions: { filter: `PartitionKey eq 'sub' and status eq '${status}'` } })
  for await (const ent of iter) {
    out.push({ email: ent.email, name: ent.name || '', firstName: ent.firstName || '', lastName: ent.lastName || '', source: ent.source || '', createdAt: ent.createdAt, confirmedAt: ent.confirmedAt || null, member: !!ent.member })
  }
  return out
}

/**
 * Issues and the send ledger.
 *
 * An issue row (partition 'issue') holds the subject, the HTML (capped), a hash of
 * the content, and running totals. The ledger (partition 'sent-<issueId>') holds one
 * row per recipient who got that issue, keyed by the same SHA-256 of the email that
 * the subscriber rows use. It stores no address, name or timestamp per person, so a
 * send can be resumed without keeping any new personal data.
 */
const HTML_CAP = 30000

function contentHash(subject, html) {
  return crypto.createHash('sha256').update(`${subject}\n${html}`).digest('hex')
}

// A time plus four random digits, so two sends started in the same millisecond never share a
// ledger. Only digits, T, Z and dashes, which the send functions check before using an id.
function issueIdNow() {
  return new Date().toISOString().replace(/[:.]/g, '-') + '-' + String(crypto.randomInt(0, 10000)).padStart(4, '0')
}

function ledgerPartition(issueId) { return `sent-${issueId}` }

async function beginIssue({ subject, html, confirmedAtStart, kind }) {
  const client = getTable()
  await ensureTable(client)
  const issueId = issueIdNow()
  const startedAt = new Date().toISOString()
  await client.upsertEntity({
    partitionKey: 'issue',
    rowKey: issueId,
    subject,
    html: String(html).slice(0, HTML_CAP),
    htmlTruncated: String(html).length > HTML_CAP,
    contentHash: contentHash(subject, html),
    sent: 0, failed: 0, remaining: confirmedAtStart, confirmedAtStart,
    status: 'sending',
    kind: kind || 'newsletter',
    sentAt: startedAt,
  }, 'Replace')
  return issueId
}

async function getIssue(issueId) {
  const client = getTable()
  await ensureTable(client)
  try { return await client.getEntity('issue', String(issueId)) } catch (e) { return null }
}

async function updateIssue(issueId, fields) {
  const client = getTable()
  await ensureTable(client)
  await client.upsertEntity(Object.assign({ partitionKey: 'issue', rowKey: String(issueId) }, fields), 'Merge')
}

/**
 * A short lease on an issue, so two rounds of the same issue cannot run at once (two tabs, or a
 * Resume click while the last round is still going after the gateway cut the browser off).
 * The lease is a timestamp on the issue row, taken with the row's version tag so only one
 * caller wins. It expires on its own, so a crashed round never locks the issue for long.
 */
const LEASE_MS = 60000
async function acquireRound(issueId) {
  const client = getTable()
  await ensureTable(client)
  let ent
  try { ent = await client.getEntity('issue', String(issueId)) } catch (e) { return false }
  if (ent.roundStartedAt && Date.now() - Date.parse(ent.roundStartedAt) < LEASE_MS) return false
  const next = { partitionKey: 'issue', rowKey: String(issueId), roundStartedAt: new Date().toISOString() }
  try {
    if (ent.etag) await client.updateEntity(next, 'Merge', { etag: ent.etag })
    else await client.upsertEntity(next, 'Merge')
  } catch (e) {
    if (e && e.statusCode === 412) return false
    throw e
  }
  return true
}

async function releaseRound(issueId) {
  const client = getTable()
  try { await client.upsertEntity({ partitionKey: 'issue', rowKey: String(issueId), roundStartedAt: '' }, 'Merge') } catch (e) { /* the lease expires by itself */ }
}

async function sentKeys(issueId) {
  const client = getTable()
  await ensureTable(client)
  const out = new Set()
  const iter = client.listEntities({ queryOptions: { filter: `PartitionKey eq '${ledgerPartition(issueId)}'` } })
  for await (const ent of iter) out.add(ent.rowKey)
  return out
}

async function markSent(issueId, email) {
  const client = getTable()
  await client.upsertEntity({ partitionKey: ledgerPartition(issueId), rowKey: emailKey(email) }, 'Replace')
}

async function listIssues() {
  const client = getTable()
  await ensureTable(client)
  const out = []
  const iter = client.listEntities({ queryOptions: { filter: "PartitionKey eq 'issue'" } })
  for await (const ent of iter) {
    if (ent.kind === 'article') continue
    out.push({
      id: ent.rowKey, subject: ent.subject, sent: ent.sent, failed: ent.failed, sentAt: ent.sentAt,
      remaining: ent.remaining == null ? 0 : ent.remaining,
      status: ent.status || 'complete',
    })
  }
  return out.sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)))
}

module.exports = { upsertPending, setStatus, getSubscriber, recordMembership, listByStatus, verifyToken, confirmLink, unsubscribeLink, emailKey, contentHash, beginIssue, getIssue, acquireRound, releaseRound, updateIssue, sentKeys, markSent, listIssues }
