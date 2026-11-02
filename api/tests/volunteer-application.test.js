/**
 * Volunteer application questions. Run with  node tests/volunteer-application.test.js
 * No network. The mailer and the inquiry store are replaced with recorders.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')

const { parseVolunteerApplication, ROLE_CHOICES } = require(path.join(api, '_shared/volunteerApplication.js'))

const good = {
  why: 'I have spent years on data breach response and want to help people understand their rights.',
  roles: ['Privacy Researcher', 'Certification Assessor'],
  experience: 'Led breach response programs and governed a consent management platform.',
  profileLink: 'linkedin.com/in/example',
  credentials: 'CIPP/E, CIPM',
  hours: '4 to 6 hours a month',
  location: 'Lisbon, Portugal',
  heardFrom: 'LinkedIn',
  extra: '',
}

// ---- Parsing -----------------------------------------------------------
const ok = parseVolunteerApplication(good)
assert(!ok.error, 'a complete application passes')
assert(ok.fields.link === 'https://linkedin.com/in/example', 'a bare link gets https')
for (const label of ['Why ODIPA:', 'Roles of interest:', 'Relevant experience and skills:', 'Resume or profile link:', 'Time available:', 'Credentials:', 'Based in:'])
  assert(ok.message.includes(label), `message carries ${label}`)
assert(!ok.message.includes('Anything else:'), 'empty optional answers are left out')

const bad = (patch, text) => {
  const r = parseVolunteerApplication({ ...good, ...patch })
  assert(r.error, `rejects ${text}`)
}
bad({ why: 'too short' }, 'a short why')
bad({ roles: [] }, 'no roles')
bad({ roles: ['Chief Wizard'] }, 'unknown roles only')
bad({ experience: 'x' }, 'thin experience')
bad({ profileLink: '' }, 'no link')
bad({ profileLink: 'javascript:alert(1)' }, 'a javascript link')
bad({ profileLink: 'not a link' }, 'text that is not a link')
bad({ hours: 'whenever' }, 'an unknown hours choice')

const dirty = parseVolunteerApplication({ ...good, why: good.why + ' <script>alert(1)</script>', roles: ['Privacy Researcher', 'Privacy Researcher', 'Hacker'] })
assert(!dirty.message.includes('<script>'), 'html is stripped')
const nested = parseVolunteerApplication({ ...good, why: good.why + ' <scr<script>ipt>alert(1)</scr</script>ipt>' })
assert(!/[<>]/.test(nested.message), 'nested tags cannot rebuild a tag')
assert.deepStrictEqual(dirty.fields.roles, ['Privacy Researcher'], 'duplicate and unknown roles dropped')
assert(ROLE_CHOICES.includes('Not sure yet') && ROLE_CHOICES.includes('Certification Assessor'), 'role choices include the real roles')
assert(parseVolunteerApplication(undefined).error, 'missing answers are rejected')

// ---- The contact route -------------------------------------------------
const emails = [], saved = [], acks = []
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (/_shared\/mailer$/.test(req)) return {
    sendFormEmail: async m => { emails.push(m) },
    sendHtmlEmail: async m => { acks.push(m) },
    respond: (c, status, body) => { c.res = { status, body } },
    clean: (v, max = 2000) => (v == null ? '' : String(v).replace(/[<>]/g, '').trim().slice(0, max)),
  }
  if (/_shared\/inquiries$/.test(req)) return { saveInquiry: async r => { saved.push(r); return 'id' } }
  return oL.call(this, req, parent, ...rest)
}
const contact = require(path.join(api, 'contact/index.js'))
const ctx = () => ({ log: { warn() {}, error() {} } })
const post = async body => { const c = ctx(); await contact(c, { method: 'POST', headers: { 'x-forwarded-for': String(Math.random()) }, body }); return c.res }

;(async () => {
  const base = { topic: 'volunteer', Name: 'Iram Jafry', Email: 'i@example.com', Consented: 'Yes' }

  let r = await post({ ...base, Message: 'I would like to volunteer please.' })
  assert.strictEqual(r.status, 400, 'a volunteer submission without answers is rejected')
  assert.strictEqual(saved.length, 0, 'nothing is stored for a rejected application')

  r = await post({ ...base, volunteer: { ...good, why: 'short' } })
  assert.strictEqual(r.status, 400, 'a thin why is rejected')
  assert(/why you want to volunteer/i.test(r.body.error), 'the error says what is missing')

  r = await post({ ...base, volunteer: good })
  assert.strictEqual(r.status, 200, 'a complete application is accepted')
  assert.strictEqual(saved.length, 1)
  assert(saved[0].message.includes('Why ODIPA:') && /https:\/\/linkedin\.com\/in\/example(\s|$)/.test(saved[0].message), 'the stored message carries the answers')
  assert.strictEqual(saved[0].topic, 'volunteer')
  assert(emails[0].fields['Why ODIPA'] && emails[0].fields['Resume or profile'], 'the team email lists each answer')
  assert.strictEqual(acks.length, 1, 'the applicant still gets the automatic acknowledgment')

  r = await post({ topic: 'general', Name: 'A B', Email: 'a@example.com', Message: 'short' })
  assert.strictEqual(r.status, 400, 'other topics still need a message')
  r = await post({ topic: 'general', Name: 'A B', Email: 'a@example.com', Message: 'A question about your programs.' })
  assert.strictEqual(r.status, 200, 'other topics are unchanged')
  assert.strictEqual(emails[emails.length - 1].fields.Message, 'A question about your programs.')

  console.log('volunteer-application: all checks passed')
})().catch(e => { console.error(e); process.exit(1) })
