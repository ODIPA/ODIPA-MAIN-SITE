/**
 * The shared admin key check. Run with  node tests/admin-auth.test.js
 * No network. Checks the helper directly, then that no endpoint has gone back to a
 * plain comparison of the key.
 */
const path = require('path'), fs = require('fs'), assert = require('assert')
const api = path.join(__dirname, '..')
const { isAdminRequest } = require(path.join(api, '_shared/adminAuth.js'))
const viaSubscriberHelper = require(path.join(api, '_shared/subscriberAdmin.js')).isAdminRequest

const req = key => ({ headers: key === undefined ? {} : { 'x-admin-key': key } })

process.env.NEWSLETTER_ADMIN_KEY = 'correct-horse-battery'
assert.strictEqual(isAdminRequest(req('correct-horse-battery')), true, 'the right key is accepted')
assert.strictEqual(isAdminRequest(req('wrong-horse-battery!')), false, 'a wrong key of the same length is refused')
assert.strictEqual(isAdminRequest(req('short')), false, 'a key of a different length is refused')
assert.strictEqual(isAdminRequest(req('correct-horse-battery-and-more')), false, 'a longer key is refused')
assert.strictEqual(isAdminRequest(req('')), false, 'an empty header is refused')
assert.strictEqual(isAdminRequest(req()), false, 'a missing header is refused')
assert.strictEqual(isAdminRequest({ headers: { 'x-admin-key': ['correct-horse-battery'] } }), false, 'a repeated header is refused')
assert.strictEqual(isAdminRequest({}), false, 'a request with no headers is refused')
assert.strictEqual(isAdminRequest(null), false, 'no request is refused')
assert.strictEqual(viaSubscriberHelper(req('correct-horse-battery')), true, 'the subscriber helper uses the same check')

delete process.env.NEWSLETTER_ADMIN_KEY
assert.strictEqual(isAdminRequest(req('anything')), false, 'with no key configured nobody gets in')
assert.strictEqual(isAdminRequest(req('')), false, 'and an empty header does not match an unset key')
process.env.NEWSLETTER_ADMIN_KEY = ''
assert.strictEqual(isAdminRequest(req('')), false, 'an empty configured key is not a key')

// Every endpoint must go through the helper. Any direct read of the header
// counts, whatever the comparison (== , !=, reversed order, or a variable).
const offenders = []
for (const dir of fs.readdirSync(api)) {
  const f = path.join(api, dir, 'index.js')
  if (!fs.existsSync(f)) continue
  const src = fs.readFileSync(f, 'utf8')
  if (/headers\s*\[\s*['"`]x-admin-key['"`]\s*\]/i.test(src)) offenders.push(dir)
}
assert.deepStrictEqual(offenders, [], `these endpoints compare the admin key directly: ${offenders.join(', ')}`)

console.log('admin-auth: all checks passed')
