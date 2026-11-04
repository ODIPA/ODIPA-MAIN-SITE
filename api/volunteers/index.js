/**
 * ODIPA Volunteer roster, /api/volunteers
 * Admin-only (x-admin-key, same check as every admin endpoint).
 *   GET                                   every volunteer, newest application first
 *   POST { id, status?, notes? }          change a status or the note
 *   POST { id, action: 'delete' }         remove a volunteer from the roster
 * Statuses: applied, intro-call, active, paused, alumni. Responses are never
 * cached and nothing here is logged.
 */
const { isAdminRequest } = require('../_shared/adminAuth')
const V = require('../_shared/volunteers')

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
    context.log.error('volunteers error:', err.message)
    return reply(context, 500, { error: 'Roster unavailable' })
  }
}
