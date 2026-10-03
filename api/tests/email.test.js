/**
 * Email delivery tests. Run with  node tests/email.test.js
 * Azure's email client and Table Storage are replaced with recorders. All ODIPA code is real.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.NEWSLETTER_TOKEN_SECRET = 's'
process.env.SUBSCRIBERS_TABLE_CONNECTION = 'x'
process.env.COMMUNICATION_SERVICES_CONNECTION_STRING = 'endpoint=https://x.communication.azure.com/;accesskey=x'
process.env.ACS_SENDER_EMAIL = 'DoNotReply@example.azurecomm.net'

// ---- fake Azure email client, result chosen per test
let acsResult = { id: 'msg-1', status: 'Succeeded' }
let acsThrows = null
const sentMessages = []
class FakeEmailClient {
  async beginSend(message) {
    if (acsThrows) throw acsThrows
    sentMessages.push(message)
    return { pollUntilDone: async () => acsResult }
  }
}
// ---- fake Table Storage
const rows = new Map()
const tables = require(path.join(api, 'node_modules/@azure/data-tables'))
tables.TableClient.fromConnectionString = () => ({
  createTable: async () => {},
  getEntity: async (p, r) => { const e = rows.get(p + r); if (!e) { const x = new Error('nf'); x.statusCode = 404; throw x } return { ...e } },
  upsertEntity: async e => { rows.set(e.partitionKey + e.rowKey, { ...(rows.get(e.partitionKey + e.rowKey) || {}), ...e }) },
  listEntities: async function* () {},
})
const oL = Module._load, oR = Module._resolveFilename
Module._load = function (req, parent, ...rest) {
  if (req === '@azure/communication-email') return { EmailClient: FakeEmailClient }
  return oL.call(this, req, parent, ...rest)
}
const mailer = require(path.join(api, '_shared/mailer.js'))
const subs = require(path.join(api, '_shared/subscribers.js'))
const membership = require(path.join(api, 'membership/index.js'))

let pass = 0, fail = 0
async function t(label, fn) { try { await fn(); console.log('  PASS', label); pass++ } catch (e) { console.log('  FAIL', label, '\n      ', e.message.split('\n')[0]); fail++ } }
const logs = []
const log = Object.assign(m => logs.push(['info', String(m)]), { warn: m => logs.push(['warn', String(m)]), error: m => logs.push(['error', String(m)]) })
let n = 0
async function join(body) {
  const ctx = { log }
  await membership(ctx, { method: 'POST', headers: { 'x-forwarded-for': `10.2.0.${++n}` }, body })
  return { status: ctx.res.status, body: JSON.parse(ctx.res.body) }
}
const good = { email: 'jane@example.com', name: 'Jane', source: 'Join page', acceptedTerms: true, termsVersion: 'v1' }
const reset = () => { acsResult = { id: 'msg-1', status: 'Succeeded' }; acsThrows = null; sentMessages.length = 0; logs.length = 0; rows.clear() }

;(async () => {
  console.log('\nmailer')
  await t('a Succeeded send resolves with the Azure message id', async () => {
    reset(); acsResult = { id: 'abc-123', status: 'Succeeded' }
    assert.strictEqual(await mailer.sendHtmlEmail({ to: 'a@example.com', subject: 's', html: '<p>x</p>' }), 'abc-123')
  })
  for (const status of ['Failed', 'Canceled']) {
    await t(`a ${status} result is no longer treated as success (sendHtmlEmail)`, async () => {
      reset(); acsResult = { id: 'm9', status, error: { code: 'SenderDomainNotVerified', message: 'The sender domain is not verified.' } }
      await assert.rejects(() => mailer.sendHtmlEmail({ to: 'a@example.com', subject: 's', html: 'x' }), e => e.code === 'EMAIL_NOT_SENT' && e.acsCode === 'SenderDomainNotVerified' && e.messageId === 'm9' && /not verified/.test(e.message))
    })
  }
  await t('sendFormEmail checks the result too', async () => {
    reset(); acsResult = { id: 'm8', status: 'Failed', error: { code: 'QuotaExceeded', message: 'limit' } }
    await assert.rejects(() => mailer.sendFormEmail({ to: 'a@example.com', subject: 's', fields: { A: 'b' } }), e => e.acsCode === 'QuotaExceeded')
  })
  await t('a result with no error detail still fails with a readable message', async () => {
    reset(); acsResult = { id: 'm7', status: 'Failed' }
    await assert.rejects(() => mailer.sendHtmlEmail({ to: 'a@example.com', subject: 's', html: 'x' }), e => /not sent/.test(e.message) && e.acsCode === 'unknown')
  })
  await t('an in-flight status is not success either', async () => {
    reset(); acsResult = { id: 'm6', status: 'Running' }
    await assert.rejects(() => mailer.sendHtmlEmail({ to: 'a@example.com', subject: 's', html: 'x' }), e => e.code === 'EMAIL_NOT_SENT')
  })

  console.log('\nmembership sign up')
  await t('new member, Azure accepts the email, so the person is told to check the inbox', async () => {
    reset()
    const r = await join(good)
    assert.deepStrictEqual([r.status, r.body.ok, r.body.alreadyConfirmed, r.body.welcomeSent], [200, true, false, false])
    const confirm = sentMessages.find(m => m.content.subject === 'Confirm your ODIPA community membership')
    assert(confirm, 'confirmation email was not sent')
    assert.deepStrictEqual(confirm.recipients.to, [{ address: 'jane@example.com' }])
    assert(/api\/newsletter-confirm\?e=/.test(confirm.content.html) && /api\/newsletter-confirm\?e=/.test(confirm.content.plainText), 'confirm link missing from html or plain text')
    assert(sentMessages.some(m => m.content.subject.startsWith('Community Member Signup')), 'internal notification missing')
    assert(logs.some(l => /accepted by Azure, message id msg-1/.test(l[1])))
  })
  await t('Azure rejects the confirmation email, so the person gets a clear error and the sign up stays saved', async () => {
    reset(); acsResult = { id: 'bad-1', status: 'Failed', error: { code: 'SenderDomainNotVerified', message: 'not verified' } }
    const r = await join(good)
    assert.strictEqual(r.status, 502)
    assert.strictEqual(r.body.code, 'email-not-sent')
    assert(/could not send the confirmation email/.test(r.body.error) && /info@odipa.org/.test(r.body.error))
    assert.strictEqual([...rows.values()][0].status, 'pending')              // still stored, a retry will resend
    assert(logs.some(l => l[0] === 'error' && /SenderDomainNotVerified/.test(l[1])), 'the Azure error code must reach the logs')
  })
  await t('the Azure client throwing outright is handled the same way', async () => {
    reset(); acsThrows = new Error('connect ETIMEDOUT')
    const r = await join(good)
    assert.deepStrictEqual([r.status, r.body.code], [502, 'email-not-sent'])
    assert(logs.some(l => l[0] === 'error' && /ETIMEDOUT/.test(l[1])))
  })
  await t('retrying after a failure sends the email', async () => {
    reset(); acsResult = { id: 'x', status: 'Failed', error: { code: 'Temp', message: 't' } }
    assert.strictEqual((await join(good)).status, 502)
    acsResult = { id: 'y', status: 'Succeeded' }
    const r = await join(good)
    assert.strictEqual(r.status, 200)
    assert(sentMessages.some(m => m.content.subject === 'Confirm your ODIPA community membership'))
  })
  await t('already confirmed subscriber receives a welcome email, and the response says so', async () => {
    reset()
    await subs.upsertPending({ email: 'jane@example.com', name: 'Jane', source: 'Footer' })
    await subs.setStatus('jane@example.com', 'confirmed')
    const r = await join(good)
    assert.deepStrictEqual([r.status, r.body.alreadyConfirmed, r.body.welcomeSent], [200, true, true])
    assert(sentMessages.some(m => m.content.subject === 'Welcome to the ODIPA community'))
    assert(!sentMessages.some(m => m.content.subject.startsWith('Confirm')), 'must not ask a confirmed person to confirm again')
    const row = [...rows.values()][0]
    assert.strictEqual(row.status, 'confirmed'); assert.strictEqual(row.member, true)
  })
  await t('a failed welcome email never fails the sign up', async () => {
    reset()
    await subs.upsertPending({ email: 'jane@example.com', name: 'Jane', source: 'Footer' })
    await subs.setStatus('jane@example.com', 'confirmed')
    acsResult = { id: 'w', status: 'Failed', error: { code: 'Throttled', message: 'slow down' } }
    const r = await join(good)
    assert.deepStrictEqual([r.status, r.body.alreadyConfirmed, r.body.welcomeSent], [200, true, false])
  })
  await t('a filled hidden field is reported, not faked, and nothing is stored or sent', async () => {
    reset()
    const r = await join({ ...good, _hp: 'autofilled' })
    assert.deepStrictEqual([r.status, r.body.code], [400, 'honeypot'])
    assert(/info@odipa.org/.test(r.body.error))
    assert.strictEqual(rows.size, 0); assert.strictEqual(sentMessages.length, 0)
    assert(logs.some(l => l[0] === 'warn'))
  })
  await t('the internal notification failing does not fail the sign up', async () => {
    reset()
    let call = 0
    FakeEmailClient.prototype.beginSend = async function (m) { call++; sentMessages.push(m); return { pollUntilDone: async () => (m.content.subject.startsWith('Community Member Signup') ? { id: 'n', status: 'Failed', error: { code: 'X', message: 'x' } } : { id: 'c', status: 'Succeeded' }) } }
    const r = await join(good)
    assert.strictEqual(r.status, 200)
    assert(call >= 2)
  })

  console.log(`\nResults  ${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})()
