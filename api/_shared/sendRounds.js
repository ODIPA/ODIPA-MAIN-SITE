/**
 * One time-boxed round of a newsletter style send, shared by newsletter-send and
 * articles-send. Azure Static Web Apps cuts API requests off at 45 seconds, so a
 * round stops starting new batches after a budget of about 25 seconds and reports
 * what is left. The caller repeats with the same issue id until done is true.
 * Each delivery is written to the ledger straight after it succeeds, so a cut off
 * round loses nothing and nobody receives the same issue twice.
 */
const { sendHtmlEmail } = require('../_shared/mailer')
const subs = require('../_shared/subscribers')
const { wrapEmail, toPlainText } = require('../_shared/newsletterEmail')

const CHUNK = 5
const budgetMs = () => Number(process.env.NEWSLETTER_SEND_BUDGET_MS) || 25000

async function runRound({ issueId, confirmed, subject, html, label, started }) {
  const already = await subs.sentKeys(issueId)
  const todo = confirmed.filter(s => !already.has(subs.emailKey(s.email)))
  const failures = []
  let sentNow = 0
  for (let i = 0; i < todo.length; i += CHUNK) {
    if (Date.now() - started > budgetMs()) break
    const batch = todo.slice(i, i + CHUNK)
    const results = await Promise.allSettled(batch.map(async s => {
      const wrapped = wrapEmail(html, subs.unsubscribeLink(s.email), label)
      await sendHtmlEmail({ to: s.email, subject, html: wrapped, plainText: toPlainText(wrapped) })
      // The email has gone out, so try the ledger write twice. If it is not recorded this
      // person would be sent the issue again on resume.
      try { await subs.markSent(issueId, s.email) } catch (e) { await subs.markSent(issueId, s.email) }
    }))
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') sentNow++
      else failures.push({ email: batch[idx].email, error: String(r.reason && r.reason.message || r.reason) })
    })
  }
  // Count from the ledger so the totals are true even after a cut off round.
  const after = await subs.sentKeys(issueId)
  const sent = confirmed.filter(s => after.has(subs.emailKey(s.email))).length
  const remaining = confirmed.length - sent
  return { sent, sentNow, remaining, done: remaining === 0, failures }
}

module.exports = { runRound }
