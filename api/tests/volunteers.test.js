/**
 * Volunteer roster and automatic membership.  Run with  node tests/volunteers.test.js
 * No network. Azure Tables, the mailer, the email checks and the file store are fakes.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.NEWSLETTER_ADMIN_KEY = 'k'
process.env.SUBSCRIBERS_TABLE_CONNECTION = 'fake'
process.env.NEWSLETTER_TOKEN_SECRET = 's'
process.env.SIGNUP_CHALLENGE_MODE = 'off'

const store = new Map() // 'table|partition|row' -> entity
const sent = []
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (req === '@azure/data-tables') return { TableClient: { fromConnectionString: (c, name) => ({
    createTable: async () => {},
    getEntity: async (p, r) => { const e = store.get(`${name}|${p}|${r}`); if (!e) { const err = new Error('404'); err.statusCode = 404; throw err } return Object.assign({}, e) },
    createEntity: async e => { store.set(`${name}|${e.partitionKey}|${e.rowKey}`, Object.assign({}, e)) },
    upsertEntity: async (e, mode) => { const k = `${name}|${e.partitionKey}|${e.rowKey}`; store.set(k, mode === 'Merge' ? Object.assign({}, store.get(k) || {}, e) : Object.assign({}, e)) },
    updateEntity: async (e, mode) => { const k = `${name}|${e.partitionKey}|${e.rowKey}`; if (!store.has(k)) { const err = new Error('404'); err.statusCode = 404; throw err } store.set(k, Object.assign({}, store.get(k) || {}, e)) },
    deleteEntity: async (p, r) => { store.delete(`${name}|${p}|${r}`) },
    listEntities: ({ queryOptions }) => {
      const part = /PartitionKey eq '([^']+)'/.exec(queryOptions.filter)[1]
      const rows = [...store.entries()].filter(([k, e]) => k.startsWith(name + '|') && e.partitionKey === part).map(([, e]) => Object.assign({}, e))
      return (async function* () { for (const r of rows) yield r })()
    },
  }) } }
  if (/(^|\/)mailer$/.test(req)) return Object.assign({}, oL.call(this, req, parent, ...rest), { sendHtmlEmail: async m => { sent.push(m) }, sendFormEmail: async () => {} })
  if (/(^|\/)emailChecks$/.test(req)) return { strictEmailCheck: async e => (/blocked/.test(e) ? { ok: false, status: 400, body: {}, reason: 'blocked' } : { ok: true }) }
  if (/(^|\/)resumeStore$/.test(req)) return Object.assign({}, oL.call(this, req, parent, ...rest), { saveResume: async () => 'x', deleteResume: async () => true })
  return oL.call(this, req, parent, ...rest)
}

const contact = require(path.join(api, 'contact/index.js'))
const roster = require(path.join(api, 'volunteers/index.js'))
const act = require(path.join(api, 'inquiries-act/index.js'))
const SA = require(path.join(api, '_shared/subscriberAdmin.js'))
const V = require(path.join(api, '_shared/volunteers.js'))

const volunteer = { why: 'I care a lot about privacy and want to help people protect their data online.', roles: ['Privacy Researcher'], experience: 'Five years in compliance work.', hours: '4 to 6 hours a month', profileLink: 'https://www.linkedin.com/in/x' }
let ip = 0
const apply = async (over = {}) => {
  const c = { log: { warn() {}, error(...a) { if (process.env.DBG) console.error(...a) }, info() {} } }
  await contact(c, { method: 'POST', headers: { 'x-forwarded-for': `10.0.0.${++ip}` }, body: Object.assign({
    topic: 'volunteer', Name: 'Ada Lovelace', Email: 'ada@example.com', Message: volunteer.why, volunteer,
    joinAsMember: true, termsVersion: '2026-10-v2', Consented: 'Yes',
  }, over) })
  return c.res
}
const call = async (fn, method, { key, body } = {}) => {
  const c = { log: { warn() {}, error() {} } }
  await fn(c, { method, headers: key === undefined ? {} : { 'x-admin-key': key }, body, query: {} })
  return { status: c.res.status, body: typeof c.res.body === 'string' ? JSON.parse(c.res.body) : c.res.body }
}
const subRow = email => [...store.entries()].find(([k, e]) => k.startsWith('subscribers|sub|') && e.email === email)?.[1]
const rows = () => [...store.entries()].filter(([k]) => k.startsWith('volunteers|')).map(([, e]) => e)

;(async () => {
  // 1. An application adds a roster row and, with the box ticked, a pending member plus a confirmation email.
  let r = await apply()
  assert.strictEqual(r.status, 200)
  assert.strictEqual(JSON.parse(r.body).member, 'pending')
  assert.strictEqual(rows().length, 1)
  assert.strictEqual(rows()[0].status, 'applied')
  assert.strictEqual(rows()[0].memberRequested, true)
  const sub = subRow('ada@example.com')
  assert(sub && sub.status === 'pending' && sub.member === true, 'a pending member, not yet confirmed')
  assert.strictEqual(sub.memberTermsVersion, '2026-10-v2', 'the terms version is recorded')
  assert(sent.some(m => m.to === 'ada@example.com' && /Confirm your ODIPA community membership/.test(m.subject)), 'double opt-in email sent')

  // 2. Unticked: roster only, no member, no confirmation email.
  sent.length = 0
  r = await apply({ Email: 'bo@example.com', Name: 'Bo Chen', joinAsMember: false })
  assert.strictEqual(r.status, 200)
  assert.strictEqual(rows().length, 2)
  assert(!subRow('bo@example.com'), 'unticked means no subscriber row')
  assert(!sent.some(m => m.to === 'bo@example.com' && /membership/.test(m.subject)))

  // 3. Ticked without a terms version, or with a one word name: application still works, membership skipped.
  r = await apply({ Email: 'cy@example.com', Name: 'Cy Dunn', termsVersion: '' })
  assert.strictEqual(r.status, 200); assert(!subRow('cy@example.com'))
  r = await apply({ Email: 'dee@example.com', Name: 'Dee' })
  assert.strictEqual(r.status, 200); assert(!subRow('dee@example.com'), 'a membership needs a first and last name')
  assert(rows().some(x => x.email === 'dee@example.com'), 'but the volunteer is still on the roster')
  r = await apply({ Email: 'eve@blocked.example', Name: 'Eve Stone' })
  assert.strictEqual(r.status, 200); assert(!subRow('eve@blocked.example'), 'a refused email address is not made a member')

  // 4. A repeat application keeps the status the team set.
  const adaId = V.idFor('ada@example.com')
  let a = await call(roster, 'POST', { key: 'k', body: { id: adaId, status: 'active' } })
  assert.strictEqual(a.status, 200)
  await apply()
  assert.strictEqual(rows().find(x => x.email === 'ada@example.com').status, 'active', 'reapplying does not reset the status')

  // 5. Admin only; validation.
  a = await call(roster, 'GET', {}); assert.strictEqual(a.status, 401)
  a = await call(roster, 'GET', { key: 'wrong' }); assert.strictEqual(a.status, 401)
  a = await call(roster, 'POST', { key: 'wrong', body: { id: adaId, status: 'active' } }); assert.strictEqual(a.status, 401)
  a = await call(roster, 'GET', { key: 'k' })
  assert.strictEqual(a.body.volunteers.length, 5); assert.strictEqual(a.body.statuses.length, 5)
  a = await call(roster, 'POST', { key: 'k', body: { id: adaId, status: 'banished' } }); assert.strictEqual(a.status, 400)
  a = await call(roster, 'POST', { key: 'k', body: { id: 'nope', status: 'active' } }); assert.strictEqual(a.status, 400)
  a = await call(roster, 'POST', { key: 'k', body: { id: adaId, notes: 'Great on the call.' } })
  assert.strictEqual(rows().find(x => x.email === 'ada@example.com').notes, 'Great on the call.')

  // 6. Moving the volunteer's card to "meeting" on the board moves an applied volunteer, never one the team advanced.
  store.set('inquiries|inquiry|i1', { partitionKey: 'inquiry', rowKey: 'i1', topic: 'volunteer', email: 'bo@example.com', name: 'Bo Chen', status: 'acked' })
  store.set('inquiries|inquiry|i2', { partitionKey: 'inquiry', rowKey: 'i2', topic: 'volunteer', email: 'ada@example.com', name: 'Ada', status: 'acked' })
  await call(act, 'POST', { key: 'k', body: { id: 'i1', action: 'move', status: 'meeting' } })
  await call(act, 'POST', { key: 'k', body: { id: 'i2', action: 'move', status: 'meeting' } })
  assert.strictEqual(rows().find(x => x.email === 'bo@example.com').status, 'intro-call')
  assert.strictEqual(rows().find(x => x.email === 'ada@example.com').status, 'active', 'an active volunteer is not pulled back')

  // 7. Deleting a person in the Subscribers tool also removes the roster row, even for a non-subscriber.
  const del = await SA.deletePerson({ email: 'bo@example.com', reason: 'requested' })
  assert.strictEqual(del.deleted, true)
  assert(!rows().some(x => x.email === 'bo@example.com'), 'the roster row is gone')
  const del2 = await SA.deletePerson({ email: 'ada@example.com', reason: 'requested' })
  assert.strictEqual(del2.deleted, true); assert(!rows().some(x => x.email === 'ada@example.com') && !subRow('ada@example.com'))
  assert.strictEqual((await SA.deletePerson({ email: 'nobody@example.com', reason: 'requested' })).deleted, false)

  // 7b. A roster row stored under a Gmail variant goes when the plain address is deleted, and a
  // volunteer-only deletion is logged like any other.
  await V.recordApplication({ email: 'jo.hn+vol@gmail.com', name: 'Jo Hn', roles: 'Privacy Researcher', hours: '2 to 4 hours a month' })
  assert(rows().some(x => x.email === 'jo.hn+vol@gmail.com'))
  const del3 = await SA.deletePerson({ email: 'john@gmail.com', reason: 'requested' })
  assert.strictEqual(del3.deleted, true); assert.strictEqual(del3.logged, true, 'volunteer-only deletions are logged')
  assert(!rows().some(x => x.email === 'jo.hn+vol@gmail.com'), 'the Gmail variant row is gone too')
  a = await call(roster, 'POST', { key: 'k', body: { id: 'f'.repeat(64), status: 'active' } })
  assert.strictEqual(a.status, 404, 'an unknown volunteer is a 404, not a server error')

  // 8. Roster delete from the admin.
  a = await call(roster, 'POST', { key: 'k', body: { id: V.idFor('cy@example.com'), action: 'delete' } })
  assert(!rows().some(x => x.email === 'cy@example.com'))

  console.log('volunteer tests passed')
})().catch(e => { console.error(e); process.exit(1) })
