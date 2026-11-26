/**
 * The board form once never sent the first and last name the API requires, so
 * every application was rejected. This test builds its request from the keys the
 * form really sends, so the two cannot drift apart again.
 * Azure email and storage are faked.
 */
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const api = path.join(__dirname, '..')
const stub = (file, exports) => {
  const full = require.resolve(path.join(api, file))
  require.cache[full] = { id: full, filename: full, loaded: true, exports }
}

const sent = [], saved = []
const mailer = require(path.join(api, '_shared/mailer'))
stub('_shared/mailer', Object.assign({}, mailer, { sendFormEmail: async m => { sent.push(m) } }))
stub('_shared/formAck', { sendAck: async () => {}, saveToPipeline: async (c, e) => { saved.push(e) } })
const handler = require(path.join(api, 'board-apply'))
const { resetRateLimits } = require(path.join(api, '_shared/rateLimiter'))

const source = fs.readFileSync(path.join(api, '..', 'components/BoardApplicationForm.tsx'), 'utf8')
const block = source.match(/body: JSON\.stringify\(\{([\s\S]*?)\n\s*\}\),/)
assert(block, 'could not find the request body in BoardApplicationForm.tsx')
const keys = [...block[1].matchAll(/^\s*(?:'([^']+)'|(_\w+)):/gm)].map(m => m[1] || m[2])

const values = {
  _hp: '', 'First Name': 'Test', 'Last Name': 'Person', Name: 'Test Person',
  Email: 'test@example.com', 'Position Applied': 'Director, Technology', Consented: 'Yes',
}
const formBody = () => Object.fromEntries(keys.map(k => [k, k in values ? values[k] : 'x']))

async function post(body) {
  resetRateLimits()
  sent.length = 0
  saved.length = 0
  const log = Object.assign(() => {}, { warn() {}, error() {} })
  const context = { log }
  await handler(context, { method: 'POST', headers: {}, body })
  return context.res
}

let passed = 0, failed = 0
async function t(name, fn) {
  try { await fn(); passed++; console.log('  ok   ' + name) }
  catch (e) { failed++; console.log('  FAIL ' + name + ': ' + e.message) }
}

;(async () => {
  await t('a request with the fields the form sends is accepted, emailed and saved', async () => {
    const res = await post(formBody())
    assert.strictEqual(res.status, 200, res.body)
    assert.strictEqual(sent.length, 1)
    assert.strictEqual(sent[0].to, 'board@odipa.org')
    assert.strictEqual(saved.length, 1)
    assert.strictEqual(saved[0].topic, 'board')
  })

  await t('the form sends first and last name separately', async () => {
    assert(keys.includes('First Name') && keys.includes('Last Name'), keys.join(', '))
  })

  await t('an already open page that only sends Name is accepted', async () => {
    const body = formBody()
    delete body['First Name']
    delete body['Last Name']
    body.Name = 'Test van Person'
    const res = await post(body)
    assert.strictEqual(res.status, 200, res.body)
    assert(sent[0].subject.endsWith('Test van Person'), sent[0].subject)
  })

  await t('a request with no name is still rejected', async () => {
    const body = formBody()
    delete body['First Name']
    delete body['Last Name']
    delete body.Name
    const res = await post(body)
    assert.strictEqual(res.status, 400)
    assert.strictEqual(sent.length, 0)
  })

  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed ? 1 : 0)
})()
