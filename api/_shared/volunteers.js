/**
 * ODIPA volunteer roster, Azure Table Storage (table 'volunteers').
 * One row per person, keyed by a hash of their email, created when they apply
 * and updated by the team. Holds only what tracking needs: name, email, the
 * roles and hours they offered, a status, dates and a short note. Never logged.
 * Deleting a person in the Subscribers tool removes their row here too.
 */
const crypto = require('crypto')
const { TableClient } = require('@azure/data-tables')

const TABLE = 'volunteers'
const PARTITION = 'volunteer'
const STATUSES = ['applied', 'intro-call', 'active', 'paused', 'alumni']
const LABELS = { applied: 'Applied', 'intro-call': 'Intro call scheduled', active: 'Active', paused: 'On pause', alumni: 'Alumni' }

function getTable() {
  const conn = process.env.SUBSCRIBERS_TABLE_CONNECTION || process.env.AzureWebJobsStorage
  if (!conn) throw new Error('SUBSCRIBERS_TABLE_CONNECTION is not set.')
  return TableClient.fromConnectionString(conn, TABLE)
}
async function ensureTable(client) { try { await client.createTable() } catch (e) { /* exists */ } }

const idFor = email => crypto.createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex')

/** Create the row on a first application, or note a repeat application without losing status. */
async function recordApplication({ email, name, roles, hours, inquiryId, memberRequested }) {
  const client = getTable()
  await ensureTable(client)
  const id = idFor(email)
  const now = new Date().toISOString()
  let existing = null
  try { existing = await client.getEntity(PARTITION, id) } catch (e) { /* new */ }
  await client.upsertEntity({
    partitionKey: PARTITION, rowKey: id,
    email: String(email).toLowerCase(), name: name || (existing && existing.name) || '',
    roles: String(roles || '').slice(0, 300), hours: String(hours || '').slice(0, 60),
    status: (existing && existing.status) || 'applied',
    appliedAt: (existing && existing.appliedAt) || now,
    statusUpdatedAt: (existing && existing.statusUpdatedAt) || now,
    notes: (existing && existing.notes) || '',
    inquiryId: inquiryId || (existing && existing.inquiryId) || '',
    memberRequested: !!memberRequested || !!(existing && existing.memberRequested),
    applications: ((existing && existing.applications) || 0) + 1,
  }, 'Replace')
  return id
}

/**
 * Add a roster row for an earlier applicant, only if the person is not already on
 * the roster. Never changes an existing row. Returns true when a row was created.
 */
async function addIfMissing({ email, name, roles, hours, appliedAt, status, inquiryId, notes }) {
  const client = getTable()
  await ensureTable(client)
  const id = idFor(email)
  try { await client.getEntity(PARTITION, id); return false } catch (e) { if (!(e && e.statusCode === 404)) throw e }
  const when = appliedAt || new Date().toISOString()
  await client.upsertEntity({
    partitionKey: PARTITION, rowKey: id,
    email: String(email).toLowerCase(), name: name || '',
    roles: String(roles || '').slice(0, 300), hours: String(hours || '').slice(0, 60),
    status: STATUSES.includes(status) ? status : 'applied',
    appliedAt: when, statusUpdatedAt: when, notes: String(notes || '').slice(0, 1000), inquiryId: inquiryId || '',
    memberRequested: false, applications: 1,
  }, 'Replace')
  return true
}

async function listVolunteers() {
  const client = getTable()
  await ensureTable(client)
  const out = []
  for await (const e of client.listEntities({ queryOptions: { filter: `PartitionKey eq '${PARTITION}'` } })) {
    out.push({
      id: e.rowKey, email: e.email, name: e.name, roles: e.roles, hours: e.hours, status: e.status,
      appliedAt: e.appliedAt, statusUpdatedAt: e.statusUpdatedAt, notes: e.notes || '',
      inquiryId: e.inquiryId || '', memberRequested: !!e.memberRequested,
    })
  }
  return out.sort((a, b) => String(b.appliedAt).localeCompare(String(a.appliedAt)))
}

async function updateVolunteer(id, { status, notes }) {
  const patch = {}
  if (status !== undefined) {
    if (!STATUSES.includes(status)) throw new Error('Invalid status')
    patch.status = status; patch.statusUpdatedAt = new Date().toISOString()
  }
  if (notes !== undefined) patch.notes = String(notes).slice(0, 1000)
  const client = getTable()
  try {
    await client.updateEntity({ partitionKey: PARTITION, rowKey: id, ...patch }, 'Merge')
  } catch (e) {
    if (e && e.statusCode === 404) { const err = new Error('Volunteer not found'); err.statusCode = 404; throw err }
    throw e
  }
}

/** Move an applicant to a status only if they are still at "applied", used by the board. */
async function advanceFromApplied(email, status) {
  const client = getTable()
  const id = idFor(email)
  let e
  try { e = await client.getEntity(PARTITION, id) } catch (err) { return false }
  if (e.status !== 'applied') return false
  await updateVolunteer(id, { status })
  return true
}

/** Remove the row if there is one. True only when a row existed and is now gone. */
async function deleteVolunteerByEmail(email) {
  const client = getTable()
  const id = idFor(email)
  // Only "no such row" means there is nothing to delete. Any other storage error is
  // thrown, so a deletion request is never reported done while the row remains.
  try { await client.getEntity(PARTITION, id) } catch (e) {
    if (e && e.statusCode === 404) return false
    throw e
  }
  await client.deleteEntity(PARTITION, id)
  return true
}
/**
 * Remove every roster row whose address is the same person under another spelling,
 * for example Gmail dot and plus variants. `same` decides whether two addresses match.
 * Returns how many rows were removed. Storage errors are thrown.
 */
async function deleteVolunteersMatching(email, same) {
  const client = getTable()
  await ensureTable(client)
  let n = 0
  for await (const e of client.listEntities({ queryOptions: { filter: `PartitionKey eq '${PARTITION}'` } })) {
    if (same(e.email, email)) { await client.deleteEntity(PARTITION, e.rowKey); n++ }
  }
  return n
}

async function deleteVolunteer(id) {
  await getTable().deleteEntity(PARTITION, id)
}

module.exports = { STATUSES, LABELS, idFor, recordApplication, addIfMissing, listVolunteers, updateVolunteer, advanceFromApplied, deleteVolunteerByEmail, deleteVolunteersMatching, deleteVolunteer }
