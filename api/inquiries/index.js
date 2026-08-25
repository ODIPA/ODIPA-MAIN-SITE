/**
 * GET /api/inquiries, admin list for the review inbox.
 * Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * ?status=drafted,needs-attention,acked (comma list, default all active)
 */
const { respond } = require('../_shared/mailer')
const { listInquiries } = require('../_shared/inquiries')

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  const key = process.env.NEWSLETTER_ADMIN_KEY
  if (!key || req.headers['x-admin-key'] !== key)
    return respond(context, 401, { error: 'Unauthorized' })

  try {
    const raw = (req.query.status || 'acked,drafted,needs-attention').split(',').map(s => s.trim()).filter(Boolean)
    const rows = await listInquiries(raw)
    rows.sort((a, b) => (a.rowKey < b.rowKey ? -1 : 1)) // inverted-ts ids: newest first
    respond(context, 200, {
      inquiries: rows.map(r => ({
        id: r.rowKey, topic: r.topic, name: r.name, email: r.email,
        organization: r.organization, message: r.message, routedTo: r.routedTo,
        status: r.status, receivedAt: Number(r.receivedAt) || 0,
        draftSubject: r.draftSubject || '', draftBody: r.draftBody || '',
        draftReason: r.draftReason || '', draftedAt: Number(r.draftedAt) || 0,
        prepSheetAt: Number(r.prepSheetAt) || 0,
      })),
    })
  } catch (err) {
    context.log.error('Inquiries list error:', err.message)
    respond(context, 500, { error: 'Failed to list inquiries' })
  }
}
