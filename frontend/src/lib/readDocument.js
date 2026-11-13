import { getDocument, getPages, getReviewEnvelope, retryDocument, uploadDocument } from '../api/ocr'
import { extractFields } from './extract'

const POLL_MS = 1500
const MAX_WAIT_MS = 3 * 60 * 1000

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Upload -> wait for Lumen to finish reading -> load pages -> extract fields.
 * `onStage` receives 'upload' | 'read' | 'extract'.
 * Pass `existingId` to resume (e.g. after a retry) without uploading again.
 */
async function run(file, onStage, existingId, language) {
  let record
  if (existingId) {
    record = await getDocument(existingId)
  } else {
    onStage('upload')
    record = await uploadDocument(file)
  }

  onStage('read')
  const started = Date.now()
  while (record.Status === 'PENDING' || record.Status === 'PROCESSING') {
    if (Date.now() - started > MAX_WAIT_MS) {
      const err = new Error('Reading timed out')
      err.kind = 'timeout'
      err.documentId = record.DocumentID
      err.retryable = true
      throw err
    }
    await wait(POLL_MS)
    record = await getDocument(record.DocumentID)
  }

  if (record.Status === 'FAILED') {
    const err = new Error(record.FailureReason || 'Read failed')
    err.kind = 'failed'
    err.documentId = record.DocumentID
    err.retryable = true
    throw err
  }

  onStage('extract')
  const [pages, envelope] = await Promise.all([
    getPages(record.DocumentID),
    getReviewEnvelope(record.DocumentID).catch(() => null),
  ])
  const items = (pages.Items || []).slice().sort((a, b) => a.PageNumber - b.PageNumber)
  const thresholds = envelope?.thresholds || { high: 0.9, medium: 0.7 }
  const { fields, lines } = extractFields(items, thresholds.high, language)

  if (!lines.some((p) => p.lines.length)) {
    const err = new Error('No text found')
    err.kind = 'unreadable'
    throw err
  }

  return {
    record,
    pages: items,
    lines,
    fields,
    thresholds,
    confidence: envelope?.document?.confidence ?? null,
  }
}

// One read per file/attempt, so React StrictMode's double effects never upload twice (uploads cost credits).
const inflight = new WeakMap()

export function readDocument(file, onStage, existingId, language) {
  if (!existingId && inflight.has(file)) {
    const entry = inflight.get(file)
    entry.listeners.add(onStage)
    onStage(entry.stage)
    return entry.promise
  }
  const entry = { stage: existingId ? 'read' : 'upload', listeners: new Set([onStage]) }
  const notify = (s) => {
    entry.stage = s
    entry.listeners.forEach((fn) => fn(s))
  }
  entry.promise = run(file, notify, existingId, language)
  if (!existingId) {
    inflight.set(file, entry)
    // A failed attempt must not be replayed: let "Subukan ulit" upload fresh.
    entry.promise.catch(() => inflight.delete(file))
  }
  return entry.promise
}

export async function retryRead(file, documentId, onStage, language) {
  onStage('read')
  try {
    await retryDocument(documentId)
  } catch (err) {
    // 409 = still reading (not stale yet) or already done: just keep waiting on it.
    if (err.status !== 409) throw Object.assign(err, { documentId, retryable: true })
  }
  return readDocument(file, onStage, documentId, language)
}
