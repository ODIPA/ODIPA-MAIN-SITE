/**
 * ODIPA Research Sponsorship — Azure Function
 * POST /api/sponsor-research
 */

const { sendFormEmail, respond, clean } = require('../_shared/mailer')
const { checkRateLimit, getClientIp } = require('../_shared/rateLimiter')
const { sendAck, saveToPipeline } = require('../_shared/formAck')

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST')   return respond(context, 405, { error: 'Method not allowed' })

  try {
    
    // Rate limiting
    const ip = getClientIp(req)
    const rl = checkRateLimit(ip, 'sponsor-research', { max: 3, windowMs: 300000 })
    if (rl.limited) {
      return respond(context, 429, { error: 'Too many requests. Please wait a moment and try again.' })
    }
    const body = req.body || {}
    // Honeypot check — bots fill in hidden fields, humans don't
    if (body._hp) {
      context.log.warn('Honeypot triggered — discarding bot submission')
      return respond(context, 200, { ok: true })
    }


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
        'Consented':         clean(body.consent, 10) || 'No',
      },
    })

    // Receipt to the sender, then into the admin pipeline. Neither can fail the submission.
    await sendAck(context, {
      to: email, name: contactName, teamAddress: 'research@odipa.org',
      subject: 'We received your ODIPA research sponsorship inquiry',
      paragraphs: [
        `Thank you for your interest in sponsoring ODIPA research on behalf of ${orgName}. This note confirms we received your inquiry.`,
        'Our research team will be in touch within 2 business days. Sponsored research at ODIPA is published freely to the public, and sponsors do not direct findings or review results before publication. We will be plain about that boundary when we talk, so there are no surprises later.',
        'If you have a question before you hear from us, reply to this email.',
      ],
    })
    await saveToPipeline(context, {
      topic: 'research-sponsor', name: contactName, email, organization: orgName, routedTo: 'research@odipa.org',
      fields: {
        'Research tier': tier, 'Title': clean(body.title, 100), 'Phone': clean(body.phone, 50), 'Website': clean(body.website, 300),
        'Research topic': clean(body.researchTopic, 1000), 'Timeline': clean(body.timeline, 200), 'Audience': clean(body.audience, 500),
        'Heard about ODIPA': clean(body.hearAbout, 200), 'Notes': clean(body.notes, 2000),
      },
    })

    respond(context, 200, { ok: true })
  } catch (err) {
    context.log.error('Research sponsor form error:', err.message)
    respond(context, 500, { error: 'Failed to send. Please try again.' })
  }
}
