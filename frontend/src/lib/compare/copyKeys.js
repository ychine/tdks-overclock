// The shape of the Compare screen's translated copy. Components read it to know how many sentences
// a row has; scripts/check-i18n.mjs reads it to check that every dynamic key exists in all 3 languages.
// Plain data, relative imports only (runs under node and under Vite).

export const ROW_IDS = ['pay', 'rest', 'medical', 'penalty', 'benefits']
export const STATUSES = ['added', 'removed', 'changed', 'unchanged']
export const IMPACTS = ['better', 'worse', 'watch', 'same']

/** Facts that can appear under "Where it is in the contract". */
export const FACTS = [
  'wage', 'payday', 'hours', 'extraPay', 'deductions', 'rest', 'leave',
  'medical', 'benefits', 'deposit', 'earlyLeave', 'notice', 'term',
]

/**
 * How many numbered sentences each row has: `compare.detail.<id>.<group><n>` (n starts at 1).
 * One key per sentence, because t() fills {placeholders} in strings but not inside arrays.
 */
export const DETAIL_COUNTS = {
  pay: { changed: 2, means: 1, ask: 3 },
  rest: { changed: 2, means: 1, ask: 3 },
  medical: { changed: 1, means: 2, ask: 3 },
  penalty: { changed: 2, means: 2, askA: 3, askB: 3 },
  benefits: { changed: 1, means: 1, ask: 3 },
}

/** Short level-3 line for each row and each impact it can end up with. Anything else uses the generic line. */
export const SUMMARY_LINES = {
  pay: ['watch', 'worse', 'better'],
  rest: ['worse', 'better'],
  penalty: ['worse', 'better'],
  benefits: ['better', 'worse'],
  medical: ['better', 'worse'],
}

export const BENEFIT_ITEMS = ['leaveDays', 'thirteenthMonth', 'mealsPerDay', 'privateRoom', 'cellphoneLoad', 'birthdayLeaveDays']
export const MEDICAL_MISSING = 5
export const PENALTY_NOT_STATED = 4

export const detailKey = (id, group, n) => `compare.detail.${id}.${group}${n}`

/** Every key built at run time. Used by the i18n checker. */
export function compareDynamicKeys() {
  const keys = []
  for (const s of STATUSES) keys.push(`compare.status.${s}`, `compare.def.${s}`)
  keys.push('compare.def.notStated')
  for (const i of IMPACTS) keys.push(`compare.impact.${i}`)
  for (const id of ROW_IDS) {
    keys.push(`compare.row.${id}`, `compare.biggest.${id}.title`, `compare.biggest.${id}.text`, `compare.detail.${id}.title`)
    for (const [group, count] of Object.entries(DETAIL_COUNTS[id])) {
      for (let n = 1; n <= count; n += 1) keys.push(detailKey(id, group, n))
    }
  }
  for (const [id, impacts] of Object.entries(SUMMARY_LINES)) {
    for (const impact of impacts) keys.push(`compare.summary.line.${id}.${impact}`)
  }
  keys.push('compare.cell.early', 'compare.cell.deposit')
  for (const f of FACTS) keys.push(`compare.detail.fact.${f}`)
  for (const b of BENEFIT_ITEMS) keys.push(`compare.detail.benefits.item.${b}`)
  for (let n = 1; n <= MEDICAL_MISSING; n += 1) keys.push(`compare.detail.medical.missing${n}`)
  for (let n = 1; n <= PENALTY_NOT_STATED; n += 1) keys.push(`compare.detail.penalty.ns${n}`)
  return keys
}
