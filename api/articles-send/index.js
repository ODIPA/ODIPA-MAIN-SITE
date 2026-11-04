/**
 * ODIPA Articles Send, POST /api/articles-send
 * Admin-only (x-admin-key). Body: { slug, testTo?, resend? }
 * Emails a short announcement of a PUBLISHED article: title, summary, byline
 * and a link to read it on odipa.org. Not the full text.
 * With testTo, sends one test email. Without it, sends to every confirmed
 * subscriber, each with their own unsubscribe link, individually and never BCC.
 * A full send is refused if the article was already emailed, unless resend is true.
 * Same 45 second limit and small list note as newsletter-send.
 */
const { isAdminRequest } = require('../_shared/adminAuth')
const { sendHtmlEmail, respond, clean } = require('../_shared/mailer')
const { listByStatus, unsubscribeLink } = require('../_shared/subscribers')
const { wrapEmail, toPlainText } = require('../_shared/newsletterEmail')
const A = require('../_shared/articles')

function announcement(ent) {
  const url = `https://www.odipa.org/articles?a=${encodeURIComponent(ent.rowKey)}`
  const byline = ent.author ? `<p style="font-size:12px;color:#667;margin:0 0 12px">By ${A.esc(ent.author)}</p>` : ''
  return `
    <h1 style="color:#0B1F3A;font-size:24px;line-height:1.3;margin:0 0 8px">${A.esc(ent.title)}</h1>
    ${byline}
    <p style="font-size:15px;line-height:1.7;color:#1C2536">${A.esc(ent.summary)}</p>
    <p style="margin:20px 0"><a href="${A.esc(url)}" style="background:#0B1F3A;color:#ffffff;font-weight:bold;padding:11px 20px;border-radius:8px;text-decoration:none;display:inline-block">Read the article</a></p>
    <p style="font-size:12px;color:#667">Or open this link: <a href="${A.esc(url)}" style="color:#B98A2E">${A.esc(url)}</a></p>`
}

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST') return respond(context, 405, { error: 'Method not allowed' })
  try {
    if (!isAdminRequest(req)) return respond(context, 401, { error: 'Unauthorized' })
    const body = req.body || {}
    const ent = await A.getArticle(String(body.slug || ''))
    if (!ent) return respond(context, 404, { error: 'Article not found' })
    if (ent.status !== 'published') return respond(context, 400, { error: 'Publish the article first, then email it.' })

    const html = announcement(ent)
    const subject = ent.title
    const label = 'ODIPA ARTICLE'

    const testTo = clean(body.testTo, 254).toLowerCase()
    if (testTo) {
      const wrapped = wrapEmail(html, unsubscribeLink(testTo), label)
      await sendHtmlEmail({ to: testTo, subject: `[TEST] ${subject}`, html: wrapped, plainText: toPlainText(wrapped) })
      return respond(context, 200, { sent: 1, mode: 'test', to: testTo })
    }

    if (ent.emailedAt && body.resend !== true) {
      return respond(context, 409, { error: 'This article was already emailed. Send again only if you mean to.', emailedAt: ent.emailedAt })
    }

    const subs = await listByStatus('confirmed')
    if (subs.length === 0) return respond(context, 200, { sent: 0, failed: 0, mode: 'full', note: 'No confirmed subscribers.' })

    let sent = 0
    let failed = 0
    const CHUNK = 5
    for (let i = 0; i < subs.length; i += CHUNK) {
      const batch = subs.slice(i, i + CHUNK)
      const results = await Promise.allSettled(batch.map(s => {
        const wrapped = wrapEmail(html, unsubscribeLink(s.email), label)
        return sendHtmlEmail({ to: s.email, subject, html: wrapped, plainText: toPlainText(wrapped) })
      }))
      results.forEach(r => { if (r.status === 'fulfilled') sent++; else failed++ })
    }
    // Only the counts are kept, never who failed.
    try { await A.patchArticle(ent.rowKey, { emailedAt: new Date().toISOString(), emailedCount: sent }) } catch (e) { context.log.error('emailedAt not saved:', e.message) }
    return respond(context, 200, { sent, failed, mode: 'full', total: subs.length })
  } catch (err) {
    context.log.error('articles-send error:', err.message)
    return respond(context, 500, { error: 'Send failed' })
  }
}
