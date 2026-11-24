/**
 * Resumable newsletter send tests.
 * Run with  node tests/newsletter-send-resume.test.js
 * Table Storage and email are replaced with fakes. All ODIPA code is real.
 */
const path = require('path'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.NEWSLETTER_TOKEN_SECRET = 's'
process.env.SUBSCRIBERS_TABLE_CONNECTION = 'x'
process.env.NEWSLETTER_ADMIN_KEY = 'admin-key-123'

const store = new Map()
const tables = require(path.join(api, 'node_modules/@azure/data-tables'))
tables.TableClient.fromConnectionString = (c, name) => ({
  createTable: async () => {},
  getEntity: async (pk, rk) => { const e = store.get(`${name}|${pk}|${rk}`); if (!e) { const x = new Error('nf'); x.statusCode = 404; throw x } return { ...e } },
  upsertEntity: async (e, mode) => { const k = `${name}|${e.partitionKey}|${e.rowKey}`; store.set(k, mode === 'Replace' ? { ...e } : { ...(store.get(k) || {}), ...e }) },
  listEntities: async function* ({ queryOptions } = {}) {
    const m = /PartitionKey eq '([^']+)'/.exec((queryOptions && queryOptions.filter) || '')
    const st = /status eq '([^']+)'/.exec((queryOptions && queryOptions.filter) || '')
    for (const [k, v] of store) { const [t] = k.split('|'); if (t === name && (!m || v.partitionKey === m[1]) && (!st || v.status === st[1])) yield { ...v, rowKey: v.rowKey } }
  },
})

const mailer = require(path.join(api, '_shared/mailer.js'))
const outbox = []
let failFor = new Set(), delayMs = 0
mailer.sendHtmlEmail = async ({ to }) => {
  if (delayMs) await new Promise(r => setTimeout(r, delayMs))
  if (failFor.has(to)) throw new Error('mailbox down')
  outbox.push(to)
}

const subs = require(path.join(api, '_shared/subscribers.js'))
const sendFn = require(path.join(api, 'newsletter-send/index.js'))
const statsFn = require(path.join(api, 'newsletter-stats/index.js'))

let pass = 0, fail = 0
async function t(label, fn) { try { await fn(); console.log('  PASS', label); pass++ } catch (e) { console.log('  FAIL', label, '\n      ', e.message.split('\n')[0]); fail++ } }
const log = Object.assign(() => {}, { warn() {}, error() {} })
const KEY = { 'x-admin-key': 'admin-key-123' }
async function send(body, headers = KEY) { const ctx = { log }; await sendFn(ctx, { method: 'POST', headers, body }); return { status: ctx.res.status, body: JSON.parse(ctx.res.body || '{}') } }

async function seed(n) {
  store.clear(); outbox.length = 0; failFor = new Set(); delayMs = 0
  delete process.env.NEWSLETTER_SEND_BUDGET_MS
  for (let i = 0; i < n; i++) { const e = `p${i}@example.com`; await subs.upsertPending({ email: e, name: `P${i}` }); await subs.setStatus(e, 'confirmed') }
  await subs.upsertPending({ email: 'pending@example.com', name: 'Pending' })
  await subs.upsertPending({ email: 'gone@example.com', name: 'Gone' }); await subs.setStatus('gone@example.com', 'confirmed'); await subs.setStatus('gone@example.com', 'unsubscribed')
}

