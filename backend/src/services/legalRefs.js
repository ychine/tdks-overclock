// Loads every law file in src/legal/ once at startup and picks the few entries that fit a question.
// Two hard rules:
//   1. Only entries a human marked verified=true (with a non-empty quote) are ever used.
//   2. Only law for the user's worker type is used. A kasambahay never gets Labor Code text,
//      an OFW never gets Batas Kasambahay text. Mixing them gives wrong answers (5 vs 30 days notice).

import { readdirSync, readFileSync } from 'node:fs'

export const WORKER_TYPES = ['kasambahay', 'ofw', 'local']

const dir = new URL('../legal/', import.meta.url)

function loadAll() {
  const refs = []
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const file = JSON.parse(readFileSync(new URL(name, dir), 'utf8'))
    if (!WORKER_TYPES.includes(file.workerType)) {
      console.warn(`[legal] ${name}: missing or unknown "workerType", file skipped`)
      continue
    }
    for (const ref of file.references ?? []) refs.push({ ...ref, workerType: file.workerType, file: name })
  }
  return refs
}

const all = loadAll()

export const verifiedRefs = all.filter((ref) => {
  if (ref.verified !== true) return false
  if (!String(ref.quote ?? '').trim()) {
    console.warn(`[legal] ${ref.id}: verified but has no quote, skipped`)
    return false
  }
  // `excerpt` pieces must be exact substrings of `quote`, so the AI still reads the law's own words.
  if (ref.excerpt && !ref.excerpt.every((piece) => ref.quote.includes(piece))) {
    console.warn(`[legal] ${ref.id}: excerpt is not an exact part of the quote; using the full quote`)
    delete ref.excerpt
  }
  return true
})

/** How many usable entries each worker type has, e.g. { kasambahay: 14, ofw: 0, local: 0 }. */
export const coverage = Object.fromEntries(
  WORKER_TYPES.map((type) => [type, verifiedRefs.filter((r) => r.workerType === type).length]),
)

console.log(`[legal] verified and usable: ${WORKER_TYPES.map((t) => `${t} ${coverage[t]}`).join(', ')}`)

/** The law text the AI sees: the excerpt if there is one, else the full quote. */
export const lawTextFor = (ref) => (ref.excerpt ? ref.excerpt.join(' ... ') : ref.quote)

export const normalize = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Score = 2 points per topic word that starts a word in the question ("bawas" matches "bawasan"),
 * plus a small tie-breaker if the entry is about a field the contract has. Entries with no topic
 * match are never picked, so an off-topic question gets NO law and the answer leaves out
 * "Ayon sa batas".
 */
export function selectRefs(question, fieldKeys = [], workerType = 'kasambahay', max = 2) {
  const q = ` ${normalize(question)} `
  return verifiedRefs
    .filter((ref) => ref.workerType === workerType)
    .map((ref) => {
      const topicHits = ref.topics.filter((t) => q.includes(` ${normalize(t)}`)).length
      const fieldHits = ref.fields.filter((f) => fieldKeys.includes(f)).length
      return { ref, topicHits, score: topicHits * 2 + fieldHits * 0.5 }
    })
    .filter((x) => x.topicHits > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.ref)
}
