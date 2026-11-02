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
const reset = n => {
  rows = Array.from({ length: n }, (_, i) => ({ rowKey: `r${i}`, status: 'acked', topic: 'volunteer', name: `P${i}`, email: `p${i}@example.com`, message: 'I want to volunteer', receivedAt: Date.now() - 10 * DAY }))
  updates = []; nudges = []; modelCalls = 0
}
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (/_shared\/mailer$/.test(req)) return { respond: (c, status, body) => { c.res = { status, body } }, sendHtmlEmail: async m => { nudges.push(m) } }
  if (/_shared\/inquiries$/.test(req)) return {
    listInquiries: async () => rows.filter(r => r.status === 'acked'),
    updateInquiry: async (id, patch) => { updates.push([id, patch]); Object.assign(rows.find(r => r.rowKey === id), patch) },
  }
  return oL.call(this, req, parent, ...rest)
}
global.fetch = async () => {
  modelCalls++
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

  for (const bad of [{ limit: 0 }, { limit: -3 }, { limit: 'abc' }, { limit: 1.5 }]) {
    reset(25)
    r = await run(bad)
    assert.strictEqual(r.body.drafted, 20, `an unusable limit (${JSON.stringify(bad)}) falls back to the normal 20`)
  }

  reset(25)
  r = await run({ limit: 100 })
  assert.strictEqual(r.body.drafted, 20, 'a large limit is capped at 20')

  const fs = require('fs')
  assert(!/[—–]/.test(fs.readFileSync(path.join(api, 'inquiries-draft/index.js'), 'utf8')), 'no em or en dashes in the drafter')
  console.log('draft-batches: all checks passed')
})().catch(e => { console.error(e); process.exit(1) })
