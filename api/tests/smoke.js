/**
 * ODIPA API Smoke Tests
 * Run with: node tests/smoke.js
 * Requires: func start running on port 7071
 *
 * Tests all 6 endpoints for:
 * - CORS preflight (OPTIONS) → 200
 * - Missing required fields → 400
 * - Valid payload → depends on SMTP config (200 if SMTP set, 500 if not)
 */

const BASE = 'http://localhost:7071/api'

const PASS  = '\x1b[32m✓\x1b[0m'
const FAIL  = '\x1b[31m✗\x1b[0m'
const WARN  = '\x1b[33m⚠\x1b[0m'

let passed = 0, failed = 0

async function test(label, fn) {
  try {
    await fn()
    console.log(`  ${PASS} ${label}`)
    passed++
  } catch (e) {
    console.log(`  ${FAIL} ${label}: ${e.message}`)
    failed++
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg)
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, body: json, headers: res.headers }
}

async function options(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:3000' },
  })
  return { status: res.status, headers: res.headers }
}

async function run() {
  console.log('\n\x1b[1mODIPA API Smoke Tests\x1b[0m')
  console.log('Target:', BASE)
  console.log('─'.repeat(50))

  // ── /api/contact ──────────────────────────────────────
  console.log('\n/api/contact')
  await test('OPTIONS preflight → 200', async () => {
    const r = await options('/contact')
    assert(r.status === 200, `Got ${r.status}`)
  })
  await test('Missing name → 400', async () => {
    const r = await post('/contact', { email: 'test@example.com', message: 'hello world test' })
    assert(r.status === 400, `Got ${r.status}`)
  })
  await test('Invalid email → 400', async () => {
    const r = await post('/contact', { name: 'Test', email: 'notanemail', message: 'hello world test' })
    assert(r.status === 400, `Got ${r.status}`)
  })
  await test('Short message → 400', async () => {
    const r = await post('/contact', { name: 'Test', email: 'test@example.com', message: 'hi' })
    assert(r.status === 400, `Got ${r.status}`)
  })
  await test('Valid payload → 200 or 500 (500 = SMTP not configured)', async () => {
    const r = await post('/contact', {
      topic: 'general', name: 'Test User', email: 'test@example.com',
      message: 'This is a test message from the smoke test suite.',
    })
    assert(r.status === 200 || r.status === 500, `Got unexpected ${r.status}`)
    if (r.status === 500) console.log(`    ${WARN}  SMTP not configured — email send failed (expected in dev)`)
  })

  // ── /api/newsletter ───────────────────────────────────
  console.log('\n/api/newsletter')
  await test('OPTIONS preflight → 200', async () => {
    const r = await options('/newsletter')
    assert(r.status === 200, `Got ${r.status}`)
  })
  await test('Missing email → 400', async () => {
    const r = await post('/newsletter', { name: 'Test' })
    assert(r.status === 400, `Got ${r.status}`)
  })
  await test('Invalid email → 400', async () => {
    const r = await post('/newsletter', { email: 'bademail' })
    assert(r.status === 400, `Got ${r.status}`)
  })
  await test('Valid payload → 200 or 500', async () => {
    const r = await post('/newsletter', { email: 'test@example.com', name: 'Test', source: 'smoke-test' })
    assert(r.status === 200 || r.status === 500, `Got unexpected ${r.status}`)
  })

  // ── /api/sponsor ──────────────────────────────────────
  console.log('\n/api/sponsor')
  await test('OPTIONS preflight → 200', async () => {
    const r = await options('/sponsor')
    assert(r.status === 200, `Got ${r.status}`)
  })
  await test('Missing org name → 400', async () => {
    const r = await post('/sponsor', { contactName: 'Test', email: 'test@example.com' })
    assert(r.status === 400, `Got ${r.status}`)
  })
  await test('Valid payload → 200 or 500', async () => {
    const r = await post('/sponsor', {
      contactName: 'Jane Smith', email: 'jane@example.com',
      orgName: 'Test Corp', tier: 'Community Sponsor',
    })
    assert(r.status === 200 || r.status === 500, `Got unexpected ${r.status}`)
  })

  // ── /api/sponsor-research ─────────────────────────────
  console.log('\n/api/sponsor-research')
  await test('OPTIONS preflight → 200', async () => {
    const r = await options('/sponsor-research')
    assert(r.status === 200, `Got ${r.status}`)
  })
  await test('Missing tier → 400', async () => {
    const r = await post('/sponsor-research', {
      contactName: 'Test', email: 'test@example.com', orgName: 'Test Corp',
    })
    assert(r.status === 400, `Got ${r.status}`)
  })
  await test('Valid payload → 200 or 500', async () => {
    const r = await post('/sponsor-research', {
      contactName: 'Jane Smith', email: 'jane@example.com',
      orgName: 'Test Corp', tier: 'Research Brief',
      researchTopic: 'Privacy implications of large language models',
    })
    assert(r.status === 200 || r.status === 500, `Got unexpected ${r.status}`)
  })

  // ── /api/board-apply ──────────────────────────────────
  console.log('\n/api/board-apply')
  await test('OPTIONS preflight → 200', async () => {
    const r = await options('/board-apply')
    assert(r.status === 200, `Got ${r.status}`)
  })
  await test('Missing last name → 400', async () => {
    const r = await post('/board-apply', {
      firstName: 'Jane', email: 'jane@example.com',
      'Position Applied': 'General Board Seat',
    })
    assert(r.status === 400, `Got ${r.status}`)
  })
  await test('Valid payload → 200 or 500', async () => {
    const r = await post('/board-apply', {
      firstName: 'Jane', lastName: 'Smith',
      email: 'jane@example.com', phone: '555-000-0000',
      'Position Applied': 'General Board Seat',
      currentRole: 'Privacy Attorney', currentOrg: 'Test Law LLP',
      city: 'Los Angeles',
      expertise: ['Legal', 'Privacy Law'],
      whyInterested: 'I care deeply about digital privacy rights.',
      relevantExperience: '10 years in privacy law.',
      privacyVision: 'Stronger consumer protections.',
      commitment: '5-10 hours per month',
      conflict: 'None',
      references: 'Available upon request',
    })
    assert(r.status === 200 || r.status === 500, `Got unexpected ${r.status}`)
  })

  // ── /api/tool-submit ──────────────────────────────────
  console.log('\n/api/tool-submit')
  await test('OPTIONS preflight → 200', async () => {
    const r = await options('/tool-submit')
    assert(r.status === 200, `Got ${r.status}`)
  })
  await test('Invalid GitHub URL → 400', async () => {
    const r = await post('/tool-submit', {
      'Tool Name': 'Test Tool', 'Contributor Email': 'test@example.com',
      'GitHub URL': 'https://gitlab.com/test/repo',
    })
    assert(r.status === 400, `Got ${r.status}`)
  })
  await test('Valid payload → 200 or 500', async () => {
    const r = await post('/tool-submit', {
      'Tool Name': 'Test Privacy Tool',
      'Contributor Email': 'dev@example.com',
      'Contributor Name': 'Dev User',
      'GitHub URL': 'https://github.com/example/test-tool',
      'Description': 'A tool that helps users manage privacy settings.',
      'Category': 'Consumer Tools',
      'Language': 'Python',
    })
    assert(r.status === 200 || r.status === 500, `Got unexpected ${r.status}`)
  })

  // ── Summary ───────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log(`Results: ${PASS} ${passed} passed  ${failed > 0 ? FAIL : ''}${failed > 0 ? ` ${failed} failed` : ''}`)
  if (failed > 0) process.exit(1)
}

run().catch(e => {
  console.error('Smoke test runner failed:', e.message)
  process.exit(1)
})
