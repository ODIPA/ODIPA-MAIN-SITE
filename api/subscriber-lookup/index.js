/**
 * ODIPA Subscriber Lookup, GET /api/subscriber-lookup
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 *   ?q=<email or part of an email or name>   search, a full email is an exact lookup
 *   ?members=1                               only community members
 *   ?view=deletions                          the deletion log, which holds no personal data
 * Responses contain personal data, so they are never cached.
 */
const admin = require('../_shared/subscriberAdmin')

module.exports = async function handler(context, req) {
  const respond = (status, body) => {
    context.res = { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body }
  }
  try {
    if (!admin.isAdminRequest(req)) return respond(401, { error: 'Unauthorized' })

    const q = req.query || {}
    if (q.view === 'deletions') {
      return respond(200, { deletions: await admin.listDeletions() })
    }
    const out = await admin.lookup({ q: q.q, membersOnly: q.members === '1' || q.members === 'true' })
    return respond(200, out)
  } catch (err) {
    context.log.error('subscriber-lookup error:', err.message)
    return respond(500, { error: 'Lookup failed' })
  }
}
