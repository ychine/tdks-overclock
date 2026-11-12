// Ask Linaw. The browser talks to these routes; only the server talks to Lumen.
//   POST /api/chat/sessions                      -> 201 { sessionId }
//   POST /api/chat/sessions/:sessionId/messages  { question, fields, language, workerType }
//        -> { answer, citations: [{ type, id, label, text }], degraded, lawAvailable }
//   GET  /api/chat/coverage                      -> { kasambahay: n, ofw: n, local: n }
// Every error: { error: { code, message, retryable } }

import { Router } from 'express'
import { chatConfig, lumenChat, LumenChatError } from '../services/lumenChat.js'
import { coverage, selectRefs, WORKER_TYPES } from '../services/legalRefs.js'
import { buildMessage, MAX_QUESTION, parseCitations, pickFields } from '../services/chatMessage.js'

const router = Router()

const LABELS = { salary: 'Sahod', start: 'Simula', term: 'Tagal', hours: 'Oras', rest: 'Pahinga', penalty: 'Multa' }

const fail = (res, status, code, message, retryable = false, upstream) =>
  res.status(status).json({ error: { code, message, retryable, ...(upstream && { upstream }) } })

// Outside production, pass Lumen's own status/code/message through so the browser's Network tab
// shows the REAL cause. Lumen's error text never contains the user's question or contract.
const upstreamOf = (err) =>
  process.env.NODE_ENV === 'production' ? undefined : { status: err.status, code: err.code, message: err.message }

// Public and free (no Lumen call): how many verified law entries each worker type has.
router.get('/coverage', (req, res) => res.json(coverage))

router.use((req, res, next) => {
  if (!chatConfig()) return fail(res, 503, 'CHAT_NOT_CONFIGURED', 'Chat is not set up on this server yet.')
  next()
})

// Express 5 sends errors thrown in async handlers to the error handler at the bottom.
router.post('/sessions', async (req, res) => {
  const r = await lumenChat.openSession('Linaw contract chat')
  res.status(201).json({ sessionId: r.Session.id })
})

router.post('/sessions/:sessionId/messages', async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : ''
  if (!question || question.length > MAX_QUESTION) {
    return fail(res, 400, 'INVALID_QUESTION', `Question must be 1 to ${MAX_QUESTION} characters.`)
  }
  const { fields, notInContract } = pickFields(req.body?.fields)
  if (!Object.keys(fields).length && !notInContract.length) {
    return fail(res, 400, 'NO_CONTRACT', 'Confirm your contract details first.')
  }

  // Which law applies depends on WHO the worker is. Never guess it: the client must send it.
  const workerType = req.body?.workerType
  if (!WORKER_TYPES.includes(workerType)) {
    return fail(res, 400, 'INVALID_WORKER_TYPE', `workerType must be one of: ${WORKER_TYPES.join(', ')}`)
  }

  const refs = selectRefs(question, Object.keys(fields), workerType)
  const { message, refsSent } = buildMessage({
    fields, notInContract, refs, question, language: req.body?.language, workerType,
  })

  const r = await lumenChat.sendMessage(req.params.sessionId, message)
  const { text, citations } = parseCitations(r.Answer?.answer ?? '', {
    fields, refsSent, labelFor: (k) => LABELS[k] ?? k,
  })

  res.json({
    answer: text,
    citations,
    degraded: (r.Answer?.degradedSources?.length ?? 0) > 0,
    // false = no verified law exists yet for this worker type, so answers explain the contract only.
    lawAvailable: coverage[workerType] > 0,
  })
})

// Lumen failures -> one error shape. Log status and code only: never the question or the contract.
router.use((err, req, res, next) => {
  if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
    return fail(res, 504, 'AI_TIMEOUT', 'The AI took too long.', true)
  }
  if (!(err instanceof LumenChatError)) {
    console.error('[chat] unexpected error:', err?.name)
    return fail(res, 502, 'AI_UNAVAILABLE', 'The AI is not available right now.', true)
  }
  console.error(`[chat] Lumen ${err.status} ${err.code}: ${err.message}`)
  const up = upstreamOf(err)
  if (err.code === 'CHAT_NOT_CONFIGURED') return fail(res, 503, 'CHAT_NOT_CONFIGURED', 'Chat is not set up on this server yet.')
  if (err.code === 'AI_CHAT_QUERY_TOO_LONG') return fail(res, 400, 'INVALID_QUESTION', 'The question is too long.', false, up)
  if (err.status === 504) return fail(res, 504, 'AI_TIMEOUT', 'The AI took too long.', true, up)
  if (err.status === 429) return fail(res, 429, 'AI_BUSY', 'The AI is busy.', true, up)
  if (err.status === 404 || err.status === 409 || err.code === 'SESSION_NOT_OWNED') {
    return fail(res, 409, 'SESSION_EXPIRED', 'The conversation expired.', true, up)
  }
  if (err.status >= 500) return fail(res, 502, 'AI_UNAVAILABLE', 'The AI is not available right now.', true, up)
  // 400/401/403: bad request, wrong key, missing AI Chat grant, or no credits. Our setup problem, not the user's.
  return fail(res, 502, 'AI_UNAVAILABLE', 'The AI is not available right now.', false, up)
})

export default router
