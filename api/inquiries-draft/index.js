/**
 * POST /api/inquiries-draft, draft replies for stale unanswered inquiries.
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
const { isAdminRequest } = require('../_shared/adminAuth')
const { respond, sendHtmlEmail } = require('../_shared/mailer')
const { listInquiries, updateInquiry } = require('../_shared/inquiries')
const { rolesForPrompt, GRC_RULE } = require('../_shared/volunteerRoles')
const { volunteerCompleteness, DRAFT_RULES } = require('../_shared/volunteerCompleteness')

const TOPIC_GUIDANCE = {
  volunteer: `Volunteering inquiry. DRAFT by default, volunteers are the most common inquiry. The line "Application completeness" below tells you which kind of reply to write.
If it says THIN, the person has not yet said enough for ODIPA to match them to a role. Write a warm reply that thanks them, reflects one concrete detail from their message so it reads personal, and asks them to reply with a resume or a LinkedIn or portfolio link, why they want to volunteer with ODIPA, their relevant experience and any credentials, which roles interest them, and about how many hours a month they can give. Ask only for what their message does not already say. Do NOT invite a call, propose times or mention scheduling in a THIN reply. Say that once ODIPA has this, the team will follow up. Wanting global or practical experience is a normal reason to volunteer, so welcome it.
If it says COMPLETE, a good draft thanks them, reflects one concrete detail from their message so it reads personal, and invites them to reply with availability for a short intro call. Strong and specific applicants deserve the fastest reply of all.
Never decline, redirect or discourage a volunteer because of their field or the kind of work they want. ${GRC_RULE} Flag ONLY if the message indicates a minor, explicitly demands pay, employment, sponsorship, or visa support as a condition, raises a legal or security matter, is hostile or incoherent, or is from a journalist. A wish for GRC or compliance experience is none of those.

Volunteer roles that really exist, the only ones you may name:
${rolesForPrompt()}
You may name at most one or two roles, only when their message clearly points to them, and only as possibilities to discuss later. Never promise a role, title, start date or outcome.`,
  partnerships: 'Partnership inquiry. Be warm, factual about ODIPA being a small California 501(c)(3), and invite a short call. Never invent programs or commitments.',
  donate: 'Donation inquiry. Thank them, confirm 501(c)(3) tax-deductible status, and point to https://www.odipa.org/donate. Never discuss amounts.',
  certification: 'Certification program inquiry. Point to https://www.odipa.org/programs/corporate-certification and offer to answer specifics. Never quote pricing or timelines beyond the published page.',
  dev: 'Open source inquiry. Point to the tool listing policy at https://www.odipa.org/get-involved/tool-listing-policy when relevant.',
  press: 'ALWAYS flag press inquiries as needs-attention. Media deserves a personal reply.',
  privacy: 'ALWAYS flag privacy-policy or data-request inquiries as needs-attention. These can be legal matters.',
  sponsor: 'Corporate sponsorship application. The auto-acknowledgment already promised contact within 2 business days. A good draft thanks them, names the tier they chose, says sponsorship is a public acknowledgment relationship with no services or influence in return, and invites a short call. Never quote or negotiate amounts, never promise placement or recognition beyond the published tiers at https://www.odipa.org/become-a-sponsor. Flag if the message asks for anything in return, mentions a product to feature, or comes from a company whose business is at odds with privacy.',
  'research-sponsor': 'Research sponsorship inquiry. The auto-acknowledgment already promised contact within 2 business days. A good draft thanks them, restates that sponsored research is published freely and sponsors do not direct findings or pre-review results, and invites a short call. Never commit to a topic, timeline, or deliverable. Flag if the message proposes a specific conclusion, asks for pre-publication review, or wants exclusivity.',
  board: 'ALWAYS flag board applications as needs-attention. Board recruitment is a governance matter for the current directors, not something to draft a reply to. The acknowledgment already told the applicant to expect confirmation within 2 business days and that decisions follow seat availability.',
}

/** The reminder email to the team. Failure only logs, drafting itself already succeeded. */
async function sendNudge(context, drafted, flagged) {
  const nudgeTo = process.env.INQUIRY_NUDGE_EMAIL
  if (!nudgeTo || (drafted + flagged) <= 0) return false
  try {
    await sendHtmlEmail({
      to: nudgeTo,
      subject: `ODIPA inbox: ${drafted} draft${drafted === 1 ? '' : 's'} awaiting approval, ${flagged} flagged`,
      html: `<p style="font-family:sans-serif;font-size:14px">The inquiry inbox has ${drafted} AI draft${drafted === 1 ? '' : 's'} awaiting your approval and ${flagged} inquiry${flagged === 1 ? '' : 'ies'} flagged for a personal reply.</p><p style="font-family:sans-serif;font-size:14px">Review at https://www.odipa.org/admin/inquiries</p>`,
      plainText: `${drafted} drafts awaiting approval, ${flagged} flagged. Review at https://www.odipa.org/admin/inquiries`,
    })
    return true
  } catch (e) { context.log.warn('Nudge failed:', e.message); return false }
}

