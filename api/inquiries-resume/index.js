/**
 * GET /api/inquiries-resume?id=<inquiry id>, admin download of a volunteer's resume.
 * Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * Returns { name, contentType, data } with the file as base64, so the board can
 * save it from a request that carries the admin key. The file is never public.
 */
const { respond } = require('../_shared/mailer')
const { getInquiry } = require('../_shared/inquiries')
const { readResume, TYPES } = require('../_shared/resumeStore')

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  const key = process.env.NEWSLETTER_ADMIN_KEY
  if (!key || req.headers['x-admin-key'] !== key)
    return respond(context, 401, { error: 'Unauthorized' })

  try {
    const id = String((req.query && req.query.id) || '')
    if (!id) return respond(context, 400, { error: 'id is required' })
    const inq = await getInquiry(id).catch(() => null)
    if (!inq || !inq.resumeBlob) return respond(context, 404, { error: 'No resume file for this inquiry' })

    const buffer = await readResume(inq.resumeBlob)
    if (!buffer) return respond(context, 404, { error: 'The resume file is no longer stored' })

    const ext = String(inq.resumeBlob).split('.').pop()
    respond(context, 200, {
      name: inq.resumeName || `resume.${ext}`,
      contentType: (TYPES[ext] || {}).contentType || 'application/octet-stream',
      data: buffer.toString('base64'),
    })
  } catch (err) {
    context.log.error('Resume download error:', err.message)
    respond(context, 500, { error: 'Could not read the resume file' })
  }
}
