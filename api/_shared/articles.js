/**
 * ODIPA articles: ad hoc pieces that sit apart from the Monthly Digest and the
 * Research Releases. Stored in the same Azure table as the newsletter, under
 * partition 'article'. No third party stores anything.
 *
 * An article is written in a small plain format, parsed here once so the site,
 * the preview and the email all agree:
 *   ## Heading
 *   A paragraph. Blank lines separate paragraphs.
 *   1. Numbered item        - Bullet item
 *   [link text](https://example.org) is the only inline markup.
 * Everything is escaped. Raw HTML in the text is shown as text, never run.
 */
const { TableClient } = require('@azure/data-tables')

const TABLE = 'subscribers'
const PARTITION = 'article'
const LIMITS = { title: 160, summary: 400, author: 120, body: 20000, sources: 3000 }

function getTable() {
  const conn = process.env.SUBSCRIBERS_TABLE_CONNECTION || process.env.AzureWebJobsStorage
  if (!conn) throw new Error('SUBSCRIBERS_TABLE_CONNECTION is not set.')
  return TableClient.fromConnectionString(conn, TABLE)
}

async function ensureTable(client) {
  try { await client.createTable() } catch (e) { /* already exists */ }
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Only plain web links. No javascript:, data: or relative links. */
function safeUrl(u) {
  const url = String(u || '').trim()
  return /^https:\/\/[^\s<>"']+$/i.test(url) ? url : ''
}

function slugify(title) {
  return String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '')
}
const validSlug = s => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(s || '')) && String(s).length <= 60

