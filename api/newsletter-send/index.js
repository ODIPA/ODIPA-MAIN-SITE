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
const { sendHtmlEmail, respond, clean } = require('../_shared/mailer')
const { listByStatus, unsubscribeLink, saveIssue } = require('../_shared/subscribers')

function wrapEmail(bodyHtml, unsubLink) {
  const postal = process.env.NEWSLETTER_POSTAL || 'ODIPA, a California 501(c)(3) nonprofit'
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1C2536">
    <div style="background:#0B1F3A;padding:18px 20px;margin-bottom:24px;border-radius:8px">
      <img src="https://www.odipa.org/logo-dark-sm.png" alt="ODIPA" height="40" style="display:block;height:40px" />
      <div style="font-family:monospace;font-size:10px;letter-spacing:2px;color:#B98A2E;margin-top:8px">PRIVACY MONTHLY DIGEST</div>
    </div>
    ${bodyHtml}
    <div style="background:#F3E8CF;border-radius:8px;padding:18px 20px;margin-top:32px;text-align:center">
      <p style="font-size:14px;color:#0B1F3A;margin:0 0 12px;font-weight:bold">Privacy education is free because people like you support it.</p>
      <a href="https://www.odipa.org/donate" style="background:#B98A2E;color:#0B1F3A;font-weight:bold;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block;margin:0 6px 6px 0">Donate</a>
      <a href="https://www.odipa.org/get-involved/volunteer" style="border:2px solid #0B1F3A;color:#0B1F3A;font-weight:bold;padding:8px 18px;border-radius:8px;text-decoration:none;display:inline-block;margin:0 0 6px 0">Volunteer</a>
      <p style="font-size:12px;color:#667;margin:8px 0 0">All our tools are free and open source at <a href="https://www.odipa.org/programs/open-source-development" style="color:#B98A2E">odipa.org</a>.</p>
    </div>
    <div style="border-top:1px solid #E4E1D8;margin-top:24px;padding-top:16px;font-size:12px;color:#667">
      <p>You are receiving this because you confirmed your subscription at odipa.org.</p>
      <p><a href="${unsubLink}" style="color:#B98A2E">Unsubscribe</a> at any time, one click, no questions.</p>
      <p>${postal}</p>
    </div>
  </div>`
}

function toPlainText(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>(\n)?/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST') return respond(context, 405, { error: 'Method not allowed' })
  try {
    const key = process.env.NEWSLETTER_ADMIN_KEY
    if (!key || req.headers['x-admin-key'] !== key) {
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
