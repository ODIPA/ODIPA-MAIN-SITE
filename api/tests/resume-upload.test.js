/**
 * Volunteer resume upload. Run with  node tests/resume-upload.test.js
 * No network. Azure Blob Storage, the mailer and the inquiry store are replaced
 * with in-memory fakes. ODIPA code is real.
 */
const path = require('path'), Module = require('module'), assert = require('assert')
const api = path.join(__dirname, '..')
process.env.NEWSLETTER_ADMIN_KEY = 'k'
process.env.SUBSCRIBERS_TABLE_CONNECTION = 'UseDevelopmentStorage=true'

// ---- Fakes ---------------------------------------------------------------
const blobs = new Map()          // blobName -> { buffer, headers }
let blobFail = false
const emails = [], acks = [], saved = []
let saveFail = false
const inquiryRows = {}           // id -> row, for the admin endpoints
const fakeBlobService = {
  getContainerClient: () => ({
    createIfNotExists: async () => { if (blobFail) throw new Error('storage down') },
    getBlockBlobClient: name => ({
      uploadData: async (buffer, opts) => { blobs.set(name, { buffer, headers: opts.blobHTTPHeaders }) },
      downloadToBuffer: async () => {
        if (!blobs.has(name)) { const e = new Error('gone'); e.statusCode = 404; throw e }
        return blobs.get(name).buffer
      },
      deleteIfExists: async () => { blobs.delete(name) },
    }),
  }),
}
const oL = Module._load
Module._load = function (req, parent, ...rest) {
  if (req === '@azure/storage-blob') return { BlobServiceClient: { fromConnectionString: () => fakeBlobService } }
  if (/_shared\/mailer$/.test(req)) return {
    sendFormEmail: async m => { emails.push(m) },
    sendHtmlEmail: async m => { acks.push(m) },
    respond: (c, status, body) => { c.res = { status, body } },
    clean: (v, max = 2000) => (v == null ? '' : String(v).replace(/[<>]/g, '').trim().slice(0, max)),
  }
  if (/_shared\/inquiries$/.test(req)) return {
    saveInquiry: async r => { if (saveFail) throw new Error('table down'); saved.push(r); return 'id1' },
    getInquiry: async id => inquiryRows[id],
    updateInquiry: async (id, patch) => { Object.assign(inquiryRows[id], patch) },
    listInquiries: async () => Object.entries(inquiryRows).map(([rowKey, r]) => ({ rowKey, ...r })),
  }
  return oL.call(this, req, parent, ...rest)
}

const store = require(path.join(api, '_shared/resumeStore.js'))
const { parseVolunteerApplication } = require(path.join(api, '_shared/volunteerApplication.js'))
const contact = require(path.join(api, 'contact/index.js'))
const download = require(path.join(api, 'inquiries-resume/index.js'))
const list = require(path.join(api, 'inquiries/index.js'))
const act = require(path.join(api, 'inquiries-act/index.js'))

const b64 = b => b.toString('base64')
const pdf = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.from('resume body '.repeat(50))])
const docx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(200, 1)])
const doc = Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(200, 2)])

const good = {
  why: 'I care about digital privacy and want to help people understand their rights.',
  roles: ['Privacy Researcher'],
  experience: 'Three years of records management and research support in a university.',
  hours: '4 to 6 hours a month',
}
let ipCounter = 0
const post = async body => {
  const c = { log: { warn() {}, error() {} } }
  await contact(c, { method: 'POST', headers: { 'x-forwarded-for': `10.0.0.${++ipCounter}` }, body })
  return c.res
}
const base = { topic: 'volunteer', Name: 'Hope K', Email: 'hope@example.com', Consented: 'Yes' }
const call = async (fn, req) => { const c = { log: { warn() {}, error() {} } }; await fn(c, req); return c.res }
const admin = (query, key = 'k') => ({ method: 'GET', headers: { 'x-admin-key': key }, query })