/** Split a line into text and link parts. */
function inline(text) {
  const parts = []
  const re = /\[([^\]\n]{1,200})\]\(([^)\s]{1,500})\)/g
  let last = 0, m
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) })
    const href = safeUrl(m[2])
    parts.push(href ? { text: m[1], href } : { text: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}

/** Article text to blocks: {t:'h'|'p'|'ol'|'ul', ...}. */
function parseBody(source) {
  const blocks = []
  let para = [], list = null
  const flushPara = () => { if (para.length) { blocks.push({ t: 'p', parts: inline(para.join(' ')) }); para = [] } }
  const flushList = () => { if (list) { blocks.push(list); list = null } }
  for (const raw of String(source || '').replace(/\r/g, '').split('\n')) {
    const line = raw.trim()
    if (!line) { flushPara(); flushList(); continue }
    let m
    if ((m = line.match(/^##\s+(.+)$/))) { flushPara(); flushList(); blocks.push({ t: 'h', text: m[1].trim() }); continue }
    if ((m = line.match(/^(\d{1,2})[.)]\s+(.+)$/))) {
      flushPara()
      if (!list || list.t !== 'ol') { flushList(); list = { t: 'ol', items: [] } }
      list.items.push(inline(m[2])); continue
    }
    if ((m = line.match(/^[-*]\s+(.+)$/))) {
      flushPara()
      if (!list || list.t !== 'ul') { flushList(); list = { t: 'ul', items: [] } }
      list.items.push(inline(m[1])); continue
    }
    // A continuation line of a list item stays with that item.
    if (list) { const items = list.items; items[items.length - 1] = items[items.length - 1].concat(inline(' ' + line)); continue }
    para.push(line)
  }
  flushPara(); flushList()
  return blocks
}

/** One source per line: "Label | https://link". */
function parseSources(source) {
  const out = []
  for (const raw of String(source || '').replace(/\r/g, '').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const i = line.lastIndexOf('|')
    const label = (i > -1 ? line.slice(0, i) : line).trim().slice(0, 200)
    const href = safeUrl(i > -1 ? line.slice(i + 1) : '')
    if (label && href) out.push({ label, href })
  }
  return out
}

const partsHtml = parts => parts.map(p => p.href ? `<a href="${esc(p.href)}" style="color:#B98A2E">${esc(p.text)}</a>` : esc(p.text)).join('')

/** Blocks to email safe HTML, same look as the digest. */
function blocksToHtml(blocks) {
  return blocks.map(b => {
    if (b.t === 'h') return `<h2 style="color:#0B1F3A;font-size:19px;border-bottom:2px solid #B98A2E;padding-bottom:6px;margin-top:28px">${esc(b.text)}</h2>`
    if (b.t === 'p') return `<p style="font-size:14px;line-height:1.7;color:#1C2536">${partsHtml(b.parts)}</p>`
    const tag = b.t === 'ol' ? 'ol' : 'ul'
    return `<${tag} style="font-size:14px;line-height:1.7;color:#1C2536">${b.items.map(i => `<li>${partsHtml(i)}</li>`).join('')}</${tag}>`
  }).join('\n')
}

/**
 * Check the fields. Returns {error} or {value}. Text is kept as typed and is
 * escaped wherever it is shown, so tags typed into a field appear as text.
 */
function validateFields(input) {
  const f = input || {}
  // One line fields: line breaks become spaces, so the title is safe as an email subject.
  const line = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max)
  const title = line(f.title, LIMITS.title)
  if (!title) return { error: 'A title is required.' }
  const summary = line(f.summary, LIMITS.summary)
  const author = line(f.author, LIMITS.author)
  const body = String(f.body || '').slice(0, LIMITS.body)
  const sources = String(f.sources || '').slice(0, LIMITS.sources)
  return { value: { title, summary, author, body, sources } }
}

/** What must be true before the public can see it. */
function publishProblems(a) {
  const problems = []
  if (!a.author) problems.push('Add an author name.')
  if (!a.summary) problems.push('Add a one or two sentence summary.')
  if (parseBody(a.body).filter(b => b.t === 'p').length < 2) problems.push('The article needs at least two paragraphs.')
  if (parseSources(a.sources).length < 1) problems.push('Add at least one source as "Label | https://link".')
  if (/\u2014/.test([a.title, a.summary, a.author, a.body, a.sources].join(' '))) problems.push('Replace the em dashes with commas or full stops.')
  return problems
}

const toPublic = e => ({
  slug: e.rowKey, title: e.title, summary: e.summary, author: e.author, publishedAt: e.publishedAt || '',
})
const toFull = e => Object.assign(toPublic(e), { blocks: JSON.parse(e.blocks || '[]'), sources: parseSources(e.sources) })
const toAdmin = e => ({
  slug: e.rowKey, title: e.title, summary: e.summary, author: e.author, body: e.body, sources: e.sources,
  status: e.status, createdAt: e.createdAt, updatedAt: e.updatedAt, publishedAt: e.publishedAt || '',
  emailedAt: e.emailedAt || '', emailedCount: e.emailedCount || 0,
})

async function getArticle(slug) {
  if (!validSlug(slug)) return null
  const client = getTable()
  await ensureTable(client)
  try { return await client.getEntity(PARTITION, slug) } catch (e) { return null }
}

async function listArticles() {
  const client = getTable()
  await ensureTable(client)
  const out = []
  for await (const ent of client.listEntities({ queryOptions: { filter: `PartitionKey eq '${PARTITION}'` } })) out.push(ent)
  return out.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
}

/** Save fields as a draft, or update an existing article without changing its status. */
async function saveArticle(slug, fields) {
  const client = getTable()
  await ensureTable(client)
  const now = new Date().toISOString()
  const existing = await getArticle(slug)
  const entity = Object.assign({}, existing || {}, fields, {
    partitionKey: PARTITION, rowKey: slug,
    blocks: JSON.stringify(parseBody(fields.body)),
    status: (existing && existing.status) || 'draft',
    createdAt: (existing && existing.createdAt) || now,
    updatedAt: now,
  })
  delete entity.etag; delete entity.timestamp
  await client.upsertEntity(entity, 'Replace')
  return entity
}

async function patchArticle(slug, patch) {
  const client = getTable()
  await client.upsertEntity(Object.assign({ partitionKey: PARTITION, rowKey: slug, updatedAt: new Date().toISOString() }, patch), 'Merge')
}

async function deleteArticle(slug) {
  const client = getTable()
  await client.deleteEntity(PARTITION, slug)
}

module.exports = {
  LIMITS, safeUrl, slugify, validSlug, parseBody, parseSources, blocksToHtml, validateFields, publishProblems,
  toPublic, toFull, toAdmin, getArticle, listArticles, saveArticle, patchArticle, deleteArticle, esc,
}
