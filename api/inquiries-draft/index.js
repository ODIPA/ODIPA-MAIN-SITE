/**
 * POST /api/inquiries-draft — draft replies for stale unanswered inquiries.
 * Admin-only (x-admin-key). Intended to be called daily by the scheduled
 * GitHub Action, and available as a button in the admin inbox.
 *
 * For every inquiry still 'acked' and older than INQUIRY_GRACE_DAYS
 * (default 2), asks the model to either propose a reply draft or flag the
 * inquiry as needs-attention when it deserves a personal first word
 * (strong volunteer candidates, journalists, legal matters, security
 * reports, anything unusual). Drafts NEVER send themselves. Every draft
 * waits for human approval in /admin/inquiries.
 */
const { respond, sendHtmlEmail } = require('../_shared/mailer')
const { listInquiries, updateInquiry } = require('../_shared/inquiries')

const TOPIC_GUIDANCE = {
  volunteer: 'Volunteering inquiry. The auto-acknowledgment already promised review within 5 business days and an intro call as the next step. A good draft thanks them, says a word about fit, and invites them to reply with availability for a short intro call. If the applicant is unusually strong or specific, flag instead.',
  partnerships: 'Partnership inquiry. Be warm, factual about ODIPA being a small California 501(c)(3), and invite a short call. Never invent programs or commitments.',
  donate: 'Donation inquiry. Thank them, confirm 501(c)(3) tax-deductible status, and point to https://www.odipa.org/donate. Never discuss amounts.',
  certification: 'Certification program inquiry. Point to https://www.odipa.org/programs/corporate-certification and offer to answer specifics. Never quote pricing or timelines beyond the published page.',
  dev: 'Open source inquiry. Point to the tool listing policy at https://www.odipa.org/get-involved/tool-listing-policy when relevant.',
  press: 'ALWAYS flag press inquiries as needs-attention. Media deserves a personal reply.',
  privacy: 'ALWAYS flag privacy-policy or data-request inquiries as needs-attention. These can be legal matters.',
}

const SYSTEM = `You draft replies for ODIPA, a small California 501(c)(3) digital privacy nonprofit. You write on behalf of a volunteer-run team.

Hard rules:
- Reply ONLY with JSON: {"action":"draft","subject":"...","body":"..."} or {"action":"flag","reason":"..."}
- Flag anything unusual, high-stakes, legal, media, security-related, hostile, or from an unusually strong candidate. When in doubt, flag.
- Drafts must be short (under 150 words), warm, and plain. No marketing language.
- Never promise timelines, money, partnerships, listings, or commitments of any kind.
- Never give legal advice.
- Never use em dashes.
- Sign off as "The ODIPA Team".
- The recipient already received an automatic acknowledgment days ago. Do not re-acknowledge receipt. Get to substance.`

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  const key = process.env.NEWSLETTER_ADMIN_KEY
  if (!key || req.headers['x-admin-key'] !== key)
    return respond(context, 401, { error: 'Unauthorized' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return respond(context, 400, { error: 'ANTHROPIC_API_KEY is not configured.' })

  try {
    const graceDays = Number(process.env.INQUIRY_GRACE_DAYS || 2)
    const cutoff = Date.now() - graceDays * 24 * 60 * 60 * 1000
    const acked = (await listInquiries(['acked'])).filter(r => Number(r.receivedAt) < cutoff)

    let drafted = 0, flagged = 0
    for (const inq of acked.slice(0, 20)) {
      const guidance = TOPIC_GUIDANCE[inq.topic] || 'General inquiry.'
      const user = `Topic: ${inq.topic}\nGuidance: ${guidance}\nFrom: ${inq.name} <${inq.email}>${inq.organization ? ` (${inq.organization})` : ''}\nReceived: ${new Date(Number(inq.receivedAt)).toUTCString()}\n\nTheir message:\n${inq.message}`

      let result = null
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
            max_tokens: 700,
            system: SYSTEM,
            messages: [{ role: 'user', content: user }],
          }),
        })
        const data = await res.json()
        const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('')
        const cleaned = text.replace(/```json|```/g, '').replace(/<\/?cite[^>]*>/g, '').trim()
        result = JSON.parse(cleaned)
      } catch (modelErr) {
        context.log.warn(`Draft failed for ${inq.rowKey}: ${modelErr.message}`)
        continue
      }

      if (result && result.action === 'draft' && result.subject && result.body) {
        await updateInquiry(inq.rowKey, {
          status: 'drafted',
          draftSubject: String(result.subject).slice(0, 200),
          draftBody: String(result.body).slice(0, 4000),
          draftReason: '',
          draftedAt: Date.now(),
        })
        drafted++
      } else {
        await updateInquiry(inq.rowKey, {
          status: 'needs-attention',
          draftReason: String((result && result.reason) || 'Flagged for personal reply').slice(0, 500),
          draftedAt: Date.now(),
        })
        flagged++
      }
    }

    // Nudge email so the inbox never accumulates silently
    const nudgeTo = process.env.INQUIRY_NUDGE_EMAIL
    if (nudgeTo && (drafted + flagged) > 0) {
      try {
        await sendHtmlEmail({
          to: nudgeTo,
          subject: `ODIPA inbox: ${drafted} draft${drafted === 1 ? '' : 's'} awaiting approval, ${flagged} flagged`,
          html: `<p style="font-family:sans-serif;font-size:14px">The inquiry inbox has ${drafted} AI draft${drafted === 1 ? '' : 's'} awaiting your approval and ${flagged} inquiry${flagged === 1 ? '' : 'ies'} flagged for a personal reply.</p><p style="font-family:sans-serif;font-size:14px">Review at https://www.odipa.org/admin/inquiries</p>`,
          plainText: `${drafted} drafts awaiting approval, ${flagged} flagged. Review at https://www.odipa.org/admin/inquiries`,
        })
      } catch (e) { context.log.warn('Nudge failed:', e.message) }
    }

    respond(context, 200, { ok: true, examined: acked.length, drafted, flagged })
  } catch (err) {
    context.log.error('Inquiry drafting error:', err.message)
    respond(context, 500, { error: 'Drafting run failed' })
  }
}
