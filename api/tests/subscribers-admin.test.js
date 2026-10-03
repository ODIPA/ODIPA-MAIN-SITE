/**
 * Subscriber lookup, delete, and member count tests.
 * Run with  node tests/subscribers-admin.test.js
 * Table Storage is replaced with an in-memory table. All ODIPA code is real.
 */
const path = require('path'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.NEWSLETTER_TOKEN_SECRET = 's'
process.env.SUBSCRIBERS_TABLE_CONNECTION = 'x'
process.env.NEWSLETTER_ADMIN_KEY = 'admin-key-123'

const store = new Map()   // `${table}|${pk}|${rk}` -> entity
let failLogWrites = false
const tables = require(path.join(api, 'node_modules/@azure/data-tables'))
tables.TableClient.fromConnectionString = (c, name) => ({
  createTable: async () => {},
  getEntity: async (pk, rk) => { const e = store.get(`${name}|${pk}|${rk}`); if (!e) { const x = new Error('nf'); x.statusCode = 404; throw x } return { ...e } },
  upsertEntity: async e => { const k = `${name}|${e.partitionKey}|${e.rowKey}`; store.set(k, { ...(store.get(k) || {}), ...e }) },
  createEntity: async e => { if (failLogWrites && name === 'subscriberdeletions') throw new Error('table down'); store.set(`${name}|${e.partitionKey}|${e.rowKey}`, { ...e }) },
  deleteEntity: async (pk, rk) => { store.delete(`${name}|${pk}|${rk}`) },
  listEntities: async function* ({ queryOptions } = {}) {
    const m = /PartitionKey eq '([^']+)'/.exec((queryOptions && queryOptions.filter) || '')
    for (const [k, v] of store) { const [t] = k.split('|'); if (t === name && (!m || v.partitionKey === m[1])) yield { ...v } }
  },
})

const subs = require(path.join(api, '_shared/subscribers.js'))
const admin = require(path.join(api, '_shared/subscriberAdmin.js'))
const lookupFn = require(path.join(api, 'subscriber-lookup/index.js'))
const deleteFn = require(path.join(api, 'subscriber-delete/index.js'))
const statsFn = require(path.join(api, 'newsletter-stats/index.js'))

let pass = 0, fail = 0
async function t(label, fn) { try { await fn(); console.log('  PASS', label); pass++ } catch (e) { console.log('  FAIL', label, '\n      ', e.message.split('\n')[0]); fail++ } }
const logs = []
const log = Object.assign(m => logs.push(String(m)), { warn() {}, error: m => logs.push('ERR ' + m) })
const KEY = { 'x-admin-key': 'admin-key-123' }
async function call(fn, req) { const ctx = { log }; await fn(ctx, { headers: {}, query: {}, ...req }); return ctx.res }
const get = (query, headers = KEY) => call(lookupFn, { method: 'GET', headers, query })
const del = (body, headers = KEY) => call(deleteFn, { method: 'POST', headers, body })

async function seed() {
  store.clear(); failLogWrites = false
  // newsletter only, confirmed
  await subs.upsertPending({ email: 'nora@example.com', name: 'Nora Newsletter', source: 'Footer' }); await subs.setStatus('nora@example.com', 'confirmed')
  // member, confirmed
  await subs.upsertPending({ email: 'milo@example.com', name: 'Milo Member', source: 'Join page' }); await subs.setStatus('milo@example.com', 'confirmed'); await subs.recordMembership('milo@example.com', { termsVersion: '2026-10-v1' })
  // member, still pending
  await subs.upsertPending({ email: 'pia@example.com', name: 'Pia Pending', source: 'Join page' }); await subs.recordMembership('pia@example.com', { termsVersion: '2026-10-v1' })
  // member who unsubscribed
  await subs.upsertPending({ email: 'una@example.com', name: '', source: 'Join page' }); await subs.recordMembership('una@example.com', { termsVersion: '2026-10-v1' }); await subs.setStatus('una@example.com', 'confirmed'); await subs.setStatus('una@example.com', 'unsubscribed')
  // newsletter only, pending
  await subs.upsertPending({ email: 'pete@example.org', name: 'Pete', source: 'Website' })
  // make creation order deterministic for the "recent" test
  const base = Date.UTC(2026, 8, 1)
  ;['nora', 'milo', 'pia', 'una'].forEach((n, i) => { for (const [k, v] of store) if (v.email === `${n}@example.com`) v.createdAt = new Date(base + i * 86400000).toISOString() })
  for (const [k, v] of store) if (v.email === 'pete@example.org') v.createdAt = new Date(base + 10 * 86400000).toISOString()
}

