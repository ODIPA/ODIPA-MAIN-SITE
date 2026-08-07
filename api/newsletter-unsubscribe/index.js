/**
 * ODIPA Newsletter Unsubscribe, GET /api/newsletter-unsubscribe?e=<b64url>&t=<token>
 */
const { setStatus, verifyToken } = require('../_shared/subscribers')

function page(title, message) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} | ODIPA</title></head>
  <body style="font-family:Arial,Helvetica,sans-serif;background:#FBFAF7;color:#1C2536;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
    <div style="max-width:440px;text-align:center;padding:32px">
      <h1 style="color:#0B1F3A;font-size:24px">${title}</h1>
      <p style="line-height:1.6">${message}</p>
      <p><a href="https://www.odipa.org" style="color:#B98A2E">Back to odipa.org</a></p>
    </div>
  </body></html>`
}

module.exports = async function handler(context, req) {
  const res = (status, html) => { context.res = { status, headers: { 'Content-Type': 'text/html' }, body: html } }
  try {
    const email = Buffer.from(String(req.query.e || ''), 'base64url').toString('utf8')
    const token = String(req.query.t || '')
    if (!email || !verifyToken(email, 'unsubscribe', token)) {
      return res(400, page('Link not valid', 'This unsubscribe link is not valid. If you keep receiving emails, contact us through odipa.org/contact and we will remove you manually.'))
    }
    await setStatus(email, 'unsubscribed')
    return res(200, page('Unsubscribed', 'You will not receive further newsletters from ODIPA. Your address is retained only to honor this opt-out.'))
  } catch (err) {
    context.log.error('newsletter-unsubscribe error:', err.message)
    return res(500, page('Something went wrong', 'Please try the link again in a moment.'))
  }
}
