/**
 * ODIPA Volunteer roster, /api/volunteers
 * Admin-only (x-admin-key, same check as every admin endpoint).
 *   GET                                   every volunteer, newest application first
 *   POST { id, status?, notes? }          change a status or the note
 *   POST { id, action: 'delete' }         remove a volunteer from the roster
 *   POST { action: 'add', name, email, roles?, hours?, status?, notes? }  add one volunteer by hand
 *   POST { action: 'set-status', inquiryId, status }  set the status from a volunteer card on the inquiry board,
 *                                         adding the person to the roster first if they are not on it
 *   POST { action: 'import', dryRun? }    add earlier volunteer applicants from the inquiry board
 * Statuses: applied, intro-call, active, paused, alumni. Responses are never
 * cached and nothing here is logged.
 */
const { isAdminRequest } = require('../_shared/adminAuth')
const V = require('../_shared/volunteers')
const { listInquiries, getInquiry } = require('../_shared/inquiries')
const { listDeletions } = require('../_shared/subscriberAdmin')

const fromLine = (msg, label) => { const m = new RegExp(`^${label}: (.+)$`, 'mi').exec(String(msg || '')); return m ? m[1].trim() : '' }

function reply(context, status, body) {
  context.res = { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) }
}

module.exports = async function handler(context, req) {
  if (req.method === 'OPTIONS') return reply(context, 200, {})
  try {
    if (!isAdminRequest(req)) return reply(context, 401, { error: 'Unauthorized' })
    if (req.method === 'GET') return reply(context, 200, { volunteers: await V.listVolunteers(), statuses: V.STATUSES.map(s => ({ value: s, label: V.LABELS[s] })) })
    if (req.method !== 'POST') return reply(context, 405, { error: 'Method not allowed' })

    const b = req.body || {}

    // Set a volunteer's status from their card on the inquiry board. The name and
    // address come from the stored card, never from the request.
    if (b.action === 'set-status') {
      if (!V.STATUSES.includes(String(b.status))) return reply(context, 400, { error: 'Invalid status' })
      let card = null
      try { card = await getInquiry(String(b.inquiryId || '')) } catch (e) { card = null }
      if (!card || card.topic !== 'volunteer' || !card.email) return reply(context, 404, { error: 'Volunteer card not found' })
      // As with the import, someone removed through the Subscribers tool is not added
      // back from their old card. Someone already on the roster can still be updated.
      const cardId = V.idFor(card.email)
      const listed = (await V.listVolunteers()).some(v => v.id === cardId)
      if (!listed && (await listDeletions(100000)).some(d => d.reference === cardId.slice(0, 10))) {
        return reply(context, 409, { error: 'This person was removed through the Subscribers tool, so they are not added back from an old card.' })
      }
      const added = await V.addIfMissing({
        email: card.email, name: card.name, roles: fromLine(card.message, 'Roles of interest'), hours: fromLine(card.message, 'Time available'),
        appliedAt: new Date(Number(card.receivedAt) || Date.now()).toISOString(), status: String(b.status), inquiryId: card.rowKey,
      })
      if (!added) await V.updateVolunteer(V.idFor(card.email), { status: String(b.status) })
      return reply(context, 200, { ok: true, added })
    }

    // Add one volunteer by hand, for people who did not apply through the form.
    // Someone already on the roster is never changed, the answer says so.
    // Text is kept as typed and escaped wherever it is shown.
    if (b.action === 'add') {
      const line = (v, max) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max)
      const email = line(b.email, 254).toLowerCase()
      const name = line(b.name, 100)
      if (!name) return reply(context, 400, { error: 'A name is required.' })
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(context, 400, { error: 'A valid email address is required.' })
      const status = b.status === undefined ? 'active' : String(b.status)
      if (!V.STATUSES.includes(status)) return reply(context, 400, { error: 'Invalid status' })
      const made = await V.addIfMissing({ email, name, roles: line(b.roles, 300), hours: line(b.hours, 60), status, notes: line(b.notes, 1000) })
      if (!made) return reply(context, 409, { error: 'That email address is already on the roster.' })
      return reply(context, 200, { ok: true })
    }

    // Earlier applicants are on the inquiry board but not on the roster. Add them
    // once. People already on the roster are left alone, and cards the team
    // dismissed are skipped. A card in "meeting" starts at Intro call scheduled.
    if (b.action === 'import') {
      // Read the whole board, not only the first 200 cards the board view stops at.
      const cards = (await listInquiries(null, 20000)).filter(c => c.topic === 'volunteer' && c.email)
      // Someone removed through the Subscribers tool must not come back from their old
      // inquiry card. The deletion log keeps the first 10 characters of a hash of the
      // address and nothing else, which is enough to recognise them here.
      const deletedRefs = new Set((await listDeletions(100000)).map(d => d.reference))
      let toAdd = 0, existing = 0, dismissed = 0, removedBefore = 0
      const seen = new Set()
      const onRoster = b.dryRun ? new Set((await V.listVolunteers()).map(v => v.id)) : null
      for (const c of cards) {
        const key = V.idFor(c.email)
        if (seen.has(key)) continue
        if (c.status === 'dismissed') { dismissed++; continue }
        if (deletedRefs.has(key.slice(0, 10))) { removedBefore++; continue }
        seen.add(key)
        const row = { email: c.email, name: c.name, roles: fromLine(c.message, 'Roles of interest'), hours: fromLine(c.message, 'Time available'), appliedAt: new Date(Number(c.receivedAt) || Date.now()).toISOString(), status: c.status === 'meeting' ? 'intro-call' : 'applied', inquiryId: c.rowKey }
        if (b.dryRun) {
          if (onRoster.has(key)) existing++; else toAdd++
        } else if (await V.addIfMissing(row)) toAdd++
        else existing++
      }
      return reply(context, 200, { ok: true, dryRun: !!b.dryRun, toAdd, alreadyOnRoster: existing, skippedDismissed: dismissed, skippedRemoved: removedBefore })
    }

    const id = String(b.id || '')
    if (!/^[a-f0-9]{64}$/.test(id)) return reply(context, 400, { error: 'A valid id is required' })
    if (b.action === 'delete') {
      await V.deleteVolunteer(id)
      return reply(context, 200, { ok: true })
    }
    if (b.status !== undefined && !V.STATUSES.includes(b.status)) return reply(context, 400, { error: 'Invalid status' })
    if (b.status === undefined && b.notes === undefined) return reply(context, 400, { error: 'Nothing to change' })
    await V.updateVolunteer(id, { status: b.status, notes: b.notes === undefined ? undefined : String(b.notes) })
    return reply(context, 200, { ok: true })
  } catch (err) {
    if (err && err.statusCode === 404) return reply(context, 404, { error: 'Volunteer not found' })
    context.log.error('volunteers error:', err.message)
    return reply(context, 500, { error: 'Roster unavailable' })
  }
}
