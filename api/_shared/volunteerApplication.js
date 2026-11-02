/**
 * Volunteer application answers for the contact form.
 *
 * When the topic is "volunteer" the form asks extra questions. This module
 * checks them on the server and turns them into labelled lines. Those lines
 * are stored as the inquiry message, so the admin pipeline, the AI reply
 * drafter and the intro call sheet all read the full application without
 * any other change.
 *
 * Resumes are collected as a link, not a file upload. Uploads would need
 * file storage, malware scanning and a retention policy, and a link keeps
 * the applicant in control of their own document.
 */

const { ROLE_TITLES } = require('./volunteerRoles')

const NOT_SURE = 'Not sure yet'
const ROLE_CHOICES = [...ROLE_TITLES, NOT_SURE]
const HOURS_CHOICES = ['2 to 4 hours a month', '4 to 6 hours a month', '6 to 10 hours a month', 'More than 10 hours a month', 'Not sure yet']

/**
 * Remove HTML tags. A single pass can be beaten by nesting (<scr<b>ipt>), so
 * repeat until nothing changes, then drop any stray angle brackets.
 */
function stripTags(v) {
  let s = String(v == null ? '' : v)
  let prev
  do { prev = s; s = s.replace(/<[^>]*>/g, '') } while (s !== prev)
  return s.replace(/[<>]/g, '')
}

function strip(v, max) {
  return stripTags(v).replace(/\s+/g, ' ').trim().slice(0, max)
}

function stripKeepBreaks(v, max) {
  return stripTags(v).replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max)
}

/** Accept only http or https links. Returns the cleaned link or ''. */
function cleanLink(v) {
  let s = strip(v, 300)
  if (!s) return ''
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = `https://${s}`
  try {
    const u = new URL(s)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return ''
    if (!u.hostname.includes('.')) return ''
    return u.toString().slice(0, 300)
  } catch (e) { return '' }
}

/**
 * @param {object} raw  the volunteer answers sent by the form
 * @returns {{error?: string, fields?: object, message?: string}}
 */
function parseVolunteerApplication(raw) {
  const v = raw && typeof raw === 'object' ? raw : {}

  const why = stripKeepBreaks(v.why, 1000)
  const experience = stripKeepBreaks(v.experience, 1000)
  const roles = (Array.isArray(v.roles) ? v.roles : [])
    .map(r => String(r))
    .filter(r => ROLE_CHOICES.includes(r))
    .filter((r, i, a) => a.indexOf(r) === i)
    .slice(0, 6)
  const hours = HOURS_CHOICES.includes(v.hours) ? v.hours : ''
  const link = cleanLink(v.profileLink)
  const credentials = strip(v.credentials, 300)
  const location = strip(v.location, 120)
  const heardFrom = strip(v.heardFrom, 200)
  const extra = stripKeepBreaks(v.extra, 800)

  if (why.length < 40) return { error: 'Please tell us in a few sentences why you want to volunteer with ODIPA.' }
  if (!roles.length) return { error: 'Please choose at least one role, or choose "Not sure yet".' }
  if (experience.length < 30) return { error: 'Please describe your relevant experience or skills.' }
  if (!link) return { error: 'Please add a link to your resume, LinkedIn profile or personal site.' }
  if (!hours) return { error: 'Please choose how much time you can give.' }

  const lines = [
    'VOLUNTEER APPLICATION',
    `Why ODIPA: ${why}`,
    `Roles of interest: ${roles.join(', ')}`,
    `Relevant experience and skills: ${experience}`,
    `Resume or profile link: ${link}`,
    credentials && `Credentials: ${credentials}`,
    `Time available: ${hours}`,
    location && `Based in: ${location}`,
    heardFrom && `Heard about ODIPA from: ${heardFrom}`,
    extra && `Anything else: ${extra}`,
  ].filter(Boolean)

  return {
    fields: { why, roles, experience, link, credentials, hours, location, heardFrom, extra },
    message: lines.join('\n'),
  }
}

module.exports = { parseVolunteerApplication, ROLE_CHOICES, HOURS_CHOICES, NOT_SURE }
