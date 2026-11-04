/**
 * ODIPA Articles Social, POST /api/articles-social
 * Admin-only (x-admin-key). Body: { slug }
 * Drafts a LinkedIn post and a short post (X, Bluesky, Mastodon) for one saved
 * article, using only the article's own text. Nothing is posted anywhere, an
 * editor copies the text and posts it by hand. One short model call with no web
 * search, well inside the 45 second limit.
 */
const { isAdminRequest } = require('../_shared/adminAuth')
const { respond } = require('../_shared/mailer')
const A = require('../_shared/articles')

const plain = blocks => blocks.map(b => {
  const parts = p => p.map(x => x.text).join('')
  if (b.t === 'h') return `## ${b.text}`
  if (b.t === 'p') return parts(b.parts)
  return b.items.map((i, n) => `${b.t === 'ol' ? `${n + 1}.` : '-'} ${parts(i)}`).join('\n')
}).join('\n\n')

// No em dashes in anything ODIPA publishes, whatever the model returns.
const noDash = s => String(s || '').replace(/\s*—\s*/g, ', ')

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST') return respond(context, 405, { error: 'Method not allowed' })
  try {
    if (!isAdminRequest(req)) return respond(context, 401, { error: 'Unauthorized' })
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return respond(context, 400, { error: 'ANTHROPIC_API_KEY is not configured in app settings.' })
    const ent = await A.getArticle(String((req.body || {}).slug || ''))
    if (!ent) return respond(context, 404, { error: 'Article not found' })

    const url = `https://www.odipa.org/articles?a=${encodeURIComponent(ent.rowKey)}`
    const system = [
      'You write social media posts announcing one article from ODIPA, a California 501(c)(3) digital privacy education nonprofit.',
      'Base the posts ONLY on the article text provided. Never invent facts, numbers, laws or claims, and never add advice the article does not give.',
      'Voice: plain, direct, founder written, no marketing hype.',
      'Hard rules: never use em dashes anywhere. Do not use colons inside sentences.',
      `Both posts must include the link ${url}`,
      'End your reply with ONLY a JSON object, no markdown fences: {"linkedin":"","short":""}',
      'linkedin: 120 to 200 words. Open with a hook from the strongest point, give 2 or 3 highlights as short lines, close with an invitation to read the article, then 3 to 5 relevant hashtags.',
      `short: a single post under 240 characters including the link, for X, Bluesky and Mastodon. Open with the single most striking point as a hook, add one line on why it matters to a normal person, then the link ${url}. End with 1 or 2 topical hashtags, still within the character limit.`,
    ].join(' ')
    const text = `Title: ${ent.title}\nBy: ${ent.author || 'ODIPA'}\nSummary: ${ent.summary}\n\n${plain(JSON.parse(ent.blocks || '[]'))}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        max_tokens: 800,
        system,
        messages: [{ role: 'user', content: text.slice(0, 20000) }],
      }),
    })
    if (!res.ok) return respond(context, 502, { error: `Generation failed (${res.status}).` })
    const data = await res.json()
    const out = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').replace(/```json|```/g, '')
    const s = out.indexOf('{'), e = out.lastIndexOf('}')
    if (s < 0 || e <= s) return respond(context, 502, { error: 'Generation returned an unexpected format. Try again.' })
    let posts
    try { posts = JSON.parse(out.slice(s, e + 1)) } catch (err) {
      return respond(context, 502, { error: 'Generated JSON could not be parsed. Try again.' })
    }
    return respond(context, 200, {
      linkedin: noDash(posts.linkedin).slice(0, 3000),
      short: noDash(posts.short).slice(0, 500),
      published: ent.status === 'published',
      url,
    })
  } catch (err) {
    context.log.error('articles-social error:', err.message)
    return respond(context, 500, { error: 'Generation failed' })
  }
}
