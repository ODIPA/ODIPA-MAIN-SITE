/**
 * ODIPA Newsletter Confirm, GET /api/newsletter-confirm?e=<b64url>&t=<token>
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
    if (!email || !verifyToken(email, 'confirm', token)) {
      return res(400, page('Link not valid', 'This confirmation link is not valid or has already been used. You can sign up again on odipa.org.'))
    }
    const ok = await setStatus(email, 'confirmed')
    if (!ok) return res(404, page('Not found', 'We could not find a pending signup for this address. You can sign up on odipa.org.'))
    return res(200, page('Subscription confirmed', 'You are on the list. We send occasional updates about digital privacy education, tools, and programs, and every email includes a one-click unsubscribe link.'))
  } catch (err) {
    context.log.error('newsletter-confirm error:', err.message)
    return res(500, page('Something went wrong', 'Please try the link again in a moment.'))
  }
}
