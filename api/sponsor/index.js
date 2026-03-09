/**
 * ODIPA Sponsor Application — Azure Function
 * POST /api/sponsor
 */

const { sendFormEmail, respond, clean } = require('../_shared/mailer')

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST')   return respond(context, 405, { error: 'Method not allowed' })

  try {
    const body = req.body || {}

    const orgName     = clean(body['Organization Name'] || body.orgName, 200) || '—'
    const contactName = clean(body['Contact Name'] || body.contactName, 100) || '—'
    const email       = clean(body['Email'] || body.email, 254).toLowerCase() || '—'
    const tier        = clean(body['Sponsorship Tier'] || body.tier, 100) || '—'
    const title      = clean(body['Job Title'] || body.title, 100) || '—' 
    const phone      = clean(body['Phone'] || body.phone, 50) || '—'
    const website    = clean(body['Website'] || body.website, 300) || '—'
    const hearAbout  = clean(body['How They Heard'] || body.hearAbout, 200) || '—'
    const message    = clean(body['Message'] || body.message, 2000) || '—'

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
        'Consented':      clean(body.Consented, 10),
      },
    })

    respond(context, 200, { ok: true })
  } catch (err) {
    context.log.error('Sponsor form error:', err.message)
    respond(context, 500, { error: 'Failed to send. Please try again.' })
  }
}
