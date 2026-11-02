/**
 * The drafter works in small batches when asked. Run with  node tests/draft-batches.test.js
 * No network. The model call, the inquiry store and the mailer are replaced.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.NEWSLETTER_ADMIN_KEY = 'k'
process.env.ANTHROPIC_API_KEY = 'x'
process.env.INQUIRY_NUDGE_EMAIL = 'team@example.com'

const DAY = 24 * 60 * 60 * 1000
let rows, updates, nudges, modelCalls
let failFor = []
let listError = null
const reset = n => {
  rows = Array.from({ length: n }, (_, i) => ({ rowKey: `r${i}`, status: 'acked', topic: 'volunteer', name: `P${i}`, email: `p${i}@example.com`, message: 'I want to volunteer', receivedAt: Date.now() - 10 * DAY }))
  updates = []; nudges = []; modelCalls = 0
}
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (/_shared\/mailer$/.test(req)) return { respond: (c, status, body) => { c.res = { status, body } }, sendHtmlEmail: async m => { nudges.push(m) } }
  if (/_shared\/inquiries$/.test(req)) return {
    listInquiries: async statuses => { if (listError) throw listError; return rows.filter(r => !statuses || statuses.includes(r.status)) },
    updateInquiry: async (id, patch) => { updates.push([id, patch]); Object.assign(rows.find(r => r.rowKey === id), patch) },
  }
  return oL.call(this, req, parent, ...rest)
}
global.fetch = async (url, opts) => {
  modelCalls++
  const user = JSON.parse(opts.body).messages[0].content
  if (failFor.some(n => user.includes(`From: ${n} <`))) throw new Error('model down')
  return { json: async () => ({ content: [{ type: 'text', text: '{"action":"draft","subject":"Hello","body":"Thanks. Please send a resume link."}' }] }) }
}
const draft = require(path.join(api, 'inquiries-draft/index.js'))
const run = async body => {
  const c = { log: { warn() {}, error() {} } }
  await draft(c, { method: 'POST', headers: { 'x-admin-key': 'k' }, body })
  return c.res
}

;(async () => {
  reset(5)
  let r = await run({ limit: 2 })
  assert.strictEqual(r.status, 200)
  assert.strictEqual(modelCalls, 2, 'a batch of 2 makes 2 model calls')
  assert.strictEqual(r.body.drafted, 2)
  assert.strictEqual(r.body.remaining, 3, 'the response says how many are left')
  assert.strictEqual(nudges.length, 0, 'small batches do not send the nudge email')
  assert.strictEqual(updates[0][1].draftRules, 'v2', 'drafts carry the rules version')

  r = await run({ limit: 2 })
  assert.strictEqual(r.body.remaining, 1, 'the next batch picks up the next ones')
  r = await run({ limit: 2 })
  assert.strictEqual(r.body.drafted, 1)
  assert.strictEqual(r.body.remaining, 0, 'nothing is left after the last batch')

  reset(5)
  r = await run(undefined)
  assert.strictEqual(r.body.drafted, 5, 'no body behaves as before')
  assert.strictEqual(nudges.length, 1, 'a full run still sends the nudge email')

  // A card whose model call keeps failing is reported, and skipping it lets the rest through.
  reset(6); failFor = ['P0', 'P1', 'P2']
  r = await run({ limit: 3 })
  assert.strictEqual(r.body.drafted, 0, 'a batch of failing cards drafts nothing')
  assert.deepStrictEqual(r.body.failed, ['r0', 'r1', 'r2'], 'the failed cards are named')
  assert.strictEqual(r.body.remaining, 3, 'failed cards are not counted as waiting')
  assert.strictEqual(rows[0].status, 'acked', 'a failed card stays in Received')
  r = await run({ limit: 3, skip: r.body.failed })
  assert.strictEqual(r.body.drafted, 3, 'with the failures skipped the next batch gets through')
  assert.strictEqual(r.body.remaining, 0)
  assert.deepStrictEqual(r.body.failed, [])
  failFor = []

  for (const bad of [{ limit: 0 }, { limit: -3 }, { limit: 'abc' }, { limit: 1.5 }]) {
    reset(25)
    r = await run(bad)
    assert.strictEqual(r.body.drafted, 20, `an unusable limit (${JSON.stringify(bad)}) falls back to the normal 20`)
  }

  reset(25)
  r = await run({ limit: 100 })
  assert.strictEqual(r.body.drafted, 20, 'a large limit is capped at 20')

  // The reminder only request: one email that reports what is actually waiting.
  reset(3)
  rows.push({ rowKey: 'd1', status: 'drafted', topic: 'volunteer' }, { rowKey: 'd2', status: 'drafted', topic: 'volunteer' }, { rowKey: 'n1', status: 'needs-attention', topic: 'press' })
  r = await run({ nudge: true })
  assert.strictEqual(r.status, 200)
  assert.deepStrictEqual([r.body.awaiting, r.body.flagged, r.body.sent], [2, 1, true], 'it counts what is waiting, not what one run drafted')
  assert.strictEqual(nudges.length, 1, 'exactly one reminder email')
  assert(/2 drafts awaiting approval, 1 flagged/.test(nudges[0].plainText), 'the email carries those counts')
  assert.strictEqual(modelCalls, 0, 'no drafting and no model call')
  assert(!updates.length, 'nothing is changed')

  reset(0)
  r = await run({ nudge: true })
  assert.deepStrictEqual([r.body.awaiting, r.body.flagged, r.body.sent], [0, 0, false], 'nothing waiting means no email')
  assert.strictEqual(nudges.length, 0)

  reset(1); rows.push({ rowKey: 'd1', status: 'drafted', topic: 'volunteer' })
  const savedNudgeTo = process.env.INQUIRY_NUDGE_EMAIL; delete process.env.INQUIRY_NUDGE_EMAIL
  r = await run({ nudge: true })
  process.env.INQUIRY_NUDGE_EMAIL = savedNudgeTo
  assert.strictEqual(r.body.sent, false, 'no address configured means no email, and no error')
  assert.strictEqual(r.status, 200)

  const c401 = { log: { warn() {}, error() {} } }
  await draft(c401, { method: 'POST', headers: { 'x-admin-key': 'nope' }, body: { nudge: true } })
  assert.strictEqual(c401.res.status, 401, 'the reminder needs the admin key too')

  // A storage failure is reported with its reason, not hidden.
  reset(1); listError = new Error('connection refused')
  r = await run({ limit: 3 })
  assert.strictEqual(r.status, 500, 'a storage failure is a 500')
  assert.strictEqual(r.body.error, 'Drafting run failed')
  assert.strictEqual(r.body.detail, 'connection refused', 'the response says why')
  listError = null

  const fs = require('fs')
  assert(!/[—–]/.test(fs.readFileSync(path.join(api, 'inquiries-draft/index.js'), 'utf8')), 'no em or en dashes in the drafter')
  console.log('draft-batches: all checks passed')
})().catch(e => { console.error(e); process.exit(1) })
