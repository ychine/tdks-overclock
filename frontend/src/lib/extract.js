// Turns Lumen OCR pages (words + boxes) into the contract fields Linaw shows.
// Pure functions: no network, easy to reason about.

const MONTHS =
  'jan(?:uary|\\.)?|feb(?:ruary|\\.)?|mar(?:ch|\\.)?|apr(?:il|\\.)?|may|jun(?:e|\\.)?|jul(?:y|\\.)?|aug(?:ust|\\.)?|sep(?:t(?:ember)?|\\.)?|oct(?:ober|\\.)?|nov(?:ember|\\.)?|dec(?:ember|\\.)?' +
  '|enero|pebrero|marso|abril|mayo|hunyo|hulyo|agosto|setyembre|oktubre|nobyembre|disyembre'
const DATE_RE = new RegExp(
  `(?:\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})\\s*,?\\s*\\d{4}\\b)` +
    `|(?:\\b(?:${MONTHS})\\s+\\d{1,2}(?:st|nd|rd|th)?\\s*,?\\s*\\d{4}\\b)` +
    `|(?:\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}\\b)` +
    `|(?:\\b\\d{4}-\\d{2}-\\d{2}\\b)`,
  'i',
)
const MONEY_RE = /(?:₱|\bphp\.?|\bp(?=\s?\d))\s?(\d{1,3}(?:[,\s]\d{3})+|\d+)(?:\.(\d{1,2}))?/i
const DAYS = {
  monday: 'Lunes', lunes: 'Lunes',
  tuesday: 'Martes', martes: 'Martes',
  wednesday: 'Miyerkules', miyerkules: 'Miyerkules', miyerkoles: 'Miyerkules',
  thursday: 'Huwebes', huwebes: 'Huwebes',
  friday: 'Biyernes', biyernes: 'Biyernes',
  saturday: 'Sabado', sabado: 'Sabado',
  sunday: 'Linggo', linggo: 'Linggo',
}
const NUM_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, isa: 1, dalawa: 2, tatlo: 3, apat: 4, lima: 5, anim: 6,
}

/** Groups a page's words into reading lines, keeping each word's index on the page. */
export function buildLines(words = []) {
  const lines = []
  let current = null
  words.forEach((w, index) => {
    const box = w.box || { x: 0, y: 0, w: 0, h: 0 }
    const mid = box.y + box.h / 2
    const sameLine =
      current &&
      Math.abs(mid - current.mid) < Math.max(box.h, current.h) * 0.6 &&
      box.x >= current.lastX - 0.02
    if (!sameLine) {
      current = { words: [], mid, h: box.h, lastX: 0 }
      lines.push(current)
    }
    current.words.push({ ...w, index })
    current.lastX = box.x + box.w
  })
  return lines.map(({ words: ws }) => ({
    text: ws.map((w) => w.text).join(' '),
    words: ws,
    box: unionBox(ws.map((w) => w.box).filter(Boolean)),
    confidence: minConfidence(ws),
  }))
}

function unionBox(boxes) {
  if (!boxes.length) return null
  const x = Math.min(...boxes.map((b) => b.x))
  const y = Math.min(...boxes.map((b) => b.y))
  const r = Math.max(...boxes.map((b) => b.x + b.w))
  const btm = Math.max(...boxes.map((b) => b.y + b.h))
  return { x, y, w: r - x, h: btm - y }
}

/** Lowest measured word confidence, or null when the engine did not measure (text-layer PDFs). */
function minConfidence(words) {
  const vals = words.filter((w) => w.confidence?.measured).map((w) => w.confidence.value)
  return vals.length ? Math.min(...vals) : null
}

const formatMoney = (m) => {
  const whole = m[1].replace(/[,\s]/g, '')
  return `₱${Number(whole).toLocaleString('en-PH')}${m[2] ? '.' + m[2].padEnd(2, '0') : ''}`
}

function salaryPeriod(text) {
  if (/per\s+day|a\s+day|\/\s*day|daily|kada\s+araw|bawat\s+araw|arawan/i.test(text)) return ' / araw'
  if (/per\s+hour|an\s+hour|\/\s*h(ou)?r|hourly|kada\s+oras/i.test(text)) return ' / oras'
  if (/per\s+week|weekly|lingguhan/i.test(text)) return ' / linggo'
  if (/per\s+month|a\s+month|\/\s*mo(nth)?|monthly|kada\s+buwan|bawat\s+buwan|buwanan/i.test(text))
    return ' / buwan'
  return ''
}