const SYSTEM = `You draft replies for ODIPA, a small California 501(c)(3) digital privacy nonprofit. You write on behalf of a volunteer-run team.

Hard rules:
- Reply ONLY with JSON: {"action":"draft","subject":"...","body":"..."} or {"action":"flag","reason":"..."}
- Flag anything high-stakes, legal, media, security-related, or hostile. Drafts never send themselves, a human approves every one, so a draft is the safe default and strong candidates get drafts too. Flag only when a topic rule says to or a reply from "The ODIPA Team" would be genuinely wrong for the situation.
- Drafts must be short (under 150 words), warm, and plain. No marketing language.
- Never promise timelines, money, partnerships, listings, or commitments of any kind.
- Never give legal advice.
- Never use em dashes.
- Never turn away or talk down a volunteer applicant. If you are unsure whether they fit, invite them to the intro call, which exists to find the fit.
- Sign off as "The ODIPA Team".
- The recipient already received an automatic acknowledgment days ago. Do not re-acknowledge receipt. Get to substance.`

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (!isAdminRequest(req))
    return respond(context, 401, { error: 'Unauthorized' })

  // Reminder only. The daily workflow drafts in small batches (each request has
  // to finish inside Azure's 45 seconds), then asks once for one email that
  // reports what is actually waiting. No drafting and no model call happen here.
  if (req.body && req.body.nudge === true) {
    try {
      const awaiting = (await listInquiries(['drafted'])).length
      const flaggedNow = (await listInquiries(['needs-attention'])).length
      const sent = await sendNudge(context, awaiting, flaggedNow)
      return respond(context, 200, { ok: true, awaiting, flagged: flaggedNow, sent })
    } catch (err) {
      context.log.error('Inquiry nudge error:', err.message)
      return respond(context, 500, { error: 'Reminder failed', detail: String(err && err.message || err).slice(0, 200) })
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return respond(context, 400, { error: 'ANTHROPIC_API_KEY is not configured.' })

  try {
    const graceDays = Number(process.env.INQUIRY_GRACE_DAYS || 2)
    const cutoff = Date.now() - graceDays * 24 * 60 * 60 * 1000
    // The board passes back inquiries that already failed this session, so a
    // card whose model call keeps failing does not block the batches behind it.
    const skip = new Set(Array.isArray(req.body && req.body.skip) ? req.body.skip.map(String) : [])
    const acked = (await listInquiries(['acked'])).filter(r => Number(r.receivedAt) < cutoff && !skip.has(r.rowKey))

    // Azure Static Web Apps cuts API requests off after 45 seconds, and each
    // draft is a model call. The admin board and the scheduled workflow ask
    // for small batches with { limit } and repeat until nothing remains. No
    // limit means a single run of up to 20.
    const asked = Number(req.body && req.body.limit)
    const batched = Number.isInteger(asked) && asked >= 1
    const limit = batched ? Math.min(asked, 20) : 20

    let drafted = 0, flagged = 0
    const failed = []
    for (const inq of acked.slice(0, limit)) {
      const guidance = TOPIC_GUIDANCE[inq.topic] || 'General inquiry.'
      const completeness = inq.topic === 'volunteer' ? `Application completeness: ${volunteerCompleteness(inq.message)}\n` : ''
      const user = `Topic: ${inq.topic}\nGuidance: ${guidance}\n${completeness}From: ${inq.name} <${inq.email}>${inq.organization ? ` (${inq.organization})` : ''}\nReceived: ${new Date(Number(inq.receivedAt)).toUTCString()}\n\nTheir message:\n${inq.message}`

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
        failed.push(inq.rowKey)
        continue
      }

      if (result && result.action === 'draft' && result.subject && result.body) {
        await updateInquiry(inq.rowKey, {
          status: 'drafted',
          draftSubject: String(result.subject).slice(0, 200),
          draftBody: String(result.body).slice(0, 4000),
          draftReason: '',
          draftedAt: Date.now(),
          draftRules: DRAFT_RULES,
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

    // Nudge email so the inbox never accumulates silently. Skipped for the
    // small batches from the board and the scheduled workflow, which would send
    // one email per batch. The workflow asks for one reminder with { nudge: true }.
    if (!batched) await sendNudge(context, drafted, flagged)

    respond(context, 200, { ok: true, examined: acked.length, drafted, flagged, failed, remaining: Math.max(acked.length - drafted - flagged - failed.length, 0) })
  } catch (err) {
    context.log.error('Inquiry drafting error:', err.message)
    // The admin key is required to reach this endpoint, so the reason is safe to show.
    respond(context, 500, { error: 'Drafting run failed', detail: String(err && err.message || err).slice(0, 200) })
  }
}

module.exports.volunteerCompleteness = volunteerCompleteness
