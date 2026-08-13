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
  toolpicks: {
    ask: 'Pick the 2 or 3 ODIPA tools most relevant to this issue and write why each helps.',
    label: 'Tools That Help',
  },
}

// ODIPA's real approved open source tool catalog. The model may ONLY pick
// from this list, never invent a tool. Keep in sync with CommunityTools.tsx.
const TOOL_CATALOG = [
  { name: 'Cookie Harvester & Analyzer', tagline: 'Scan, extract, and classify first and third party cookies from any domain.', url: 'https://github.com/odipa/cookie-harvester' },
  { name: 'Tracker Lens', tagline: 'Identify and map all third party trackers on a webpage in seconds.', url: 'https://github.com/odipa/tracker-lens' },
  { name: 'Privacy Policy Scanner', tagline: 'Grade any privacy policy with plain language scoring and red flag detection.', url: 'https://github.com/odipa/policy-scanner' },
  { name: 'Data Broker Opt-Out Bot', tagline: 'Automate opt out and removal requests to major data broker sites.', url: 'https://github.com/odipa/broker-opt-out' },
  { name: 'Browser Fingerprint Inspector', tagline: 'Reveal exactly how uniquely identifiable your browser is.', url: 'https://github.com/odipa/fingerprint-check' },
  { name: 'GDPR / CCPA Request Generator', tagline: 'Generate legally worded data subject requests in one click.', url: 'https://github.com/odipa/gdpr-request-gen' },
]

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
    if (!section && String(body.section) !== 'social') {
      return respond(context, 400, { error: 'section must be breaches, laws, tips, toolpicks, or social.' })
    }
    const month = clean(body.month, 40) || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const extraNotes = clean(body.extraNotes, 1000)
    const isToolPicks = String(body.section) === 'toolpicks'
    const newsContext = clean(body.context, 3000)

    if (String(body.section) === 'social') {
      const system = [
        'You write social media posts announcing an issue of the ODIPA Privacy Monthly Digest, the newsletter of a California 501(c)(3) digital privacy education nonprofit.',
        'Base the posts ONLY on the issue content provided. Never invent items, numbers, or claims.',
        'Voice: plain, direct, founder written, no marketing hype.',
        'Hard rules: never use em dashes anywhere. Do not use colons inside sentences.',
        'Both posts must include the link https://www.odipa.org/newsletter',
        'End your reply with ONLY a JSON object, no markdown fences: {"linkedin":"","short":""}',
        'linkedin: 120 to 200 words. Open with a hook from the strongest item, give 2 or 3 highlights as short lines, close with an invitation to read and subscribe, then 3 to 5 relevant hashtags.',
        'short: a single post under 240 characters including the link, for X, Bluesky, and Mastodon. Structure, pick ONLY the single strongest item, open with it as a hook (a striking number or surprising fact works best), add one line on why it matters to a normal person, then the link written as https://www.odipa.org/newsletter so it works everywhere. Never list multiple items, never write a summary of the whole issue. It should make someone stop scrolling, not inform them of everything.',
      ].join(' ')
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
          max_tokens: 800,
          system,
          messages: [{ role: 'user', content: `Issue content for ${month}.\n${newsContext || 'General privacy digest.'}` }],
        }),
      })
      if (!res.ok) return respond(context, 502, { error: `Generation failed (${res.status}).` })
      const data = await res.json()
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n')
      const cleaned = text.replace(/```json|```/g, '').replace(/<\/?cite[^>]*>/g, '')
      const s = cleaned.indexOf('{'); const e = cleaned.lastIndexOf('}')
      if (s < 0 || e <= s) return respond(context, 502, { error: 'Generation returned an unexpected format. Try again.' })
      let posts
      try { posts = JSON.parse(cleaned.slice(s, e + 1)) } catch (err2) {
        return respond(context, 502, { error: 'Generated JSON could not be parsed. Try again.' })
      }
      return respond(context, 200, {
        section: 'social', month,
        linkedin: String(posts.linkedin || '').slice(0, 3000),
        short: String(posts.short || '').slice(0, 500),
      })
    }

    if (isToolPicks) {
      const catalogText = TOOL_CATALOG.map(t => `${t.name} :: ${t.tagline} :: ${t.url}`).join('\n')
      const system = [
        'You recommend ODIPA open source privacy tools inside the ODIPA Privacy Monthly Digest.',
        'You may ONLY recommend tools from the catalog below, copied exactly, name and url verbatim. Never invent, rename, or modify a tool.',
        'Pick the 2 or 3 tools most relevant to this month\'s news items. For each, write two sentences on why it helps a consumer or small organization given that news.',
        'Hard rules: never use em dashes anywhere. Do not use colons inside sentences.',
        'End your reply with ONLY a JSON array, no markdown fences: [{"title":"tool name from catalog","summary":"","url":"url from catalog"}]',
        'Catalog, one tool per line, name :: tagline :: url',
        catalogText,
      ].join('\n')
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
          max_tokens: 900,
          system,
          messages: [{ role: 'user', content: `This month's news items.\n${newsContext || 'General privacy awareness, no specific items.'}\nPick the most relevant tools.` }],
        }),
      })
      if (!res.ok) return respond(context, 502, { error: `Generation failed (${res.status}).` })
      const data = await res.json()
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n')
      const cleaned = text.replace(/```json|```/g, '').replace(/<\/?cite[^>]*>/g, '')
      const s = cleaned.indexOf('['); const e = cleaned.lastIndexOf(']')
      if (s < 0 || e <= s) return respond(context, 502, { error: 'Generation returned an unexpected format. Try again.' })
      let items
      try { items = JSON.parse(cleaned.slice(s, e + 1)) } catch (err2) {
        return respond(context, 502, { error: 'Generated JSON could not be parsed. Try again.' })
      }
      // Enforce the catalog server side. Anything not matching a real tool is dropped.
      const byName = new Map(TOOL_CATALOG.map(t => [t.name.toLowerCase(), t]))
      const norm = (Array.isArray(items) ? items : []).map(i => {
        const t = byName.get(String(i.title || '').toLowerCase().trim())
        if (!t) return null
        return { title: t.name, summary: clean(i.summary, 600), url: t.url }
      }).filter(i => i && i.summary)
      return respond(context, 200, { section: 'toolpicks', month, items: norm })
    }

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
    const cleaned = text.replace(/```json|```/g, '').replace(/<\/?cite[^>]*>/g, '')
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
