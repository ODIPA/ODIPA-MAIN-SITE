/**
 * Single source of truth for the volunteer roles that the AI helpers
 * (reply drafts and intro call prep sheets) are allowed to talk about.
 * Keep in sync with the roles array in app/get-involved/volunteer/page.tsx.
 *
 * Why this exists. Before this file, the prep sheet prompt knew only three
 * roles and a list of design needs, and the reply drafter knew none, so
 * applicants from governance, risk and compliance (GRC) backgrounds were
 * steered toward visuals or treated as people asking for a job.
 */

const ROLES = [
  {
    title: 'Certification Assessor',
    hours: '8 to 12 hours per engagement',
    what: 'Structured privacy compliance assessments against ODIPA\'s published criteria, documentation review, assessment interviews, gap analysis reports, and a seat on the two assessor decision panel. Requires an active credential such as CIPP/US, CIPP/E, CIPM, CISA, CISSP, QSA, CHPC or CAMS. People working toward a credential can start as an assessor shadow.',
    grc: true,
  },
  {
    title: 'Privacy Researcher',
    hours: '4 to 6 hours per month',
    what: 'Independent research, research briefs, the annual State of Privacy report, and monitoring of emerging threats and enforcement actions. Published work can appear on odipa.org under Research Releases and in the newsletter.',
    grc: true,
  },
  {
    title: 'Educator / Trainer',
    hours: '2 to 4 hours per month',
    what: 'Design and deliver free consumer workshops, webinars and courses, and build curriculum. ODIPA also lists fee-based corporate training, so ask before assuming a volunteer would teach that.',
    grc: true,
  },
  { title: 'Privacy Attorney', hours: '4 to 8 hours per month', what: 'Review position papers, advise on legislative submissions, and help with the certification program legal framework.', grc: true },
  { title: 'Data Analyst', hours: 'varies', what: 'Analyze breach datasets, track legislative trends, and build visualizations for reports.', grc: false },
  { title: 'Software Developer', hours: '6 to 10 hours per month', what: 'Open source privacy tools, the odipa.org site, and code reviews.', grc: false },
  { title: 'Community Advocate', hours: '3 to 5 hours per month', what: 'Represent ODIPA at community events, social media, local meetups, and recruiting participants.', grc: false },
  { title: 'Content Writer', hours: '2 to 4 hours per month', what: 'Blog posts, campaign copy, research summaries, and plain language educational material.', grc: false },
  { title: 'Translator', hours: '4 to 6 hours per month', what: 'Translate educational content into Spanish, Mandarin, Tagalog or other languages.', grc: false },
]

const ROLE_TITLES = ROLES.map(r => r.title)

/** Plain text block for prompts. */
function rolesForPrompt() {
  return ROLES.map(r => `- ${r.title} (${r.hours}). ${r.what}`).join('\n')
}

/** Shared rule text. Both generators include it verbatim. */
const GRC_RULE = `Applicants from governance, risk, compliance (GRC), audit, security, privacy operations or legal backgrounds are the people several roles were written for. Treat them as strong volunteer candidates, never as a poor fit. Wanting GRC experience, GRC work, a portfolio, references or a credential is a normal reason to volunteer and is not a demand for employment. Never tell such an applicant that ODIPA has no GRC roles, that their background does not match, or that they should look elsewhere. Match them to Certification Assessor, Privacy Researcher, Educator / Trainer, or reviewing the published certification criteria. Say plainly, once and without discouraging them, that volunteer roles are unpaid.`

module.exports = { ROLES, ROLE_TITLES, rolesForPrompt, GRC_RULE }
