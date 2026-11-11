/**
 * The one place that decides whether a request carries the admin key.
 *
 * The key is compared in constant time, so the time a check takes does not
 * reveal how much of a guess was right. A missing key setting means nobody gets
 * in, and so does a missing or empty header. Every admin endpoint uses this, so
 * the rule lives in one file.
 */
const crypto = require('crypto')

/** True only if the x-admin-key header equals NEWSLETTER_ADMIN_KEY. */
function isAdminRequest(req) {
  const key = process.env.NEWSLETTER_ADMIN_KEY
  const given = req && req.headers ? req.headers['x-admin-key'] : ''
  if (!key || !given || typeof given !== 'string') return false
  const a = Buffer.from(String(key))
  const b = Buffer.from(given)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

module.exports = { isAdminRequest }
