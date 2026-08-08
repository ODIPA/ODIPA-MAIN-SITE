/**
 * ODIPA Newsletter Stats, GET /api/newsletter-stats
 * Admin-only. Requires header x-admin-key matching NEWSLETTER_ADMIN_KEY.
 * Returns aggregate subscriber statistics. No per-user telemetry, no open
 * or click tracking, aggregate counts only, consistent with ODIPA's
 * no-tracking commitment.
 */
const crypto = require('crypto')
const { TableClient } = require('@azure/data-tables')
const { listIssues } = require('../_shared/subscribers')

function getTable() {
  const conn = process.env.SUBSCRIBERS_TABLE_CONNECTION || process.env.AzureWebJobsStorage
  if (!conn) throw new Error('SUBSCRIBERS_TABLE_CONNECTION is not set.')
  return TableClient.fromConnectionString(conn, 'subscribers')
}

function monthOf(iso) {
  return iso ? String(iso).slice(0, 7) : 'unknown'
}

module.exports = async function handler(context, req) {
  const respond = (status, body) => { context.res = { status, headers: { 'Content-Type': 'application/json' }, body } }
  try {
    const key = process.env.NEWSLETTER_ADMIN_KEY
    if (!key || req.headers['x-admin-key'] !== key) {
      return respond(401, { error: 'Unauthorized' })
    }

    const client = getTable()
    const totals = { pending: 0, confirmed: 0, unsubscribed: 0 }
    const signupsByMonth = {}
    const confirmedByMonth = {}
    const sources = {}
    const now = Date.now()
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
    let last30 = { signups: 0, confirmed: 0, unsubscribed: 0 }

    const iter = client.listEntities({ queryOptions: { filter: "PartitionKey eq 'sub'" } })
    for await (const ent of iter) {
      const status = ent.status || 'pending'
      if (totals[status] != null) totals[status]++

      signupsByMonth[monthOf(ent.createdAt)] = (signupsByMonth[monthOf(ent.createdAt)] || 0) + 1
      if (ent.confirmedAt) {
        confirmedByMonth[monthOf(ent.confirmedAt)] = (confirmedByMonth[monthOf(ent.confirmedAt)] || 0) + 1
      }
      const src = ent.source || 'Website'
      sources[src] = (sources[src] || 0) + 1

      if (ent.createdAt && now - Date.parse(ent.createdAt) < THIRTY_DAYS) last30.signups++
      if (ent.confirmedAt && now - Date.parse(ent.confirmedAt) < THIRTY_DAYS) last30.confirmed++
      if (ent.unsubscribedAt && now - Date.parse(ent.unsubscribedAt) < THIRTY_DAYS) last30.unsubscribed++
    }

    const totalSignups = totals.pending + totals.confirmed + totals.unsubscribed
    const everConfirmed = totals.confirmed + totals.unsubscribed

    return respond(200, {
      generatedAt: new Date().toISOString(),
      totals: { ...totals, allTimeSignups: totalSignups },
      rates: {
        confirmationRate: totalSignups ? +(everConfirmed / totalSignups * 100).toFixed(1) : 0,
        unsubscribeRate: everConfirmed ? +(totals.unsubscribed / everConfirmed * 100).toFixed(1) : 0,
      },
      last30Days: last30,
      signupsByMonth: Object.fromEntries(Object.entries(signupsByMonth).sort()),
      confirmedByMonth: Object.fromEntries(Object.entries(confirmedByMonth).sort()),
      sources,
      issues: await listIssues().catch(() => []),
      telemetryPolicy: 'Aggregate counts only. ODIPA does not use open tracking, click tracking, or any per-subscriber telemetry.',
    })
  } catch (err) {
    context.log.error('newsletter-stats error:', err.message)
    return respond(500, { error: 'Stats failed' })
  }
}
