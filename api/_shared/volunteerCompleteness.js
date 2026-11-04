/**
 * Shared by the reply drafter and the bulk redraft action, so both agree on
 * which volunteer messages are thin.
 */

/**
 * Version of the reply drafting rules. The drafter stamps each draft with it.
 * Bump it when the rules change enough that older drafts should be redone, so
 * the bulk redraft action can find them.
 */
const DRAFT_RULES = 'v3'

/**
 * Decide in code, not in the model, whether a volunteer message has enough
 * information to match the person to a role. Messages from the structured
 * volunteer form start with "VOLUNTEER APPLICATION" and always carry the
 * answers ODIPA needs. Anything else (older submissions, short free text)
 * counts as THIN unless it includes a link to a resume or profile.
 */
function volunteerCompleteness(message) {
  const text = String(message || '').trim()
  if (/^VOLUNTEER APPLICATION/i.test(text)) return 'COMPLETE'
  if (/https?:\/\/|www\.|linkedin\.com/i.test(text)) return 'COMPLETE'
  return 'THIN'
}

module.exports = { volunteerCompleteness, DRAFT_RULES }
