// Server-side client for the Lumen AI Chat API. Credentials never leave the backend.
// Same style as lumenOcr.js.

export class LumenChatError extends Error {
  constructor(status, body) {
    super(body?.error?.message || body?.message || `Lumen AI Chat request failed (${status})`)
    this.status = status
    this.code = body?.error?.code || body?.code || `HTTP_${status}`
  }
}

export function chatConfig() {
  const baseUrl = process.env.LUMEN_CHAT_BASE_URL
  const instanceId = process.env.LUMEN_CHAT_INSTANCE_ID
  const key = process.env.LUMEN_API_KEY
  const secret = process.env.LUMEN_API_SECRET
  if (!baseUrl || !instanceId || !key || !secret) return null
  return { baseUrl: baseUrl.replace(/\/+$/, '').replace(/\/instances$/, ''), instanceId, key, secret }
}

// Lumen ends a turn at 25 s (504 AI_CHAT_REPLY_TIMEOUT). Wait a little longer so we get its answer, not our own abort.
const TIMEOUT_MS = 30000

async function request(method, path, body) {
  const cfg = chatConfig()
  if (!cfg) throw new LumenChatError(503, { error: { code: 'CHAT_NOT_CONFIGURED' } })

  const res = await fetch(cfg.baseUrl + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'lumen-api-key': cfg.key,
      'lumen-api-secret': cfg.secret,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  const text = await res.text()
  let parsed = null
  if (text) {
    try { parsed = JSON.parse(text) } catch { parsed = { message: text } }
  }
  if (!res.ok) throw new LumenChatError(res.status, parsed)
  return parsed
}

const enc = encodeURIComponent
const instance = () => enc(chatConfig().instanceId)

export const lumenChat = {
  // 201 { Session: { id, ... } }  (2 credits)
  openSession: (title) => request('POST', `/instances/${instance()}/sessions`, { title }),

  // { Answer: { sessionID, answer, citations, degradedSources } }  (5 credits)
  sendMessage: (sessionId, message) =>
    request('POST', `/instances/${instance()}/sessions/${enc(sessionId)}/messages`, { message }),
}
