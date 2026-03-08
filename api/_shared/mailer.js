/**
 * ODIPA Shared Mailer
 * All email is sent via your own SMTP — no third party ever stores submissions.
 *
 * Required Azure environment variables:
 *   SMTP_HOST    e.g. smtp.office365.com
 *   SMTP_PORT    587 (STARTTLS recommended) or 465 (SSL)
 *   SMTP_USER    e.g. noreply@odipa.org
 *   SMTP_PASS    App password (NOT your login password)
 *   SMTP_FROM    e.g. ODIPA <noreply@odipa.org>
 *   ALLOWED_ORIGIN  e.g. https://odipa.org
 */

const nodemailer = require('nodemailer')

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP_HOST, SMTP_USER, SMTP_PASS must be set in Azure environment variables.')
  }
  const port = parseInt(SMTP_PORT || '587', 10)
  return nodemailer.createTransport({
    host: SMTP_HOST, port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: true },
  })
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function clean(val, max = 2000) {
  if (val == null) return ''
  return String(val).replace(/<[^>]*>/g, '').trim().slice(0, max)
}

async function sendFormEmail({ to, subject, replyTo, fields }) {
  const transport = getTransport()
  const from = process.env.SMTP_FROM || `ODIPA <${process.env.SMTP_USER}>`

  const text = [subject, '─'.repeat(60),
    ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`)
  ].join('\n')

  const rows = Object.entries(fields).map(([k, v]) => `
    <tr>
      <td style="padding:8px 12px;font-family:monospace;font-size:11px;font-weight:600;
                 text-transform:uppercase;letter-spacing:1px;color:#0B1F3A;width:28%;
                 vertical-align:top;border-bottom:1px solid #f0f0f0;">${esc(k)}</td>
      <td style="padding:8px 12px;font-size:13px;color:#333;vertical-align:top;
                 border-bottom:1px solid #f0f0f0;white-space:pre-wrap;line-height:1.6;">${esc(String(v))}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f4f1;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
<div style="max-width:660px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.08);">
  <div style="background:#0B1F3A;padding:20px 28px;">
    <div style="color:#C8920A;font-family:monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">ODIPA · Self-Hosted Form</div>
    <div style="color:#fff;font-size:18px;font-weight:700;">${esc(subject)}</div>
  </div>
  <div style="padding:20px 28px 4px;">
    <p style="margin:0;font-family:monospace;font-size:11px;color:#999;">
      ${new Date().toUTCString()} &nbsp;·&nbsp; reply-to: ${esc(replyTo || 'not provided')}
    </p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin:12px 0 20px;">${rows}</table>
  <div style="padding:14px 28px;background:#f5f4f1;border-top:1px solid #eee;">
    <p style="margin:0;font-size:11px;color:#aaa;font-family:monospace;">
      Delivered by ODIPA&apos;s self-hosted Azure Function. No third party processed or stored this submission.
    </p>
  </div>
</div></body></html>`

  await transport.sendMail({ from, to, replyTo: replyTo || undefined, subject, text, html })
}

function respond(context, status, body) {
  context.res = {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://odipa.org',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  }
}

module.exports = { sendFormEmail, respond, clean }
