/**
 * ODIPA Subscriber Administration, look up and delete a person.
 *
 * Works on the same Azure Table Storage 'subscribers' table as the newsletter and
 * community membership sign ups. Everything here is admin-only and first-party.
 *
 * Deleting removes the subscriber row. The record of the deletion is kept in a separate
 * table and holds NO email address and NO name, only the time, the reason, whether the
 * person was a member, their status at the time, and a short reference derived from a hash
 * so ODIPA can show it honored a request without keeping the personal data it deleted.
 */

const crypto = require('crypto')
const { TableClient } = require('@azure/data-tables')

const SUBSCRIBERS = 'subscribers'
const DELETIONS = 'subscriberdeletions'
const REASONS = ['person-request', 'duplicate-or-test', 'other']
const LOOKUP_LIMIT = 25
const SCAN_CAP = 20000

// ----------------------------------------------------------------- storage

function conn() {
  const c = process.env.SUBSCRIBERS_TABLE_CONNECTION || process.env.AzureWebJobsStorage
  if (!c) throw new Error('SUBSCRIBERS_TABLE_CONNECTION is not set.')
  return c
}
function table(name) { return TableClient.fromConnectionString(conn(), name) }
async function ensure(client) { try { await client.createTable() } catch (e) { /* already exists */ } }

/** Must stay identical to the key used by api/_shared/subscribers.js. */
function emailKey(email) {
  return crypto.createHash('sha256').update(String(email).toLowerCase()).digest('hex')
}

// ----------------------------------------------------------------- auth

/** Constant time check of the x-admin-key header against NEWSLETTER_ADMIN_KEY. */
function isAdminRequest(req) {
  const key = process.env.NEWSLETTER_ADMIN_KEY
  const given = req && req.headers ? req.headers['x-admin-key'] : ''
  if (!key || !given) return false
  const a = Buffer.from(String(key))
  const b = Buffer.from(String(given))
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// ----------------------------------------------------------------- helpers

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(v) {
  return String(v == null ? '' : v).trim().toLowerCase().slice(0, 254)
}

function toView(ent) {
  return {
    email: ent.email || '',
    name: ent.name || '',
    status: ent.status || 'pending',
    source: ent.source || '',
    member: !!ent.member,
    memberSince: ent.memberSince || '',
    memberTermsVersion: ent.memberTermsVersion || '',
    memberTermsAcceptedAt: ent.memberTermsAcceptedAt || '',
    createdAt: ent.createdAt || '',
    confirmedAt: ent.confirmedAt || '',
    unsubscribedAt: ent.unsubscribedAt || '',
  }
}

// ----------------------------------------------------------------- lookup

/**
 * q empty            the most recent sign ups
 * q a full email     an exact lookup by key, fast and precise
 * q anything else    case-insensitive match on email or name
 * membersOnly        only rows flagged as community members
 */
async function lookup({ q, membersOnly }) {
  const client = table(SUBSCRIBERS)
  await ensure(client)
  const query = normalizeEmail(q)
  const result = { results: [], total: 0, limit: LOOKUP_LIMIT, mode: 'recent', scanCapped: false }

  if (query && EMAIL_RE.test(query)) {
    result.mode = 'exact'
    try {
      const ent = await client.getEntity('sub', emailKey(query))
      if (!membersOnly || ent.member) { result.results = [toView(ent)]; result.total = 1 }
    } catch (e) {
      if (!(e && e.statusCode === 404)) throw e
    }
    return result
  }

  result.mode = query ? 'search' : 'recent'
  const matches = []
  let scanned = 0
  const iter = client.listEntities({ queryOptions: { filter: "PartitionKey eq 'sub'" } })
  for await (const ent of iter) {
    if (++scanned > SCAN_CAP) { result.scanCapped = true; break }
    if (membersOnly && !ent.member) continue
    if (query) {
      const hay = `${ent.email || ''}\n${String(ent.name || '').toLowerCase()}`
      if (!hay.includes(query)) continue
    }
    matches.push(ent)
  }
  result.total = matches.length
  matches.sort(query
    ? (a, b) => String(a.email).localeCompare(String(b.email))
    : (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  result.results = matches.slice(0, LOOKUP_LIMIT).map(toView)
  return result
}

// ----------------------------------------------------------------- delete

/**
 * Remove one person. Returns { deleted: false } when no row exists. The deletion log
 * write is best effort and never undoes or blocks the deletion itself.
 */
async function deletePerson({ email, reason }) {
  const client = table(SUBSCRIBERS)
  await ensure(client)
  const rowKey = emailKey(email)
  let ent
  try { ent = await client.getEntity('sub', rowKey) } catch (e) {
    if (e && e.statusCode === 404) return { deleted: false }
    throw e
  }
  await client.deleteEntity('sub', rowKey)

  const info = { deleted: true, wasMember: !!ent.member, status: ent.status || 'pending', logged: true }
  try {
    const log = table(DELETIONS)
    await ensure(log)
    await log.createEntity({
      partitionKey: 'del',
      rowKey: `${String(9999999999999 - Date.now()).padStart(13, '0')}-${crypto.randomBytes(2).toString('hex')}`,
      deletedAt: new Date().toISOString(),
      reason,
      wasMember: info.wasMember,
      statusAtDeletion: info.status,
      reference: rowKey.slice(0, 10),
    })
  } catch (e) {
    info.logged = false
  }
  return info
}

/** Newest first. Holds no names or addresses. */
async function listDeletions(limit = LOOKUP_LIMIT) {
  const log = table(DELETIONS)
  await ensure(log)
  const out = []
  const iter = log.listEntities({ queryOptions: { filter: "PartitionKey eq 'del'" } })
  for await (const ent of iter) {
    out.push({
      deletedAt: ent.deletedAt, reason: ent.reason, wasMember: !!ent.wasMember,
      statusAtDeletion: ent.statusAtDeletion, reference: ent.reference, key: ent.rowKey,
    })
  }
  return out.sort((a, b) => String(a.key).localeCompare(String(b.key))).slice(0, limit).map(({ key, ...rest }) => rest)
}

module.exports = {
  REASONS, LOOKUP_LIMIT, EMAIL_RE,
  emailKey, isAdminRequest, normalizeEmail, toView,
  lookup, deletePerson, listDeletions,
}
