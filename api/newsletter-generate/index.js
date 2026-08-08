/**
 * ODIPA Newsletter Generate, POST /api/newsletter-generate
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * Body: { topics, notes? }
 * Calls the Anthropic API server side (key stays in app settings, never in
 * the browser) and returns { subject, html } for review in the composer.
 * Generated drafts are never sent automatically. A human reviews and sends.
 */
const { respond, clean } = require('../_shared/mailer')

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST') return respond(context, 405, { error: 'Method not allowed' })
  try {
    const key = process.env.NEWSLETTER_ADMIN_KEY
    if (!key || req.headers['x-admin-key'] !== key) {
      return respond(context, 401, { error: 'Unauthorized' })
    }
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return respond(context, 400, { error: 'ANTHROPIC_API_KEY is not configured in app settings.' })

    const body = req.body || {}
    const topics = clean(body.topics, 2000)
    const notes = clean(body.notes, 2000)
    if (!topics) return respond(context, 400, { error: 'topics is required.' })

    const system = [
      'You write the email newsletter for ODIPA, a California 501(c)(3) nonprofit for digital privacy education.',
      'Voice: plain, direct, warm, practical. Written by a founder, not a marketing team.',
      'Hard rules: never use em dashes anywhere. Do not use colons inside sentences. Short paragraphs.',
      'Audience: consumers and small organizations who care about privacy but are not experts.',
      'Never invent statistics, studies, laws, or news. Only use facts provided in the topics or notes. If a claim is not provided, do not make one.',
      'Output strictly valid JSON with exactly two keys, "subject" (under 60 characters) and "html" (an email safe HTML fragment using only p, h2, h3, a, ul, li, strong tags with inline styles, no images, no scripts).',
      'Do not include a header, unsubscribe footer, or postal address. Those are added by the sending system.',
    ].join(' ')

    const userMsg = `Write this issue of the ODIPA newsletter.\nTopics to cover:\n${topics}${notes ? `\nAdditional notes and facts to use:\n${notes}` : ''}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        max_tokens: 2500,
        system,
        messages: [{ role: 'user', content: userMsg }],
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      context.log.error('Anthropic API error:', res.status, errText.slice(0, 300))
      return respond(context, 502, { error: `Generation failed (${res.status}).` })
    }
    const data = await res.json()
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n')
    const cleaned = text.replace(/```json|```/g, '').trim()

    let draft
    try {
      draft = JSON.parse(cleaned)
    } catch (e) {
      // Fall back to returning raw text as the body if JSON parsing fails
      draft = { subject: 'ODIPA Privacy Newsletter', html: `<p>${cleaned}</p>` }
    }
    if (!draft.subject || !draft.html) return respond(context, 502, { error: 'Generation returned an unexpected format.' })

    return respond(context, 200, { subject: String(draft.subject).slice(0, 200), html: String(draft.html) })
  } catch (err) {
    context.log.error('newsletter-generate error:', err.message)
    return respond(context, 500, { error: 'Generation failed' })
  }
}
