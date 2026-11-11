/**
 * POST /api/inquiries-act, approve-and-send or dismiss an inquiry draft.
 * Admin-only (x-admin-key).
 * Body: { id, action: 'send' | 'dismiss' | 'move', subject?, body?, status? }
 * or { action: 'redraft-thin', dryRun? } to queue old thin volunteer drafts for
 * a fresh drafting run.
 * 'move' sets a whitelisted pipeline status (kanban drag or button). Moving
 * to 'sent' marks an inquiry handled personally and emails nothing.
 * 'send' uses the provided subject/body (the admin may have edited the
 * draft), emails the submitter with reply-to routed to the team address,
 * and marks the inquiry sent. Nothing sends without this explicit call.
 * Each reply is also copied to the team address (see EMAIL_COPY_TO below).
 */
const { isAdminRequest } = require('../_shared/adminAuth')
const { respond, sendHtmlEmail } = require('../_shared/mailer')
const { getInquiry, listInquiries, updateInquiry } = require('../_shared/inquiries')
const { advanceFromApplied } = require('../_shared/volunteers')
const { volunteerCompleteness, DRAFT_RULES } = require('../_shared/volunteerCompleteness')
const { deleteResume } = require('../_shared/resumeStore')

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
  if (!isAdminRequest(req))
    return respond(context, 401, { error: 'Unauthorized' })

  try {
    const { id, action, subject, body } = req.body || {}

    // Bulk: send thin volunteer drafts that predate the current drafting rules
    // back to 'acked' so the next drafting run writes them again. Sends nothing
    // and does not touch anything else. dryRun only counts.
    if (action === 'redraft-thin') {
      const stale = (await listInquiries(['drafted'])).filter(r =>
        r.topic === 'volunteer' &&
        volunteerCompleteness(r.message) === 'THIN' &&
        r.draftRules !== DRAFT_RULES)
      const dryRun = !!(req.body && req.body.dryRun)
      if (!dryRun) for (const r of stale) await updateInquiry(r.rowKey, { status: 'acked', handledAt: 0 })
      return respond(context, 200, { ok: true, count: stale.length, dryRun })
    }

    if (!id || !action) return respond(context, 400, { error: 'id and action are required' })

    const inq = await getInquiry(id).catch(() => null)
    if (!inq) return respond(context, 404, { error: 'Inquiry not found' })

    if (action === 'dismiss') {
      // Dismissed means handled outside the system, so the resume file is no
      // longer needed. Remove it rather than keep a document nobody will open.
      // Keep the reference if the delete failed, so the file is not orphaned.
      const fileGone = inq.resumeBlob ? await deleteResume(inq.resumeBlob) : true
      await updateInquiry(id, fileGone ? { status: 'dismissed', resumeBlob: '' } : { status: 'dismissed' })
      return respond(context, 200, { ok: true, status: 'dismissed' })
    }

    if (action === 'move') {
      const allowed = ['acked', 'needs-attention', 'sent', 'meeting']
      const target = String(req.body && req.body.status || '')
      if (!allowed.includes(target)) return respond(context, 400, { error: 'Invalid target status' })
      // A manual move to 'sent' means handled outside the system. Record when,
      // so the dashboard can tell it apart from a reply the system emailed.
      const patch = { status: target }
      if (target === 'sent' && !inq.sentAt) patch.handledAt = Date.now()
      if (target === 'acked' || target === 'needs-attention') patch.handledAt = 0
      await updateInquiry(id, patch)
      // Booking the intro call moves the volunteer on the roster too, unless
      // the team already moved them further. Roster trouble never fails the move.
      if (target === 'meeting' && inq.topic === 'volunteer' && inq.email) {
        try { await advanceFromApplied(inq.email, 'intro-call') } catch (e) { context.log.warn('Roster not updated: ' + e.message) }
      }
      return respond(context, 200, { ok: true, status: target })
    }

    if (action === 'send') {
      if (!subject || !body) return respond(context, 400, { error: 'subject and body are required to send' })
      if (inq.status === 'sent') return respond(context, 409, { error: 'Already sent' })
      const teamAddress = inq.routedTo || 'info@odipa.org'
      // Every portal reply is also copied (bcc) to the team address, so there is
      // a record in a real mailbox. Set EMAIL_COPY_TO to use another address,
      // or to "off" to turn the copy off.
      const copyTo = (process.env.EMAIL_COPY_TO || teamAddress).trim()
      await sendHtmlEmail({
        to: inq.email,
        bcc: copyTo.toLowerCase() === 'off' ? undefined : copyTo,
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
