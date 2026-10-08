/**
 * Signup abuse control tests. Run with  node tests/abuse.test.js
 * Azure's email client and Table Storage are replaced with recorders. All ODIPA code is real.
 */
const path = require('path'), Module = require('module'), assert = require('assert'), crypto = require('crypto')
const api = path.join(__dirname, '..')
process.env.NEWSLETTER_TOKEN_SECRET = 's'
process.env.NEWSLETTER_ADMIN_KEY = 'admin-key'
process.env.SUBSCRIBERS_TABLE_CONNECTION = 'x'
process.env.COMMUNICATION_SERVICES_CONNECTION_STRING = 'endpoint=https://x.communication.azure.com/;accesskey=x'
process.env.ACS_SENDER_EMAIL = 'DoNotReply@example.azurecomm.net'

const sentMessages = []
class FakeEmailClient {
  async beginSend(message) { sentMessages.push(message); return { pollUntilDone: async () => ({ id: 'm', status: 'Succeeded' }) } }
}
const stores = {}
const store = name => (stores[name] = stores[name] || new Map())
const tables = require(path.join(api, 'node_modules/@azure/data-tables'))
tables.TableClient.fromConnectionString = (conn, name) => {
  const rows = store(name)
  return {
    createTable: async () => {},
    getEntity: async (p, r) => { const e = rows.get(p + r); if (!e) { const x = new Error('nf'); x.statusCode = 404; throw x } return { ...e } },
    upsertEntity: async e => { rows.set(e.partitionKey + e.rowKey, { ...(rows.get(e.partitionKey + e.rowKey) || {}), ...e }) },
    deleteEntity: async (p, r) => { rows.delete(p + r) },
    listEntities: async function* ({ queryOptions } = {}) {
      const f = (queryOptions && queryOptions.filter) || ''
      for (const e of rows.values()) {
        if (f.includes("status eq 'pending'") && e.status !== 'pending') continue
        yield { ...e }
      }
    },
  }
}
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (req === '@azure/communication-email') return { EmailClient: FakeEmailClient }
  return oL.call(this, req, parent, ...rest)
}
const emailChecks = require(path.join(api, '_shared/emailChecks.js'))
// A fake resolver so the mail server check is deterministic here. gmail.com is the canary.
const KNOWN = new Set(['gmail.com', 'example.com', 'odipa.org', 'outlook.com', 'brown.edu', 'googlemail.com'])
const notFound = () => { const e = new Error('nf'); e.code = 'ENOTFOUND'; throw e }
const fakeDns = {
  resolveMx: async d => KNOWN.has(d) ? [{ exchange: 'mx.' + d, priority: 10 }] : notFound(),
  resolve4: async d => d === 'a-record-only.test' ? ['192.0.2.1'] : notFound(),
  resolve6: async () => notFound(),
}
const realStrict = emailChecks.strictEmailCheck
emailChecks.strictEmailCheck = email => realStrict(email, fakeDns)
const abuse = require(path.join(api, '_shared/abuse.js'))
const subs = require(path.join(api, '_shared/subscribers.js'))
const admin = require(path.join(api, '_shared/subscriberAdmin.js'))
const membership = require(path.join(api, 'membership/index.js'))
const newsletter = require(path.join(api, 'newsletter/index.js'))
const challengeFn = require(path.join(api, 'signup-challenge/index.js'))
const purgeFn = require(path.join(api, 'subscriber-purge-pending/index.js'))

let pass = 0, fail = 0
async function t(label, fn) { try { await fn(); console.log('  PASS', label); pass++ } catch (e) { console.log('  FAIL', label, '\n      ', e.message.split('\n')[0]); fail++ } }
const logs = []
const log = Object.assign(m => logs.push(['info', String(m)]), { warn: m => logs.push(['warn', String(m)]), error: m => logs.push(['error', String(m)]) })
const reset = () => { sentMessages.length = 0; logs.length = 0; for (const k of Object.keys(stores)) stores[k].clear(); delete process.env.SIGNUP_CHALLENGE_MODE }
const subRows = () => [...store('subscribers').values()].filter(r => r.partitionKey === 'sub')

function solve(c) {
  for (let k = 0; k <= c.maxnumber; k++) {
    if (crypto.createHash('sha256').update(c.salt + k).digest('hex') === c.challenge) {
      return { algorithm: c.algorithm, challenge: c.challenge, number: k, salt: c.salt, signature: c.signature }
    }
  }
}
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64')
const aged = (ms = 10000) => b64(solve(abuse.issueChallenge(Date.now() - ms)))   // a solution old enough to pass

