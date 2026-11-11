/**
 * Join someone as a free community member from another form (the volunteer
 * application). Same rules as /api/membership: an explicit terms acceptance with
 * its version, the same email and name checks, first party storage, and double
 * opt-in, so nobody is on the list until they click the confirm link.
 *
 * Never throws and never blocks the form it is called from. It returns
 * { status } where status is one of:
 *   'pending'    saved, confirmation email sent
 *   'confirmed'  already a confirmed subscriber, now flagged as a member
 *   'skipped'    not attempted or not accepted (no tick, no terms version, or a
 *                full name is missing), `reason` says which
 *   'failed'     something went wrong, nothing was promised to the person
 */
const { sendHtmlEmail } = require('./mailer')
const { upsertPending, recordMembership, getSubscriber, confirmLink, unsubscribeLink } = require('./subscribers')
const abuse = require('./abuse')
const { strictEmailCheck } = require('./emailChecks')

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return null
  return { firstName: parts.slice(0, -1).join(' ').slice(0, 60), lastName: parts[parts.length - 1].slice(0, 60) }
}

async function joinAsMember(context, { email, name, accepted, termsVersion, source }) {
  try {
    if (accepted !== true || !String(termsVersion || '').trim()) return { status: 'skipped', reason: 'not-requested' }
    const names = splitName(name)
    if (!names) return { status: 'skipped', reason: 'full-name-needed' }
    const typed = String(email || '').toLowerCase()
    if (abuse.looksGenerated(typed)) return { status: 'skipped', reason: 'held' }
    const check = await strictEmailCheck(typed)
    if (!check.ok) return { status: 'skipped', reason: 'email' }
    if (abuse.checkMemberName(names.firstName, names.lastName)) return { status: 'skipped', reason: 'full-name-needed' }

    const address = await abuse.resolveIdentity(typed, getSubscriber)
    const full = `${names.firstName} ${names.lastName}`
    const record = await upsertPending({ email: address, name: full, source: source || 'Volunteer application' })
    await recordMembership(address, { termsVersion: String(termsVersion).trim().slice(0, 40), firstName: names.firstName, lastName: names.lastName })
    if (record.status === 'confirmed') return { status: 'confirmed' }

    const cLink = confirmLink(address)
    const uLink = unsubscribeLink(address)
    await sendHtmlEmail({
      to: address,
      subject: 'Confirm your ODIPA community membership',
      plainText: [
        'Confirm your ODIPA community membership',
        '',
        'You ticked the box to join the ODIPA community when you applied to volunteer. Open this link to confirm it was really you.',
        cLink,
        '',
        'Community membership is free. Community members are supporters of ODIPA\'s mission and do not have voting or governance rights.',
        'If you did not ask to join, ignore this email and nothing further will be sent. Your volunteer application is not affected.',
        `You can leave at any time using the link in every email, or right now at ${uLink}`,
        '',
        'ODIPA is a 501(c)(3) nonprofit. Your name and email address are stored by ODIPA and are never sold or shared for anyone else\'s use.',
      ].join('\n'),
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1C2536">
        <h2 style="color:#0B1F3A">Confirm your membership</h2>
        <p>You ticked the box to join the ODIPA community when you applied to volunteer. One click confirms it was really you.</p>
        <p style="margin:28px 0">
          <a href="${cLink}" style="background:#B98A2E;color:#0B1F3A;font-weight:bold;padding:12px 22px;border-radius:8px;text-decoration:none">Confirm membership</a>
        </p>
        <p style="font-size:12px;color:#667">Community membership is free. Community members are supporters of ODIPA's mission and do not have voting or governance rights.
        If you did not ask to join, ignore this email and nothing further will be sent. Your volunteer application is not affected.
        You can leave at any time using the link in every email, or <a href="${uLink}">right now</a>.</p>
        <p style="font-size:12px;color:#667">ODIPA is a 501(c)(3) nonprofit. Your name and email address are stored by ODIPA and are never sold or shared for anyone else's use.</p>
      </div>`,
    })
    return { status: 'pending' }
  } catch (err) {
    context.log.error('Volunteer membership step failed:', err.message)
    return { status: 'failed' }
  }
}

module.exports = { joinAsMember, splitName }
