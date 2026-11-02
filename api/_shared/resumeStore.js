/**
 * Volunteer resume files, kept in ODIPA's own Azure Blob Storage.
 *
 * - The container is private. Nothing here ever builds a public link. Only the
 *   admin endpoint (x-admin-key) can read a file back.
 * - A file is accepted only if its first bytes match a PDF or Word document.
 *   The browser's own claim about the type is ignored.
 * - Blob names are random. The applicant's file name is kept only as a display
 *   label on the inquiry, cleaned of anything but plain characters.
 * - There is no malware scan here. Files are only ever handed to the admin as a
 *   download, never opened or rendered by the site. Turn on Microsoft Defender
 *   for Storage and a lifecycle rule that deletes old files (see the PR notes).
 *
 * Connection: RESUME_BLOB_CONNECTION, else the same storage account the
 * inquiries already use.
 */
const crypto = require('crypto')

const CONTAINER = 'resumes'
const MAX_BYTES = 2 * 1024 * 1024

const TYPES = {
  pdf:  { contentType: 'application/pdf', label: 'PDF' },
  doc:  { contentType: 'application/msword', label: 'Word' },
  docx: { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word' },
}

/** Which allowed type do these first bytes look like? '' if none. */
function sniff(buf) {
  if (buf.length >= 5 && buf.slice(0, 5).toString('latin1') === '%PDF-') return 'pdf'
  if (buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return 'docx'
  if (buf.length >= 8 && buf.slice(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return 'doc'
  return ''
}

/** A plain display name: letters, numbers, spaces and . _ - ( ) only. */
function cleanName(name, ext) {
  const base = String(name || '').replace(/\.[^.]*$/, '')
  const plain = base.replace(/[^A-Za-z0-9 ._()-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60)
  return `${plain || 'resume'}.${ext}`
}

/**
 * @param {{name?: string, data?: string}} raw  base64 data as sent by the form
 * @returns {{error: string} | {file: {name, ext, contentType, label, size, buffer}}}
 */
function validateResume(raw) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const b64 = typeof r.data === 'string' ? r.data.replace(/^data:[^,]*,/, '') : ''
  if (!b64) return { error: 'The resume file was empty. Please attach it again or add a link instead.' }
  // Check the encoded size before decoding so a huge string is never allocated.
  if (b64.length > Math.ceil(MAX_BYTES * 4 / 3) + 8) return { error: 'The resume file is larger than 2 MB. Please attach a smaller file or add a link instead.' }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) return { error: 'The resume file could not be read. Please attach it again or add a link instead.' }
  const buffer = Buffer.from(b64, 'base64')
  if (!buffer.length) return { error: 'The resume file was empty. Please attach it again or add a link instead.' }
  if (buffer.length > MAX_BYTES) return { error: 'The resume file is larger than 2 MB. Please attach a smaller file or add a link instead.' }
  const ext = sniff(buffer)
  if (!ext) return { error: 'Please attach a PDF or Word document (.pdf, .doc or .docx), or add a link instead.' }
  const { contentType, label } = TYPES[ext]
  return { file: { name: cleanName(r.name, ext), ext, contentType, label, size: buffer.length, buffer } }
}

function container() {
  const conn = process.env.RESUME_BLOB_CONNECTION || process.env.SUBSCRIBERS_TABLE_CONNECTION || process.env.AzureWebJobsStorage
  if (!conn) throw new Error('No storage connection is set for resumes.')
  const { BlobServiceClient } = require('@azure/storage-blob')
  return BlobServiceClient.fromConnectionString(conn).getContainerClient(CONTAINER)
}

/** Store a validated file. Returns the random blob name to keep on the inquiry. */
async function saveResume(file) {
  const c = container()
  await c.createIfNotExists() // private by default, no public access level is set
  const blobName = `${crypto.randomBytes(16).toString('hex')}.${file.ext}`
  await c.getBlockBlobClient(blobName).uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.contentType, blobContentDisposition: 'attachment' },
  })
  return blobName
}

/** Read a stored file back. Returns null if it is gone. */
async function readResume(blobName) {
  if (!/^[a-f0-9]{32}\.(pdf|doc|docx)$/.test(String(blobName || ''))) return null
  try {
    return await container().getBlockBlobClient(blobName).downloadToBuffer()
  } catch (e) {
    if (e && (e.statusCode === 404 || e.code === 'BlobNotFound')) return null
    throw e
  }
}

/** Best effort delete. Never throws. */
async function deleteResume(blobName) {
  if (!/^[a-f0-9]{32}\.(pdf|doc|docx)$/.test(String(blobName || ''))) return false
  try { await container().getBlockBlobClient(blobName).deleteIfExists(); return true } catch (e) { return false }
}

module.exports = { validateResume, saveResume, readResume, deleteResume, MAX_BYTES, TYPES }
