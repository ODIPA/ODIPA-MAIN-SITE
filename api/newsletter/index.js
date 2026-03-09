/**
 * ODIPA Newsletter Signup — Azure Function
 * POST /api/newsletter
 *
 */

const { sendFormEmail, respond, clean } = require('../_shared/mailer')

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
    const body  = req.body || {}
    const email = clean(body.email, 254).toLowerCase()
    const name  = clean(body.name, 100)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return respond(context, 400, { error: 'A valid email address is required.' })
    }

    // Always send internal notification
    await sendFormEmail({
      to:      'info@odipa.org',
      subject: `Newsletter Signup: ${email}`,
      replyTo: email,
      fields: {
        'Email':      email,
        'Name':       name || '—',
        'Source':     clean(body.source, 100) || 'Website',
        'Signed Up':  new Date().toUTCString(),
      },
    })

    // Forward to ESP if configured
    const provider = (process.env.NEWSLETTER_PROVIDER || '').toLowerCase()
    if (provider === 'brevo' && process.env.BREVO_API_KEY) {
      await addToBrevo(email, name)
    } else if (provider === 'mailchimp' && process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
      await addToMailchimp(email, name)
    }

    respond(context, 200, { ok: true })
  } catch (err) {
    context.log.error('Newsletter signup error:', err.message)
    respond(context, 500, { error: 'Signup failed. Please try again.' })
  }
}
