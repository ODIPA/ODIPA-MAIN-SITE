/**
 * ODIPA Community Membership Signup, Azure Function
 * POST /api/membership
 *
 * Follows the same flow as /api/newsletter (rate limit, first-party storage,
 * double opt-in by email) and additionally requires the person to
 * accept the Community Member Terms. Members are stored in the same subscriber
 * table, flagged as members, so they receive the Privacy Monthly Digest and
 * can unsubscribe with the same one-click link.
 */

const { sendFormEmail, sendHtmlEmail, respond, clean } = require('../_shared/mailer')
const { upsertPending, recordMembership, confirmLink, unsubscribeLink } = require('../_shared/subscribers')
const { checkRateLimit, getClientIp } = require('../_shared/rateLimiter')

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST')   return respond(context, 405, { error: 'Method not allowed' })

  try {
    // Rate limiting
    const ip = getClientIp(req)
    const rl = checkRateLimit(ip, 'membership', { max: 3, windowMs: 60000 })
    if (rl.limited) {
      return respond(context, 429, { error: 'Too many requests. Please wait a moment and try again.' })
    }

    const body  = req.body || {}
    const email = clean(body.email, 254).toLowerCase()
    const name  = clean(body.name, 100)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return respond(context, 400, { error: 'A valid email address is required.' })
    }

    // Terms acceptance must be an explicit true, and we record which version.
    const termsVersion = clean(body.termsVersion, 40)
    if (body.acceptedTerms !== true || !termsVersion) {
      return respond(context, 400, { error: 'Please accept the Community Member Terms to join.' })
    }

    const source = clean(body.source, 100) || 'Join page'

    // First-party persistence + double opt-in, same as the newsletter.
    const record = await upsertPending({ email, name, source })
    await recordMembership(email, { termsVersion })

    const uLink = unsubscribeLink(email)
    let welcomeSent = false

    if (record.status !== 'confirmed') {
      const cLink = confirmLink(email)
      try {
        const id = await sendHtmlEmail({
          to: email,
          subject: 'Confirm your ODIPA community membership',
          plainText: [
            'Confirm your ODIPA community membership',
            '',
            'Thanks for joining the ODIPA community. Open this link to confirm it was really you.',
            cLink,
            '',
            'Community membership is free. Community members are supporters of ODIPA\'s mission and do not have voting or governance rights.',
            'If you did not sign up, ignore this email and nothing further will be sent.',
            `You can leave at any time using the link in every email, or right now at ${uLink}`,
            '',
            'ODIPA is a 501(c)(3) nonprofit. Your address is stored by ODIPA and is never sold or shared for anyone else\'s use.',
          ].join('\n'),
          html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1C2536">
            <h2 style="color:#0B1F3A">Confirm your membership</h2>
            <p>Thanks for joining the ODIPA community. One click confirms it was really you.</p>
            <p style="margin:28px 0">
              <a href="${cLink}" style="background:#B98A2E;color:#0B1F3A;font-weight:bold;padding:12px 22px;border-radius:8px;text-decoration:none">Confirm membership</a>
            </p>
            <p style="font-size:12px;color:#667">Community membership is free. Community members are supporters of ODIPA's mission and do not have voting or governance rights.
            If you did not sign up, ignore this email and nothing further will be sent.
            You can leave at any time using the link in every email, or <a href="${uLink}">right now</a>.</p>
            <p style="font-size:12px;color:#667">ODIPA is a 501(c)(3) nonprofit. Your address is stored by ODIPA and is never sold or shared for anyone else's use.</p>
          </div>`,
        })
        context.log(`Membership confirmation email accepted by Azure, message id ${id}`)
      } catch (mailErr) {
        // The sign up is saved, but the person must not be told to check an inbox that will stay empty.
        context.log.error(`Membership confirmation email failed. code=${mailErr.acsCode || mailErr.code || 'n/a'} message=${mailErr.message}`)
        return respond(context, 502, {
          error: 'Your sign up was saved, but we could not send the confirmation email. Please try again in a few minutes, or email info@odipa.org.',
          code: 'email-not-sent',
        })
      }
    } else {
      // Already a confirmed subscriber, so there is nothing to confirm. Send a short welcome so the
      // person still gets an email. A failure here never fails the sign up.
      try {
        const id = await sendHtmlEmail({
          to: email,
          subject: 'Welcome to the ODIPA community',
          plainText: [
            'Welcome to the ODIPA community',
            '',
            'Your free community membership is active. You will receive the Privacy Monthly Digest, invitations to free sessions and events, and research and program updates.',
            'Community members are supporters of ODIPA\'s mission and do not have voting or governance rights.',
            `You can leave at any time at ${uLink}`,
          ].join('\n'),
          html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1C2536">
            <h2 style="color:#0B1F3A">Welcome to the ODIPA community</h2>
            <p>Your free community membership is active. You will receive the Privacy Monthly Digest, invitations to free sessions and events, and research and program updates.</p>
            <p style="font-size:12px;color:#667">Community members are supporters of ODIPA's mission and do not have voting or governance rights. You can leave at any time using the link in every email, or <a href="${uLink}">right now</a>.</p>
          </div>`,
        })
        welcomeSent = true
        context.log(`Membership welcome email accepted by Azure, message id ${id}`)
      } catch (mailErr) {
        context.log.error(`Membership welcome email failed. code=${mailErr.acsCode || mailErr.code || 'n/a'} message=${mailErr.message}`)
      }
    }

    // Internal notification. A failure here must not fail the signup.
    try {
      await sendFormEmail({
        to:      'info@odipa.org',
        subject: `Community Member Signup: ${email}`,
        replyTo: email,
        fields: {
          'Email':          email,
          'Name':           name || 'Not provided',
          'Source':         source,
          'Terms version':  termsVersion,
          'Status':         record.status === 'confirmed' ? 'Already confirmed subscriber' : 'Pending confirmation',
          'Signed Up':      new Date().toUTCString(),
        },
      })
    } catch (notifyErr) {
      context.log.warn('Membership notification email failed:', notifyErr.message)
    }

    respond(context, 200, { ok: true, alreadyConfirmed: record.status === 'confirmed', welcomeSent })
  } catch (err) {
    context.log.error('Membership signup error:', err.message)
    respond(context, 500, { error: 'Sign up failed. Please try again.' })
  }
}
