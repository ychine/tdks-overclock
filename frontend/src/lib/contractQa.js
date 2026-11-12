import { contract } from './contract'

/*
 * Grounded contract Q&A.
 *
 * There is no language model behind this: a question is matched to one of the topics the sample
 * contract can actually answer, and the answer (written in each language) cites the clause it comes
 * from. When nothing matches, we say so instead of guessing. Swap `askContract` for an API call
 * when a real backend exists; the chat UI only depends on its return shape:
 *   { intent, source?: { label, quote }, followUps: string[] }
 */

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/[“”"'’.,!?;:()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Keywords are multilingual (English, Filipino, Taglish). Order matters only for ties.
const INTENTS = [
  {
    id: 'early',
    keywords: [
      'umalis', 'aalis', 'alis', 'resign', 'quit', 'penalty', 'parusa', 'multa', 'terminate',
      'termination', 'tanggal', 'maaga', 'early', 'bago matapos', 'bitiw', 'magbitiw', 'leave', 'leaving',
    ],
  },
  {
    id: 'deductions',
    keywords: [
      'bawas', 'kaltas', 'deduct', 'deduction', 'deductions', 'sss', 'philhealth', 'pag ibig', 'pagibig',
      'tax', 'take home', 'net pay', 'net', 'maiuuwi', 'iuuwi', 'uuwi', 'payslip',
    ],
  },
  {
    id: 'thirteenth',
    keywords: ['13th', '13 th', 'ika 13', '13 month', 'thirteenth', 'bonus'],
  },
  {
    id: 'medical',
    keywords: ['medical', 'medikal', 'sakit', 'ospital', 'hospital', 'doktor', 'doctor', 'gamot', 'insurance'],
  },
  {
    id: 'checklist',
    keywords: [
      'bago pumirma', 'pumirma', 'itanong', 'itatanong', 'before signing', 'before i sign', 'checklist', 'sign',
    ],
  },
  { id: 'quitclaim', keywords: ['quitclaim', 'quit claim'] },
  { id: 'probationary', keywords: ['probationary', 'probation'] },
  {
    id: 'hours',
    keywords: ['oras', 'hours', 'hour', 'overtime', 'duty', 'shift', 'pasok', 'schedule', 'working'],
  },
  {
    id: 'dayoff',
    keywords: ['day off', 'dayoff', 'pahinga', 'rest day', 'rest', 'linggo', 'sunday', 'off day'],
  },
  {
    id: 'term',
    keywords: [
      'haba', 'tagal', 'tatagal', 'duration', 'ilang taon', 'gaano katagal', 'how long', 'term', 'simula',
      'start', 'magsisimula', 'matatapos', 'end date', 'contract length', 'years', 'taon',
    ],
  },
  {
    id: 'salary',
    keywords: ['sahod', 'sweldo', 'suweldo', 'salary', 'wage', 'pay', 'bayad', 'magkano', 'kita', 'compensation', 'paid'],
  },
  {
    id: 'help',
    keywords: [
      'tulong', 'help', 'dole', 'reklamo', 'complain', 'complaint', 'abuso', 'hotline', 'tawag', 'tumawag',
      'call', 'ahensya', 'agency', 'pao', 'owwa', 'dmw', 'lawyer', 'abogado', 'legal',
    ],
  },
]

const MIN_SCORE = 3

// Short keywords must match as whole words so "sss" doesn't hit "classes".
function hits(haystack, keyword) {
  const k = normalize(keyword)
  return k.length <= 4 ? ` ${haystack} `.includes(` ${k} `) : haystack.includes(k)
}

/** Returns the intent id that best matches the question, or null. */
export function matchIntent(question) {
  const text = normalize(question)
  if (!text) return null
  let best = null
  let bestScore = 0
  for (const intent of INTENTS) {
    const score = intent.keywords.reduce((sum, k) => (hits(text, k) ? sum + normalize(k).length : sum), 0)
    if (score > bestScore) {
      best = intent.id
      bestScore = score
    }
  }
  return bestScore >= MIN_SCORE ? best : null
}

const SOURCES = {
  salary: contract.clauses.compensation,
  term: contract.clauses.term,
  hours: contract.clauses.hours,
  dayoff: contract.clauses.rest,
  early: contract.clauses.early,
}

const FOLLOW_UPS = {
  salary: ['deductions', 'thirteenth'],
  deductions: ['salary', 'early'],
  hours: ['dayoff', 'checklist'],
  dayoff: ['hours', 'term'],
  term: ['early', 'salary'],
  early: ['checklist', 'medical'],
  medical: ['checklist', 'help'],
  thirteenth: ['deductions', 'term'],
  checklist: ['early', 'medical'],
  quitclaim: ['checklist', 'help'],
  probationary: ['term', 'help'],
  help: [],
  fallback: ['salary', 'early', 'checklist'],
}

/** Questions offered as chips before the user types anything. */
export const STARTER_INTENTS = ['early', 'deductions', 'checklist', 'thirteenth']

/**
 * Answer a question about the contract. `intent` may be passed directly (suggestion chips),
 * otherwise it is inferred from the text.
 */
export function askContract(question, intent) {
  const id = intent ?? matchIntent(question) ?? 'fallback'
  return { intent: id, source: SOURCES[id] ?? null, followUps: FOLLOW_UPS[id] ?? [] }
}