;(async () => {
  // ---- File checks -------------------------------------------------------
  let v = store.validateResume({ name: 'My CV.pdf', data: b64(pdf) })
  assert(v.file && v.file.ext === 'pdf' && v.file.contentType === 'application/pdf', 'a PDF is accepted')
  assert.strictEqual(v.file.name, 'My CV.pdf')
  assert(store.validateResume({ name: 'a.docx', data: b64(docx) }).file.ext === 'docx', 'a docx is accepted')
  assert(store.validateResume({ name: 'a.doc', data: b64(doc) }).file.ext === 'doc', 'an old Word file is accepted')
  assert(store.validateResume({ name: 'a.pdf', data: 'data:application/pdf;base64,' + b64(pdf) }).file, 'a data URL prefix is tolerated')

  const exe = Buffer.concat([Buffer.from('MZ'), Buffer.alloc(300, 3)])
  assert(store.validateResume({ name: 'resume.pdf', data: b64(exe) }).error, 'a program renamed .pdf is refused, the bytes decide')
  assert(store.validateResume({ name: 'resume.pdf', data: b64(Buffer.from('plain text resume, not a document')) }).error, 'plain text is refused')
  assert(store.validateResume({ name: 'x.pdf', data: '' }).error, 'an empty file is refused')
  assert(store.validateResume({ name: 'x.pdf', data: '***not base64***' }).error, 'junk data is refused')
  assert(store.validateResume(null).error, 'no file object is refused')
  const big = Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(store.MAX_BYTES + 10, 4)])
  assert(/2 MB/.test(store.validateResume({ name: 'x.pdf', data: b64(big) }).error), 'a file over 2 MB is refused')
  const justUnder = Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(store.MAX_BYTES - 5, 4)])
  assert(store.validateResume({ name: 'x.pdf', data: b64(justUnder) }).file, 'a file at exactly the limit is accepted')
  const evilName = store.validateResume({ name: '../../etc/<b>passwd".pdf', data: b64(pdf) }).file.name
  assert(/^[A-Za-z0-9 ._()-]+\.pdf$/.test(evilName) && !evilName.includes('/'), 'the display name is cleaned')

  // ---- Parser: a link, a file, or both -----------------------------------
  assert(/attach your resume/.test(parseVolunteerApplication({ ...good, profileLink: '' }).error), 'one of link or file is required')
  const meta = { name: 'My CV.pdf', label: 'PDF', size: 2048 }
  const withFile = parseVolunteerApplication({ ...good, profileLink: '' }, meta)
  assert(!withFile.error, 'a file alone is enough')
  assert(withFile.message.includes('Resume file: My CV.pdf (PDF, 2 KB)'), 'the message names the file')
  assert(!withFile.message.includes('Resume or profile link'), 'no link line when there is no link')
  const both = parseVolunteerApplication({ ...good, profileLink: 'https://linkedin.com/in/x' }, meta)
  assert(both.message.includes('Resume or profile link: https://linkedin.com/in/x') && both.message.includes('Resume file:'), 'link and file can both be given')

  // ---- Contact flow ------------------------------------------------------
  let r = await post({ ...base, volunteer: { ...good, profileLink: '', resume: { name: 'My CV.pdf', data: b64(pdf) } } })
  assert.strictEqual(r.status, 200, 'an application with a file is accepted')
  assert.strictEqual(blobs.size, 1, 'the file is stored once')
  const [blobName, blob] = [...blobs.entries()][0]
  assert(/^[a-f0-9]{32}\.pdf$/.test(blobName), 'the stored name is random, not the applicant file name')
  assert.strictEqual(blob.headers.blobContentType, 'application/pdf')
  assert.strictEqual(blob.headers.blobContentDisposition, 'attachment', 'stored as a download, never shown inline')
  assert.strictEqual(saved[0].resumeBlob, blobName, 'the inquiry points at the stored file')
  assert.strictEqual(saved[0].resumeName, 'My CV.pdf')
  assert(!saved[0].message.includes(blobName), 'the stored name is not written into the message')
  assert(!JSON.stringify(emails[0]).includes(blobName), 'the team email does not carry the stored name')
  assert(/My CV\.pdf/.test(emails[0].fields['Resume file']), 'the team email says a file was attached')

  const before = blobs.size
  r = await post({ ...base, volunteer: { ...good, profileLink: '', resume: { name: 'x.pdf', data: b64(exe) } } })
  assert.strictEqual(r.status, 400, 'a bad file is refused with a clear message')
  assert.strictEqual(blobs.size, before, 'a bad file is never stored')

  r = await post({ ...base, volunteer: { ...good, profileLink: 'https://linkedin.com/in/x' } })
  assert.strictEqual(r.status, 200, 'a link alone still works')
  assert.strictEqual(saved[saved.length - 1].resumeBlob, '', 'no file means no blob reference')

  const mailsBefore = emails.length
  blobFail = true
  r = await post({ ...base, volunteer: { ...good, profileLink: '', resume: { name: 'My CV.pdf', data: b64(pdf) } } })
  blobFail = false
  assert.strictEqual(r.status, 503, 'if the file cannot be saved the applicant is told')
  assert(/add a link/.test(r.body.error), 'the message offers the link instead')
  assert.strictEqual(emails.length, mailsBefore, 'nothing is emailed for an application that did not fully arrive')

  const blobsBefore = blobs.size
  saveFail = true
  r = await post({ ...base, volunteer: { ...good, profileLink: '', resume: { name: 'My CV.pdf', data: b64(pdf) } } })
  saveFail = false
  assert.strictEqual(r.status, 200, 'the application is still delivered by email')
  assert.strictEqual(blobs.size, blobsBefore, 'an unreferenced file is removed')

  r = await post({ topic: 'press', Name: 'A B', Email: 'a@example.com', Message: 'A question about a story.', volunteer: { resume: { name: 'x.pdf', data: b64(pdf) } } })
  assert.strictEqual(blobs.size, blobsBefore, 'a file sent with a non volunteer topic is ignored')

  // ---- Admin download ----------------------------------------------------
  inquiryRows.a1 = { topic: 'volunteer', name: 'Hope K', email: 'hope@example.com', status: 'acked', receivedAt: 1, resumeBlob: blobName, resumeName: 'My CV.pdf', message: 'm' }
  inquiryRows.a2 = { topic: 'volunteer', name: 'No File', email: 'n@example.com', status: 'acked', receivedAt: 2, resumeBlob: '', resumeName: '', message: 'm' }
  assert.strictEqual((await call(download, admin({ id: 'a1' }, 'wrong'))).status, 401, 'download needs the admin key')
  assert.strictEqual((await call(download, { method: 'GET', headers: {}, query: { id: 'a1' } })).status, 401, 'no key is refused')
  assert.strictEqual((await call(download, admin({}))).status, 400, 'an id is required')
  assert.strictEqual((await call(download, admin({ id: 'a2' }))).status, 404, 'an inquiry with no file has nothing to download')
  assert.strictEqual((await call(download, admin({ id: 'nope' }))).status, 404, 'an unknown inquiry is a 404')
  r = await call(download, admin({ id: 'a1' }))
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.name, 'My CV.pdf')
  assert.strictEqual(r.body.contentType, 'application/pdf')
  assert(Buffer.from(r.body.data, 'base64').equals(pdf), 'the file comes back unchanged')
  blobs.delete(blobName)
  assert.strictEqual((await call(download, admin({ id: 'a1' }))).status, 404, 'a file that is gone is a 404')

  // ---- List never exposes the stored name --------------------------------
  blobs.set(blobName, { buffer: pdf, headers: {} })
  r = await call(list, { method: 'GET', headers: { 'x-admin-key': 'k' }, query: {} })
  const row = r.body.inquiries.find(i => i.id === 'a1')
  assert.deepStrictEqual(row.resume, { name: 'My CV.pdf' }, 'the board sees only the display name')
  assert(!JSON.stringify(r.body).includes(blobName), 'the stored name never leaves the server')
  assert.strictEqual(r.body.inquiries.find(i => i.id === 'a2').resume, null)

  // ---- Dismiss removes the file ------------------------------------------
  r = await call(act, { method: 'POST', headers: { 'x-admin-key': 'k' }, body: { id: 'a1', action: 'dismiss' } })
  assert.strictEqual(r.status, 200)
  assert(!blobs.has(blobName), 'dismissing deletes the resume file')
  assert.strictEqual(inquiryRows.a1.resumeBlob, '', 'and the reference is cleared')

  // ---- Source hygiene ----------------------------------------------------
  const fs = require('fs')
  for (const f of ['_shared/resumeStore.js', 'inquiries-resume/index.js', '_shared/volunteerApplication.js'])
    assert(!/[—–]/.test(fs.readFileSync(path.join(api, f), 'utf8')), `no em or en dashes in ${f}`)

  console.log('resume-upload: all checks passed')
})().catch(e => { console.error(e); process.exit(1) })
