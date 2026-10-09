/**
 * ODIPA Sponsor Application — Azure Function
 * POST /api/sponsor
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
    const rl = checkRateLimit(ip, 'sponsor', { max: 3, windowMs: 300000 })
    if (rl.limited) {
      return respond(context, 429, { error: 'Too many requests. Please wait a moment and try again.' })
    }
    const body = req.body || {}
    // Honeypot check — bots fill in hidden fields, humans don't
    if (body._hp) {
      context.log.warn('Honeypot triggered — discarding bot submission')
      return respond(context, 200, { ok: true })
    }


    const orgName     = clean(body['Organization Name'] || body.orgName, 200) || '—'
    const contactName = clean(body['Contact Name'] || body.contactName, 100) || '—'
    const email       = clean(body['Email'] || body.email, 254).toLowerCase() || '—'
    const tier        = clean(body['Sponsorship Tier'] || body.tier, 100) || '—'
    const title      = clean(body['Job Title'] || body.title, 100) || '—' 
    const phone      = clean(body['Phone'] || body.phone, 50) || '—'
    const website    = clean(body['Website'] || body.website, 300) || '—'
    const hearAbout  = clean(body['How They Heard'] || body.hearAbout, 200) || '—'
    const message    = clean(body['Message'] || body.message, 2000) || '—'
    const consent    = clean(body['Consented'] || body.consent, 10) || 'No'

    if (!contactName) return respond(context, 400, { error: 'Contact name is required' })
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return respond(context, 400, { error: 'Valid email is required' })
    if (!orgName) return respond(context, 400, { error: 'Organization name is required' })

    await sendFormEmail({
      to:      'partnerships@odipa.org',
      subject: `Sponsor Application: ${orgName} — ${contactName}`,
      replyTo: email,
      fields: {
        'Contact Name':   contactName,
        'Email':          email,
        'Organization':   orgName,
        'Title':          title,
        'Phone':          phone,
        'Website':        website,
        'Tier Interest':  tier,
        'Hear About':     hearAbout,
        'Message':        message,
        'Consented':      consent,
      },
    })

    // Receipt to the sender, then into the admin pipeline. Neither can fail the submission.
    await sendAck(context, {
      to: email, name: contactName, teamAddress: 'partnerships@odipa.org',
      subject: 'We received your ODIPA sponsorship application',
      paragraphs: [
        `Thank you for applying to sponsor ODIPA on behalf of ${orgName}. This note confirms we received your application.`,
        'Someone from our partnerships team will be in touch within 2 business days to talk through the tier you chose and the next steps. Sponsorship is a public acknowledgment relationship. ODIPA recognizes sponsors by name and logo and does not provide services, endorsements, or influence over our programs or positions in return.',
        'If you have a question before you hear from us, reply to this email.',
      ],
    })
    await saveToPipeline(context, {
      topic: 'sponsor', name: contactName, email, organization: orgName, routedTo: 'partnerships@odipa.org',
      fields: { 'Tier interest': tier, 'Title': title, 'Phone': phone, 'Website': website, 'Heard about ODIPA': hearAbout, 'Message': message },
    })

    respond(context, 200, { ok: true })
  } catch (err) {
    context.log.error('Sponsor form error:', err.message)
    respond(context, 500, { error: 'Failed to send. Please try again.' })
  }
}
