// Talks to our own backend (/api/chat), which holds the Lumen credentials. Mirrors api/ocr.js.
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api/chat'

export class ChatError extends Error {
  constructor(status, code, retryable) {
    super(code)
    this.status = status
    this.code = code
    this.retryable = retryable
  }
}

async function post(path, body) {
  let res
  try {
    res = await fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
  } catch {
    throw new ChatError(0, 'NETWORK', true)
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = data?.error ?? {}
    throw new ChatError(res.status, err.code || 'AI_UNAVAILABLE', err.retryable ?? false)
  }
  return data
}

/** Opens one Lumen conversation. Returns the session id. */
export const openChat = async () => (await post('/sessions')).sessionId

/** Sends one question with the confirmed fields. Returns { answer, citations, degraded, lawAvailable }. */
export const askChat = (sessionId, { question, fields, language, workerType }) =>
  post(`/sessions/${encodeURIComponent(sessionId)}/messages`, { question, fields, language, workerType })

/** Free (no Lumen call): verified law entries per worker type, e.g. { kasambahay: 14, ofw: 0, local: 0 }. */
export async function getCoverage() {
  try {
    const res = await fetch(API + '/coverage')
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}
