/**
 * ODIPA strict email checks. All first-party. The only outside traffic is a DNS lookup
 * for the domain's mail servers, which is how any mail sender finds the destination.
 *
 * Order of checks, cheapest first. The first failure wins.
 *   1. shape        stricter than the old pattern: no doubled, leading or trailing dots,
 *                   a real domain ending of two or more letters, length limits.
 *   2. disposable   the domain is a known throwaway provider (local list, CC0).
 *   3. mx           the domain publishes mail servers. A domain with no MX and no A record
 *                   cannot receive the confirmation email, so there is no point sending it.
 *                   A DNS timeout or server error is NOT a failure; the sign up proceeds.
 *
 * Each result is { ok: true } or { ok: false, reason, status, body } ready for the handler.
 */

const fs = require('fs')
const path = require('path')
const dns = require('dns').promises

const HELP_EMAIL = 'info@odipa.org'
const DNS_TIMEOUT_MS = 2500
// Before a "domain not found" answer is trusted, a domain that certainly exists must resolve.
// If it does not, the resolver itself is the problem and the sign up proceeds.
const CANARY_DOMAIN = 'gmail.com'
const CANARY_TTL_MS = 10 * 60 * 1000
let canaryOkUntil = 0

let disposable = null
function disposableDomains() {
  if (disposable) return disposable
  disposable = new Set()
  try {
    const text = fs.readFileSync(path.join(__dirname, 'data', 'disposable-domains.txt'), 'utf8')
    for (const line of text.split('\n')) {
      const d = line.trim().toLowerCase()
      if (d && !d.startsWith('#')) disposable.add(d)
    }
  } catch (e) { /* missing list means no disposable check, never a crash */ }
  return disposable
}

function splitEmail(email) {
  const e = String(email || '').trim().toLowerCase()
  const i = e.lastIndexOf('@')
  return i < 1 || i === e.length - 1 ? null : { local: e.slice(0, i), domain: e.slice(i + 1) }
}

/** The domain and every parent domain, so sub.mailinator.com matches mailinator.com. */
function domainChain(domain) {
  const parts = domain.split('.')
  const out = []
  for (let i = 0; i < parts.length - 1; i++) out.push(parts.slice(i).join('.'))
  return out
}

const LOCAL_RE = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/
const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

function checkShape(email) {
  const e = String(email || '').trim().toLowerCase()
  const bad = reason => ({ ok: false, reason, status: 400, body: { code: 'email-invalid', error: 'Please enter a valid email address.' } })
  if (!e || e.length > 254) return bad('length')
  const parts = splitEmail(e)
  if (!parts) return bad('no-at')
  const { local, domain } = parts
  if (local.length > 64 || !LOCAL_RE.test(local)) return bad('local')
  const labels = domain.split('.')
  if (labels.length < 2 || domain.length > 253) return bad('domain')
  if (!labels.every(l => LABEL_RE.test(l))) return bad('domain')
  const tld = labels[labels.length - 1]
  if (!/^[a-z]{2,}$/.test(tld)) return bad('tld')
  return { ok: true }
}

function checkDisposable(email) {
  const parts = splitEmail(email)
  if (!parts) return { ok: true }
  const list = disposableDomains()
  const hit = domainChain(parts.domain).some(d => list.has(d))
  if (!hit) return { ok: true }
  return {
    ok: false, reason: 'disposable', status: 422,
    body: { code: 'email-disposable', error: `Temporary or disposable email addresses cannot be used to join. Please use an address you check regularly, or email ${HELP_EMAIL} and we will add you.` },
  }
}

function withTimeout(promise, ms) {
  let timer
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error('dns timeout'), { code: 'ETIMEOUT' })), ms) })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function canaryResolves(resolver) {
  const now = Date.now()
  if (now < canaryOkUntil) return true
  try {
    const mx = await withTimeout(resolver.resolveMx(CANARY_DOMAIN), DNS_TIMEOUT_MS)
    if (mx && mx.length) { canaryOkUntil = now + CANARY_TTL_MS; return true }
  } catch (e) { /* fall through */ }
  return false
}

/**
 * Resolves to ok when the domain has MX records, or falls back to A/AAAA (RFC 5321 allows
 * delivery to an A record). Only ENOTFOUND and ENODATA on every lookup count as failure.
 * Anything else, such as a timeout or a resolver error, lets the sign up through.
 */
async function checkMx(email, resolver = dns) {
  const parts = splitEmail(email)
  if (!parts) return { ok: true }
  const domain = parts.domain
  const noSuch = e => e && (e.code === 'ENOTFOUND' || e.code === 'ENODATA')
  try {
    const mx = await withTimeout(resolver.resolveMx(domain), DNS_TIMEOUT_MS)
    if (mx && mx.length) return { ok: true }
  } catch (e) {
    if (!noSuch(e)) return { ok: true, skipped: 'mx-error' }
  }
  for (const fn of ['resolve4', 'resolve6']) {
    try {
      const a = await withTimeout(resolver[fn](domain), DNS_TIMEOUT_MS)
      if (a && a.length) return { ok: true }
    } catch (e) {
      if (!noSuch(e)) return { ok: true, skipped: 'dns-error' }
    }
  }
  // Every lookup said "no such domain". Make sure DNS is actually answering before believing it.
  if (!(await canaryResolves(resolver))) return { ok: true, skipped: 'dns-unavailable' }
  return {
    ok: false, reason: 'no-mx', status: 422,
    body: { code: 'email-domain', error: `We could not find a mail server for that email domain, so a confirmation email would never arrive. Please check the address, or email ${HELP_EMAIL} and we will add you.` },
  }
}

/** Runs all checks in order and returns the first failure, or { ok: true }. */
async function strictEmailCheck(email, resolver) {
  const shape = checkShape(email); if (!shape.ok) return shape
  const disp = checkDisposable(email); if (!disp.ok) return disp
  return checkMx(email, resolver)
}

module.exports = { checkShape, checkDisposable, checkMx, strictEmailCheck, domainChain, _resetForTests: () => { disposable = null; canaryOkUntil = 0 } }
