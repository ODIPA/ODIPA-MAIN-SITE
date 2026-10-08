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
