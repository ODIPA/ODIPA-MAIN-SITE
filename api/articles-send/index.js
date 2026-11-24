/**
 * ODIPA Articles Send, POST /api/articles-send
 * Admin-only (x-admin-key). Body: { slug, testTo?, resend?, resume? }
 * Emails a short announcement of a PUBLISHED article: title, summary, byline
 * and a link to read it on odipa.org. Not the full text.
 * With testTo, sends one test email. Without it, sends to every confirmed
 * subscriber, each with their own unsubscribe link, individually and never BCC.
 * A full send is refused if the article was already emailed, unless resend is true.
 * Works in time-boxed rounds like newsletter-send, because API requests are cut off at
 * 45 seconds. Each round returns { issueId, total, sent, remaining, done, failed }. Call
 * again with resume: true until done is true. Each delivery is recorded as it happens
 * (a hash of the address, never the address), so nobody gets the article twice. The
 * response never lists addresses.
 */
const { isAdminRequest } = require('../_shared/adminAuth')
const { sendHtmlEmail, respond, clean } = require('../_shared/mailer')
const { listByStatus, unsubscribeLink } = require('../_shared/subscribers')
const { wrapEmail, toPlainText } = require('../_shared/newsletterEmail')
const subsLib = require('../_shared/subscribers')
const { runRound } = require('../_shared/sendRounds')
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

    const started = Date.now()
    const confirmed = await listByStatus('confirmed')
    let issueId

    if (body.resume === true) {
      // Continue the send that is already under way. The stored copy of the email is used,
      // so editing the article in between does not change what the rest of the list gets.
      issueId = ent.emailingIssueId
      const issue = issueId && /^[0-9TZ-]+$/.test(issueId) ? await subsLib.getIssue(issueId) : null
      if (!issue) return respond(context, 404, { error: 'There is no send under way for this article.' })
      if (issue.status === 'complete') return respond(context, 409, { error: 'This send already finished.' })
      return await finish(context, ent, issueId, confirmed, issue.subject, issue.html, label, started)
    }

    if (ent.emailedAt && body.resend !== true) {
      return respond(context, 409, { error: 'This article was already emailed. Send again only if you mean to.', emailedAt: ent.emailedAt })
    }

    if (confirmed.length === 0) return respond(context, 200, { sent: 0, failed: 0, total: 0, remaining: 0, done: true, mode: 'full', note: 'No confirmed subscribers.' })

    // Claim the send before any email goes out, using the row's version tag, so two
    // sends at once (two tabs, a retry) cannot both pass, and a request cut off by
    // the 45 second limit still leaves the article marked as emailed.
    try { await A.claimEmailing(ent.rowKey, ent.etag) } catch (e) {
      if (e && e.statusCode === 412) return respond(context, 409, { error: 'Another send of this article is already under way or just finished.' })
      throw e
    }
    issueId = await subsLib.beginIssue({ subject, html, confirmedAtStart: confirmed.length, kind: 'article' })
    try { await A.patchArticle(ent.rowKey, { emailingIssueId: issueId, emailRemaining: confirmed.length }) } catch (e) { context.log.error('issue id not saved:', e.message) }
    return await finish(context, ent, issueId, confirmed, subject, html, label, started)
  } catch (err) {
    context.log.error('articles-send error:', err.message)
    return respond(context, 500, { error: 'Send failed' })
  }
}

async function finish(context, ent, issueId, confirmed, subject, html, label, started) {
  const { sent, remaining, done, failures } = await runRound({ issueId, confirmed, subject, html, label, started })
  // Only the counts are kept, never who failed.
  try { await subsLib.updateIssue(issueId, { sent, remaining, failed: failures.length, status: done ? 'complete' : 'incomplete', updatedAt: new Date().toISOString() }) } catch (e) { context.log.error('issue totals not saved:', e.message) }
  try { await A.patchArticle(ent.rowKey, { emailedCount: sent, emailRemaining: remaining }) } catch (e) { context.log.error('emailed count not saved:', e.message) }
  return respond(context, 200, { issueId, sent, failed: failures.length, remaining, done, mode: 'full', total: confirmed.length })
}
