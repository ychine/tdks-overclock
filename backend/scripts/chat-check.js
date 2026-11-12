// One real round trip to Lumen AI Chat, printing the RAW status and body (never your key).
// Run from /backend:   node --env-file=.env scripts/chat-check.js
// Cost: about 7 credits (open session 2 + one message 5). Errors are not charged.

const base = (process.env.LUMEN_CHAT_BASE_URL || '').replace(/\/+$/, '').replace(/\/instances$/, '')
const id = process.env.LUMEN_CHAT_INSTANCE_ID
const headers = {
  'Content-Type': 'application/json',
  'lumen-api-key': process.env.LUMEN_API_KEY,
  'lumen-api-secret': process.env.LUMEN_API_SECRET,
}
if (!base || !id || !process.env.LUMEN_API_KEY || !process.env.LUMEN_API_SECRET) {
  console.log('Missing one of LUMEN_CHAT_BASE_URL, LUMEN_CHAT_INSTANCE_ID, LUMEN_API_KEY, LUMEN_API_SECRET in .env')
  process.exit(1)
}

async function call(label, method, path, body) {
  const started = Date.now()
  const res = await fetch(base + path, { method, headers, body: body && JSON.stringify(body), signal: AbortSignal.timeout(30000) })
  const text = await res.text()
  console.log(`\n${label}: ${method} ${path}\n-> ${res.status} in ${Date.now() - started} ms\n${text.slice(0, 1500)}`)
  return { ok: res.ok, json: (() => { try { return JSON.parse(text) } catch { return null } })() }
}

const enc = encodeURIComponent
console.log('Base URL path ends with:', new URL(base).pathname)
const list = await call('1. List instances', 'GET', '/instances')
const s = await call('2. Open session', 'POST', `/instances/${enc(id)}/sessions`, { title: 'Linaw check' })
const sid = s.json?.Session?.id ?? s.json?.data?.Session?.id
if (!sid) process.exit(1)
await call('3. Send message', 'POST', `/instances/${enc(id)}/sessions/${enc(sid)}/messages`, {
  message: 'Sagutin sa isang pangungusap: ano ang ibig sabihin ng kasambahay?',
})