;(async () => {
  console.log('\nsecurity')
  await seed()
  await t('every endpoint refuses a missing, wrong, or different length key', async () => {
    for (const headers of [{}, { 'x-admin-key': 'nope' }, { 'x-admin-key': 'admin-key-123-extra' }, { 'x-admin-key': '' }]) {
      assert.strictEqual((await get({}, headers)).status, 401)
      assert.strictEqual((await del({ email: 'milo@example.com', confirmEmail: 'milo@example.com', reason: 'other' }, headers)).status, 401)
    }
    assert.strictEqual(store.size > 0 && [...store.keys()].some(k => k.includes('|sub|')), true, 'a refused request must not touch data')
  })
  await t('with no admin key configured nobody gets in, even with an empty header', async () => {
    const saved = process.env.NEWSLETTER_ADMIN_KEY; delete process.env.NEWSLETTER_ADMIN_KEY
    assert.strictEqual((await get({}, { 'x-admin-key': '' })).status, 401)
    assert.strictEqual((await get({}, { 'x-admin-key': 'undefined' })).status, 401)
    process.env.NEWSLETTER_ADMIN_KEY = saved
  })
  await t('responses with personal data are marked no-store', async () => {
    const r = await get({}); assert.strictEqual(r.headers['Cache-Control'], 'no-store')
    const d = await del({ email: 'nobody@example.com', confirmEmail: 'nobody@example.com', reason: 'other' }); assert.strictEqual(d.headers['Cache-Control'], 'no-store')
  })
  await t('the key helper agrees with the key stored for a real sign up row', () => {
    assert.strictEqual([...store.keys()].some(k => k.endsWith('|' + admin.emailKey('milo@example.com'))), true, 'emailKey must match subscribers.js')
  })

  console.log('\nlookup')
  await t('an exact email is found by key, case and spaces ignored', async () => {
    const r = await get({ q: '  MILO@Example.com ' })
    assert.deepStrictEqual([r.status, r.body.mode, r.body.total, r.body.results[0].email], [200, 'exact', 1, 'milo@example.com'])
    const v = r.body.results[0]
    assert.deepStrictEqual([v.member, v.status, v.memberTermsVersion, v.name, v.source], [true, 'confirmed', '2026-10-v1', 'Milo Member', 'Join page'])
    assert(v.memberSince && v.memberTermsAcceptedAt && v.confirmedAt)
  })
  await t('an exact email that does not exist returns nothing, not an error', async () => {
    const r = await get({ q: 'ghost@example.com' }); assert.deepStrictEqual([r.status, r.body.total], [200, 0])
  })
  await t('a partial search matches email or name, case insensitive', async () => {
    assert.deepStrictEqual((await get({ q: 'example.com' })).body.results.map(x => x.email), ['milo@example.com', 'nora@example.com', 'pia@example.com', 'una@example.com'])
    assert.deepStrictEqual((await get({ q: 'PETE' })).body.results.map(x => x.email), ['pete@example.org'])
    assert.deepStrictEqual((await get({ q: 'member' })).body.results.map(x => x.email), ['milo@example.com'])   // matched on the name
    assert.strictEqual((await get({ q: 'zzz' })).body.total, 0)
  })
  await t('members only filter works for browse, search, and exact lookup', async () => {
    assert.deepStrictEqual((await get({ members: '1' })).body.results.map(x => x.email).sort(), ['milo@example.com', 'pia@example.com', 'una@example.com'])
    assert.deepStrictEqual((await get({ q: 'example.com', members: '1' })).body.results.map(x => x.email), ['milo@example.com', 'pia@example.com', 'una@example.com'])
    assert.strictEqual((await get({ q: 'nora@example.com', members: '1' })).body.total, 0)
    assert.strictEqual((await get({ q: 'milo@example.com', members: '1' })).body.total, 1)
  })
  await t('no search shows the most recent sign ups first', async () => {
    const r = await get({}); assert.strictEqual(r.body.mode, 'recent')
    assert.deepStrictEqual(r.body.results.map(x => x.email), ['pete@example.org', 'una@example.com', 'pia@example.com', 'milo@example.com', 'nora@example.com'])
  })
  await t('results are capped at 25 but the total is reported', async () => {
    for (let i = 0; i < 30; i++) await subs.upsertPending({ email: `bulk${String(i).padStart(2, '0')}@bulk.test`, name: '', source: 'Website' })
    const r = await get({ q: 'bulk.test' }); assert.deepStrictEqual([r.body.results.length, r.body.total, r.body.limit], [25, 30, 25])
  })
  await t('a search is treated as text, never as a query', async () => {
    const r = await get({ q: "' or PartitionKey ne '" }); assert.deepStrictEqual([r.status, r.body.total], [200, 0])
  })

  console.log('\ndelete')
  await seed()
  await t('the address must be typed again, and a different one is refused', async () => {
    assert.strictEqual((await del({ email: 'milo@example.com', confirmEmail: '', reason: 'person-request' })).status, 400)
    assert.strictEqual((await del({ email: 'milo@example.com', confirmEmail: 'nora@example.com', reason: 'person-request' })).status, 400)
    assert.strictEqual((await get({ q: 'milo@example.com' })).body.total, 1, 'nothing deleted on a failed confirmation')
  })
  await t('a reason is required, and only the listed reasons are accepted', async () => {
    for (const reason of [undefined, '', 'because', 'OTHER']) assert.strictEqual((await del({ email: 'milo@example.com', confirmEmail: 'milo@example.com', reason })).status, 400)
  })
  await t('an invalid address is refused', async () => {
    assert.strictEqual((await del({ email: 'not-an-email', confirmEmail: 'not-an-email', reason: 'other' })).status, 400)
  })
  await t('an unknown address is a 404 and writes nothing to the log', async () => {
    const r = await del({ email: 'ghost@example.com', confirmEmail: 'ghost@example.com', reason: 'other' })
    assert.strictEqual(r.status, 404); assert.strictEqual((await get({ view: 'deletions' })).body.deletions.length, 0)
  })
  await t('deleting a member removes the row completely, case insensitive', async () => {
    const r = await del({ email: ' Milo@Example.COM ', confirmEmail: 'milo@example.com', reason: 'person-request' })
    assert.deepStrictEqual([r.status, r.body.ok, r.body.wasMember, r.body.status, r.body.logged], [200, true, true, 'confirmed', true])
    assert.strictEqual(await subs.getSubscriber('milo@example.com'), null, 'the subscriber must be gone')
    assert.strictEqual((await get({ q: 'milo' })).body.total, 0)
    assert.strictEqual((await get({ q: 'milo@example.com' })).body.total, 0)
    assert([...store.values()].every(v => v.email !== 'milo@example.com'), 'no copy of the row may remain')
  })
  await t('other people are untouched, including the newsletter only subscriber', async () => {
    assert.strictEqual((await get({ q: 'nora@example.com' })).body.total, 1)
    assert.strictEqual((await get({})).body.total, 4)
  })
  await t('deleting the same person twice gives 404 the second time', async () => {
    const r = await del({ email: 'milo@example.com', confirmEmail: 'milo@example.com', reason: 'person-request' }); assert.strictEqual(r.status, 404)
  })
  await t('the deletion log has the facts and not one name or address', async () => {
    await del({ email: 'nora@example.com', confirmEmail: 'nora@example.com', reason: 'duplicate-or-test' })
    const r = await get({ view: 'deletions' })
    assert.deepStrictEqual(r.body.deletions.map(d => [d.reason, d.wasMember, d.statusAtDeletion]), [['duplicate-or-test', false, 'confirmed'], ['person-request', true, 'confirmed']])   // newest first
    const raw = JSON.stringify([...store.entries()].filter(([k]) => k.startsWith('subscriberdeletions|'))) + JSON.stringify(r.body)
    for (const secret of ['milo', 'nora', 'Milo Member', 'Nora Newsletter', 'example.com']) assert(!raw.includes(secret), `deletion log leaked "${secret}"`)
    assert(r.body.deletions.every(d => /^[0-9a-f]{10}$/.test(d.reference) && d.deletedAt))
    assert.strictEqual(r.body.deletions[1].reference, admin.emailKey('milo@example.com').slice(0, 10), 'the reference lets ODIPA prove a deletion without keeping the address')
  })
  await t('a failed log write never blocks or undoes the deletion', async () => {
    failLogWrites = true
    const r = await del({ email: 'pia@example.com', confirmEmail: 'pia@example.com', reason: 'other' })
    assert.deepStrictEqual([r.status, r.body.deleted, r.body.logged], [200, true, false])
    assert.strictEqual(await subs.getSubscriber('pia@example.com'), null)
    failLogWrites = false
  })
  await t('an unsubscribed person can be deleted and the status is recorded', async () => {
    const r = await del({ email: 'una@example.com', confirmEmail: 'una@example.com', reason: 'person-request' })
    assert.deepStrictEqual([r.status, r.body.status, r.body.wasMember], [200, 'unsubscribed', true])
  })
  await t('a deleted person can sign up again and starts clean', async () => {
    await subs.upsertPending({ email: 'milo@example.com', name: 'Milo Again', source: 'Footer' })
    const v = (await get({ q: 'milo@example.com' })).body.results[0]
    assert.deepStrictEqual([v.status, v.member, v.name], ['pending', false, 'Milo Again'])
  })

  console.log('\nmember counts on the newsletter stats')
  await seed()
  await t('members are counted by status and kept separate from newsletter only', async () => {
    const r = await call(statsFn, { method: 'GET', headers: KEY })
    assert.strictEqual(r.status, 200)
    const m = r.body.members
    assert.deepStrictEqual([m.total, m.confirmed, m.pending, m.unsubscribed, m.newsletterOnlyConfirmed], [3, 1, 1, 1, 1])
    assert.strictEqual(m.newLast30Days, 3)                                  // recordMembership stamps memberSince now
    assert.deepStrictEqual([r.body.totals.confirmed, r.body.totals.pending, r.body.totals.unsubscribed, r.body.totals.allTimeSignups], [2, 2, 1, 5])
    assert.strictEqual(m.confirmed + m.newsletterOnlyConfirmed, r.body.totals.confirmed, 'members plus newsletter only must equal everyone confirmed')
  })
  await t('older members outside 30 days are not counted as new', async () => {
    for (const v of store.values()) if (v.email === 'milo@example.com') v.memberSince = new Date(Date.now() - 45 * 86400000).toISOString()
    const r = await call(statsFn, { method: 'GET', headers: KEY }); assert.strictEqual(r.body.members.newLast30Days, 2)
  })
  await t('stats still refuse a wrong key and still return the old fields', async () => {
    assert.strictEqual((await call(statsFn, { method: 'GET', headers: { 'x-admin-key': 'bad' } })).status, 401)
    const r = await call(statsFn, { method: 'GET', headers: KEY })
    for (const f of ['totals', 'rates', 'last30Days', 'signupsByMonth', 'confirmedByMonth', 'sources', 'issues']) assert(f in r.body, f)
  })
  await t('after a member is deleted the counts drop', async () => {
    await del({ email: 'milo@example.com', confirmEmail: 'milo@example.com', reason: 'person-request' })
    const r = await call(statsFn, { method: 'GET', headers: KEY })
    assert.deepStrictEqual([r.body.members.total, r.body.members.confirmed, r.body.totals.confirmed], [2, 0, 1])
  })

  console.log(`\nResults  ${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})()
