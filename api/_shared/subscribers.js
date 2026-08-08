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

async function listByStatus(status) {
  const client = getTable()
  await ensureTable(client)
  const out = []
  const iter = client.listEntities({ queryOptions: { filter: `PartitionKey eq 'sub' and status eq '${status}'` } })
  for await (const ent of iter) {
    out.push({ email: ent.email, name: ent.name || '', source: ent.source || '', createdAt: ent.createdAt, confirmedAt: ent.confirmedAt || null })
  }
  return out
}

async function saveIssue({ subject, html, sent, failed }) {
  const client = getTable()
  await ensureTable(client)
  const sentAt = new Date().toISOString()
  await client.upsertEntity({
    partitionKey: 'issue',
    rowKey: sentAt.replace(/[:.]/g, '-'),
    subject, html: String(html).slice(0, 30000), sent, failed, sentAt,
  }, 'Replace')
}

async function listIssues() {
  const client = getTable()
  await ensureTable(client)
  const out = []
  const iter = client.listEntities({ queryOptions: { filter: "PartitionKey eq 'issue'" } })
  for await (const ent of iter) {
    out.push({ subject: ent.subject, sent: ent.sent, failed: ent.failed, sentAt: ent.sentAt })
  }
  return out.sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)))
}

module.exports = { upsertPending, setStatus, listByStatus, verifyToken, confirmLink, unsubscribeLink, saveIssue, listIssues }
