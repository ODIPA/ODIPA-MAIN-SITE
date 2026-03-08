/**
 * ODIPA Research Sponsorship — Azure Function
 * POST /api/sponsor-research
 */

const { sendFormEmail, respond, clean } = require('../_shared/mailer')

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST')   return respond(context, 405, { error: 'Method not allowed' })

  try {
    const body = req.body || {}

    const contactName = clean(body.contactName, 100)
    const email       = clean(body.email, 200)
    const orgName     = clean(body.orgName, 200)
    const tier        = clean(body.tier, 100)

    if (!contactName) return respond(context, 400, { error: 'Contact name is required' })
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return respond(context, 400, { error: 'Valid email is required' })
    if (!orgName) return respond(context, 400, { error: 'Organization name is required' })
    if (!tier)    return respond(context, 400, { error: 'Research tier is required' })

    await sendFormEmail({
      to:      'research@odipa.org',
      subject: `Research Sponsorship Inquiry: ${orgName} — ${tier}`,
      replyTo: email,
      fields: {
        'Contact Name':      contactName,
        'Email':             email,
        'Organization':      orgName,
        'Title':             clean(body.title, 100) || '—',
        'Phone':             clean(body.phone, 50) || '—',
        'Website':           clean(body.website, 300) || '—',
        'Research Tier':     tier,
        'Research Topic':    clean(body.researchTopic, 1000) || '—',
        'Timeline':          clean(body.timeline, 200) || '—',
        'Audience':          clean(body.audience, 500) || '—',
        'Hear About':        clean(body.hearAbout, 200) || '—',
        'Additional Notes':  clean(body.notes, 2000) || '—',
      },
    })

    respond(context, 200, { ok: true })
  } catch (err) {
    context.log.error('Research sponsor form error:', err.message)
    respond(context, 500, { error: 'Failed to send. Please try again.' })
  }
}
