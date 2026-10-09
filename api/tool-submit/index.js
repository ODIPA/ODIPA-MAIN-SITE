/**
 * ODIPA Privacy Tool Submission — Azure Function
 * POST /api/tool-submit
 *
 */

const { sendFormEmail, sendHtmlEmail, respond, clean } = require('../_shared/mailer')
const { checkRateLimit, getClientIp } = require('../_shared/rateLimiter')

const GITHUB_OWNER = 'odipa'
const GITHUB_REPO  = 'odipa-privacy-tools'

async function openGitHubIssue({ toolName, github, description, authorName, authorEmail, category, lang, tier }) {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    // Non-fatal — email still sends, issue just won't be created
    console.warn('GITHUB_TOKEN not set — skipping GitHub Issue creation')
    return null
  }

  const body = [
    `## Tool Submission`,
    ``,
    `**Submitted by:** ${authorName} (${authorEmail})`,
    `**Category:** ${category || '—'}`,
    `**Language:** ${lang || '—'}`,
    `**GitHub:** ${github}`,
    `**Requested listing:** ${tier}`,
    ``,
    `### Description`,
    description || '—',
    ``,
    `---`,
    `*Submitted via odipa.org/get-involved/contribute-code*`,
    `*Move this issue to \`security-audit\` label when initial review passes.*`,
    `*Move to \`approved\` label when security audit passes and tool is listed.*`,
  ].join('\n')

  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      title: `[Tool Submission] ${toolName}`,
      body,
      labels: ['tool-review'],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('GitHub Issue creation failed:', res.status, err)
    return null
  }

  const issue = await res.json()
  return { number: issue.number, url: issue.html_url }
}

const TIER_LINES = {
  'Approved listing': 'You asked for an Approved listing. If it passes review, the tool is listed with the green Approved badge, the repository stays where it is, and you keep full ownership and control. The listing identifies the exact version we reviewed.',
  'Community project': 'You asked for a Community Project listing. The tool is featured under the amber Needs Help badge so contributors can help close its gaps. It is labeled experimental and not yet reviewed until it completes the full review.',
  'ODIPA adopted': 'You asked about ODIPA adoption. That means transferring the repository into ODIPA\'s GitHub organization with you continuing as lead maintainer. We will discuss the details with you before anything moves, and adoption on its own does not grant Approved status.',
}

function ackParagraphs({ toolName, tier, issueUrl }) {
  return [
    `Thanks for submitting ${toolName} to ODIPA's Community Privacy Tools directory. This note confirms we received it.`,
    TIER_LINES[tier] || 'We have recorded the listing arrangement you chose.',
    'What happens next. We acknowledge within 2 business days. Our team then does an initial review of code quality, documentation, and stated purpose, which takes 1 to 2 weeks. Volunteer security engineers follow with a security review including dependency scanning and manual code review, which takes 1 to 3 weeks. The board then confirms mission and community alignment within about a week. Findings are posted in writing at each stage.',
    issueUrl
      ? `You can follow progress on the public tracking issue: ${issueUrl}`
      : 'Progress is tracked publicly at https://github.com/odipa/odipa-privacy-tools/issues once an issue is opened for your submission.',
    'A listing means the code was reviewed against our published criteria. It is not an endorsement or promotion, and there is no fee at any stage. Our Tool Listing Policy is at https://www.odipa.org/get-involved/tool-listing-policy',
  ]
}

function ackText({ authorName, toolName, tier, issueUrl }) {
  return [`Hi ${authorName},`, '', ...ackParagraphs({ toolName, tier, issueUrl }).join('\n\n').split('\n'), '', 'This confirmation was sent automatically. Replies go to dev@odipa.org.'].join('\n')
}

