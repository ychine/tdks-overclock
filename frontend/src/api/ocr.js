// Talks to our own backend (/api/ocr), which holds the Lumen credentials.
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api/ocr'

export class OcrError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request(path, options) {
  let res
  try {
    res = await fetch(API + path, options)
  } catch {
    throw new OcrError(0, 'Hindi maabot ang server. Naka-on ba ang backend?')
  }
  const text = await res.text()
  const body = (() => {
    try {
      return text ? JSON.parse(text) : null
    } catch {
      return null
    }
  })()
  if (!res.ok) {
    const err = body?.error || body || {}
    throw new OcrError(res.status, err.message || `Request failed (${res.status})`, err.code)
  }
  return body?.data ?? body
}

/** Sends the raw file; Lumen stores it and schedules the read (202). */
export const uploadDocument = (file) =>
  request(`/documents?name=${encodeURIComponent(file.name || 'dokumento')}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  })

export const getDocument = (id) => request(`/documents/${encodeURIComponent(id)}`)

export const retryDocument = (id) =>
  request(`/documents/${encodeURIComponent(id)}/retry`, { method: 'POST' })

export const getPages = (id) =>
  request(`/documents/${encodeURIComponent(id)}/pages?IncludeWords=true`)

export const getReviewEnvelope = (id) => request(`/documents/${encodeURIComponent(id)}/review`)
