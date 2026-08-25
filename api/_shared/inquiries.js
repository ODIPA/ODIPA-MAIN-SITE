/**
 * ODIPA Inquiry Store, Azure Table Storage
 * Persists contact-form inquiries so unanswered ones can be surfaced in the
 * admin review inbox with AI-proposed drafts. First-party storage only.
 * Reuses the subscribers table connection. Table: 'inquiries'.
 *
 * status lifecycle:
 *   acked            canned acknowledgment sent, awaiting human reply
 *   drafted          AI draft awaiting human approval in the admin inbox
 *   needs-attention  flagged as too important/unusual for an AI draft
 *   sent             approved reply sent
 *   dismissed        handled outside the system (personal reply, spam, etc.)
 */

const crypto = require('crypto')
const { TableClient } = require('@azure/data-tables')

const TABLE = 'inquiries'
const PARTITION = 'inquiry'

function getTable() {
  const conn = process.env.SUBSCRIBERS_TABLE_CONNECTION || process.env.AzureWebJobsStorage
  if (!conn) throw new Error('SUBSCRIBERS_TABLE_CONNECTION is not set.')
  return TableClient.fromConnectionString(conn, TABLE)
}

async function ensureTable(client) {
  try { await client.createTable() } catch (e) { /* exists */ }
}

function newId() {
  // Sortable id: inverted timestamp prefix keeps newest-first listing cheap
  const ts = String(9999999999999 - Date.now()).padStart(13, '0')
  return `${ts}-${crypto.randomBytes(4).toString('hex')}`
}

async function saveInquiry({ topic, name, email, organization, message, routedTo }) {
  const client = getTable()
  await ensureTable(client)
  const id = newId()
  await client.createEntity({
    partitionKey: PARTITION,
    rowKey: id,
    topic: topic || 'general',
    name: name || '',
    email: email || '',
    organization: organization || '',
    message: (message || '').slice(0, 8000),
    routedTo: routedTo || '',
    status: 'acked',
    receivedAt: Date.now(),
    draftSubject: '',
    draftBody: '',
    draftReason: '',
    draftedAt: 0,
    sentAt: 0,
  })
  return id
}

async function listInquiries(statuses) {
  const client = getTable()
  await ensureTable(client)
  const out = []
  const wanted = statuses && statuses.length ? new Set(statuses) : null
  for await (const e of client.listEntities({ queryOptions: { filter: `PartitionKey eq '${PARTITION}'` } })) {
    if (wanted && !wanted.has(e.status)) continue
    out.push(e)
    if (out.length >= 200) break
  }
  return out
}

async function updateInquiry(rowKey, patch) {
  const client = getTable()
  await client.updateEntity({ partitionKey: PARTITION, rowKey, ...patch }, 'Merge')
}

async function getInquiry(rowKey) {
  const client = getTable()
  return client.getEntity(PARTITION, rowKey)
}

module.exports = { saveInquiry, listInquiries, updateInquiry, getInquiry }
