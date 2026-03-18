/**
 * ODIPA Contact Form — Azure Function
 * POST /api/contact
 * Validates, sanitizes, and emails to info@odipa.org (or topic-routed alias).
 * No data is stored anywhere. Reply-to is set to the submitter's address.
 */

const { sendFormEmail, respond, clean } = require('../_shared/mailer')
const { checkRateLimit, getClientIp } = require('../_shared/rateLimiter')

const TOPIC_ROUTING = {
  general:       'info@odipa.org',
  programs:      'education@odipa.org',
  volunteer:     'volunteer@odipa.org',
  partnerships:  'partnerships@odipa.org',
  certification: 'certification@odipa.org',
  press:         'press@odipa.org',
  research:      'research@odipa.org',
  dev:           'dev@odipa.org',
  privacy:       'privacy@odipa.org',
  donate:        'donate@odipa.org',
}

module.exports = async function handler(context, req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') return respond(context, 200, {})

  if (req.method !== 'POST') return respond(context, 405, { error: 'Method not allowed' })

  try {
    
    // Rate limiting
    const ip = getClientIp(req)
    const rl = checkRateLimit(ip, 'contact', { max: 5, windowMs: 60000 })
    if (rl.limited) {
      return respond(context, 429, { error: 'Too many requests. Please wait a moment and try again.' })
    }
    const body = req.body || {}
    // Honeypot check — bots fill in hidden fields, humans don't
    if (body._hp) {
      context.log.warn('Honeypot triggered — discarding bot submission')
      return respond(context, 200, { ok: true })
    }


    // Validate required fields
    const topic   = clean(body.topic, 50)
    const name    = clean(body['Name'] || body.name, 100)
    const email   = clean(body['Email'] || body.email, 200)
    const organization = clean(body['Organization'] || body.organization, 200) || '—'
    const message = clean(body['Message'] || body.message, 2000) || '—'

    if (!name)    return respond(context, 400, { error: 'Name is required' })
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return respond(context, 400, { error: 'Valid email is required' })
    if (!message || message.length < 10)
      return respond(context, 400, { error: 'Message is required' })

    const toAddress = TOPIC_ROUTING[topic] || TOPIC_ROUTING.general
    const topicLabel = clean(body['Topic'] || topic || 'General Inquiry', 100)
    const consent = clean(body['Consented'] || body.consent, 10) || 'No'

    await sendFormEmail({
      to:      toAddress,
      subject: `Contact Form: ${topicLabel} — from ${name}`,
      replyTo: email,
      fields: {
        'Topic':        topicLabel,
        'Name':         name,
        'Email':        email,
        'Organization': organization,
        'Message':      message,
        'Routed to':    toAddress,
        'Consented':    consent,
      },
    })

    respond(context, 200, { ok: true })
  } catch (err) {
    context.log.error('Contact form error:', err.message)
    respond(context, 500, { error: 'Failed to send. Please try again.' })
  }
}