function ackHtml({ authorName, toolName, tier, issueUrl }) {
  const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const paragraphs = ackParagraphs({ toolName, tier, issueUrl }).map(t =>
    `<p style="font-size:14px;line-height:1.7;color:#1C2536;margin:0 0 14px">${esc(t).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')}</p>`).join('')
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1C2536">
      <div style="background:#0B1F3A;padding:16px 20px;margin-bottom:22px;border-radius:8px">
        <img src="https://www.odipa.org/logo-dark-sm.png" alt="ODIPA" height="36" style="display:block;height:36px" />
      </div>
      <p style="font-size:15px;margin:0 0 14px">Hi ${esc(authorName)},</p>
      ${paragraphs}
      <p style="font-size:12px;color:#667;margin:20px 0 0">This confirmation was sent automatically. Replies go to our team at dev@odipa.org.</p>
    </div>`
}

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST')   return respond(context, 405, { error: 'Method not allowed' })

  try {
    
    // Rate limiting
    const ip = getClientIp(req)
    const rl = checkRateLimit(ip, 'tool-submit', { max: 3, windowMs: 300000 })
    if (rl.limited) {
      return respond(context, 429, { error: 'Too many requests. Please wait a moment and try again.' })
    }
    const body = req.body || {}
    // Honeypot check — bots fill in hidden fields, humans don't
    if (body._hp) {
      context.log.warn('Honeypot triggered — discarding bot submission')
      return respond(context, 200, { ok: true })
    }


    const toolName    = clean(body['Tool Name'], 200) || '—'
    const authorEmail = clean(body['Contributor Email'], 200) || '—'
    const authorName  = clean(body['Contributor Name'], 100) || '—'
    const github      = clean(body['GitHub URL'], 300) 
    const description = clean(body['Description'], 2000) || '—'
    const category    = clean(body['Category'], 100) || '—'
    const lang        = clean(body['Language'], 100) || '—'
    const agree       = clean(body['Agreed to Standards'], 10) || 'No'
    // Listing arrangement from the Tool Listing Policy. Mirrors LISTING_TIERS in
    // components/ToolSubmissionForm.tsx, keep the two lists the same.
    const LISTING_TIERS = ['Approved listing', 'Community project', 'ODIPA adopted']
    const tier        = clean(body['Listing Tier'], 40)

    if (!toolName) return respond(context, 400, { error: 'Tool name is required' })
    if (!authorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail))
      return respond(context, 400, { error: 'Valid email is required' })
    if (!github || !github.startsWith('https://github.com/'))
      return respond(context, 400, { error: 'Valid GitHub URL is required' })
    if (!LISTING_TIERS.includes(tier))
      return respond(context, 400, { error: 'Please choose how you would like the tool listed.' })

    // ── Spam guardrails ────────────────────────────────────────────────────
    // 1. The privacy problem must be answered in its own words. Submissions
    //    that paste the description again are directory spam by signature.
    const privacyProblem = clean(body['Privacy Problem'], 2000) || ''
    const normalize = s => s.toLowerCase().replace(/\s+/g, ' ').trim()
    if (!privacyProblem || normalize(privacyProblem) === normalize(description))
      return respond(context, 400, { error: 'Please describe the specific privacy problem this tool solves, in your own words.' })
    if (privacyProblem.length < 40)
      return respond(context, 400, { error: 'Please describe the privacy problem in at least a sentence or two.' })

    // 2. The GitHub repo must actually exist and not be empty.
    try {
      const m = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/.exec(github)
      if (!m) return respond(context, 400, { error: 'GitHub URL must point to a repository.' })
      const repoRes = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}`, {
        headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'odipa-tool-submit' },
      })
      if (repoRes.status === 404)
        return respond(context, 400, { error: 'That GitHub repository does not exist or is private.' })
      if (repoRes.ok) {
        const repo = await repoRes.json()
        if ((repo.size ?? 0) === 0)
          return respond(context, 400, { error: 'That repository appears to be empty.' })
      }
      // Rate-limited or transient GitHub errors fall through, humans review anyway.
    } catch (ghErr) {
      context.log.warn('GitHub check skipped:', ghErr.message)
    }

    // Run email + GitHub issue creation in parallel
    const [, issue] = await Promise.allSettled([
      sendFormEmail({
        to:      'dev@odipa.org',
        subject: `Tool Submission: ${toolName} — ${authorName}`,
        replyTo: authorEmail,
        fields: {
          'Tool Name':         toolName,
          'Tagline':           clean(body['Tagline'], 200) || '—',
          'Category':          category || '—',
          'Description':       description || '—',
          'Privacy Problem':   clean(body['Privacy Problem'], 2000) || '—',
          'GitHub URL':        github,
          'Docs URL':          clean(body['Docs URL'], 300) || '—',
          'Language':          lang || '—',
          'Platforms':         clean(body['Platforms'], 300) || '—',
          'License':           clean(body['License'], 100) || '—',
          'Contributor Name':  authorName || '—',
          'Contributor Email': authorEmail,
          'GitHub Handle':     clean(body['GitHub Handle'], 100) || '—',
          'Organization':      clean(body['Organization'], 200) || '—',
          'Listing Tier':      tier,
          'Agreed to Standards': agree,
        },
      }),
      openGitHubIssue({ toolName, github, description, authorName, authorEmail, category, lang }),
    ])

    const issueResult = issue.status === 'fulfilled' ? issue.value : null
    context.log.info('Tool submission processed', { toolName, issue: issueResult })

    // Acknowledgment to the submitter. Repeats the arrangement they chose, states the
    // stages and timelines from the Contribute Code page, and links the tracking issue
    // when one was created. A failure here never fails the submission.
    try {
      await sendHtmlEmail({
        to: authorEmail,
        subject: `We received your ODIPA tool submission: ${toolName}`,
        replyTo: 'dev@odipa.org',
        plainText: ackText({ authorName, toolName, tier, issueUrl: issueResult ? issueResult.url : null }),
        html: ackHtml({ authorName, toolName, tier, issueUrl: issueResult ? issueResult.url : null }),
      })
    } catch (ackErr) {
      context.log.warn('Submission acknowledgment email failed:', ackErr.message)
    }

    respond(context, 200, {
      ok: true,
      ...(issueResult ? { issueUrl: issueResult.url, issueNumber: issueResult.number } : {}),
    })
  } catch (err) {
    context.log.error('Tool submission error:', err.message)
    respond(context, 500, { error: 'Failed to send. Please try again.' })
  }
}
