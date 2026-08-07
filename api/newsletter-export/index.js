/**
 * ODIPA Newsletter Export, GET /api/newsletter-export
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * Returns confirmed subscribers with their unsubscribe links, which is the
 * feed for any automated or AI-assisted newsletter send pipeline.
 */
const { listByStatus, unsubscribeLink } = require('../_shared/subscribers')

module.exports = async function handler(context, req) {
  const respond = (status, body) => { context.res = { status, headers: { 'Content-Type': 'application/json' }, body } }
  try {
    const key = process.env.NEWSLETTER_ADMIN_KEY
    if (!key || req.headers['x-admin-key'] !== key) {
      return respond(401, { error: 'Unauthorized' })
    }
    const subs = await listByStatus('confirmed')
    return respond(200, {
      count: subs.length,
      subscribers: subs.map(s => Object.assign({}, s, { unsubscribe: unsubscribeLink(s.email) })),
    })
  } catch (err) {
    context.log.error('newsletter-export error:', err.message)
    return respond(500, { error: 'Export failed' })
  }
}
