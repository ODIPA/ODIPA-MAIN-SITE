/**
 * ODIPA Subscriber Delete, POST /api/subscriber-delete
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * Body { email, confirmEmail, reason } where reason is one of
 * person-request, duplicate-or-test, other.
 * The address must be typed a second time to confirm. The subscriber row is removed
 * and a deletion log entry is written that holds no name and no address.
 */
const admin = require('../_shared/subscriberAdmin')

module.exports = async function handler(context, req) {
  const respond = (status, body) => {
    context.res = { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body }
  }
  try {
    if (!admin.isAdminRequest(req)) return respond(401, { error: 'Unauthorized' })

    const body = req.body || {}
    const email = admin.normalizeEmail(body.email)
    const confirmEmail = admin.normalizeEmail(body.confirmEmail)

    if (!admin.EMAIL_RE.test(email)) return respond(400, { error: 'Enter a valid email address.' })
    if (confirmEmail !== email) return respond(400, { error: 'Type the email address again to confirm the deletion.' })
    if (!admin.REASONS.includes(body.reason)) return respond(400, { error: 'Choose a reason for the deletion.' })

    const result = await admin.deletePerson({ email, reason: body.reason })
    if (!result.deleted) return respond(404, { error: 'No record exists for that address. It may already be deleted.' })

    context.log(`Subscriber deleted. reason=${body.reason} wasMember=${result.wasMember} status=${result.status} logged=${result.logged}`)
    return respond(200, { ok: true, deleted: true, wasMember: result.wasMember, status: result.status, logged: result.logged })
  } catch (err) {
    context.log.error('subscriber-delete error:', err.message)
    return respond(500, { error: 'Delete failed' })
  }
}
