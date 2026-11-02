/**
 * ODIPA Contact Form — Azure Function
 * POST /api/contact
 * Validates, sanitizes, and emails to info@odipa.org (or topic-routed alias).
 * Reply-to is set to the submitter's address. The inquiry is kept in ODIPA's
 * own Azure storage for the admin inbox. A volunteer's resume file, if they
 * attach one, goes to a private container in the same storage.
 */

const { sendFormEmail, sendHtmlEmail, respond, clean } = require('../_shared/mailer')
const { saveInquiry } = require('../_shared/inquiries')
const { checkRateLimit, getClientIp } = require('../_shared/rateLimiter')
const { parseVolunteerApplication } = require('../_shared/volunteerApplication')
const { validateResume, saveResume, deleteResume } = require('../_shared/resumeStore')

// ── Auto-acknowledgment templates per topic ──────────────────────────────────
// Instant canned response to the submitter. Templates only, no AI, every word
// pre-approved. Timelines match what the site publicly promises. No template
// asks the reader to reply. The footer names the team address instead, and a
// reply-to header routes replies there for anyone who replies anyway.
const ACKS = {
  volunteer: {
    subject: 'Your ODIPA volunteer application was received',
    body: `Thank you for offering your time to ODIPA. Your form submission counts as your volunteer application, so that step is complete.
We review applications within 5 business days. The next step after review is an invitation to a short intro call to match you with the right role. In the meantime, you can read about the volunteer roles at https://www.odipa.org/get-involved/volunteer.`,
  },
  certification: {
    subject: 'Your certification inquiry was received, ODIPA',
    body: `Thank you for your interest in ODIPA's certification program. Your inquiry has been received and you can expect a reply within 2 business days.
You can read how the program works at https://www.odipa.org/programs/corporate-certification.`,
  },
  dev: {
    subject: 'Your message to ODIPA open source was received',
    body: `Thanks for reaching out about ODIPA's open source work. You can expect a reply within 2 business days.
If your message is about listing a tool, our listing tiers and review process are published at https://www.odipa.org/get-involved/tool-listing-policy, and tool submissions go through the form at https://www.odipa.org/get-involved/contribute-code.`,
  },
  partnerships: {
    subject: 'Your partnership inquiry was received, ODIPA',
    body: `Thank you for your interest in partnering with ODIPA. Your inquiry has been received and you can expect a personal reply within 2 business days.
ODIPA is a California 501(c)(3) nonprofit, and we are glad to share program details and partnership options.`,
  },
  donate: {
    subject: 'Thank you for supporting ODIPA',
    body: `Thank you for your interest in supporting ODIPA's work. Your message has been received and you can expect a reply within 2 business days.
ODIPA is a California 501(c)(3) nonprofit, and donations are tax deductible to the extent allowed by law.`,
  },
  press: {
    subject: 'Your media inquiry was received, ODIPA',
    body: `Thank you for your interest in covering ODIPA. Your inquiry has been received and you can expect a reply within 2 business days.`,
  },
  privacy: {
    subject: 'Your privacy inquiry was received, ODIPA',
    body: `Thank you for contacting ODIPA about privacy. Your message has been received and will be handled with care. You can expect a reply within 2 business days.`,
  },
}

const DEFAULT_ACK = {
  subject: 'We received your message, ODIPA',
  body: `Thank you for contacting ODIPA. Your message has been received and you can expect a reply within 2 business days.`,
}

