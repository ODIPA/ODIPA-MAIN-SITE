/**
 * ODIPA signup abuse controls. First-party, no third-party requests, no cookies.
 *
 * 1. Proof-of-work challenge. The browser fetches a challenge from /api/signup-challenge,
 *    solves it in the background, and sends the solution with the form. The format is
 *    compatible with Altcha (SHA-256, HMAC signed), so the official widget can replace
 *    the built-in client later without any server change.
 *    The salt carries the issue time, which gives a minimum time-to-submit check for free.
 *    Each solution can be used once per server instance.
 * 2. Gmail aware identity. Gmail ignores dots and anything after a plus sign, so
 *    j.a.smin.e and jasmine are one inbox. canonicalEmail() collapses them so one inbox
 *    cannot register many times, and looksGenerated() flags the random dot pattern bots use.
 *
 * Secret. Uses ABUSE_TOKEN_SECRET if set, otherwise the NEWSLETTER_TOKEN_SECRET that the
 * confirmation links already require, so no new app setting is needed.
 *
 * Optional app settings
 *   SIGNUP_CHALLENGE_MODE  enforce (default) or monitor. Monitor logs failures but lets
 *                          the sign up through, useful for the first day after deploying.
 *   SIGNUP_MIN_AGE_MS      minimum time between issuing and submitting a challenge. Default 3000.
 */

const crypto = require('crypto')

const MAX_NUMBER = 50000                 // average client work is about 25,000 hashes
const MAX_AGE_MS = 30 * 60 * 1000        // a challenge is valid for 30 minutes
const HELP_EMAIL = 'info@odipa.org'

const used = new Map()                   // signature to expiry, best effort replay guard

function minAgeMs() {
  const v = Number(process.env.SIGNUP_MIN_AGE_MS)
  return Number.isFinite(v) && v >= 0 ? v : 3000
}

function challengeMode() {
  return String(process.env.SIGNUP_CHALLENGE_MODE || 'enforce').toLowerCase() === 'monitor' ? 'monitor' : 'enforce'
}

function key() {
  const secret = process.env.ABUSE_TOKEN_SECRET || process.env.NEWSLETTER_TOKEN_SECRET
  if (!secret) throw new Error('ABUSE_TOKEN_SECRET (or NEWSLETTER_TOKEN_SECRET) is not set.')
  return crypto.createHmac('sha256', secret).update('odipa-signup-challenge-v1').digest()
}

const sha256hex = s => crypto.createHash('sha256').update(s).digest('hex')
const hmachex = (k, s) => crypto.createHmac('sha256', k).update(s).digest('hex')

function safeEqualHex(a, b) {
  try {
    const x = Buffer.from(String(a), 'hex'), y = Buffer.from(String(b), 'hex')
    return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y)
  } catch (e) { return false }
}

// ------------------------------------------------------------ challenge

function issueChallenge(now = Date.now()) {
  const salt = `${crypto.randomBytes(12).toString('hex')}?issued=${now}&expires=${now + MAX_AGE_MS}`
  const number = crypto.randomInt(0, MAX_NUMBER + 1)
  const challenge = sha256hex(salt + number)
  return { algorithm: 'SHA-256', challenge, maxnumber: MAX_NUMBER, salt, signature: hmachex(key(), challenge) }
}

/** payload is the base64 JSON string the browser sends. Returns { ok } or { ok: false, reason }. */
function verifySolution(payload, now = Date.now()) {
  const fail = reason => ({ ok: false, reason })
  if (!payload) return fail('missing')
  let p
  try { p = JSON.parse(Buffer.from(String(payload), 'base64').toString('utf8')) } catch (e) { return fail('malformed') }
  if (!p || p.algorithm !== 'SHA-256' || typeof p.challenge !== 'string' || typeof p.salt !== 'string' ||
      typeof p.signature !== 'string' || !Number.isInteger(p.number) || p.number < 0 || p.number > MAX_NUMBER) {
    return fail('malformed')
  }
  if (!safeEqualHex(hmachex(key(), p.challenge), p.signature)) return fail('bad-signature')
  if (!safeEqualHex(sha256hex(p.salt + p.number), p.challenge)) return fail('bad-solution')

  const q = new URLSearchParams(p.salt.split('?')[1] || '')
  const issued = Number(q.get('issued')), expires = Number(q.get('expires'))
  if (!Number.isFinite(issued) || !Number.isFinite(expires)) return fail('malformed')
  if (now > expires) return fail('expired')
  if (now - issued < minAgeMs()) return fail('too-fast')

  if (used.has(p.signature)) return fail('replayed')
  if (used.size > 5000) for (const [s, exp] of used) if (now > exp) used.delete(s)
  used.set(p.signature, expires)
  return { ok: true }
}

/**
 * Handler helper. Returns null when the sign up may continue, otherwise a
 * { status, body } the handler should send. In monitor mode failures are only logged.
 * Never logs the email address.
 */
function enforceChallenge(body, context, label) {
  const result = verifySolution(body && body.challenge)
  if (result.ok) return null
  context.log.warn(`${label} challenge ${result.reason}${challengeMode() === 'monitor' ? ' (monitor mode, allowed)' : ''}`)
  if (challengeMode() === 'monitor') return null
  if (result.reason === 'missing') {
    return { status: 400, body: { code: 'challenge-missing', error: `Your browser did not complete our security check. Please refresh the page and try again, or email ${HELP_EMAIL} and we will add you.` } }
  }
  return { status: 400, body: { code: 'challenge-failed', error: `We could not verify this sign up. Please refresh the page and try again, or email ${HELP_EMAIL} and we will add you.` } }
}

