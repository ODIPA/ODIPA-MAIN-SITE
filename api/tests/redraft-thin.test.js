/**
 * Bulk redraft of thin volunteer drafts. Run with  node tests/redraft-thin.test.js
 * No network. The inquiry store is an in-memory list and the mailer is a stub.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.NEWSLETTER_ADMIN_KEY = 'k'

const rows = [
  { rowKey: 'old-thin', status: 'drafted', topic: 'volunteer', message: 'I want to volunteer', draftBody: 'old' },
  { rowKey: 'new-thin', status: 'drafted', topic: 'volunteer', message: 'I want to volunteer', draftRules: 'v3' },
  { rowKey: 'has-link', status: 'drafted', topic: 'volunteer', message: 'My profile is https://linkedin.com/in/x' },
  { rowKey: 'form', status: 'drafted', topic: 'volunteer', message: 'VOLUNTEER APPLICATION\nWhy ODIPA: privacy' },
  { rowKey: 'press', status: 'drafted', topic: 'press', message: 'Question for a story' },
  { rowKey: 'flagged-thin', status: 'needs-attention', topic: 'volunteer', message: 'I want to volunteer' },
  { rowKey: 'acked-thin', status: 'acked', topic: 'volunteer', message: 'I want to volunteer' },
]
const updates = []
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (/_shared\/inquiries$/.test(req)) return {
    listInquiries: async statuses => rows.filter(r => !statuses || statuses.includes(r.status)),
    getInquiry: async id => rows.find(r => r.rowKey === id),
    updateInquiry: async (id, patch) => { updates.push([id, patch]) },
  }
  if (/_shared\/mailer$/.test(req)) return { respond: (c, status, body) => { c.res = { status, body } }, sendHtmlEmail: async () => {} }
  return oL.call(this, req, parent, ...rest)
}
const act = require(path.join(api, 'inquiries-act/index.js'))
const run = async (body, key = 'k') => {
  const c = { log: { warn() {}, error() {} } }
  await act(c, { method: 'POST', headers: { 'x-admin-key': key }, body })
  return c.res
}

;(async () => {
  let r = await run({ action: 'redraft-thin' }, 'wrong')
  assert.strictEqual(r.status, 401, 'needs the admin key')
  assert.strictEqual(updates.length, 0, 'nothing changes without the key')

  r = await run({ action: 'redraft-thin', dryRun: true })
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.count, 1, 'only the old thin volunteer draft counts')
  assert.strictEqual(r.body.dryRun, true)
  assert.strictEqual(updates.length, 0, 'a dry run changes nothing')

  r = await run({ action: 'redraft-thin' })
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.count, 1)
  assert.deepStrictEqual(updates, [['old-thin', { status: 'acked', handledAt: 0 }]], 'only the old thin draft goes back to acked')

  console.log('redraft-thin: all checks passed')
})().catch(e => { console.error(e); process.exit(1) })
