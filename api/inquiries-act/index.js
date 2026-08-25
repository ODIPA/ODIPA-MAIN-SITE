/**
 * POST /api/inquiries-act — approve-and-send or dismiss an inquiry draft.
 * Admin-only (x-admin-key).
 * Body: { id, action: 'send' | 'dismiss', subject?, body? }
 * 'send' uses the provided subject/body (the admin may have edited the
 * draft), emails the submitter with reply-to routed to the team address,
 * and marks the inquiry sent. Nothing sends without this explicit call.
 */
const { respond, sendHtmlEmail } = require('../_shared/mailer')
const { getInquiry, updateInquiry } = require('../_shared/inquiries')

function replyHtml(name, bodyText, teamAddress) {
  const paragraphs = bodyText.split('\n').filter(p => p.trim()).map(p =>
    `<p style="font-size:14px;line-height:1.7;color:#1C2536;margin:0 0 14px">${p}</p>`).join('')
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1C2536">
      <div style="background:#0B1F3A;padding:16px 20px;margin-bottom:22px;border-radius:8px">
        <img src="https://www.odipa.org/logo-dark-sm.png" alt="ODIPA" height="36" style="display:block;height:36px" />
      </div>
      ${paragraphs}
      <p style="font-size:12px;color:#667;margin:20px 0 0">Replies reach our team at ${teamAddress}.</p>
    </div>`
}

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  const key = process.env.NEWSLETTER_ADMIN_KEY
  if (!key || req.headers['x-admin-key'] !== key)
    return respond(context, 401, { error: 'Unauthorized' })

  try {
    const { id, action, subject, body } = req.body || {}
    if (!id || !action) return respond(context, 400, { error: 'id and action are required' })

    const inq = await getInquiry(id).catch(() => null)
    if (!inq) return respond(context, 404, { error: 'Inquiry not found' })

    if (action === 'dismiss') {
      await updateInquiry(id, { status: 'dismissed' })
      return respond(context, 200, { ok: true, status: 'dismissed' })
    }

    if (action === 'send') {
      if (!subject || !body) return respond(context, 400, { error: 'subject and body are required to send' })
      if (inq.status === 'sent') return respond(context, 409, { error: 'Already sent' })
      const teamAddress = inq.routedTo || 'info@odipa.org'
      await sendHtmlEmail({
        to: inq.email,
        replyTo: teamAddress,
        subject: String(subject).slice(0, 200),
        html: replyHtml(inq.name, String(body).slice(0, 4000), teamAddress),
        plainText: `${String(body).slice(0, 4000)}\n\nReplies reach our team at ${teamAddress}.`,
      })
      await updateInquiry(id, {
        status: 'sent', sentAt: Date.now(),
        draftSubject: String(subject).slice(0, 200), draftBody: String(body).slice(0, 4000),
      })
      return respond(context, 200, { ok: true, status: 'sent' })
    }

    respond(context, 400, { error: 'Unknown action' })
  } catch (err) {
    context.log.error('Inquiry act error:', err.message)
    respond(context, 500, { error: 'Action failed' })
  }
}