function ackHtml(name, ack, teamAddress) {
  const paragraphs = ack.body.split('\n').map(p =>
    `<p style="font-size:14px;line-height:1.7;color:#1C2536;margin:0 0 14px">${p}</p>`).join('')
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1C2536">
      <div style="background:#0B1F3A;padding:16px 20px;margin-bottom:22px;border-radius:8px">
        <img src="https://www.odipa.org/logo-dark-sm.png" alt="ODIPA" height="36" style="display:block;height:36px" />
      </div>
      <p style="font-size:15px;margin:0 0 14px">Hi ${name},</p>
      ${paragraphs}
      <p style="font-size:12px;color:#667;margin:20px 0 0">This confirmation was sent automatically. Replies go to our team at ${teamAddress}.</p>
    </div>`
}

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
    let message = clean(body['Message'] || body.message, 2000) || '—'

    if (!name)    return respond(context, 400, { error: 'Name is required' })
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return respond(context, 400, { error: 'Valid email is required' })

    // Volunteer applications carry their own questions. They are checked here
    // and written into the message, so everything downstream reads them.
    let volunteerFields = null
    let resumeFile = null
    if (topic === 'volunteer') {
      const rawResume = body.volunteer && body.volunteer.resume
      if (rawResume) {
        const checked = validateResume(rawResume)
        if (checked.error) return respond(context, 400, { error: checked.error })
        resumeFile = checked.file
      }
      const parsed = parseVolunteerApplication(body.volunteer, resumeFile)
      if (parsed.error) return respond(context, 400, { error: parsed.error })
      volunteerFields = parsed.fields
      message = parsed.message
    } else if (!message || message.length < 10) {
      return respond(context, 400, { error: 'Message is required' })
    }

    const toAddress = TOPIC_ROUTING[topic] || TOPIC_ROUTING.general
    const topicLabel = clean(body['Topic'] || topic || 'General Inquiry', 100)
    const consent = clean(body['Consented'] || body.consent, 10) || 'No'

    // Store the file before anything is emailed, so the applicant is never told
    // it arrived when it did not.
    let resumeBlob = ''
    if (resumeFile) {
      try { resumeBlob = await saveResume(resumeFile) } catch (fileErr) {
        context.log.error('Resume store failed:', fileErr.message)
        return respond(context, 503, { error: 'We could not save your resume file. Please try again, or add a link to your resume instead.' })
      }
    }

    // If the team email fails the applicant sees an error and will resend, so
    // do not keep a file that no inquiry will ever point at.
    try {
    await sendFormEmail({
      to:      toAddress,
      subject: `Contact Form: ${topicLabel} — from ${name}`,
      replyTo: email,
      fields: volunteerFields ? {
        'Topic':              topicLabel,
        'Name':               name,
        'Email':              email,
        'Organization':       organization,
        'Why ODIPA':          volunteerFields.why,
        'Roles of interest':  volunteerFields.roles.join(', '),
        'Experience':         volunteerFields.experience,
        'Resume or profile':  volunteerFields.link || 'None',
        'Resume file':        resumeFile ? `${resumeFile.name} (${resumeFile.label}), open it from the admin inquiry board` : 'None',
        'Credentials':        volunteerFields.credentials || '—',
        'Time available':     volunteerFields.hours,
        'Based in':           volunteerFields.location || '—',
        'Heard from':         volunteerFields.heardFrom || '—',
        'Anything else':      volunteerFields.extra || '—',
        'Routed to':          toAddress,
        'Consented':          consent,
      } : {
        'Topic':        topicLabel,
        'Name':         name,
        'Email':        email,
        'Organization': organization,
        'Message':      message,
        'Routed to':    toAddress,
        'Consented':    consent,
      },
    })
    } catch (mailErr) {
      if (resumeBlob) await deleteResume(resumeBlob)
      throw mailErr
    }

    // Instant canned acknowledgment to the submitter. Awaited so it cannot be
    // dropped, but a failure only logs, the inquiry itself succeeded.
    const ack = ACKS[topic] || DEFAULT_ACK
    try {
      await sendHtmlEmail({
        to: email,
        replyTo: toAddress,
        subject: ack.subject,
        html: ackHtml(name, ack, toAddress),
        plainText: `Hi ${name},\n\n${ack.body}\n\nThis confirmation was sent automatically. Replies go to our team at ${toAddress}.`,
      })
    } catch (ackErr) {
      context.log.error('Contact acknowledgment failed:', ackErr.message)
    }

    // Persist for the admin review inbox. Failure only logs, the inquiry
    // was already delivered by email either way.
    try {
      await saveInquiry({ topic, name, email, organization, message, routedTo: toAddress, resumeBlob, resumeName: resumeFile ? resumeFile.name : '' })
    } catch (storeErr) {
      context.log.error('Inquiry store failed:', storeErr.message)
      // Nothing points at the file now, so do not leave it behind.
      if (resumeBlob) await deleteResume(resumeBlob)
    }

    respond(context, 200, { ok: true })
  } catch (err) {
    context.log.error('Contact form error:', err.message)
    respond(context, 500, { error: 'Failed to send. Please try again.' })
  }
}
