/**
 * ODIPA Board Application — Azure Function
 * POST /api/board-apply
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
    const rl = checkRateLimit(ip, 'board-apply', { max: 3, windowMs: 300000 })
    if (rl.limited) {
      return respond(context, 429, { error: 'Too many requests. Please wait a moment and try again.' })
    }
    const body = req.body || {}
    // Honeypot check — bots fill in hidden fields, humans don't
    if (body._hp) {
      context.log.warn('Honeypot triggered — discarding bot submission')
      return respond(context, 200, { ok: true })
    }


    const firstName = clean(body['First Name'] || body.firstName, 100)
    const lastName  = clean(body['Last Name']  || body.lastName,  100)
    const email     = clean(body['Email']       || body.email,     200)
    const position  = clean(body['Position Applied'] || body.seat, 100)
    const name      = clean(body['Name'] || `${firstName} ${lastName}`, 200)

    if (!firstName) return respond(context, 400, { error: 'First name is required' })
    if (!lastName)  return respond(context, 400, { error: 'Last name is required' })
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return respond(context, 400, { error: 'Valid email is required' })
    if (!position) return respond(context, 400, { error: 'Position is required' })

    await sendFormEmail({
      to:      'board@odipa.org',
      subject: `Board Application: ${position} — ${firstName} ${lastName}`,
      replyTo: email,
      fields: {
        'Position':            position,
        'Name':                name,
        'Email':               email,
        'Phone':               clean(body['Phone'] || body.phone, 50) || '—',
        'LinkedIn':            clean(body['LinkedIn'] || body.linkedin, 300) || '—',
        'Current Role':        clean(body['Current Role'] || body.currentRole, 200) || '—',
        'Organization':        clean(body['Organization'] || body.currentOrg, 200) || '—',
        'City':                clean(body['City'] || body.city, 100) || '—',
        'Expertise':           clean(body['Areas of Expertise'] || (body.expertise||[]).join(', '), 500) || '—',
        'Why Interested':      clean(body['Why Interested'] || body.whyInterested, 2000) || '—',
        'Relevant Experience': clean(body['Relevant Experience'] || body.relevantExperience, 2000) || '—',
        'Privacy Vision':      clean(body['Privacy Vision'] || body.privacyVision, 2000) || '—',
        'Time Commitment':     clean(body['Time Commitment'] || body.commitment, 1000) || '—',
        'Conflicts':           clean(body['Conflicts'] || body.conflict, 1000) || '—',
        'References':          clean(body['References'] || body.references, 1000) || '—',
        'Consented':           clean(body['Consented'] || body.consent, 10) || 'No',
      },
    })

    // Receipt to the applicant, then into the admin pipeline. Neither can fail the submission.
    await sendAck(context, {
      to: email, name: firstName, teamAddress: 'board@odipa.org',
      subject: 'We received your ODIPA board application',
      paragraphs: [
        `Thank you for applying to serve on ODIPA's Board of Directors${position ? ` for the ${position} seat` : ''}. This note confirms we received your application.`,
        'Board applications are reviewed by the current board and considered as seats open, so this is not a fast process. We will confirm within 2 business days that your application is complete, and we will tell you the expected timeline for a decision at that point. If a seat is not open, we keep applications on file and reach out when one is.',
        'Board service at ODIPA is unpaid. Directors govern the organization under its bylaws and serve without compensation.',
        'If you have a question before you hear from us, reply to this email.',
      ],
    })
    await saveToPipeline(context, {
      topic: 'board', name, email, organization: clean(body['Organization'] || body.currentOrg, 200), routedTo: 'board@odipa.org',
      fields: {
        'Position': position, 'Phone': clean(body['Phone'] || body.phone, 50), 'LinkedIn': clean(body['LinkedIn'] || body.linkedin, 300),
        'Current role': clean(body['Current Role'] || body.currentRole, 200), 'City': clean(body['City'] || body.city, 100),
        'Expertise': clean(body['Areas of Expertise'] || (body.expertise || []).join(', '), 500),
        'Why interested': clean(body['Why Interested'] || body.whyInterested, 2000),
        'Relevant experience': clean(body['Relevant Experience'] || body.relevantExperience, 2000),
        'Privacy vision': clean(body['Privacy Vision'] || body.privacyVision, 2000),
        'Time commitment': clean(body['Time Commitment'] || body.commitment, 1000),
        'Conflicts': clean(body['Conflicts'] || body.conflict, 1000), 'References': clean(body['References'] || body.references, 1000),
      },
    })

    respond(context, 200, { ok: true })
  } catch (err) {
    context.log.error('Board application error:', err.message)
    respond(context, 500, { error: 'Failed to send. Please try again.' })
  }
}
