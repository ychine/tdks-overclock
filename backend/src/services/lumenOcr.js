// Server-side client for the Lumen OCR API. Credentials never leave the backend.

export class LumenError extends Error {
  constructor(status, body) {
    super(body?.error?.message || body?.message || `Lumen OCR request failed (${status})`)
    this.status = status
    this.body = body
  }
}

function config() {
  const baseUrl = process.env.LUMEN_OCR_BASE_URL
  const key = process.env.LUMEN_API_KEY
  const secret = process.env.LUMEN_API_SECRET
  if (!baseUrl || !key || !secret) {
    throw new LumenError(503, { message: 'OCR is not configured on this server' })
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ''), key, secret }
}

async function request(method, path, { query, headers = {}, body, raw = false } = {}) {
  const { baseUrl, key, secret } = config()
  const url = new URL(baseUrl + path)
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  }

  const res = await fetch(url, {
    method,
    headers: { 'lumen-api-key': key, 'lumen-api-secret': secret, ...headers },
    body,
    signal: AbortSignal.timeout(Number(process.env.LUMEN_TIMEOUT_MS) || 30000),
  })

  if (raw && res.ok) return res

  const text = await res.text()
  let parsed = null
  if (text) {
    try { parsed = JSON.parse(text) } catch { parsed = { message: text } }
  }
  if (!res.ok) throw new LumenError(res.status, parsed)
  return { body: parsed, headers: res.headers, status: res.status }
}

const enc = encodeURIComponent
const json = (data) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})

export const lumenOcr = {
  listDocuments: ({ Status, Limit, ContinuationToken } = {}) =>
    request('GET', '/documents', { query: { Status, Limit, ContinuationToken } }),

  // Descriptor mode: creates a PENDING record (201), no charge.
  createDescriptor: ({ Name, MediaType, ByteSize }) =>
    request('POST', '/documents', json({ Name, MediaType, ByteSize })),

  // Document-body mode: stores and schedules the read (202). Metered.
  uploadDocument: ({ bytes, mediaType, name }) =>
    request('POST', '/documents', {
      headers: { 'Content-Type': mediaType, 'X-Lumen-Document-Name': enc(name) },
      body: bytes,
    }),

  getDocument: (id) => request('GET', `/documents/${enc(id)}`),
  retryDocument: (id) => request('POST', `/documents/${enc(id)}/retry`),
  downloadFile: (id) => request('GET', `/documents/${enc(id)}/file`, { raw: true }),

  listPages: (id, { IncludeWords } = {}) =>
    request('GET', `/documents/${enc(id)}/pages`, { query: { IncludeWords } }),
  getPage: (id, n) => request('GET', `/documents/${enc(id)}/pages/${enc(n)}`),

  listReviews: (id) => request('GET', `/documents/${enc(id)}/reviews`),
  getReviewRevision: (id, query) =>
    request('GET', `/documents/${enc(id)}/reviews/revision`, { query }),
  submitReview: (id, ifMatch, payload) => {
    const j = json(payload)
    return request('POST', `/documents/${enc(id)}/reviews`, {
      headers: { ...j.headers, 'If-Match': ifMatch },
      body: j.body,
    })
  },

  getReviewEnvelope: (id) => request('GET', `/documents/${enc(id)}/review`),
  getReviewPage: (id, n) => request('GET', `/documents/${enc(id)}/review/pages/${enc(n)}`),
  correctWord: (id, payload) =>
    request('POST', `/documents/${enc(id)}/review/corrections`, json(payload)),
}
