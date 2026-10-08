/**
 * ODIPA signup challenge, POST /api/signup-challenge
 * Returns a signed proof-of-work challenge for the signup forms. Nothing is stored.
 */
const { respond } = require('../_shared/mailer')
const { issueChallenge } = require('../_shared/abuse')
const { checkRateLimit, getClientIp } = require('../_shared/rateLimiter')

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST')   return respond(context, 405, { error: 'Method not allowed' })
  try {
    const rl = checkRateLimit(getClientIp(req), 'signup-challenge', { max: 20, windowMs: 60000 })
    if (rl.limited) return respond(context, 429, { error: 'Too many requests. Please wait a moment and try again.' })
    respond(context, 200, issueChallenge())
  } catch (err) {
    context.log.error('Signup challenge error:', err.message)
    respond(context, 500, { error: 'Could not start the security check. Please try again.' })
  }
}