// ------------------------------------------------------------ email identity

const GMAIL = new Set(['gmail.com', 'googlemail.com'])

function splitEmail(email) {
  const e = String(email || '').trim().toLowerCase()
  const i = e.lastIndexOf('@')
  return i < 1 ? null : { local: e.slice(0, i), domain: e.slice(i + 1) }
}

/** Collapses Gmail dot and plus variants to one address. Other providers are only lowercased. */
function canonicalEmail(email) {
  const e = String(email || '').trim().toLowerCase()
  const parts = splitEmail(e)
  if (!parts || !GMAIL.has(parts.domain)) return e
  const local = parts.local.split('+')[0].replace(/\./g, '')
  return local ? `${local}@gmail.com` : e
}

/**
 * Flags the random dot pattern used to mint endless "different" Gmail addresses.
 * Real Gmail users almost never have more than two dots (first.middle.last). Three or more
 * is held. Only applies to Gmail, where dots are ignored, so nothing is lost by holding it.
 */
function looksGenerated(email) {
  const parts = splitEmail(email)
  if (!parts || !GMAIL.has(parts.domain)) return false
  const local = parts.local.split('+')[0]
  const dots = (local.match(/\./g) || []).length
  return dots >= 3
}

function reviewResponse() {
  return { status: 422, body: { code: 'email-review', error: `That email address looks unusual, so we could not add it automatically. Please email ${HELP_EMAIL} and we will add you.` } }
}

// ------------------------------------------------------------ first name shape

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const KEYBOARD_RUNS = new Set()
for (const row of KEYBOARD_ROWS) {
  for (let i = 0; i + 5 <= row.length; i++) {
    const run = row.slice(i, i + 5)
    KEYBOARD_RUNS.add(run); KEYBOARD_RUNS.add([...run].reverse().join(''))
  }
}

/**
 * Judges whether a first name looks randomly generated. The name field is optional, so
 * this is deliberately conservative. Real names come in every shape, so only patterns no
 * real name has count as "hold". Returns { level: 'hold' | 'weak' | null, reason }.
 *
 *   hold  a digit, three or more capitals inside one word, a word of four or more
 *         letters with no vowel, four identical letters in a row, or a keyboard run
 *         such as "asdfg". The person is asked to check the name or leave it blank.
 *   weak  a run of four or more consonants in a longer word. Real names such as
 *         Szczepan do this, so it is only logged and never blocks.
 *
 * Only plain A to Z words are judged. Names with accents or in other scripts are never
 * flagged, and a name typed in all capitals skips the capital letter rule.
 */
function nameLooksFake(name) {
  const n = String(name || '').trim()
  if (!n) return { level: null }
  if (/\d/.test(n)) return { level: 'hold', reason: 'digit' }
  const allCaps = n === n.toUpperCase()
  const words = n.split(/[\s\-'\u2019.]+/).filter(Boolean)
  let weak = false
  for (const w of words) {
    if (!/^[A-Za-z]+$/.test(w)) continue
    const lower = w.toLowerCase()
    if (!allCaps && (w.slice(1).match(/[A-Z]/g) || []).length >= 3) return { level: 'hold', reason: 'mixed-case' }
    if (w.length >= 4 && !/[aeiouy]/.test(lower)) return { level: 'hold', reason: 'no-vowel' }
    if (/(.)\1{3,}/.test(lower)) return { level: 'hold', reason: 'repeated' }
    for (let i = 0; i + 5 <= lower.length; i++) {
      if (KEYBOARD_RUNS.has(lower.slice(i, i + 5))) return { level: 'hold', reason: 'keyboard' }
    }
    if (w.length >= 5 && /[^aeiouy]{4,}/.test(lower)) weak = true
  }
  return weak ? { level: 'weak', reason: 'consonant-run' } : { level: null }
}

function nameReviewResponse(which = 'name') {
  return { status: 422, body: { code: 'name-review', error: `That ${which} looks unusual. Please check the spelling and try again. If it is correct, email ${HELP_EMAIL} and we will add you.` } }
}

/**
 * Membership requires a first and a last name. Each is checked with nameLooksFake.
 * Returns null when both are acceptable, otherwise { status, body } for the handler.
 * A "weak" pattern (a long consonant run) never blocks, the caller may log it.
 */
function checkMemberName(firstName, lastName) {
  const first = String(firstName || '').trim(), last = String(lastName || '').trim()
  if (!first || !last) {
    return { status: 400, body: { code: 'name-required', error: 'Please enter your first and last name to join.' } }
  }
  if (first.length > 60 || last.length > 60) {
    return { status: 400, body: { code: 'name-required', error: 'Please enter your first and last name to join.' } }
  }
  const f = nameLooksFake(first), l = nameLooksFake(last)
  if (f.level === 'hold') return Object.assign(nameReviewResponse('first name'), { reason: f.reason })
  if (l.level === 'hold') return Object.assign(nameReviewResponse('last name'), { reason: l.reason })
  return null
}

/**
 * The address to store and send to. A person already on the list under the exact
 * address they typed keeps that record. Otherwise Gmail variants collapse to one record.
 */
async function resolveIdentity(email, getSubscriber) {
  const canon = canonicalEmail(email)
  if (canon === email) return email
  if (await getSubscriber(email)) return email
  return canon
}

module.exports = {
  issueChallenge, verifySolution, enforceChallenge, challengeMode,
  canonicalEmail, looksGenerated, reviewResponse, nameLooksFake, nameReviewResponse, checkMemberName, resolveIdentity, HELP_EMAIL,
}
