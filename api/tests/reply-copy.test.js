/**
 * Portal replies are copied to the team address. Run with  node tests/reply-copy.test.js
 * Azure's email client is replaced with a recorder. ODIPA code is real.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.COMMUNICATION_SERVICES_CONNECTION_STRING = 'endpoint=https://x.communication.azure.com/;accesskey=x'
process.env.ACS_SENDER_EMAIL = 'DoNotReply@example.azurecomm.net'
process.env.NEWSLETTER_ADMIN_KEY = 'k'

const sent = []
class FakeEmailClient { async beginSend(m) { sent.push(m); return { pollUntilDone: async () => ({ id: 'm1', status: 'Succeeded' }) } } }
const updates = []
const row = { rowKey: 'r1', email: 'iram@example.com', name: 'Iram', routedTo: 'volunteer@odipa.org', status: 'drafted' }
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (req === '@azure/communication-email') return { EmailClient: FakeEmailClient }
  if (/_shared\/inquiries$/.test(req)) return { getInquiry: async () => ({ ...row }), updateInquiry: async (id, v) => { updates.push(v) } }
  return oL.call(this, req, parent, ...rest)
}
const act = require(path.join(api, 'inquiries-act/index.js'))
const { sendHtmlEmail } = require(path.join(api, '_shared/mailer.js'))
const send = async () => {
  const c = { log: { warn() {}, error() {} } }
  await act(c, { method: 'POST', headers: { 'x-admin-key': 'k' }, body: { id: 'r1', action: 'send', subject: 'Hello', body: 'Thanks for applying.' } })
  return c.res
}

;(async () => {
  let r = await send()
  assert.strictEqual(r.status, 200, 'the reply sends')
  let m = sent[sent.length - 1]
  assert.strictEqual(m.recipients.to[0].address, 'iram@example.com')
  assert.deepStrictEqual(m.recipients.bcc, [{ address: 'volunteer@odipa.org' }], 'the team address gets a hidden copy')
  assert.strictEqual(updates[updates.length - 1].status, 'sent')

  process.env.EMAIL_COPY_TO = 'records@odipa.org'
  await send()
  m = sent[sent.length - 1]
  assert.deepStrictEqual(m.recipients.bcc, [{ address: 'records@odipa.org' }], 'EMAIL_COPY_TO overrides the address')

  process.env.EMAIL_COPY_TO = 'off'
  await send()
  m = sent[sent.length - 1]
  assert.strictEqual(m.recipients.bcc, undefined, 'the copy can be turned off')
  delete process.env.EMAIL_COPY_TO

  await sendHtmlEmail({ to: 'a@odipa.org', bcc: 'A@odipa.org', subject: 's', html: '<p>x</p>' })
  assert.strictEqual(sent[sent.length - 1].recipients.bcc, undefined, 'never copies the recipient to themselves')

  await sendHtmlEmail({ to: 'a@example.com', subject: 's', html: '<p>x</p>' })
  assert.strictEqual(sent[sent.length - 1].recipients.bcc, undefined, 'other emails, like acknowledgments, are not copied')

  console.log('reply-copy: all checks passed')
})().catch(e => { console.error(e); process.exit(1) })
