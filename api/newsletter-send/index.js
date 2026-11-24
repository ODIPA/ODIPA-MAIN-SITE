/**
 * ODIPA Newsletter Send, POST /api/newsletter-send
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 *
 * Test send:   { subject, html, testTo }  sends one email to that address.
 *
 * Full send:   { subject, html }          starts a new issue and sends to confirmed
 *              subscribers until a time budget runs out, then reports what is left.
 *              { issueId }                continues that issue. Only people who have
 *              not yet received it are emailed, so repeating the call is safe.
 *              { issueId, subject, html } also works, and the content must match the
 *              issue that was started.
 * Each call returns { issueId, total, sent, remaining, done, failed, failures }.
 * Keep calling with the same issueId until done is true.
 *
 * Azure Static Web Apps cuts API requests off at 45 seconds, so one call only works
 * for a budget of about 25 seconds and the caller repeats. Each success is written
 * to a ledger (a hash of the address per issue, no readable address) right away, so
 * a cut off call loses nothing and nobody gets the same issue twice. Mail is sent
 * one message per person, never BCC, each with their own unsubscribe link.
 */
const { isAdminRequest } = require('../_shared/adminAuth')
const { sendHtmlEmail, respond, clean } = require('../_shared/mailer')
const subs = require('../_shared/subscribers')
const { wrapEmail, toPlainText } = require('../_shared/newsletterEmail')
const { runRound } = require('../_shared/sendRounds')

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST') return respond(context, 405, { error: 'Method not allowed' })
  try {
    if (!isAdminRequest(req)) {
      return respond(context, 401, { error: 'Unauthorized' })
    }

    const body = req.body || {}
    const issueId = clean(body.issueId, 80)
    let subject = clean(body.subject, 200)
    let html = String(body.html || '').trim()

    // Test send
    const testTo = clean(body.testTo, 254).toLowerCase()
    if (testTo) {
      if (!subject || !html) return respond(context, 400, { error: 'subject and html are required.' })
      const wrapped = wrapEmail(html, subs.unsubscribeLink(testTo))
      await sendHtmlEmail({ to: testTo, subject: `[TEST] ${subject}`, html: wrapped, plainText: toPlainText(wrapped) })
      return respond(context, 200, { sent: 1, mode: 'test', to: testTo })
    }

    const started = Date.now()
    const confirmed = await subs.listByStatus('confirmed')
    let id = issueId

    if (id) {
      // Issue ids are generated here from an ISO timestamp. Anything else is refused before
      // it reaches a Table Storage query.
      if (!/^[0-9TZ-]+$/.test(id)) return respond(context, 400, { error: 'That issue id is not valid.' })
      const issue = await subs.getIssue(id)
      if (!issue || issue.kind === 'article') return respond(context, 404, { error: 'That issue was not found.' })
      if (issue.status === 'complete') return respond(context, 409, { error: 'This issue was already sent to everyone.' })
      if (!subject && !html) {
        if (issue.htmlTruncated) return respond(context, 409, { error: 'This issue is too long to resume without the content. Send subject and html again.' })
        subject = issue.subject; html = issue.html
      } else if (!subject || !html || subs.contentHash(subject, html) !== issue.contentHash) {
        return respond(context, 409, { error: 'The content does not match the issue that was started. Resume with the same subject and body.' })
      }
    } else {
      if (!subject || !html) return respond(context, 400, { error: 'subject and html are required.' })
      if (confirmed.length === 0) return respond(context, 200, { sent: 0, failed: 0, remaining: 0, total: 0, done: true, mode: 'full', note: 'No confirmed subscribers.' })
      id = await subs.beginIssue({ subject, html, confirmedAtStart: confirmed.length })
    }

    if (!(await subs.acquireRound(id))) return respond(context, 409, { error: 'Another round of this send is still running. Wait a minute, then resume.' })
    let round
    try { round = await runRound({ issueId: id, confirmed, subject, html, started }) } finally { await subs.releaseRound(id) }
    const { sent, sentNow, remaining, done, failures } = round
    try {
      await subs.updateIssue(id, { sent, remaining, failed: failures.length, status: done ? 'complete' : 'incomplete', updatedAt: new Date().toISOString() })
    } catch (e) { context.log.error('updateIssue failed:', e.message) }

    return respond(context, 200, { issueId: id, mode: 'full', total: confirmed.length, sent, sentNow, remaining, done, failed: failures.length, failures })
  } catch (err) {
    context.log.error('newsletter-send error:', err.message)
    return respond(context, 500, { error: 'Send failed' })
  }
}
