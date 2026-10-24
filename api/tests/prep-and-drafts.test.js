/**
 * Volunteer prep sheet and reply draft behavior. Run with  node tests/prep-and-drafts.test.js
 * No network. The model call and the inquiry store are replaced with recorders.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')

const prep = require(path.join(api, '_shared/prepSheet.js'))
const roles = require(path.join(api, '_shared/volunteerRoles.js'))

// ---- Prep sheet --------------------------------------------------------
for (const title of roles.ROLE_TITLES)
  assert(prep.ORG_CONTEXT.includes(title), `org context lists the ${title} role`)
assert(prep.ORG_CONTEXT.includes('Certification Assessor'), 'org context lists the assessor role')
assert(prep.ORG_CONTEXT.includes('Privacy Researcher'), 'org context lists the researcher role')
assert(prep.ORG_CONTEXT.includes('Research and publications facts'), 'org context explains the research program')
assert(prep.PROMPT_SYSTEM.includes('never as a poor fit'), 'prompt carries the GRC rule')
assert(!/Publicly listed volunteer roles: Community Advocate, Content Writer, Educator\/Trainer\./.test(prep.ORG_CONTEXT),
  'the old three role list is gone')

const sample = {
  icebreaker: 'Thank you for reaching out \u2014 your note was short but your background stood out.',
  asked: 'They asked to volunteer to support privacy research and asked how to progress.',
  bridge: 'a seasoned governance and risk voice.',
  background: ['Linked a personal site', 'Wrote two lines'],
  listen_for: ['Why research', 'Hours they can give'],
  qa: [{ q: 'Can I use this for GRC experience?', a: 'Yes, that is a fine reason to volunteer.', watch: '' }],
  fit: [
    { lane: 'Privacy Researcher', evidence: 'Asked for research.', level: 'strong' },
    { lane: 'certification assessor', evidence: 'Lists audit credentials.', level: 'possible' },
    { lane: 'Chief Wizard', evidence: 'Should be dropped.', level: 'strong' },
  ],
  options: [
    { name: 'Research brief', script: 'Write a short brief.' },
    { name: 'Criteria feedback', script: 'Read the draft criteria.' },
  ],
  questions: [{ label: 'Topics', text: 'What topics interest you?', listen: 'Specific subjects.' }],
}
const gen = prep.normalizeGenerated(sample)
assert.deepStrictEqual(gen.fit.map(f => f.lane), ['Privacy Researcher', 'Certification Assessor'], 'unknown lanes dropped, case fixed')
assert(!gen.icebreaker.includes('\u2014'), 'dashes removed from generated text')

assert.throws(() => prep.normalizeGenerated({ ...sample, fit: [{ lane: 'Nope', evidence: 'x', level: 'strong' }] }), /empty after validation/)
assert.throws(() => prep.normalizeGenerated({ ...sample, asked: '' }), /missing required/)

const html = prep.renderPrepSheet({ name: 'Iram Jafry', email: 'i@example.com', receivedAt: Date.now() }, gen)
for (const needle of ['id="fit"', 'id="theirs"', 'id="watch"', 'id="research"', 'research-releases', 'Research briefs', 'Privacy Researcher', 'Certification Assessor', 'They asked for', 'Is this paid?'])
  assert(html.includes(needle), `sheet contains ${needle}`)
assert(!/[\u2014\u2013]/.test(html), 'no em or en dashes in the sheet')
assert(!html.includes('Fifteen plus years'), 'no years of experience in the credibility line')

// ---- Reply drafts ------------------------------------------------------
const calls = []
const store = []
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (/_shared\/mailer$/.test(req)) return { respond: (c, status, body) => { c.res = { status, body } }, sendHtmlEmail: async () => {} }
  if (/_shared\/inquiries$/.test(req)) return {
    listInquiries: async () => [{ rowKey: 'r1', topic: 'volunteer', name: 'Iram', email: 'i@example.com', receivedAt: 1, message: 'I want GRC experience and would like to support privacy research.' }],
    updateInquiry: async (k, v) => { store.push([k, v]) },
  }
  return oL.call(this, req, parent, ...rest)
}
process.env.NEWSLETTER_ADMIN_KEY = 'k'
process.env.ANTHROPIC_API_KEY = 'x'
global.fetch = async (url, opts) => {
  calls.push(JSON.parse(opts.body))
  return { json: async () => ({ content: [{ type: 'text', text: '{"action":"draft","subject":"Hello","body":"Thanks. Can we set up a short call?"}' }] }) }
}

;(async () => {
  const draft = require(path.join(api, 'inquiries-draft/index.js'))
  const ctx = { log: { warn() {}, error() {} } }
  await draft(ctx, { method: 'POST', headers: { 'x-admin-key': 'k' } })
  assert.strictEqual(ctx.res.status, 200)
  assert.strictEqual(calls.length, 1)
  const sent = calls[0]
  const userMsg = sent.messages[0].content
  assert(userMsg.includes('Certification Assessor'), 'draft prompt lists the real roles')
  assert(userMsg.includes('Wanting GRC experience'), 'draft prompt says GRC interest is normal')
  assert(userMsg.includes('Never decline, redirect or discourage a volunteer'), 'draft prompt forbids turning applicants away')
  assert(sent.system.includes('Never turn away or talk down a volunteer applicant'), 'system prompt forbids turning applicants away')
  assert.strictEqual(store[0][1].status, 'drafted', 'result is stored as a draft, not flagged')
  console.log('prep-and-drafts: all checks passed')
})().catch(e => { console.error(e); process.exit(1) })
