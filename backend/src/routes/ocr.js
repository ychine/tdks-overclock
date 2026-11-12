import { Router } from 'express'
import express from 'express'
import { Readable } from 'node:stream'
import { lumenOcr, LumenError } from '../services/lumenOcr.js'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_BYTES = (Number(process.env.MAX_FILE_MB) || 20) * 1024 * 1024

const router = Router()

// Wrap handlers so Lumen errors map to clean HTTP responses.
const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res)
  } catch (err) {
    if (err instanceof LumenError) {
      return res.status(err.status).json(err.body ?? { error: { message: err.message } })
    }
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      return res.status(504).json({ error: { message: 'OCR service timed out', retryable: true } })
    }
    console.error('OCR route error:', err)
    res.status(502).json({ error: { message: 'OCR service unavailable', retryable: true } })
  }
}

const send = (res, r) => res.status(r.status).json(r.body)

// List documents
router.get('/documents', wrap(async (req, res) => {
  const { Status, Limit, ContinuationToken } = req.query
  send(res, await lumenOcr.listDocuments({ Status, Limit, ContinuationToken }))
}))

// Upload: raw bytes (pdf/jpeg/png) with ?name= or X-Document-Name header -> 202,
// or a JSON descriptor -> 201.
router.post(
  '/documents',
  express.raw({ type: ACCEPTED_TYPES, limit: MAX_BYTES }),
  wrap(async (req, res) => {
    const mediaType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase()

    if (mediaType === 'application/json') {
      const { Name, MediaType, ByteSize } = req.body || {}
      if (!Name || !MediaType || !Number.isInteger(ByteSize)) {
        return res.status(400).json({ error: { message: 'Name, MediaType and ByteSize are required' } })
      }
      return send(res, await lumenOcr.createDescriptor({ Name, MediaType, ByteSize }))
    }

    if (!ACCEPTED_TYPES.includes(mediaType)) {
      return res.status(415).json({ error: { message: `Accepted types: ${ACCEPTED_TYPES.join(', ')}` } })
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: { message: 'Empty document body' } })
    }
    const name = req.query.name || req.headers['x-document-name']
    if (!name || name.length > 256) {
      return res.status(400).json({ error: { message: 'Document name (1-256 chars) is required' } })
    }

    const r = await lumenOcr.uploadDocument({ bytes: req.body, mediaType, name: String(name) })
    const id = r.body?.data?.DocumentID
    if (id) res.set('Location', `/api/ocr/documents/${id}`)
    send(res, r)
  }),
)

router.get('/documents/:id', wrap(async (req, res) => send(res, await lumenOcr.getDocument(req.params.id))))

router.post('/documents/:id/retry', wrap(async (req, res) => send(res, await lumenOcr.retryDocument(req.params.id))))

// Stream stored bytes back
router.get('/documents/:id/file', wrap(async (req, res) => {
  const upstream = await lumenOcr.downloadFile(req.params.id)
  res.status(200)
  for (const h of ['content-type', 'content-disposition', 'cache-control', 'x-content-type-options']) {
    const v = upstream.headers.get(h)
    if (v) res.set(h, v)
  }
  Readable.fromWeb(upstream.body).pipe(res)
}))

// Pages
router.get('/documents/:id/pages', wrap(async (req, res) => {
  const IncludeWords = req.query.IncludeWords
  send(res, await lumenOcr.listPages(req.params.id, { IncludeWords }))
}))
router.get('/documents/:id/pages/:page', wrap(async (req, res) =>
  send(res, await lumenOcr.getPage(req.params.id, req.params.page))))

// Review judgements
router.get('/documents/:id/reviews', wrap(async (req, res) => send(res, await lumenOcr.listReviews(req.params.id))))

router.get('/documents/:id/reviews/revision', wrap(async (req, res) => {
  // Lumen infers the target kind: send PageNumber+WordIndex (word) OR FieldPath (field).
  // It rejects an explicit Kind key, so it is accepted here but never forwarded.
  const { PageNumber, WordIndex, FieldPath } = req.query
  const isWord = PageNumber !== undefined && WordIndex !== undefined
  if (isWord === Boolean(FieldPath)) {
    return res.status(400).json({ error: { message: 'Provide either PageNumber and WordIndex, or FieldPath' } })
  }
  const query = isWord ? { PageNumber, WordIndex } : { FieldPath }
  send(res, await lumenOcr.getReviewRevision(req.params.id, query))
}))

router.post('/documents/:id/reviews', wrap(async (req, res) => {
  const ifMatch = req.headers['if-match']
  if (!ifMatch || !ifMatch.trim()) {
    return res.status(428).json({ error: { code: 'ocr_review_precondition_required', message: 'If-Match header is required' } })
  }
  const { Target, Action, CorrectedValue, Note } = req.body || {}
  if (!Target || !Action) {
    return res.status(400).json({ error: { message: 'Target and Action are required' } })
  }
  const r = await lumenOcr.submitReview(req.params.id, ifMatch, { Target, Action, CorrectedValue, Note })
  const etag = r.headers.get('etag')
  if (etag) res.set('ETag', etag)
  send(res, r)
}))

// Review widget
router.get('/documents/:id/review', wrap(async (req, res) => send(res, await lumenOcr.getReviewEnvelope(req.params.id))))
router.get('/documents/:id/review/pages/:page', wrap(async (req, res) =>
  send(res, await lumenOcr.getReviewPage(req.params.id, req.params.page))))

router.post('/documents/:id/review/corrections', wrap(async (req, res) => {
  const { pageNumber, wordIndex, text, fingerprint, metadata } = req.body || {}
  if (!Number.isInteger(pageNumber) || !Number.isInteger(wordIndex) || typeof text !== 'string') {
    return res.status(400).json({ error: { message: 'pageNumber, wordIndex and text are required' } })
  }
  // documentId is taken from the path so it can never disagree with it.
  send(res, await lumenOcr.correctWord(req.params.id, {
    documentId: req.params.id, pageNumber, wordIndex, text, fingerprint, metadata,
  }))
}))

export default router
