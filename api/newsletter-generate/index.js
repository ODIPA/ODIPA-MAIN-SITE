/**
 * ODIPA Newsletter Generate, POST /api/newsletter-generate
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * Body: { section: 'breaches' | 'laws' | 'tips', month, extraNotes? }
 * Researches ONE digest section per call using the Anthropic API with web
 * search. Single-section calls stay well under the Static Web Apps
 * 45 second limit. The dashboard fires the three sections in parallel.
 * Nothing is ever sent automatically, a human reviews in the composer.
 */
const { respond, clean } = require('../_shared/mailer')

const SECTIONS = {
  breaches: {
    ask: '2 to 3 significant data breaches or exposures from roughly the past month. Each item must include the source URL.',
    label: 'Breach Alerts',
  },
  laws: {
    ask: '2 to 3 new or advancing privacy laws or regulations, state, federal, or international. Each item must include the source URL.',
    label: 'New Privacy Laws',
  },
  tips: {
    ask: '2 to 3 practical data protection tips for consumers or small organizations, tied to current events where natural. Tips may omit the url.',
    label: 'Practical Tips',
  },
}

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
    const section = SECTIONS[String(body.section || '')]
    if (!section) return respond(context, 400, { error: 'section must be breaches, laws, or tips.' })
    const month = clean(body.month, 40) || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const extraNotes = clean(body.extraNotes, 1000)

    const system = [
      `You research one section, ${section.label}, of the ODIPA Privacy Monthly Digest, the email newsletter of a California 501(c)(3) digital privacy education nonprofit.`,
      'Use web search, at most 3 searches, to find real, recent, verifiable items. Every item must come from an actual source found in search. Never invent a breach, law, statistic, or date. If search yields fewer solid items than asked, return fewer.',
      'Voice: plain, direct, practical, for consumers and small organizations who are not experts.',
      'Hard rules: never use em dashes anywhere. Do not use colons inside sentences. Two to three sentences per summary.',
      'End your reply with ONLY a JSON array, no markdown fences, in exactly this shape:',
      '[{"title":"","summary":"","url":""}]',
      `Items wanted: ${section.ask}`,
    ].join(' ')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: `Research the ${section.label} section for the ${month} issue.${extraNotes ? ` Editor notes. ${extraNotes}` : ''}` }],
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
    const start = cleaned.indexOf('[')
    const end = cleaned.lastIndexOf(']')
    if (start < 0 || end <= start) return respond(context, 502, { error: 'Generation returned an unexpected format. Try again.' })

    let items
    try { items = JSON.parse(cleaned.slice(start, end + 1)) } catch (e) {
      return respond(context, 502, { error: 'Generated JSON could not be parsed. Try again.' })
    }
    const norm = (Array.isArray(items) ? items : []).map(i => ({
      title: clean(i.title, 200), summary: clean(i.summary, 600), url: clean(i.url, 500),
    })).filter(i => i.title && i.summary)

    return respond(context, 200, { section: String(body.section), month, items: norm })
  } catch (err) {
    context.log.error('newsletter-generate error:', err.message)
    return respond(context, 500, { error: 'Generation failed' })
  }
}
