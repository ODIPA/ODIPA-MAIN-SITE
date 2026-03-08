/**
 * ODIPA Privacy Tool Submission — Azure Function
 * POST /api/tool-submit
 *
 */

const { sendFormEmail, respond, clean } = require('../_shared/mailer')

const GITHUB_OWNER = 'odipa'
const GITHUB_REPO  = 'odipa-privacy-tools'

async function openGitHubIssue({ toolName, github, description, authorName, authorEmail, category, lang }) {
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

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return respond(context, 200, {})
  if (req.method !== 'POST')   return respond(context, 405, { error: 'Method not allowed' })

  try {
    const body = req.body || {}

    const toolName    = clean(body['Tool Name'], 200)
    const authorEmail = clean(body['Contributor Email'], 200)
    const authorName  = clean(body['Contributor Name'], 100)
    const github      = clean(body['GitHub URL'], 300)
    const description = clean(body['Description'], 2000)
    const category    = clean(body['Category'], 100)
    const lang        = clean(body['Language'], 100)

    if (!toolName) return respond(context, 400, { error: 'Tool name is required' })
    if (!authorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail))
      return respond(context, 400, { error: 'Valid email is required' })
    if (!github || !github.startsWith('https://github.com/'))
      return respond(context, 400, { error: 'Valid GitHub URL is required' })

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
        },
      }),
      openGitHubIssue({ toolName, github, description, authorName, authorEmail, category, lang }),
    ])

    const issueResult = issue.status === 'fulfilled' ? issue.value : null
    context.log.info('Tool submission processed', { toolName, issue: issueResult })

    respond(context, 200, {
      ok: true,
      ...(issueResult ? { issueUrl: issueResult.url, issueNumber: issueResult.number } : {}),
    })
  } catch (err) {
    context.log.error('Tool submission error:', err.message)
    respond(context, 500, { error: 'Failed to send. Please try again.' })
  }
}