let ip = 0
async function post(fn, body) {
  const ctx = { log }
  await fn(ctx, { method: 'POST', headers: { 'x-forwarded-for': `10.9.${Math.floor(++ip / 250)}.${ip % 250}` }, body })
  return { status: ctx.res.status, body: typeof ctx.res.body === 'string' ? JSON.parse(ctx.res.body) : ctx.res.body }
}
let u = 0
const joinBody = (email, extra) => ({ email, firstName: 'Taylor', lastName: 'Reyes', source: 'Join page', acceptedTerms: true, termsVersion: 'v2', challenge: aged(), ...extra })
const newsBody = (email, extra) => ({ email, source: 'Footer', challenge: aged(), ...extra })
const fresh = () => `person${++u}@example.com`

;(async () => {
  console.log('\nemail identity')
  await t('Gmail dots, plus tags and googlemail collapse to one address', () => {
    for (const v of ['j.a.smine@gmail.com', 'jasmine+news@gmail.com', 'J.Asmine@GoogleMail.com', 'ja.smi.ne+x.y@gmail.com'])
      assert.strictEqual(abuse.canonicalEmail(v), 'jasmine@gmail.com', v)
  })
  await t('other providers are only lowercased, since dots count there', () => {
    assert.strictEqual(abuse.canonicalEmail('J.Smith+a@Example.com'), 'j.smith+a@example.com')
    assert.strictEqual(abuse.canonicalEmail('a.b@outlook.com'), 'a.b@outlook.com')
  })
  await t('a degenerate Gmail local part is left alone, not turned into @gmail.com', () => {
    assert.strictEqual(abuse.canonicalEmail('+x@gmail.com'), '+x@gmail.com')
    assert.strictEqual(abuse.canonicalEmail('...@gmail.com'), '...@gmail.com')
  })
  await t('the real bot address from the ODIPA inbox is flagged', () => {
    assert.strictEqual(abuse.looksGenerated('j.a.smin.e.h.i.nnant9.21.1@gmail.com'), true)
  })
  await t('ordinary Gmail addresses are not flagged', () => {
    for (const v of ['jane@gmail.com', 'first.last@gmail.com', 'first.middle.last@gmail.com', 'jane+a.b.c.d.e.f@gmail.com'])
      assert.strictEqual(abuse.looksGenerated(v), false, v)
    assert.strictEqual(abuse.looksGenerated('j.r.r.tolkien@gmail.com'), true, 'three or more dots is held')
    assert.strictEqual(abuse.looksGenerated('s.a.ra.h.k.ar.im.ah.s.aa@gmail.com'), true, 'the second real bot address')
  })
  await t('many dots on a non-Gmail domain are not flagged, since dots are real there', () => {
    assert.strictEqual(abuse.looksGenerated('a.b.c.d.e.f.g@example.com'), false)
  })

  console.log('\nproof-of-work challenge')
  await t('a correct solution passes', () => assert.deepStrictEqual(abuse.verifySolution(aged()), { ok: true }))
  await t('the same solution cannot be used twice', () => {
    const sol = aged()
    assert.strictEqual(abuse.verifySolution(sol).ok, true)
    assert.strictEqual(abuse.verifySolution(sol).reason, 'replayed')
  })
  await t('a solution submitted too soon after issue is rejected, then accepted once old enough', () => {
    const now = Date.now()
    const sol = b64(solve(abuse.issueChallenge(now)))
    assert.strictEqual(abuse.verifySolution(sol, now + 500).reason, 'too-fast')
    assert.strictEqual(abuse.verifySolution(sol, now + 3100).ok, true)
  })
  await t('an expired challenge is rejected', () => {
    const now = Date.now()
    const sol = b64(solve(abuse.issueChallenge(now)))
    assert.strictEqual(abuse.verifySolution(sol, now + 31 * 60 * 1000).reason, 'expired')
  })
  await t('a wrong number is rejected', () => {
    const s = solve(abuse.issueChallenge(Date.now() - 10000)); s.number = (s.number + 1) % 50001
    assert.strictEqual(abuse.verifySolution(b64(s)).reason, 'bad-solution')
  })
  await t('rewriting the issue time to dodge the minimum age breaks the proof', () => {
    const now = Date.now()
    const s = solve(abuse.issueChallenge(now))
    s.salt = s.salt.replace(`issued=${now}`, `issued=${now - 60000}`)
    assert.strictEqual(abuse.verifySolution(b64(s), now + 100).ok, false)
  })
  await t('a challenge the attacker made up, with a guessed signature, is rejected', () => {
    const salt = `abcd?issued=${Date.now() - 10000}&expires=${Date.now() + 100000}`
    const challenge = crypto.createHash('sha256').update(salt + '7').digest('hex')
    const forged = { algorithm: 'SHA-256', challenge, number: 7, salt, signature: crypto.createHmac('sha256', 'guess').update(challenge).digest('hex') }
    assert.strictEqual(abuse.verifySolution(b64(forged)).reason, 'bad-signature')
  })
  await t('a challenge signed under a different secret is rejected', () => {
    process.env.ABUSE_TOKEN_SECRET = 'other'
    const sol = aged()
    delete process.env.ABUSE_TOKEN_SECRET
    assert.strictEqual(abuse.verifySolution(sol).reason, 'bad-signature')
  })
  await t('missing and malformed payloads are rejected without throwing', () => {
    for (const v of [undefined, '', 'not base64 json', b64({ algorithm: 'MD5' }), b64([]), b64(null)])
      assert.strictEqual(abuse.verifySolution(v).ok, false)
  })

  console.log('\nchallenge endpoint')
  await t('returns a challenge a browser can solve and the server then accepts', async () => {
    reset()
    const r = await post(challengeFn, {})
    assert.strictEqual(r.status, 200)
    assert.deepStrictEqual(Object.keys(r.body).sort(), ['algorithm', 'challenge', 'maxnumber', 'salt', 'signature'])
    const sol = b64(solve(r.body))
    const issued = Number(new URLSearchParams(r.body.salt.split('?')[1]).get('issued'))
    assert.strictEqual(abuse.verifySolution(sol, issued + 4000).ok, true)
  })
  await t('is rate limited per IP', async () => {
    const same = { method: 'POST', headers: { 'x-forwarded-for': '10.77.0.1' }, body: {} }
    let last
    for (let i = 0; i < 21; i++) { const ctx = { log }; await challengeFn(ctx, same); last = ctx.res.status }
    assert.strictEqual(last, 429)
  })

  console.log('\nmembership sign up')
  await t('no challenge is refused, nothing stored, nothing emailed', async () => {
    reset()
    const r = await post(membership, joinBody(fresh(), { challenge: undefined }))
    assert.deepStrictEqual([r.status, r.body.code], [400, 'challenge-missing'])
    assert(/refresh the page/.test(r.body.error) && /info@odipa.org/.test(r.body.error))
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0)
  })
  await t('a bad challenge is refused, nothing stored, nothing emailed', async () => {
    reset()
    const r = await post(membership, joinBody(fresh(), { challenge: b64({ algorithm: 'SHA-256', challenge: 'a', number: 1, salt: 'b', signature: 'c' }) }))
    assert.deepStrictEqual([r.status, r.body.code], [400, 'challenge-failed'])
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0)
  })
  await t('a valid challenge signs the person up and sends the confirmation', async () => {
    reset()
    const email = fresh()
    const r = await post(membership, joinBody(email))
    assert.deepStrictEqual([r.status, r.body.ok], [200, true])
    assert.strictEqual(subRows()[0].email, email)
    assert(sentMessages.some(m => m.content.subject === 'Confirm your ODIPA community membership' && m.recipients.to[0].address === email))
  })
  await t('the generated looking Gmail address is held for review with no email sent anywhere', async () => {
    reset()
    const r = await post(membership, joinBody('j.a.smin.e.h.i.nnant9.21.1@gmail.com'))
    assert.deepStrictEqual([r.status, r.body.code], [422, 'email-review'])
    assert(/info@odipa.org/.test(r.body.error))
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0, 'no confirmation and no info@ notification')
  })
  await t('Gmail dot and plus variants of one inbox end up as one record', async () => {
    reset()
    assert.strictEqual((await post(membership, joinBody('mary.smith@gmail.com'))).status, 200)
    assert.strictEqual((await post(membership, joinBody('marysmith+odipa@gmail.com'))).status, 200)
    assert.strictEqual((await post(membership, joinBody('mary.s.mith@gmail.com'))).status, 200)
    assert.strictEqual(subRows().length, 1)
    assert.strictEqual(subRows()[0].email, 'marysmith@gmail.com')
    assert(sentMessages.filter(m => m.content.subject.startsWith('Confirm')).every(m => m.recipients.to[0].address === 'marysmith@gmail.com'))
  })
  await t('a person already on the list under their dotted address keeps that record', async () => {
    reset()
    await subs.upsertPending({ email: 'old.timer@gmail.com', name: 'Old', source: 'Footer' })
    await subs.setStatus('old.timer@gmail.com', 'confirmed')
    const r = await post(membership, joinBody('old.timer@gmail.com'))
    assert.deepStrictEqual([r.status, r.body.alreadyConfirmed], [200, true])
    assert.strictEqual(subRows().length, 1)
    assert.strictEqual(subRows()[0].email, 'old.timer@gmail.com')
  })
  await t('repeat attempts for one address are capped, so the form cannot mail-bomb a victim', async () => {
    reset()
    const email = fresh()
    const out = []
    for (let i = 0; i < 5; i++) out.push((await post(membership, joinBody(email))).status)
    assert.deepStrictEqual(out, [200, 200, 200, 429, 429])
    assert.strictEqual(sentMessages.filter(m => m.content.subject.startsWith('Confirm')).length, 3)
  })
  await t('the cap also applies across dotted variants of one Gmail inbox', async () => {
    reset()
    const out = []
    for (const v of ['v.ictim@gmail.com', 'vi.ctim@gmail.com', 'vic.tim@gmail.com', 'vict.im@gmail.com']) out.push((await post(membership, joinBody(v))).status)
    assert.deepStrictEqual(out, [200, 200, 200, 429])
  })
  await t('monitor mode lets a missing challenge through and logs it', async () => {
    reset(); process.env.SIGNUP_CHALLENGE_MODE = 'monitor'
    const r = await post(membership, joinBody(fresh(), { challenge: undefined }))
    delete process.env.SIGNUP_CHALLENGE_MODE
    assert.strictEqual(r.status, 200)
    assert(logs.some(l => l[0] === 'warn' && /challenge missing \(monitor mode, allowed\)/.test(l[1])))
  })
  await t('the log line for a refused sign up never contains the email address', async () => {
    reset()
    const email = fresh()
    await post(membership, joinBody(email, { challenge: undefined }))
    assert(logs.length > 0 && logs.every(l => !l[1].includes(email)))
  })

  console.log('\nnewsletter sign up')
  await t('the trap field gets a clear error, never a fake success, and nothing is stored or sent', async () => {
    reset()
    const r = await post(newsletter, newsBody(fresh(), { _hp: 'filled' }))
    assert.deepStrictEqual([r.status, r.body.code], [400, 'trap'])
    assert(/info@odipa.org/.test(r.body.error))
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0)
  })
  await t('no challenge is refused, nothing stored, nothing emailed', async () => {
    reset()
    const r = await post(newsletter, newsBody(fresh(), { challenge: undefined }))
    assert.deepStrictEqual([r.status, r.body.code], [400, 'challenge-missing'])
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0)
  })
  await t('a valid challenge signs the person up and sends the confirmation', async () => {
    reset()
    const email = fresh()
    const r = await post(newsletter, newsBody(email))
    assert.deepStrictEqual([r.status, r.body.ok], [200, true])
    assert(sentMessages.some(m => m.content.subject === 'Confirm your ODIPA newsletter subscription' && m.recipients.to[0].address === email))
  })
  await t('the generated looking Gmail address is held for review', async () => {
    reset()
    const r = await post(newsletter, newsBody('j.a.smin.e.h.i.nnant9.21.1@gmail.com'))
    assert.deepStrictEqual([r.status, r.body.code], [422, 'email-review'])
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0)
  })
  await t('Gmail variants collapse to one record here too', async () => {
    reset()
    await post(newsletter, newsBody('ann.lee@gmail.com')); await post(newsletter, newsBody('annlee+x@gmail.com'))
    assert.strictEqual(subRows().length, 1)
  })

  console.log('\nstrict email checks')
  await t('format: doubled, leading and trailing dots, bad endings and overlong parts are refused', () => {
    for (const v of ['a..b@gmail.com', '.a@gmail.com', 'a.@gmail.com', 'a@gmail', 'a@gmail.c', 'a@-bad.com', 'a@bad-.com', 'a@b..com', 'a@@b.com', 'x'.repeat(65) + '@gmail.com', 'a b@gmail.com', 'a@gmail.c0m'])
      assert.strictEqual(emailChecks.checkShape(v).ok, false, v)
  })
  await t('format: ordinary and unusual but valid addresses pass', () => {
    for (const v of ['jane@example.com', 'first.last@example.com', 'jane+tag@gmail.com', "o'brien@example.com", 'x@sub.domain.example.co.uk', 'a_b-c@example.io', 'name@xn--80ak6aa92e.com'])
      assert.strictEqual(emailChecks.checkShape(v).ok, true, v)
  })
  await t('throwaway providers are refused, including subdomains, with a clear message', () => {
    for (const v of ['x@mailinator.com', 'x@sub.mailinator.com', 'x@guerrillamail.com', 'x@yopmail.com', 'x@10minutemail.com']) {
      const r = emailChecks.checkDisposable(v)
      assert.deepStrictEqual([r.ok, r.status, r.body.code], [false, 422, 'email-disposable'], v)
      assert(/info@odipa.org/.test(r.body.error))
    }
  })
  await t('real providers are not on the throwaway list', () => {
    for (const v of ['x@gmail.com', 'x@outlook.com', 'x@yahoo.com', 'x@icloud.com', 'x@proton.me', 'x@protonmail.com', 'x@hotmail.com', 'x@odipa.org'])
      assert.strictEqual(emailChecks.checkDisposable(v).ok, true, v)
  })
  await t('mail server: a domain with MX passes, an A-record-only domain passes, a missing domain is refused', async () => {
    emailChecks._resetForTests()
    assert.strictEqual((await emailChecks.checkMx('x@example.com', fakeDns)).ok, true)
    assert.strictEqual((await emailChecks.checkMx('x@a-record-only.test', fakeDns)).ok, true)
    const r = await emailChecks.checkMx('x@no-such-domain.test', fakeDns)
    assert.deepStrictEqual([r.ok, r.status, r.body.code], [false, 422, 'email-domain'])
  })
  await t('mail server: when DNS itself is down, nobody is refused', async () => {
    emailChecks._resetForTests()
    const dead = { resolveMx: notFound, resolve4: notFound, resolve6: notFound }   // even gmail.com "does not exist"
    const r = await emailChecks.checkMx('x@anything.test', dead)
    assert.deepStrictEqual([r.ok, r.skipped], [true, 'dns-unavailable'])
    const slow = { resolveMx: async () => { const e = new Error('t'); e.code = 'ETIMEOUT'; throw e }, resolve4: notFound, resolve6: notFound }
    assert.strictEqual((await emailChecks.checkMx('x@example.com', slow)).ok, true)
  })
  await t('the order is format, then throwaway, then mail server', async () => {
    emailChecks._resetForTests()
    assert.strictEqual((await realStrict('a..b@mailinator.com', fakeDns)).reason, 'local')
    assert.strictEqual((await realStrict('a@mailinator.com', fakeDns)).reason, 'disposable')
    assert.strictEqual((await realStrict('a@no-such-domain.test', fakeDns)).reason, 'no-mx')
    assert.strictEqual((await realStrict('a@example.com', fakeDns)).ok, true)
  })
  await t('Join refuses a throwaway or dead domain before storing or emailing anything', async () => {
    reset()
    for (const email of ['bot@mailinator.com', 'bot@no-such-domain.test']) {
      const r = await post(membership, joinBody(email))
      assert.strictEqual(r.status, 422, email)
    }
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0)
  })
  await t('the newsletter refuses them the same way', async () => {
    reset()
    for (const email of ['bot@mailinator.com', 'bot@no-such-domain.test']) assert.strictEqual((await post(newsletter, newsBody(email))).status, 422, email)
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0)
  })

  console.log('\nmembership name')
  await t('first and last name are required', async () => {
    reset()
    for (const extra of [{ firstName: '', lastName: 'Reyes' }, { firstName: 'Taylor', lastName: '' }, { firstName: undefined, lastName: undefined }, { firstName: '   ', lastName: 'Reyes' }]) {
      const r = await post(membership, joinBody(fresh(), extra))
      assert.deepStrictEqual([r.status, r.body.code], [400, 'name-required'], JSON.stringify(extra))
    }
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0)
  })
  await t('the names from the real spam sign ups are refused in either field', async () => {
    reset()
    for (const [f, l] of [['Mxwnq', 'Reyes'], ['Taylor', 'Mxwnq'], ['IHWFnMS0xq', 'Reyes'], ['Taylor', 'IHWFnMSxq']]) {
      const r = await post(membership, joinBody(fresh(), { firstName: f, lastName: l }))
      assert.deepStrictEqual([r.status, r.body.code], [422, 'name-review'], `${f} ${l}`)
      assert(/check the spelling/.test(r.body.error) && /info@odipa.org/.test(r.body.error))
    }
    assert.strictEqual(subRows().length, 0); assert.strictEqual(sentMessages.length, 0)
  })
  await t('the message says which name looked wrong', async () => {
    reset()
    assert(/first name/.test((await post(membership, joinBody(fresh(), { firstName: 'Bcdfg' }))).body.error))
    assert(/last name/.test((await post(membership, joinBody(fresh(), { lastName: 'Bcdfg' }))).body.error))
  })
  await t('real names from many languages are accepted and stored as "First Last"', async () => {
    reset()
    const real = [['Mary', 'O’Brien'], ['Jean-Luc', 'Picard'], ['Mxolisi', 'Ngcobo'], ['Ngozi', 'Okonjo-Iweala'], ['Krzysztof', 'Szczepanski'], ['Nguyen', 'Van Anh'], ['José', 'María'], ['Björn', 'Sørensen'], ['李', '明'], ['محمد', 'علي'], ['Ma. Cristina', 'Dela Cruz'], ['JOHN', 'SMITH'], ['Ukcwpa', 'Reyes'], ['DeShawn', 'McDonald'], ['Ng', 'Wu']]
    for (const [f, l] of real) {
      const r = await post(membership, joinBody(fresh(), { firstName: f, lastName: l }))
      assert.strictEqual(r.status, 200, `${f} ${l} -> ${JSON.stringify(r.body)}`)
    }
    assert(subRows().some(x => x.name === 'Mxolisi Ngcobo'))
  })
  await t('a confirmed newsletter subscriber who joins gets their name on the record', async () => {
    reset()
    await subs.upsertPending({ email: 'longtime@example.com', name: '', source: 'Footer' })
    await subs.setStatus('longtime@example.com', 'confirmed')
    const r = await post(membership, joinBody('longtime@example.com', { firstName: 'Nora', lastName: 'Okafor' }))
    assert.deepStrictEqual([r.status, r.body.alreadyConfirmed], [200, true])
    const row = subRows().find(x => x.email === 'longtime@example.com')
    assert.deepStrictEqual([row.name, row.firstName, row.lastName, row.member, row.status], ['Nora Okafor', 'Nora', 'Okafor', true, 'confirmed'])
  })
  await t('a pending newsletter subscriber who joins also gets the name, and the name given at join wins', async () => {
    reset()
    await subs.upsertPending({ email: 'pending@example.com', name: 'Old Value', source: 'Footer' })
    await post(membership, joinBody('pending@example.com', { firstName: 'Ada', lastName: 'Lovelace' }))
    const row = subRows().find(x => x.email === 'pending@example.com')
    assert.deepStrictEqual([row.name, row.firstName, row.lastName], ['Ada Lovelace', 'Ada', 'Lovelace'])
  })
  await t('the admin view and the export expose first and last name separately', async () => {
    reset()
    await post(membership, joinBody('split@example.com', { firstName: 'Grace', lastName: 'Hopper' }))
    const v = admin.toView(subRows().find(x => x.email === 'split@example.com'))
    assert.deepStrictEqual([v.firstName, v.lastName, v.name], ['Grace', 'Hopper', 'Grace Hopper'])
  })
  await t('the sign up email to ODIPA carries the full name, the newsletter one carries no name line', async () => {
    reset()
    await post(membership, joinBody(fresh()))
    const note = sentMessages.find(m => m.content.subject.startsWith('Community Member Signup'))
    assert(/First name/.test(note.content.html) && /Taylor/.test(note.content.html) && /Last name/.test(note.content.html) && /Reyes/.test(note.content.html))
    sentMessages.length = 0
    await post(newsletter, newsBody(fresh()))
    const n2 = sentMessages.find(m => m.content.subject.startsWith('Newsletter Signup'))
    assert(n2 && !/Name/.test(n2.content.html), 'newsletter notification must not have a Name row')
  })
  await t('the confirmation email tells the member that name and email are stored', async () => {
    reset()
    await post(membership, joinBody(fresh()))
    const c = sentMessages.find(m => m.content.subject.startsWith('Confirm your ODIPA community'))
    assert(/Your name and email address are stored by ODIPA/.test(c.content.html) && /Your name and email address are stored by ODIPA/.test(c.content.plainText))
    sentMessages.length = 0
    await post(newsletter, newsBody(fresh()))
    const n = sentMessages.find(m => m.content.subject.startsWith('Confirm your ODIPA newsletter'))
    assert(/Your address is stored by ODIPA only/.test(n.content.html), 'the newsletter email still says address only, which is correct')
  })
  await t('a leftover name field on the newsletter body is ignored, not stored', async () => {
    reset()
    const r = await post(newsletter, newsBody(fresh(), { name: 'Mxwnq' }))
    assert.strictEqual(r.status, 200)
    assert.strictEqual(subRows()[0].name, '')
  })
  await t('nameLooksFake still protects against the known patterns', () => {
    for (const [name, reason] of Object.entries({ 'xK9fQ2': 'digit', 'IHWFnMS': 'mixed-case', 'Bcdfg': 'no-vowel', 'Aaaaab': 'repeated', 'Asdfgh': 'keyboard' }))
      assert.deepStrictEqual(abuse.nameLooksFake(name), { level: 'hold', reason }, name)
    assert.strictEqual(abuse.nameLooksFake('Ukcwpa').level, 'weak')
  })

  console.log('\npurge of unconfirmed sign ups')
  const day = 24 * 3600 * 1000
  const seed = async () => {
    reset()
    const put = async (email, status, ageDays, extra = {}) => {
      await subs.upsertPending({ email, name: '', source: 'Footer' })
      const rowKey = crypto.createHash('sha256').update(email).digest('hex')
      const r = store('subscribers').get('sub' + rowKey)
      r.status = status
      if (ageDays === null) delete r.createdAt; else r.createdAt = new Date(Date.now() - ageDays * day).toISOString()
      Object.assign(r, extra)
    }
    await put('stale1@example.com', 'pending', 5)
    await put('stale2@example.com', 'pending', 9, { member: true })
    await put('fresh@example.com', 'pending', 0.9)   // clearly younger than the 24 hour floor
    await put('confirmed@example.com', 'confirmed', 30)
    await put('unsub@example.com', 'unsubscribed', 30)
    await put('nodate@example.com', 'pending', null)
  }
  await t('a dry run counts but deletes nothing', async () => {
    await seed()
    const r = await admin.purgeStalePending({ olderThanHours: 72, dryRun: true })
    assert.deepStrictEqual([r.matched, r.deleted, r.dryRun], [2, 0, true])
    assert.strictEqual(subRows().length, 6)
  })
  await t('a live run removes only stale pending rows', async () => {
    await seed()
    const r = await admin.purgeStalePending({ olderThanHours: 72, dryRun: false })
    assert.deepStrictEqual([r.matched, r.deleted], [2, 2])
    assert.deepStrictEqual(subRows().map(x => x.email).sort(), ['confirmed@example.com', 'fresh@example.com', 'nodate@example.com', 'unsub@example.com'])
  })
  await t('the minimum age is 24 hours however small a number is asked for', async () => {
    await seed()
    const r = await admin.purgeStalePending({ olderThanHours: 1, dryRun: false })
    assert.strictEqual(r.olderThanHours, 24)
    assert(subRows().some(x => x.email === 'fresh@example.com'), 'a one day old row must survive a 24 hour minimum')
  })
  await t('the endpoint needs the admin key and defaults to a dry run', async () => {
    await seed()
    const denied = { log }; await purgeFn(denied, { method: 'POST', headers: {}, body: {} })
    assert.strictEqual(denied.res.status, 401); assert.strictEqual(subRows().length, 6)
    const ok = { log }; await purgeFn(ok, { method: 'POST', headers: { 'x-admin-key': 'admin-key' }, body: {} })
    assert.strictEqual(ok.res.status, 200); assert.strictEqual(ok.res.body.dryRun, true); assert.strictEqual(subRows().length, 6)
    const live = { log }; await purgeFn(live, { method: 'POST', headers: { 'x-admin-key': 'admin-key' }, body: { dryRun: false } })
    assert.strictEqual(live.res.body.deleted, 2)
  })

  console.log(`\nResults  ${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})()
