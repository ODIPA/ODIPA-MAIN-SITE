/**
 * /api/inquiries-prep, volunteer intro-call prep sheets. Admin-only (x-admin-key).
 *
 * POST { id, regenerate? }  Generate a prep sheet for a volunteering inquiry
 *                           and store it on the inquiry entity. Skips the
 *                           model call if a sheet already exists, unless
 *                           regenerate is true.
 * GET  ?id=...              Return the stored sheet as { html } for the
 *                           admin dashboard to open in a print view.
 *
 * On-demand by design: sheets are generated when the founder decides to
 * actually meet an applicant, not in the daily drafting batch. The static
 * policy sections (scale honesty, work-authorization gate, do/don'ts) live
 * verbatim in _shared/prepSheet.js and are never model-generated.
 */
const { respond } = require('../_shared/mailer')
const { getInquiry, updateInquiry } = require('../_shared/inquiries')
const { ORG_CONTEXT, PROMPT_SYSTEM, normalizeGenerated, renderPrepSheet } = require('../_shared/prepSheet')

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  const key = process.env.NEWSLETTER_ADMIN_KEY
  if (!key || req.headers['x-admin-key'] !== key)
    return respond(context, 401, { error: 'Unauthorized' })

  try {
    if (req.method === 'GET') {
      const id = (req.query.id || '').trim()
      if (!id) return respond(context, 400, { error: 'id is required' })
      const inq = await getInquiry(id).catch(() => null)
      if (!inq) return respond(context, 404, { error: 'Inquiry not found' })
      if (!inq.prepSheetHtml) return respond(context, 404, { error: 'No prep sheet generated yet' })
      return respond(context, 200, { html: inq.prepSheetHtml, generatedAt: Number(inq.prepSheetAt) || 0 })
    }

    // POST: generate
    const { id, regenerate } = req.body || {}
    if (!id) return respond(context, 400, { error: 'id is required' })

    const inq = await getInquiry(id).catch(() => null)
    if (!inq) return respond(context, 404, { error: 'Inquiry not found' })
    if (inq.topic !== 'volunteer')
      return respond(context, 400, { error: 'Prep sheets are for volunteering inquiries' })
    if (inq.prepSheetHtml && !regenerate)
      return respond(context, 200, { ok: true, existing: true, generatedAt: Number(inq.prepSheetAt) || 0 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return respond(context, 400, { error: 'ANTHROPIC_API_KEY is not configured.' })

    const user = `Org context:\n${ORG_CONTEXT}\n\nApplicant:\nName: ${inq.name}\nEmail: ${inq.email}${inq.organization ? `\nOrganization: ${inq.organization}` : ''}\nReceived: ${new Date(Number(inq.receivedAt)).toUTCString()}\n\nTheir message:\n${inq.message}`

    let gen
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
          max_tokens: 1500,
          system: PROMPT_SYSTEM,
          messages: [{ role: 'user', content: user }],
        }),
      })
      const data = await res.json()
      const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('')
      const cleaned = text.replace(/```json|```/g, '').trim()
      gen = normalizeGenerated(JSON.parse(cleaned))
    } catch (modelErr) {
      context.log.warn(`Prep generation failed for ${id}: ${modelErr.message}`)
      return respond(context, 502, { error: 'Prep sheet generation failed, try again' })
    }

    const html = renderPrepSheet(inq, gen)
    await updateInquiry(id, { prepSheetHtml: html, prepSheetAt: Date.now() })
    respond(context, 200, { ok: true, generatedAt: Date.now() })
  } catch (err) {
    context.log.error('Inquiry prep error:', err.message)
    respond(context, 500, { error: 'Prep sheet request failed' })
  }
}
