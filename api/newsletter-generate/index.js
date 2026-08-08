/**
 * ODIPA Newsletter Generate, POST /api/newsletter-generate
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * Body: { month, extraNotes? }
 * Uses the Anthropic API with server side web search to research real,
 * current items for the monthly digest. Returns structured sections for
 * human review in the composer. Nothing is ever sent automatically.
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
    const month = clean(body.month, 40) || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const extraNotes = clean(body.extraNotes, 2000)

    const system = [
      'You research and draft sections of the ODIPA Privacy Monthly Digest, the email newsletter of a California 501(c)(3) digital privacy education nonprofit.',
      'Use web search to find real, recent, verifiable items. Every item must come from an actual source found in search, with its URL. Never invent a breach, law, statistic, or date. If search yields fewer solid items than asked, return fewer.',
      'Voice: plain, direct, practical, written for consumers and small organizations who care about privacy but are not experts.',
      'Hard rules: never use em dashes anywhere. Do not use colons inside sentences. Two to three sentences per summary.',
      'After your research, end your reply with ONLY a JSON object, no markdown fences, in exactly this shape:',
      '{"breaches":[{"title":"","summary":"","url":""}],"laws":[{"title":"","summary":"","url":""}],"tips":[{"title":"","summary":"","url":""}]}',
      'breaches: 2 to 4 significant data breaches or exposures from roughly the past month. laws: 2 to 3 new or advancing privacy laws or regulations. tips: 2 to 3 practical data protection tips, tied to the news where natural (tips may omit url).',
    ].join(' ')

    const userMsg = `Research and draft the ${month} issue of the ODIPA Privacy Monthly Digest.${extraNotes ? ` Editor notes to consider, use only if verifiable or clearly editorial guidance. ${extraNotes}` : ''}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        max_tokens: 4000,
        system,
        messages: [{ role: 'user', content: userMsg }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      context.log.error('Anthropic API error:', res.status, errText.slice(0, 300))
      return respond(context, 502, { error: `Generation failed (${res.status}).` })
    }
    const data = await res.json()
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n')
    const cleaned = text.replace(/```json|```/g, '')
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start < 0 || end <= start) return respond(context, 502, { error: 'Generation returned an unexpected format. Try again.' })

    let draft
    try { draft = JSON.parse(cleaned.slice(start, end + 1)) } catch (e) {
      return respond(context, 502, { error: 'Generated JSON could not be parsed. Try again.' })
    }
    const norm = arr => (Array.isArray(arr) ? arr : []).map(i => ({
      title: clean(i.title, 200), summary: clean(i.summary, 600), url: clean(i.url, 500),
    })).filter(i => i.title && i.summary)

    return respond(context, 200, {
      month,
      breaches: norm(draft.breaches),
      laws: norm(draft.laws),
      tips: norm(draft.tips),
    })
  } catch (err) {
    context.log.error('newsletter-generate error:', err.message)
    return respond(context, 500, { error: 'Generation failed' })
  }
}
