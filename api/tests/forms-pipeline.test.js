/**
 * Sponsor, research sponsor, and board application forms. Run with  node tests/forms-pipeline.test.js
 * Azure's email client and Table Storage are replaced with recorders. ODIPA code is real.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.COMMUNICATION_SERVICES_CONNECTION_STRING = 'endpoint=https://x.communication.azure.com/;accesskey=x'
process.env.ACS_SENDER_EMAIL = 'DoNotReply@example.azurecomm.net'
process.env.INQUIRIES_TABLE_CONNECTION = 'x'
process.env.SUBSCRIBERS_TABLE_CONNECTION = 'x'
process.env.AzureWebJobsStorage = 'x'

const sent = [], rows = []
class FakeEmailClient { async beginSend(m) { sent.push(m); return { pollUntilDone: async () => ({ id: 'm', status: 'Succeeded' }) } } }
const tables = require(path.join(api, 'node_modules/@azure/data-tables'))
tables.TableClient.fromConnectionString = () => ({
  createTable: async () => {},
  createEntity: async e => { rows.push(e) },
  upsertEntity: async e => { rows.push(e) },
  getEntity: async () => { const x = new Error('nf'); x.statusCode = 404; throw x },
  listEntities: async function* () {},
})
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (req === '@azure/communication-email') return { EmailClient: FakeEmailClient }
  return oL.call(this, req, parent, ...rest)
}
const sponsor = require(path.join(api, 'sponsor/index.js'))
const research = require(path.join(api, 'sponsor-research/index.js'))
const board = require(path.join(api, 'board-apply/index.js'))
const { foldFields } = require(path.join(api, '_shared/formAck.js'))

let pass = 0, fail = 0
async function t(label, fn) { try { await fn(); console.log('  PASS', label); pass++ } catch (e) { console.log('  FAIL', label, '\n      ', e.message.split('\n')[0]); fail++ } }
let n = 0
async function post(fn, body) {
  const ctx = { log: Object.assign(() => {}, { warn() {}, error() {}, info() {} }) }
  await fn(ctx, { method: 'POST', headers: { 'x-forwarded-for': `10.6.0.${++n}` }, body })
  return { status: ctx.res.status, body: JSON.parse(ctx.res.body) }
}
const reset = () => { sent.length = 0; rows.length = 0 }
const ackOf = () => sent.find(m => m.content.subject.startsWith('We received'))
const noDash = s => assert(!/—/.test(s), 'em dash in email')

;(async () => {
  console.log('\nsponsor application')
  await t('team email, receipt to the sender, and a pipeline row with the folded answers', async () => {
    reset()
    const r = await post(sponsor, { 'Organization Name': 'Acme Corp', 'Contact Name': 'Dana Lee', 'Email': 'dana@acme.example', 'Sponsorship Tier': 'Champion', 'Job Title': 'CMO', 'Website': 'https://acme.example', 'Message': 'We would like to sponsor.', 'Consented': 'Yes' })
    assert.strictEqual(r.status, 200)
    assert(sent.some(m => m.content.subject.startsWith('Sponsor Application') && m.recipients.to[0].address === 'partnerships@odipa.org'), 'team email')
    const ack = ackOf(); assert(ack, 'receipt missing')
    assert.deepStrictEqual(ack.recipients.to, [{ address: 'dana@acme.example' }])
    assert.deepStrictEqual(ack.replyTo, [{ address: 'partnerships@odipa.org' }])
    assert(/Hi Dana Lee/.test(ack.content.html) && /Acme Corp/.test(ack.content.plainText) && /2 business days/.test(ack.content.plainText))
    assert(/public acknowledgment relationship/.test(ack.content.plainText), 'must set the no-services expectation')
    noDash(ack.content.html + ack.content.plainText)
    const row = rows.find(x => x.topic === 'sponsor'); assert(row, 'pipeline row missing')
    assert.deepStrictEqual([row.name, row.email, row.organization, row.routedTo, row.status], ['Dana Lee', 'dana@acme.example', 'Acme Corp', 'partnerships@odipa.org', 'acked'])
    assert(/Tier interest: Champion/.test(row.message) && /Message: We would like to sponsor\./.test(row.message))
    assert(!/Phone:/.test(row.message), 'empty answers must be left out')
  })

  console.log('\nresearch sponsorship')
  await t('receipt states that sponsors do not direct findings, and the row carries the research topic', async () => {
    reset()
    const r = await post(research, { contactName: 'Priya Nair', email: 'priya@uni.example', orgName: 'Example University', tier: 'Brief', researchTopic: 'Data broker opt-outs', timeline: 'Q1', consent: 'Yes' })
    assert.strictEqual(r.status, 200)
    const ack = ackOf(); assert(ack)
    assert(/do not direct findings/.test(ack.content.plainText) && /research@odipa.org/.test(ack.content.plainText))
    noDash(ack.content.html + ack.content.plainText)
    const row = rows.find(x => x.topic === 'research-sponsor'); assert(row)
    assert(/Research topic: Data broker opt-outs/.test(row.message) && /Timeline: Q1/.test(row.message))
    assert.strictEqual(row.routedTo, 'research@odipa.org')
  })

  console.log('\nboard application')
  await t('receipt sets expectations about seats and unpaid service, and the row holds the full application', async () => {
    reset()
    const r = await post(board, { 'First Name': 'Maria', 'Last Name': 'Santos', 'Email': 'maria@example.com', 'Position Applied': 'Treasurer', 'Current Role': 'CFO', 'Organization': 'Example Co', 'Why Interested': 'Privacy matters to me.', 'Conflicts': 'None', 'Consented': 'Yes' })
    assert.strictEqual(r.status, 200)
    const ack = ackOf(); assert(ack)
    assert(/Hi Maria,/.test(ack.content.plainText) && /Treasurer seat/.test(ack.content.plainText))
    assert(/as seats open/.test(ack.content.plainText) && /unpaid/.test(ack.content.plainText))
    noDash(ack.content.html + ack.content.plainText)
    const row = rows.find(x => x.topic === 'board'); assert(row)
    assert.deepStrictEqual([row.name, row.organization, row.routedTo], ['Maria Santos', 'Example Co', 'board@odipa.org'])
    assert(/Position: Treasurer/.test(row.message) && /Why interested: Privacy matters to me\./.test(row.message) && /Conflicts: None/.test(row.message))
  })

  console.log('\nresilience')
  await t('a failed receipt or a failed store write never fails the submission', async () => {
    reset()
    const origSend = FakeEmailClient.prototype.beginSend
    FakeEmailClient.prototype.beginSend = async function (m) { if (m.content.subject.startsWith('We received')) throw new Error('smtp down'); return origSend.call(this, m) }
    const origFrom = tables.TableClient.fromConnectionString
    tables.TableClient.fromConnectionString = () => ({ createTable: async () => { throw new Error('storage down') }, createEntity: async () => { throw new Error('storage down') } })
    try {
      const r = await post(sponsor, { 'Organization Name': 'Acme', 'Contact Name': 'D', 'Email': 'd@acme.example', 'Message': 'hi', 'Consented': 'Yes' })
      assert.strictEqual(r.status, 200)
    } finally { FakeEmailClient.prototype.beginSend = origSend; tables.TableClient.fromConnectionString = origFrom }
  })
  await t('a sender cannot inject html into their own receipt', async () => {
    reset()
    await post(sponsor, { 'Organization Name': '<script>x</script>Acme', 'Contact Name': '<b onmouseover=1>Dana', 'Email': 'd@acme.example', 'Message': 'hi', 'Consented': 'Yes' })
    const ack = ackOf()
    assert(!/<script|onmouseover/.test(ack.content.html))
  })
  await t('foldFields drops blanks and dashes and keeps order', () => {
    assert.strictEqual(foldFields({ A: '1', B: '', C: '—', D: ' x ' }), 'A: 1\nD: x')
  })

  console.log('\ndrafting run guidance')
  await t('the drafting run has guidance for all three topics and always flags board applications', () => {
    const src = require('fs').readFileSync(path.join(api, 'inquiries-draft/index.js'), 'utf8')
    for (const k of ["sponsor:", "'research-sponsor':", "board:"]) assert(src.includes(k), 'missing guidance for ' + k)
    assert(/board: 'ALWAYS flag/.test(src))
  })

  console.log(`\nResults  ${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})()
