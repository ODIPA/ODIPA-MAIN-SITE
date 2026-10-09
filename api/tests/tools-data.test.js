/**
 * Shared directory data. Run with  node tests/tools-data.test.js
 * Guards the one file that both the site and the newsletter generator read.
 */
const path = require('path'), assert = require('assert'), fs = require('fs')
const api = path.join(__dirname, '..')
const data = require(path.join(api, '_shared/tools.json'))

let pass = 0, fail = 0
function t(label, fn) { try { fn(); console.log('  PASS', label); pass++ } catch (e) { console.log('  FAIL', label, '\n      ', e.message.split('\n')[0]); fail++ } }

console.log('\nshared tool data')
t('every entry has the fields the directory card needs', () => {
  const need = ['id', 'name', 'tagline', 'desc', 'category', 'author', 'authorHandle', 'lang', 'platform', 'license', 'github', 'docs', 'tags']
  for (const tool of [...data.approved, ...data.communityProjects])
    for (const k of need) assert(tool[k] !== undefined && tool[k] !== '', `${tool.id} missing ${k}`)
})
t('ids are unique across both lists', () => {
  const ids = [...data.approved, ...data.communityProjects].map(x => x.id)
  assert.strictEqual(new Set(ids).size, ids.length)
})
t('approved tools carry an approval date, community projects carry needs-help and a contribute link', () => {
  for (const x of data.approved) assert(x.approvedDate && x.status !== 'needs-help', x.id)
  for (const x of data.communityProjects) assert(x.status === 'needs-help' && x.contribute, x.id)
})
t('approved tools from outside authors are marked community and pin a reviewed commit', () => {
  for (const x of data.approved.filter(x => !/github\.com\/odipa\//i.test(x.github)))
    assert(x.maintainer === 'community' && /^[0-9a-f]{7,}$/.test(x.reviewedCommit || ''), x.id)
})
t('every github link is a repository url', () => {
  for (const x of [...data.approved, ...data.communityProjects])
    assert(/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(x.github), x.github)
})
t('the newsletter generator catalog is exactly the approved list, and nothing from community projects', () => {
  const src = fs.readFileSync(path.join(api, 'newsletter-generate/index.js'), 'utf8')
  assert(/require\('\.\.\/_shared\/tools\.json'\)/.test(src), 'generator must read the shared file')
  assert(!/const TOOL_CATALOG = \[/.test(src), 'no hand-typed catalog may remain')
  // Rebuild the catalog the way the generator does and compare.
  const cat = data.approved.filter(x => x.status !== 'needs-help').map(x => x.name)
  assert(cat.includes('HOL Guard'), 'a newly approved tool must be eligible without editing the generator')
  for (const c of data.communityProjects) assert(!cat.includes(c.name), 'community projects must never be recommended')
})
t('no em dashes in any text the public sees', () => {
  for (const x of [...data.approved, ...data.communityProjects])
    for (const k of ['name', 'tagline', 'desc', 'reviewScope']) assert(!/—/.test(x[k] || ''), `${x.id}.${k}`)
})

console.log(`\nResults  ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
