/**
 * ODIPA Newsletter Signup — Azure Function
 * POST /api/newsletter
 *
 */

const { sendFormEmail, sendHtmlEmail, respond, clean } = require('../_shared/mailer')
const { upsertPending, getSubscriber, confirmLink, unsubscribeLink } = require('../_shared/subscribers')
const { checkRateLimit, getClientIp } = require('../_shared/rateLimiter')
const abuse = require('../_shared/abuse')
const { strictEmailCheck } = require('../_shared/emailChecks')

// ─── Optional ESP helpers ─────────────────────────────────────────────────────

async function addToBrevo(email, firstName) {
  const listId = parseInt(process.env.BREVO_LIST_ID || '0', 10)
  const body = {
    email,
    listIds: listId ? [listId] : [],
    updateEnabled: true,
    attributes: firstName ? { FIRSTNAME: firstName } : {},
  }
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok && res.status !== 204) {
    const err = await res.text()
    throw new Error(`Brevo error ${res.status}: ${err}`)
  }
}

async function addToMailchimp(email, firstName) {
  const dc = process.env.MAILCHIMP_DC || 'us1'
  const listId = process.env.MAILCHIMP_LIST_ID
  const apiKey = process.env.MAILCHIMP_API_KEY
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`
  const body = {
    email_address: email,
    status: 'subscribed',
    merge_fields: firstName ? { FNAME: firstName } : {},
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    // 400 with title 'Member Exists' is fine — already subscribed
    if (!(res.status === 400 && data.title === 'Member Exists')) {
      throw new Error(`Mailchimp error ${res.status}: ${data.detail || res.statusText}`)
    }
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST')   return respond(context, 405, { error: 'Method not allowed' })

  try {
    
    // Rate limiting
    const ip = getClientIp(req)
    const rl = checkRateLimit(ip, 'newsletter', { max: 3, windowMs: 60000 })
    if (rl.limited) {
      return respond(context, 429, { error: 'Too many requests. Please wait a moment and try again.' })
    }
    const body  = req.body || {}
    const typedEmail = clean(body.email, 254).toLowerCase()
    // The newsletter collects an email address and nothing else.

    // Hidden trap field. Bots fill it in, people do not. A real person whose browser or
    // password manager filled it anyway gets a clear message and a way in, not a fake success.
    if (body._hp) {
      context.log.warn('Newsletter trap field filled, rejecting submission')
      return respond(context, 400, {
        code: 'trap',
        error: `We could not complete your sign up from this browser. Please email ${abuse.HELP_EMAIL} and we will add you.`,
      })
    }

    if (!typedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typedEmail)) {
      return respond(context, 400, { error: 'A valid email address is required.' })
    }

    // Bot checks run before anything is stored and before any email is sent.
    const blocked = abuse.enforceChallenge(body, context, 'Newsletter')
    if (blocked) return respond(context, blocked.status, blocked.body)

    if (abuse.looksGenerated(typedEmail)) {
      context.log.warn('Newsletter signup held for review, generated looking Gmail pattern')
      const r = abuse.reviewResponse()
      return respond(context, r.status, r.body)
    }

    // Strict email checks: format, throwaway domains, then a mail server lookup.
    const emailCheck = await strictEmailCheck(typedEmail)
    if (!emailCheck.ok) {
      context.log.warn('Newsletter signup refused, email ' + emailCheck.reason)
      return respond(context, emailCheck.status, emailCheck.body)
    }
    if (emailCheck.skipped) context.log.warn('Newsletter signup mail server check skipped, ' + emailCheck.skipped)

    // One inbox, one record. Gmail dot and plus variants collapse to a single address.
    const canon = abuse.canonicalEmail(typedEmail)
    const addrLimit = checkRateLimit(canon, 'newsletter-address', { max: 3, windowMs: 10 * 60000 })
    if (addrLimit.limited) {
      return respond(context, 429, { error: 'There have been several sign up attempts for this address. Please check your inbox and spam folder, or try again in a few minutes.' })
    }
    const email = await abuse.resolveIdentity(typedEmail, getSubscriber)
    // First-party persistence + double opt-in.
    // The subscriber is stored as pending and receives a confirmation email.
    // Only confirmed subscribers ever receive the newsletter.
    const record = await upsertPending({ email, name: '', source: clean(body.source, 100) || 'Website' })
    if (record.status !== 'confirmed') {
      const cLink = confirmLink(email)
      const uLink = unsubscribeLink(email)
      await sendHtmlEmail({
        to: email,
        subject: 'Confirm your ODIPA newsletter subscription',
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1C2536">
            <h2 style="color:#0B1F3A">Confirm your subscription</h2>
            <p>Thanks for signing up for the ODIPA newsletter. One click confirms it was really you.</p>
            <p style="margin:28px 0">
              <a href="${cLink}" style="background:#B98A2E;color:#0B1F3A;font-weight:bold;padding:12px 22px;border-radius:8px;text-decoration:none">Confirm subscription</a>
            </p>
            <p style="font-size:12px;color:#667">If you did not sign up, ignore this email and nothing further will be sent.
            You can unsubscribe at any time using the link in every newsletter, or <a href="${uLink}">right now</a>.</p>
            <p style="font-size:12px;color:#667">ODIPA is a 501(c)(3) nonprofit. Your address is stored by ODIPA only and is never shared or sold.</p>
          </div>`,
      })
    }


    // Always send internal notification
    await sendFormEmail({
      to:      'info@odipa.org',
      subject: `Newsletter Signup: ${email}`,
      replyTo: email,
      fields: {
        'Email':      email,
        'Source':     clean(body.source, 100) || 'Website',
        'Signed Up':  new Date().toUTCString(),
      },
    })

    // Forward to ESP if configured
    const provider = (process.env.NEWSLETTER_PROVIDER || '').toLowerCase()
    if (provider === 'brevo' && process.env.BREVO_API_KEY) {
      await addToBrevo(email, '')
    } else if (provider === 'mailchimp' && process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
      await addToMailchimp(email, '')
    }

    respond(context, 200, { ok: true })
  } catch (err) {
    context.log.error('Newsletter signup error:', err.message)
    respond(context, 500, { error: 'Signup failed. Please try again.' })
  }
}