;(async () => {
  console.log('newsletter-send resume')
  await t('rejects a missing admin key', async () => { await seed(2); assert.strictEqual((await send({ subject: 's', html: '<p>x</p>' }, {})).status, 401) })

  await t('one call sends to every confirmed subscriber and nobody else', async () => {
    await seed(12)
    const r = (await send({ subject: 'Issue', html: '<p>hi</p>' })).body
    assert.strictEqual(r.done, true); assert.strictEqual(r.sent, 12); assert.strictEqual(r.remaining, 0); assert.strictEqual(r.total, 12)
    assert.strictEqual(outbox.length, 12)
    assert(!outbox.includes('pending@example.com') && !outbox.includes('gone@example.com'))
  })

  await t('a cut off send resumes and nobody gets it twice', async () => {
    await seed(12)
    process.env.NEWSLETTER_SEND_BUDGET_MS = '1'; delayMs = 5
    const first = (await send({ subject: 'Issue', html: '<p>hi</p>' })).body
    assert.strictEqual(first.done, false); assert(first.remaining > 0 && first.sent > 0)
    const id = first.issueId
    let r = first, rounds = 0
    while (!r.done && rounds++ < 20) r = (await send({ issueId: id })).body
    assert.strictEqual(r.done, true); assert.strictEqual(r.sent, 12)
    assert.strictEqual(outbox.length, 12); assert.strictEqual(new Set(outbox).size, 12)
  })

  await t('failed recipients stay unsent and are picked up on resume', async () => {
    await seed(7); failFor = new Set(['p3@example.com'])
    const first = (await send({ subject: 'Issue', html: '<p>hi</p>' })).body
    assert.strictEqual(first.done, false); assert.strictEqual(first.remaining, 1); assert.strictEqual(first.failed, 1)
    assert.strictEqual(first.failures[0].email, 'p3@example.com')
    failFor = new Set()
    const r = (await send({ issueId: first.issueId })).body
    assert.strictEqual(r.done, true); assert.strictEqual(r.sentNow, 1)
    assert.strictEqual(outbox.filter(e => e === 'p3@example.com').length, 1)
  })

  await t('someone who unsubscribes mid-send is skipped, a new confirmation is included', async () => {
    await seed(6)
    process.env.NEWSLETTER_SEND_BUDGET_MS = '1'; delayMs = 5
    const first = (await send({ subject: 'Issue', html: '<p>hi</p>' })).body
    await subs.setStatus('p5@example.com', 'unsubscribed')
    await subs.upsertPending({ email: 'late@example.com', name: 'Late' }); await subs.setStatus('late@example.com', 'confirmed')
    let r = first, rounds = 0
    while (!r.done && rounds++ < 20) r = (await send({ issueId: first.issueId })).body
    assert.strictEqual(r.done, true)
    assert(outbox.includes('late@example.com'))
    assert.strictEqual(new Set(outbox).size, outbox.length)
  })

  await t('resuming with different content is refused', async () => {
    await seed(3); failFor = new Set(['p1@example.com'])
    const first = (await send({ subject: 'Issue', html: '<p>hi</p>' })).body
    const res = await send({ issueId: first.issueId, subject: 'Issue', html: '<p>changed</p>' })
    assert.strictEqual(res.status, 409)
    assert.strictEqual((await send({ issueId: 'nope' })).status, 400)
    assert.strictEqual((await send({ issueId: '2020-01-01T00-00-00-000Z-0000' })).status, 404)
  })

  await t('a finished issue cannot be resumed, and two rounds cannot overlap', async () => {
    await seed(3)
    const first = (await send({ subject: 'Issue', html: '<p>hi</p>' })).body
    assert.strictEqual(first.done, true)
    assert.strictEqual((await send({ issueId: first.issueId })).status, 409)
    await seed(4); failFor = new Set(['p1@example.com'])
    const part = (await send({ subject: 'Issue', html: '<p>hi</p>' })).body
    const row = [...store.entries()].find(([k]) => k.endsWith(`|issue|${part.issueId}`))
    row[1].roundStartedAt = new Date().toISOString()
    failFor = new Set(); outbox.length = 0
    assert.strictEqual((await send({ issueId: part.issueId })).status, 409, 'a round in progress blocks another')
    assert.strictEqual(outbox.length, 0)
    row[1].roundStartedAt = new Date(Date.now() - 120000).toISOString()
    assert.strictEqual((await send({ issueId: part.issueId })).body.done, true, 'an old lease expires')
  })

  await t('the ledger holds no readable email addresses', async () => {
    await seed(3)
    await send({ subject: 'Issue', html: '<p>hi</p>' })
    for (const [k, v] of store) if (v.partitionKey && v.partitionKey.startsWith('sent-')) {
      assert(!JSON.stringify(v).includes('@'), 'ledger row has an address')
    }
  })

  await t('stats list the issue with its remaining count', async () => {
    await seed(4); failFor = new Set(['p0@example.com'])
    await send({ subject: 'Issue', html: '<p>hi</p>' })
    const ctx = { log }; await statsFn(ctx, { method: 'GET', headers: KEY, query: {} })
    const issue = ctx.res.body.issues[0]
    assert.strictEqual(issue.status, 'incomplete'); assert.strictEqual(issue.remaining, 1); assert.strictEqual(issue.sent, 3)
  })

  await t('test send does not start an issue', async () => {
    await seed(2)
    const r = (await send({ subject: 's', html: '<p>x</p>', testTo: 'me@example.com' })).body
    assert.strictEqual(r.mode, 'test')
    assert.strictEqual([...store.values()].filter(v => v.partitionKey === 'issue').length, 0)
  })

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})()
