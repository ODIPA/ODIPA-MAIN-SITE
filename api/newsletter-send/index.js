/**
 * ODIPA Newsletter Send, POST /api/newsletter-send
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * Body: { subject, html, testTo? }
 * With testTo, sends a single test email to that address.
 * Without it, sends to every confirmed subscriber, each with their own
 * unsubscribe link. Sends individually, never BCC, so no address leaks.
 *
 * Note: Static Web Apps managed functions have a 45 second limit. This is
 * fine for small lists. Beyond roughly 100 subscribers, move sending to a
 * queue or timer based worker.
 */
const { isAdminRequest } = require('../_shared/adminAuth')
const { sendHtmlEmail, respond, clean } = require('../_shared/mailer')
const { listByStatus, unsubscribeLink, saveIssue } = require('../_shared/subscribers')
const { wrapEmail, toPlainText } = require('../_shared/newsletterEmail')

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST') return respond(context, 405, { error: 'Method not allowed' })
  try {
    if (!isAdminRequest(req)) {
      return respond(context, 401, { error: 'Unauthorized' })
    }

    const body = req.body || {}
    const subject = clean(body.subject, 200)
    const html = String(body.html || '').trim()
    if (!subject || !html) return respond(context, 400, { error: 'subject and html are required.' })

    // Test send
    const testTo = clean(body.testTo, 254).toLowerCase()
    if (testTo) {
      const wrapped = wrapEmail(html, unsubscribeLink(testTo))
      await sendHtmlEmail({ to: testTo, subject: `[TEST] ${subject}`, html: wrapped, plainText: toPlainText(wrapped) })
      return respond(context, 200, { sent: 1, mode: 'test', to: testTo })
    }

    // Full send to confirmed subscribers
    const subs = await listByStatus('confirmed')
    if (subs.length === 0) return respond(context, 200, { sent: 0, failed: 0, mode: 'full', note: 'No confirmed subscribers.' })

    let sent = 0
    const failures = []
    const CHUNK = 5
    for (let i = 0; i < subs.length; i += CHUNK) {
      const batch = subs.slice(i, i + CHUNK)
      const results = await Promise.allSettled(batch.map(s => {
        const wrapped = wrapEmail(html, unsubscribeLink(s.email))
        return sendHtmlEmail({ to: s.email, subject, html: wrapped, plainText: toPlainText(wrapped) })
      }))
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') sent++
        else failures.push({ email: batch[idx].email, error: String(r.reason && r.reason.message || r.reason) })
      })
    }

    try { await saveIssue({ subject, html, sent, failed: failures.length }) } catch (e) { context.log.error('saveIssue failed:', e.message) }
    return respond(context, 200, { sent, failed: failures.length, failures, mode: 'full', total: subs.length })
  } catch (err) {
    context.log.error('newsletter-send error:', err.message)
    return respond(context, 500, { error: 'Send failed' })
  }
}
