/**
 * ODIPA Newsletter Archive, GET /api/newsletter-archive
 * Public, no auth. Returns sent digest issues for the archive page.
 * Issues contain only the published digest body, never subscriber data.
 */
const { TableClient } = require('@azure/data-tables')

module.exports = async function handler(context, req) {
  const respond = (status, body) => {
    context.res = { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }, body }
  }
  try {
    const conn = process.env.SUBSCRIBERS_TABLE_CONNECTION || process.env.AzureWebJobsStorage
    const client = TableClient.fromConnectionString(conn, 'subscribers')
    const issues = []
    try {
      const iter = client.listEntities({ queryOptions: { filter: "PartitionKey eq 'issue'" } })
      for await (const ent of iter) {
        issues.push({ subject: ent.subject, sentAt: ent.sentAt, html: ent.html })
      }
    } catch (e) { /* table may not exist yet */ }
    issues.sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)))
    return respond(200, { issues })
  } catch (err) {
    context.log.error('newsletter-archive error:', err.message)
    return respond(500, { error: 'Archive unavailable' })
  }
}