// Each rule looks for a keyword in a line (or a line + the next one), then pulls a value.
const RULES = [
  {
    key: 'salary',
    label: 'Sahod',
    keyword: /salary|sahod|suweldo|sweldo|compensation|wage|pasahod|monthly\s+rate|daily\s+rate|basic\s+pay/i,
    read(text) {
      const m = text.match(MONEY_RE)
      return m ? formatMoney(m) + salaryPeriod(text) : null
    },
  },
  {
    key: 'start',
    label: 'Start date',
    keyword: /start|commence|effective|begin|simula|magsisimula|umpisa/i,
    read(text) {
      return text.match(DATE_RE)?.[0] ?? null
    },
  },
  {
    key: 'term',
    label: 'Haba',
    keyword: /term|period|duration|contract|haba|tagal|for\s+a\s+period/i,
    read(text) {
      const m = text.match(
        /(?:\b([a-z]+)\s*)?\(?\b(\d{1,2})?\)?\s*(years?|months?|taon|buwan)\b/i,
      )
      if (!m) return null
      const n = m[2] ? Number(m[2]) : NUM_WORDS[m[1]?.toLowerCase()]
      if (!n) return null
      const unit = /year|taon/i.test(m[3]) ? 'taon' : 'buwan'
      return `${n} ${unit}`
    },
  },
  {
    key: 'hours',
    label: 'Oras',
    keyword: /hours?|oras|working\s+time|work\s+schedule/i,
    read(text) {
      const m = text.match(
        /\b(\d{1,2}|[a-z]+)\s*(?:\(\d{1,2}\)\s*)?(?:hours?|hrs?|oras)\s*(?:of\s+work\s*)?(?:per|a|\/|kada|bawat|each)?\s*(day|araw|week|linggo)/i,
      )
      if (!m) return null
      const n = /^\d+$/.test(m[1]) ? Number(m[1]) : NUM_WORDS[m[1].toLowerCase()]
      if (!n) return null
      return `${n} oras / ${/week|linggo/i.test(m[2]) ? 'linggo' : 'araw'}`
    },
  },
  {
    key: 'rest',
    label: 'Day off',
    keyword: /rest\s*day|day[\s-]*off|pahinga|day\s+of\s+rest/i,
    read(text) {
      const found = [...text.matchAll(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miyerkules|miyerkoles|huwebes|biyernes|sabado|linggo)s?\b/gi)]
        .map((m) => DAYS[m[1].toLowerCase()])
      const unique = [...new Set(found)]
      return unique.length ? unique.join(', ') : null
    },
  },
  {
    key: 'penalty',
    label: 'Penalty',
    keyword: /penalt|liquidated\s+damages|multa|forfeit|deduct.*(?:resign|leave|terminat)/i,
    read(text) {
      const m = text.match(MONEY_RE)
      return m ? formatMoney(m) : null
    },
    // Keyword present but no amount nearby: still worth flagging.
    fallback: 'May nakasulat na penalty',
    optional: true,
  },
]

/**
 * @param pages Lumen page records with Words
 * @param highThreshold confidence below which a field is flagged for checking
 * @returns {{ fields: object[], lines: object[][] }}
 */
export function extractFields(pages, highThreshold = 0.9) {
  const linesByPage = pages.map((p) => ({ pageNumber: p.PageNumber, lines: buildLines(p.Words) }))

  const fields = []
  const makeHit = (value, pageNumber, lines, i, span) => {
    const group = lines.slice(i, i + span)
    const confs = group.map((l) => l.confidence).filter((c) => c !== null)
    return {
      value,
      pageNumber,
      lineIndex: i,
      lineCount: group.length,
      box: unionBox(group.map((l) => l.box).filter(Boolean)),
      source: group.map((l) => l.text).join(' '),
      confidence: confs.length ? Math.min(...confs) : null,
    }
  }

  for (const rule of RULES) {
    let hit = null
    let keywordOnly = null // first line with the keyword but no value, for rule.fallback
    outer: for (const { pageNumber, lines } of linesByPage) {
      for (let i = 0; i < lines.length; i++) {
        // Try the line alone, then joined with the next (values often wrap).
        for (const span of [1, 2]) {
          const group = lines.slice(i, i + span)
          const text = group.map((l) => l.text).join(' ')
          // The keyword must start the match, so the highlight begins on the right line.
          if (!rule.keyword.test(group[0].text)) continue
          const value = rule.read(text)
          if (value) {
            hit = makeHit(value, pageNumber, lines, i, span)
            break outer
          }
          if (!keywordOnly) {
            keywordOnly = makeHit(rule.fallback, pageNumber, lines, i, 1)
          }
        }
      }
    }
    if (!hit && rule.fallback && keywordOnly) hit = keywordOnly

    if (!hit && rule.optional) continue
    fields.push({
      key: rule.key,
      label: rule.label,
      value: hit?.value ?? '',
      found: Boolean(hit),
      pageNumber: hit?.pageNumber ?? null,
      lineIndex: hit?.lineIndex ?? null,
      lineCount: hit?.lineCount ?? 0,
      box: hit?.box ?? null,
      source: hit?.source ?? '',
      confidence: hit?.confidence ?? null,
      // Not found, or measured and below threshold -> ask the user to check.
      low: !hit || (hit.confidence !== null && hit.confidence < highThreshold),
      edited: false,
    })
  }

  return { fields, lines: linesByPage }
}

/** Plain text of every page, for search-style checks later in the flow. */
export const fullText = (lines) =>
  lines.map((p) => p.lines.map((l) => l.text).join('\n')).join('\n\n')
