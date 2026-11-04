/**
 * ODIPA Articles, /api/articles
 *
 * Public GET:
 *   /api/articles               published articles, newest first (no body)
 *   /api/articles?slug=x        one published article with its parsed body
 * Admin (header x-admin-key, same check as every admin endpoint):
 *   GET  /api/articles?all=1            every article including drafts
 *   GET  /api/articles?slug=x           the draft or published article for editing
 *   POST { action: 'save', slug?, title, summary, author, body, sources }
 *   POST { action: 'preview', title, summary, author, body, sources }
 *   POST { action: 'publish' | 'unpublish' | 'delete', slug }
 * Nothing here emails anyone. Sending is /api/articles-send.
 */
const { isAdminRequest } = require('../_shared/adminAuth')
const { respond } = require('../_shared/mailer')
const A = require('../_shared/articles')

function reply(context, status, body, cache) {
  context.res = {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache || 'no-store' },
    body: JSON.stringify(body),
  }
}

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  try {
    const admin = isAdminRequest(req)

    if (req.method === 'GET') {
      const q = req.query || {}
      if (q.slug) {
        const ent = await A.getArticle(String(q.slug))
        if (!ent) return reply(context, 404, { error: 'Not found' })
        if (admin) return reply(context, 200, { article: A.toAdmin(ent) })
        if (ent.status !== 'published') return reply(context, 404, { error: 'Not found' })
        return reply(context, 200, { article: A.toFull(ent) }, 'public, max-age=60')
      }
      const all = await A.listArticles()
      if (admin && q.all) return reply(context, 200, { articles: all.map(A.toAdmin) })
      const published = all.filter(e => e.status === 'published').sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
      return reply(context, 200, { articles: published.map(A.toPublic) }, 'public, max-age=60')
    }

    if (req.method !== 'POST') return reply(context, 405, { error: 'Method not allowed' })
    if (!admin) return reply(context, 401, { error: 'Unauthorized' })

    const b = req.body || {}
    const action = String(b.action || '')

    if (action === 'save' || action === 'preview') {
      const v = A.validateFields(b)
      if (v.error) return reply(context, 400, { error: v.error })
      const blocks = A.parseBody(v.value.body)
      if (action === 'preview') {
        return reply(context, 200, { blocks, sources: A.parseSources(v.value.sources), emailHtml: A.blocksToHtml(blocks), problems: A.publishProblems(v.value) })
      }
      let slug = String(b.slug || '')
      if (slug) {
        if (!A.validSlug(slug)) return reply(context, 400, { error: 'That web address is not valid.' })
      } else {
        const base = A.slugify(v.value.title) || 'article'
        slug = base
        // Trim a trailing hyphen so the suffixed slug stays valid (no "--").
        const stem = base.slice(0, 55).replace(/-+$/, '') || 'article'
        for (let n = 2; await A.getArticle(slug); n++) slug = `${stem}-${n}`
      }
      // A published article stays live after a save, so it must still meet the publishing rules.
      const existing = b.slug ? await A.getArticle(slug) : null
      if (existing && existing.status === 'published') {
        const problems = A.publishProblems(v.value)
        if (problems.length) return reply(context, 400, { error: 'This article is live, so the edit must still meet the publishing rules.', problems })
      }
      await A.saveArticle(slug, v.value)
      return reply(context, 200, { ok: true, slug })
    }

    const slug = String(b.slug || '')
    const ent = await A.getArticle(slug)
    if (!ent) return reply(context, 404, { error: 'Article not found' })

    if (action === 'publish') {
      const problems = A.publishProblems(ent)
      if (problems.length) return reply(context, 400, { error: 'Not ready to publish.', problems })
      await A.patchArticle(slug, { status: 'published', publishedAt: ent.publishedAt || new Date().toISOString() })
      return reply(context, 200, { ok: true })
    }
    if (action === 'unpublish') {
      await A.patchArticle(slug, { status: 'draft' })
      return reply(context, 200, { ok: true })
    }
    if (action === 'delete') {
      await A.deleteArticle(slug)
      return reply(context, 200, { ok: true })
    }
    return reply(context, 400, { error: 'Unknown action' })
  } catch (err) {
    context.log.error('articles error:', err.message)
    return reply(context, 500, { error: 'Articles unavailable' })
  }
}
