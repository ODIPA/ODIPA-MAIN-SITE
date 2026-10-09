/**
 * Shared acknowledgment and inquiry-store helpers for the sponsor, research
 * sponsor, and board application forms. Each form emails its team address and
 * previously stopped there. Now each one also sends the sender a receipt and
 * saves to the inquiry store so it shows on the admin pipeline with the same
 * age tracking as contact inquiries.
 *
 * Neither step may fail the submission. The team email already went out.
 */

const { sendHtmlEmail } = require('./mailer')
const { saveInquiry } = require('./inquiries')

const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function ackHtml(name, paragraphs, teamAddress) {
  const body = paragraphs.map(p => `<p style="font-size:14px;line-height:1.7;color:#1C2536;margin:0 0 14px">${esc(p)}</p>`).join('')
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1C2536">
      <div style="background:#0B1F3A;padding:16px 20px;margin-bottom:22px;border-radius:8px">
        <img src="https://www.odipa.org/logo-dark-sm.png" alt="ODIPA" height="36" style="display:block;height:36px" />
      </div>
      <p style="font-size:15px;margin:0 0 14px">Hi ${esc(name)},</p>
      ${body}
      <p style="font-size:12px;color:#667;margin:20px 0 0">This confirmation was sent automatically. Replies go to our team at ${esc(teamAddress)}.</p>
    </div>`
}

/** Sends the receipt. Logs and swallows failure. */
async function sendAck(context, { to, name, subject, paragraphs, teamAddress }) {
  try {
    await sendHtmlEmail({
      to,
      replyTo: teamAddress,
      subject,
      html: ackHtml(name, paragraphs, teamAddress),
      plainText: `Hi ${name},\n\n${paragraphs.join('\n\n')}\n\nThis confirmation was sent automatically. Replies go to our team at ${teamAddress}.`,
    })
  } catch (err) {
    context.log.error('Acknowledgment failed:', err.message)
  }
}

/**
 * Folds a form's answers into one readable message for the inquiry store, so the
 * admin pipeline and the drafting run see the whole submission. Empty answers and
 * placeholder dashes are left out.
 */
function foldFields(fields) {
  return Object.entries(fields)
    .filter(([, v]) => v != null && String(v).trim() && String(v).trim() !== '—')
    .map(([k, v]) => `${k}: ${String(v).trim()}`)
    .join('\n')
}

/** Saves to the inquiry store. Logs and swallows failure. */
async function saveToPipeline(context, { topic, name, email, organization, fields, routedTo }) {
  try {
    await saveInquiry({ topic, name, email, organization, message: foldFields(fields), routedTo })
  } catch (err) {
    context.log.error('Inquiry store failed:', err.message)
  }
}

module.exports = { sendAck, saveToPipeline, foldFields }
