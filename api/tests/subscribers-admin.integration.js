/**
 * Subscriber admin storage integration test.
 * Runs the real lookup, delete, deletion log, and stats code against Azure's local Table Storage
 * emulator, which catches storage specific problems that an in-memory stand-in cannot.
 *
 * Run it with two terminals from the api folder
 *   npx azurite-table --silent --location /tmp/azurite-data --tablePort 10002
 *   node tests/subscribers-admin.integration.js
 * Azurite is fetched by npx on demand and is not a project dependency.
 * Production uses https, so this test allows an insecure connection for the emulator only.
 */
process.env.SUBSCRIBERS_TABLE_CONNECTION = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;'
process.env.NEWSLETTER_TOKEN_SECRET = 's'
process.env.NEWSLETTER_ADMIN_KEY = 'k'
const path = require('path'), assert = require('assert')
const api = path.join(__dirname, '..')
const { TableClient } = require('@azure/data-tables')
const origFrom = TableClient.fromConnectionString.bind(TableClient)
TableClient.fromConnectionString = (conn, table, opts) => origFrom(conn, table, { ...(opts || {}), allowInsecureConnection: true })

const subs = require(path.join(api, '_shared/subscribers.js'))
const admin = require(path.join(api, '_shared/subscriberAdmin.js'))
const lookupFn = require(path.join(api, 'subscriber-lookup/index.js'))
const deleteFn = require(path.join(api, 'subscriber-delete/index.js'))
const statsFn = require(path.join(api, 'newsletter-stats/index.js'))

let pass = 0, fail = 0
async function t(label, fn) { try { await fn(); console.log('  PASS', label); pass++ } catch (e) { console.log('  FAIL', label, '\n      ', e.message.split('\n')[0]); fail++ } }
const H = { 'x-admin-key': 'k' }
const log = Object.assign(() => {}, { warn() {}, error: m => console.log('   [error]', m) })
async function call(fn, req) { const ctx = { log }; await fn(ctx, { headers: H, query: {}, ...req }); return ctx.res }

;(async () => {
  console.log('\nsubscriber admin against the Table Storage emulator')
  await t('seed with the real sign up and membership code', async () => {
    await subs.upsertPending({ email: 'nora@example.com', name: 'Nora Newsletter', source: 'Footer' }); await subs.setStatus('nora@example.com', 'confirmed')
    await subs.upsertPending({ email: 'milo@example.com', name: 'Milo Member', source: 'Join page' }); await subs.setStatus('milo@example.com', 'confirmed'); await subs.recordMembership('milo@example.com', { termsVersion: 'v1' })
    await subs.upsertPending({ email: 'pia@example.com', name: 'Pia', source: 'Join page' }); await subs.recordMembership('pia@example.com', { termsVersion: 'v1' })
  })
  await t('exact lookup finds the row the real signup code wrote, so the key matches', async () => {
    const r = await call(lookupFn, { method: 'GET', query: { q: 'MILO@example.com' } })
    assert.deepStrictEqual([r.body.mode, r.body.total, r.body.results[0].member, r.body.results[0].memberTermsVersion], ['exact', 1, true, 'v1'])
  })
  await t('search, members only, and browse use real queries', async () => {
    assert.deepStrictEqual((await call(lookupFn, { method: 'GET', query: { q: 'example' } })).body.results.map(x => x.email), ['milo@example.com', 'nora@example.com', 'pia@example.com'])
    assert.deepStrictEqual((await call(lookupFn, { method: 'GET', query: { members: '1' } })).body.results.map(x => x.email).sort(), ['milo@example.com', 'pia@example.com'])
    assert.strictEqual((await call(lookupFn, { method: 'GET', query: {} })).body.results.length, 3)
  })
  await t('stats count members from real rows', async () => {
    const r = await call(statsFn, { method: 'GET' })
    assert.deepStrictEqual([r.body.members.total, r.body.members.confirmed, r.body.members.pending, r.body.members.newsletterOnlyConfirmed], [2, 1, 1, 1])
  })
  await t('delete removes the real row and writes a log entry with no personal data', async () => {
    const r = await call(deleteFn, { method: 'POST', body: { email: 'milo@example.com', confirmEmail: 'MILO@example.com', reason: 'person-request' } })
    assert.deepStrictEqual([r.status, r.body.deleted, r.body.wasMember, r.body.logged], [200, true, true, true])
    assert.strictEqual(await subs.getSubscriber('milo@example.com'), null)
    assert.strictEqual((await call(lookupFn, { method: 'GET', query: { q: 'milo' } })).body.total, 0)
    const d = await call(lookupFn, { method: 'GET', query: { view: 'deletions' } })
    assert.deepStrictEqual(d.body.deletions.map(x => [x.reason, x.wasMember, x.statusAtDeletion]), [['person-request', true, 'confirmed']])
    assert(!/milo|example\.com|Milo Member/i.test(JSON.stringify(d.body)), 'log must hold no personal data')
    assert.strictEqual(d.body.deletions[0].reference, admin.emailKey('milo@example.com').slice(0, 10))
  })
  await t('second delete is a 404, others untouched, stats drop', async () => {
    assert.strictEqual((await call(deleteFn, { method: 'POST', body: { email: 'milo@example.com', confirmEmail: 'milo@example.com', reason: 'other' } })).status, 404)
    assert.strictEqual((await call(lookupFn, { method: 'GET', query: { q: 'nora@example.com' } })).body.total, 1)
    const s = await call(statsFn, { method: 'GET' })
    assert.deepStrictEqual([s.body.members.total, s.body.totals.confirmed], [1, 1])
  })
  await t('a newer deletion is listed first', async () => {
    await call(deleteFn, { method: 'POST', body: { email: 'pia@example.com', confirmEmail: 'pia@example.com', reason: 'duplicate-or-test' } })
    const d = await call(lookupFn, { method: 'GET', query: { view: 'deletions' } })
    assert.deepStrictEqual(d.body.deletions.map(x => x.reason), ['duplicate-or-test', 'person-request'])
  })
  console.log(`\nResults  ${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})().catch(e => { console.error('runner failed', e); process.exit(1) })
