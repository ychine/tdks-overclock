// Temporary verification helper: serves a build, drives headless Edge over the DevTools protocol
// (scroll, hover, click, theme), saves screenshots, then exits.
import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const [root, out] = process.argv.slice(2)
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' }
const server = http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html')
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await new Promise((r) => server.listen(0, '127.0.0.1', r))
const site = `http://127.0.0.1:${server.address().port}/`
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-cdp-'))
const browser = spawn(edge, ['--headless', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'])

let devtools
for (let i = 0; i < 100 && !devtools; i++) {
  await sleep(150)
  const f = path.join(profile, 'DevToolsActivePort')
  if (fs.existsSync(f)) devtools = fs.readFileSync(f, 'utf8').split('\n')[0]
}
const targets = await (await fetch(`http://127.0.0.1:${devtools}/json/list`)).json()
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) (pending.get(msg.id)(msg), pending.delete(msg.id))
  if (msg.method === 'Runtime.exceptionThrown') console.log('EXCEPTION', msg.params.exceptionDetails.exception?.description?.slice(0, 600))
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') console.log('CONSOLE', JSON.stringify(msg.params.args.map((a) => a.value ?? a.description)).slice(0, 600))
})
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })) })
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value

await send('Runtime.enable')
await send('Page.enable')
async function open(width, height, dark) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 })
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }, { name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] })
  await send('Page.navigate', { url: site })
  await sleep(2500)
  if (dark) await evaluate(`document.documentElement.dataset.theme = 'dark'`)
}
async function shot(name, selector, pad = 0) {
  const box = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.scrollIntoView({ block: 'start' }); const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height } })()`)
  await sleep(400)
  const res = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.w + pad * 2, height: Math.min(box.h + pad * 2, 3000), scale: 1 } })
  fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(res.result.data, 'base64'))
  console.log('saved', name, Math.round(box.w), 'x', Math.round(box.h))
}
async function hover(selector) {
  const c = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })()`)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y, pointerType: 'mouse' })
  await sleep(300)
}

// Hero: rest, then hovered (reduced motion makes the spring instant, so the open pose is captured directly).
await open(1280, 860)
await shot('hero-rest', '[data-hero="visual"]', 40)
await evaluate(`scrollTo(0, 0)`)
await hover('[data-parallax]')
await shot('hero-open', '[data-hero="visual"]', 40)
// FAQ desktop, light and dark; then a filtered topic.
await shot('faq', '#faq')
await evaluate(`document.querySelectorAll('#faq [aria-pressed]')[2].click()`)
await sleep(300)
await shot('faq-privacy', '#faq')
await open(1280, 860, true)
await shot('faq-dark', '#faq')
await hover('[data-parallax]')
await shot('hero-open-dark', '[data-hero="visual"]', 40)
// Mobile.
await open(390, 844)
await shot('faq-mobile', '#faq')

ws.close()
browser.kill()
server.close()
setTimeout(() => fs.rmSync(profile, { recursive: true, force: true }), 500)
