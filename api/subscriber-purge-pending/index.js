/**
 * ODIPA purge of unconfirmed sign ups, POST /api/subscriber-purge-pending
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * Body { olderThanHours, dryRun }. olderThanHours defaults to 72 and never goes below 24.
 * dryRun defaults to true, so nothing is deleted unless the body says dryRun false.
 * Only pending rows are touched. Confirmed and unsubscribed rows are never removed.
 */
const admin = require('../_shared/subscriberAdmin')

module.exports = async function handler(context, req) {
  const respond = (status, body) => {
    context.res = { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body }
  }
  try {
    if (!admin.isAdminRequest(req)) return respond(401, { error: 'Unauthorized' })
    const body = req.body || {}
    const result = await admin.purgeStalePending({
      olderThanHours: body.olderThanHours,
      dryRun: body.dryRun !== false,
    })
    context.log(`Pending purge. dryRun=${result.dryRun} matched=${result.matched} deleted=${result.deleted} scanned=${result.scanned}`)
    return respond(200, { ok: true, ...result })
  } catch (err) {
    context.log.error('subscriber-purge-pending error:', err.message)
    return respond(500, { error: 'Purge failed' })
  }
}
