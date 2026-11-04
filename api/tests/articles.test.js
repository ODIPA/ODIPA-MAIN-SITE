/**
 * Articles: parsing, publishing rules, public vs admin access, and the email send.
 * Run with  node tests/articles.test.js
 * No network. Azure Tables and the mailer are replaced with fakes.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.NEWSLETTER_ADMIN_KEY = 'k'
process.env.SUBSCRIBERS_TABLE_CONNECTION = 'fake'
process.env.NEWSLETTER_TOKEN_SECRET = 's'

const tables = new Map() // 'partition|row' -> entity
const sent = []
let failTo = ''
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (req === '@azure/data-tables') return { TableClient: { fromConnectionString: () => ({
    createTable: async () => {},
    getEntity: async (p, r) => { const e = tables.get(`${p}|${r}`); if (!e) throw new Error('404'); return Object.assign({}, e) },
    listEntities: ({ queryOptions }) => {
      const part = /PartitionKey eq '([^']+)'/.exec(queryOptions.filter)[1]
      const status = /status eq '([^']+)'/.exec(queryOptions.filter)
      const rows = [...tables.values()].filter(e => e.partitionKey === part && (!status || e.status === status[1]))
      return (async function* () { for (const r of rows) yield Object.assign({}, r) })()
    },
    upsertEntity: async (e, mode) => { const k = `${e.partitionKey}|${e.rowKey}`; tables.set(k, mode === 'Merge' ? Object.assign({}, tables.get(k) || {}, e) : Object.assign({}, e)) },
    deleteEntity: async (p, r) => { tables.delete(`${p}|${r}`) },
  }) } }
  if (/_shared\/mailer$/.test(req)) {
    const real = oL.call(this, req, parent, ...rest)
    return Object.assign({}, real, { sendHtmlEmail: async m => { if (failTo && m.to === failTo) throw new Error('bounce'); sent.push(m) } })
  }
  return oL.call(this, req, parent, ...rest)
}

const A = require(path.join(api, '_shared/articles.js'))
const articles = require(path.join(api, 'articles/index.js'))
const send = require(path.join(api, 'articles-send/index.js'))
const call = async (fn, method, { query, body, key } = {}) => {
  const c = { log: { error() {}, warn() {} } }
  await fn(c, { method, query: query || {}, body, headers: key === undefined ? {} : { 'x-admin-key': key } })
  const res = c.res
  return { status: res.status, body: typeof res.body === 'string' ? JSON.parse(res.body) : res.body, headers: res.headers }
}

;(async () => {
  // Parsing: headings, paragraphs, lists, links; HTML stays text; bad links stay text.
  const blocks = A.parseBody('Intro line one\nline two\n\n## Steps\n1. Use [the portal](https://www.sos.ca.gov/x) first\n2. Then <b>wait</b>\n\n- bullet [bad](javascript:alert(1))\n\nEnd')
  assert.deepStrictEqual(blocks.map(b => b.t), ['p', 'h', 'ol', 'ul', 'p'])
  assert.strictEqual(blocks[0].parts[0].text, 'Intro line one line two')
  assert.strictEqual(blocks[2].items[0][1].href, 'https://www.sos.ca.gov/x')
  const html = A.blocksToHtml(blocks)
  assert(!/<b>/.test(html) && html.includes('&lt;b&gt;wait'), 'raw HTML is escaped')
  assert(!/javascript:/.test(html.replace('[bad](javascript:alert(1))', '')) || !/href="javascript/.test(html), 'unsafe links are not made into links')
  assert(!/href="javascript/.test(html))
  assert.deepStrictEqual(A.parseSources('Secretary of State | https://www.sos.ca.gov/a\nbad | http://nope\nno link'), [{ label: 'Secretary of State', href: 'https://www.sos.ca.gov/a' }])
  assert.strictEqual(A.slugify('Your Vote Is Private. Is Your Voter Data?'), 'your-vote-is-private-is-your-voter-data')

  const good = { title: 'Your Vote Is Private', summary: 'What campaigns can see.', author: 'A Writer', body: 'One.\n\nTwo.', sources: 'SOS | https://www.sos.ca.gov/a' }

  // Access: anonymous and wrong keys cannot write or see drafts.
  let r = await call(articles, 'POST', { body: Object.assign({ action: 'save' }, good) })
  assert.strictEqual(r.status, 401, 'saving needs the admin key')
  r = await call(articles, 'POST', { key: 'wrong', body: Object.assign({ action: 'save' }, good) })
  assert.strictEqual(r.status, 401)

  r = await call(articles, 'POST', { key: 'k', body: Object.assign({ action: 'save' }, good) })
  assert.strictEqual(r.status, 200)
  const slug = r.body.slug
  assert.strictEqual(slug, 'your-vote-is-private')
  r = await call(articles, 'POST', { key: 'k', body: Object.assign({ action: 'save' }, good) })
  assert.strictEqual(r.body.slug, 'your-vote-is-private-2', 'a second article with the same title gets its own address')

  // A draft is invisible to the public.
  r = await call(articles, 'GET', { query: { slug } })
  assert.strictEqual(r.status, 404, 'drafts are not public')
  r = await call(articles, 'GET', {})
  assert.deepStrictEqual(r.body.articles, [])
  r = await call(articles, 'GET', { query: { all: '1' } })
  assert.deepStrictEqual(r.body.articles, [], 'anonymous ?all=1 does not list drafts')
  r = await call(articles, 'GET', { key: 'k', query: { all: '1' } })
  assert.strictEqual(r.body.articles.length, 2, 'the admin sees drafts')
  r = await call(articles, 'GET', { key: 'k', query: { slug } })
  assert.strictEqual(r.body.article.body, good.body, 'the admin gets the editable text')

  // Publishing rules.
  await call(articles, 'POST', { key: 'k', body: Object.assign({ action: 'save', slug }, good, { author: '', sources: '' }) })
  r = await call(articles, 'POST', { key: 'k', body: { action: 'publish', slug } })
  assert.strictEqual(r.status, 400)
  assert(r.body.problems.length >= 2, 'it says what is missing')
  r = await call(articles, 'POST', { key: 'k', body: Object.assign({ action: 'save', slug }, good, { body: 'One — two.\n\nThree.' }) })
  r = await call(articles, 'POST', { key: 'k', body: { action: 'publish', slug } })
  assert(r.body.problems.some(p => /em dash/.test(p)), 'em dashes block publishing')
  await call(articles, 'POST', { key: 'k', body: Object.assign({ action: 'save', slug }, good) })

  // Sending needs a published article.
  r = await call(send, 'POST', { key: 'k', body: { slug, testTo: 'me@example.com' } })
  assert.strictEqual(r.status, 400, 'a draft cannot be emailed')

  r = await call(articles, 'POST', { key: 'k', body: { action: 'publish', slug } })
  assert.strictEqual(r.status, 200)
  r = await call(articles, 'GET', {})
  assert.strictEqual(r.body.articles.length, 1)
  assert(!('blocks' in r.body.articles[0]) && !('body' in r.body.articles[0]), 'the list carries no body')
  r = await call(articles, 'GET', { query: { slug } })
  assert.strictEqual(r.status, 200)
  assert(r.body.article.blocks.length === 2 && r.body.article.sources.length === 1)
  assert(!('body' in r.body.article), 'the public gets parsed blocks, not the draft source')

  // A live article cannot be edited into one that breaks the publishing rules.
  r = await call(articles, 'POST', { key: 'k', body: Object.assign({ action: 'save', slug }, good, { author: '' }) })
  assert.strictEqual(r.status, 400, 'editing a published article still checks the rules')
  r = await call(articles, 'GET', { query: { slug } })
  assert.strictEqual(r.body.article.author, good.author, 'the live article is unchanged')

  // A long title whose cut point lands on a hyphen still gets a valid suffixed address.
  const longTitle = 'a'.repeat(54) + ' bcdefghij'
  r = await call(articles, 'POST', { key: 'k', body: Object.assign({ action: 'save' }, good, { title: longTitle }) })
  r = await call(articles, 'POST', { key: 'k', body: Object.assign({ action: 'save' }, good, { title: longTitle }) })
  assert(A.validSlug(r.body.slug), 'the suffixed address is valid: ' + r.body.slug)
  await call(articles, 'POST', { key: 'k', body: { action: 'delete', slug: r.body.slug } })

  // Email: test, full, no double send, counts only.
  const sub = e => tables.set(`sub|${e}`, { partitionKey: 'sub', rowKey: e, email: e, status: 'confirmed' })
  sub('a@example.com'); sub('b@example.com'); sub('c@example.com')
  tables.set('sub|p', { partitionKey: 'sub', rowKey: 'p', email: 'p@example.com', status: 'pending' })

  r = await call(send, 'POST', { body: { slug } })
  assert.strictEqual(r.status, 401)
  r = await call(send, 'POST', { key: 'k', body: { slug, testTo: 'me@example.com' } })
  assert.strictEqual(r.body.mode, 'test')
  assert(/^\[TEST\]/.test(sent[0].subject) && sent[0].html.includes('/articles?a=your-vote-is-private'))
  assert(sent[0].html.includes('ODIPA ARTICLE') && /unsubscribe/i.test(sent[0].html), 'wrapped with the article label and an unsubscribe line')
  assert(!sent[0].html.includes('One.'), 'the email carries the summary, not the full text')

  sent.length = 0; failTo = 'b@example.com'
  r = await call(send, 'POST', { key: 'k', body: { slug } })
  assert.deepStrictEqual([r.body.sent, r.body.failed, r.body.total], [2, 1, 3], 'only confirmed subscribers, failures counted')
  assert(!JSON.stringify(r.body).includes('b@example.com'), 'no address in the response')
  assert(!sent.some(m => m.to === 'p@example.com'), 'pending people get nothing')
  failTo = ''
  r = await call(send, 'POST', { key: 'k', body: { slug } })
  assert.strictEqual(r.status, 409, 'a second full send is refused')
  sent.length = 0
  r = await call(send, 'POST', { key: 'k', body: { slug, resend: true } })
  assert.strictEqual(r.body.sent, 3, 'resend works when asked')

  // Unpublish hides it again; delete removes it.
  await call(articles, 'POST', { key: 'k', body: { action: 'unpublish', slug } })
  r = await call(articles, 'GET', { query: { slug } })
  assert.strictEqual(r.status, 404)
  r = await call(articles, 'POST', { key: 'k', body: { action: 'delete', slug } })
  r = await call(articles, 'GET', { key: 'k', query: { slug } })
  assert.strictEqual(r.status, 404)

  console.log('articles tests passed')
})().catch(e => { console.error(e); process.exit(1) })
