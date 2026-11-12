// Loads the curated RA 10361 references once at startup and picks the few that fit a question.
// Only entries a human marked verified=true are ever used. The AI can cite nothing else.

import { readFileSync } from 'node:fs'

const file = new URL('../legal/ra10361.json', import.meta.url)
const all = JSON.parse(readFileSync(file, 'utf8')).references
export const verifiedRefs = all.filter((r) => r.verified === true)

console.log(`[legal] ${verifiedRefs.length} of ${all.length} references verified and usable`)

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
 * Score = 2 points per topic word found in the question, +1 if the entry is about a field
 * the contract actually has. Entries with no topic match are never picked, so a question about
 * something the file does not cover gets NO law (and the answer leaves out "Ayon sa batas").
 */
export function selectRefs(question, fieldKeys = [], max = 3) {
  const q = ` ${normalize(question)} `
  return verifiedRefs
    .map((ref) => {
      const topicHits = ref.topics.filter((t) => q.includes(` ${normalize(t)}`)).length
      const fieldHits = ref.fields.filter((f) => fieldKeys.includes(f)).length
      return { ref, topicHits, score: topicHits * 2 + fieldHits }
    })
    .filter((x) => x.topicHits > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.ref)
}
