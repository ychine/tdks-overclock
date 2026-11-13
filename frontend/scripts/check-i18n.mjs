import fs from 'node:fs'
import path from 'node:path'
import english from '../src/i18n/english.js'
import filipino from '../src/i18n/filipino.js'
import taglish from '../src/i18n/taglish.js'
import { LANGUAGES } from '../src/i18n/messages.js'
import { GLOSSARY } from '../src/lib/glossary.js'
import { compareDynamicKeys } from '../src/lib/compare/copyKeys.js'

const langs = { english, filipino, taglish }
const base = new Set(Object.keys(taglish))
let problems = 0

for (const [name, dict] of Object.entries(langs)) {
  const keys = new Set(Object.keys(dict))
  for (const k of base) if (!keys.has(k)) (problems++, console.log(`[${name}] missing: ${k}`))
  for (const k of keys) if (!base.has(k)) (problems++, console.log(`[${name}] extra: ${k}`))
  // arrays/objects must have the same shape
  for (const k of base) {
    const a = taglish[k]
    const b = dict[k]
    if (b === undefined) continue
    if (Array.isArray(a) !== Array.isArray(b) || (Array.isArray(a) && a.length !== b.length)) {
      problems++
      console.log(`[${name}] shape mismatch: ${k}`)
    }
    if (typeof a === 'string') {
      const ph = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join()
      if (ph(a) !== ph(b)) (problems++, console.log(`[${name}] placeholder mismatch: ${k}`))
      const bold = (s) => (s.match(/\*\*/g) ?? []).length
      if (bold(a) !== bold(b)) (problems++, console.log(`[${name}] bold marker mismatch: ${k}`))
    }
  }
}

// every literal key used in the source must exist
const used = new Set()
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name)
    if (f.isDirectory()) walk(p)
    else if (/\.jsx?$/.test(f.name) && !p.includes('i18n')) {
      const src = fs.readFileSync(p, 'utf8')
      for (const m of src.matchAll(/\bt\(\s*'([\w.]+)'/g)) used.add(m[1])
    }
  }
}
walk('src')
for (const k of used) if (!base.has(k)) (problems++, console.log(`used but undefined: ${k}`))

// dynamic keys
const dynamic = [
  ...['home', 'summary', 'chat', 'compare', 'help'].map((x) => `nav.${x}`),
  ...['home', 'upload', 'reading', 'review', 'summary', 'salary', 'chat', 'compare', 'questions', 'help'].map((x) => `screen.${x}`),
  ...['salary', 'start', 'term', 'hours', 'rest'].flatMap((x) => [`review.${x}`, `review.${x}Value`]),
  ...['blurry', 'type', 'size'].flatMap((x) => [`file.${x}.title`, `file.${x}.text`]),
  ...['salary', 'deductions', 'hours', 'dayoff', 'term', 'early', 'medical', 'thirteenth', 'checklist', 'quitclaim', 'probationary', 'help'].flatMap((x) => [`q.${x}`, `qa.${x}`]),
  'qa.fallback',
  // Compare screen: keys built at run time (see src/lib/compare/copyKeys.js)
  ...compareDynamicKeys(),
  ...['Kasambahay', 'Local', 'Ofw'].flatMap((x) => [`questions.title${x}`, `questions.rights${x}`]),
]
for (const k of dynamic) if (!base.has(k)) (problems++, console.log(`dynamic key undefined: ${k}`))

// glossary definitions must match LANGUAGES so every term renders in every locale
const seenIds = new Set()
for (const entry of GLOSSARY) {
  if (seenIds.has(entry.id)) (problems++, console.log(`glossary duplicate id: ${entry.id}`))
  seenIds.add(entry.id)
  if (!entry.name || !entry.pattern) (problems++, console.log(`glossary missing name/pattern: ${entry.id}`))
  for (const l of LANGUAGES) {
    if (!entry.def?.[l]?.trim()) (problems++, console.log(`glossary missing def: ${entry.id} [${l}]`))
  }
  for (const k of Object.keys(entry.def ?? {})) {
    if (!LANGUAGES.includes(k)) (problems++, console.log(`glossary extra def: ${entry.id} [${k}]`))
  }
}

console.log(
  problems
    ? `${problems} problem(s)`
    : `i18n OK — ${base.size} keys × 3 languages, ${used.size} literal keys used, ${GLOSSARY.length} glossary terms × ${LANGUAGES.length}`,
)
process.exit(problems ? 1 : 0)
