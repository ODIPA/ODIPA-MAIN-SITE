/**
 * Tool submission tests. Run with  node tests/tool-submit.test.js
 * Azure's email client is replaced with a recorder, GitHub calls are stubbed. ODIPA code is real.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.COMMUNICATION_SERVICES_CONNECTION_STRING = 'endpoint=https://x.communication.azure.com/;accesskey=x'
process.env.ACS_SENDER_EMAIL = 'DoNotReply@example.azurecomm.net'
delete process.env.GITHUB_TOKEN

const sent = []
class FakeEmailClient { async beginSend(m) { sent.push(m); return { pollUntilDone: async () => ({ id: 'm', status: 'Succeeded' }) } } }
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (req === '@azure/communication-email') return { EmailClient: FakeEmailClient }
  return oL.call(this, req, parent, ...rest)
}
// The repo existence check calls GitHub. Pretend every repo exists and is non-empty.
global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ size: 42 }) })
const handler = require(path.join(api, 'tool-submit/index.js'))

let pass = 0, fail = 0
async function t(label, fn) { try { await fn(); console.log('  PASS', label); pass++ } catch (e) { console.log('  FAIL', label, '\n      ', e.message.split('\n')[0]); fail++ } }
let n = 0
async function post(body) {
  const ctx = { log: Object.assign(() => {}, { warn() {}, error() {}, info() {} }) }
  await handler(ctx, { method: 'POST', headers: { 'x-forwarded-for': `10.5.0.${++n}` }, body })
  return { status: ctx.res.status, body: JSON.parse(ctx.res.body) }
}
const good = {
  'Tool Name': 'Example Tool', 'Tagline': 'Does a thing', 'Category': 'AI Agent Security',
  'Description': 'A tool that does a privacy thing on your own machine without sending anything anywhere.',
  'Privacy Problem': 'People leak secrets to AI agents without a local check. This tool gates calls before they run.',
  'GitHub URL': 'https://github.com/example/tool', 'Language': 'Python', 'Platforms': 'CLI', 'License': 'MIT',
  'Contributor Name': 'Jane Smith', 'Contributor Email': 'jane@example.com', 'Agreed to Standards': 'Yes',
}

;(async () => {
  console.log('\nlisting tier')
  await t('a submission with no tier is refused with a clear message', async () => {
    sent.length = 0
    const r = await post({ ...good })
    assert.deepStrictEqual([r.status, /choose how you would like the tool listed/.test(r.body.error)], [400, true])
    assert.strictEqual(sent.length, 0)
  })
  await t('a made-up tier is refused', async () => {
    const r = await post({ ...good, 'Listing Tier': 'Platinum' })
    assert.strictEqual(r.status, 400)
  })
  for (const tier of ['Approved listing', 'Community project', 'ODIPA adopted']) {
    await t(`"${tier}" is accepted and appears in the notification email`, async () => {
      sent.length = 0
      const r = await post({ ...good, 'Listing Tier': tier })
      assert.deepStrictEqual([r.status, r.body.ok], [200, true])
      const m = sent.find(x => x.content.subject.startsWith('Tool Submission'))
      assert(m, 'notification missing')
      assert(/Listing Tier/.test(m.content.html) && m.content.html.includes(tier), 'tier row missing from the email')
    })
  }
  console.log('\nacknowledgment to the submitter')
  await t('a valid submission sends an acknowledgment to the submitter with their tier and the stages', async () => {
    sent.length = 0
    const r = await post({ ...good, 'Listing Tier': 'Community project' })
    assert.strictEqual(r.status, 200)
    const ack = sent.find(m => m.content.subject.startsWith('We received your ODIPA tool submission'))
    assert(ack, 'acknowledgment missing')
    assert.deepStrictEqual(ack.recipients.to, [{ address: 'jane@example.com' }])
    assert.deepStrictEqual(ack.replyTo, [{ address: 'dev@odipa.org' }])
    for (const text of [ack.content.html, ack.content.plainText]) {
      assert(/Hi Jane Smith/.test(text))
      assert(/Example Tool/.test(text))
      assert(/Community Project listing/.test(text), 'tier line missing')
      assert(/2 business days/.test(text) && /1 to 2 weeks/.test(text) && /1 to 3 weeks/.test(text), 'stages missing')
      assert(/tool-listing-policy/.test(text))
      assert(/not an endorsement/.test(text))
    }
    assert(!/—/.test(ack.content.html + ack.content.plainText), 'no em dashes')
  })
  await t('the acknowledgment links the tracking issue when one was created', async () => {
    process.env.GITHUB_TOKEN = 'x'
    const origFetch = global.fetch
    global.fetch = async (url, opts) => {
      if (String(url).includes('/issues') && opts && opts.method === 'POST') return { ok: true, status: 201, json: async () => ({ number: 42, html_url: 'https://github.com/odipa/odipa-privacy-tools/issues/42' }) }
      return { ok: true, status: 200, json: async () => ({ size: 42 }) }
    }
    sent.length = 0
    try {
      const r = await post({ ...good, 'Listing Tier': 'Approved listing' })
      assert.deepStrictEqual([r.status, r.body.issueNumber], [200, 42])
      const ack = sent.find(m => m.content.subject.startsWith('We received your ODIPA tool submission'))
      assert(/issues\/42/.test(ack.content.html) && /issues\/42/.test(ack.content.plainText), 'issue link missing')
      assert(/Approved listing/.test(ack.content.plainText))
    } finally { global.fetch = origFetch; delete process.env.GITHUB_TOKEN }
  })
  await t('the acknowledgment failing never fails the submission', async () => {
    const orig = FakeEmailClient.prototype.beginSend
    FakeEmailClient.prototype.beginSend = async function (m) {
      if (m.content.subject.startsWith('We received')) throw new Error('smtp down')
      return orig.call(this, m)
    }
    try {
      const r = await post({ ...good, 'Listing Tier': 'Approved listing' })
      assert.strictEqual(r.status, 200)
    } finally { FakeEmailClient.prototype.beginSend = orig }
  })
  await t('a submitter cannot inject html into their own acknowledgment', async () => {
    sent.length = 0
    await post({ ...good, 'Listing Tier': 'Approved listing', 'Contributor Name': '<img src=x onerror=1>Jane', 'Tool Name': 'Tool <script>' })
    const ack = sent.find(m => m.content.subject.startsWith('We received'))
    assert(!/onerror|<script/.test(ack.content.html), 'html not escaped')
    assert(/&lt;img src=x onerror=1&gt;Jane|Hi Jane/.test(ack.content.html), 'name should be escaped or cleaned')
  })

  await t('the form and the server agree on the tier list', () => {
    const fs = require('fs')
    const form = fs.readFileSync(path.join(api, '..', 'components', 'ToolSubmissionForm.tsx'), 'utf8')
    const server = fs.readFileSync(path.join(api, 'tool-submit', 'index.js'), 'utf8')
    const formTiers = [...form.matchAll(/value: '([^']+)',\s*\n\s*title:/g)].map(m => m[1])
    const serverTiers = JSON.parse(server.match(/const LISTING_TIERS = (\[[^\]]+\])/)[1].replace(/'/g, '"'))
    assert.deepStrictEqual(formTiers, serverTiers)
  })
  console.log(`\nResults  ${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})()
