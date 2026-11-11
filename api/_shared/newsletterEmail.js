/**
 * Email wrapper shared by the newsletter and article sends: ODIPA header, the
 * donate and volunteer footer, and the per recipient unsubscribe line.
 */
function wrapEmail(bodyHtml, unsubLink, label = 'PRIVACY MONTHLY DIGEST') {
  const postal = process.env.NEWSLETTER_POSTAL || 'ODIPA, a California 501(c)(3) nonprofit'
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1C2536">
    <div style="background:#0B1F3A;padding:18px 20px;margin-bottom:24px;border-radius:8px">
      <img src="https://www.odipa.org/logo-dark-sm.png" alt="ODIPA" height="40" style="display:block;height:40px" />
      <div style="font-family:monospace;font-size:10px;letter-spacing:2px;color:#B98A2E;margin-top:8px">${label}</div>
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

/**
 * Drop every <tag ...> by scanning characters, and drop the whole content of
 * <style> and <script> elements. A scanner has no pattern to get around, unlike
 * a regular expression, so odd closing tags such as "</script foo>" are handled.
 * Line breaks are kept for <br> and for the end of paragraphs, headings and list items.
 */
function stripMarkup(input) {
  const text = String(input)
  const lower = text.toLowerCase()
  let out = ''
  let i = 0
  while (i < text.length) {
    if (text[i] !== '<') { out += text[i++]; continue }
    const m = /^<(\/?)([a-z][a-z0-9]*)/.exec(lower.slice(i, i + 20))
    const closing = !!(m && m[1]), tag = m ? m[2] : ''
    const close = text.indexOf('>', i)
    if (close === -1) break // an unfinished tag at the end is dropped
    i = close + 1
    if ((tag === 'style' || tag === 'script') && !closing) {
      const end = lower.indexOf('</' + tag, i)
      if (end === -1) break
      const endClose = text.indexOf('>', end)
      i = endClose === -1 ? text.length : endClose + 1
    }
    if (tag === 'br' || (closing && /^(p|div|h[1-6]|li)$/.test(tag))) out += '\n'
  }
  return out
}

/** The plain text copy of an email. Text only, so nothing here is ever run as HTML. */
function toPlainText(html) {
  return stripMarkup(html)
    // &amp; last, so "&amp;lt;" becomes "&lt;" and not "<".
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

module.exports = { wrapEmail, toPlainText }
