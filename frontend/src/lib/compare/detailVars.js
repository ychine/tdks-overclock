// Fills the {placeholders} of a row's sentences (changed / means / ask) from item.numbers.
// Every figure is computed in calc.js / buildComparison.js and only FORMATTED here, so no peso
// amount is ever typed into JSX or into a translation file. Pure; relative imports only.

import { formatHours, formatTime } from './format.js'
import { formatCount, formatPeso, formatPercent, formatRate } from './money.js'

/**
 * Values for the "Biggest change" callout and the Level 3 summary lines. Empty string = not available;
 * the caller decides what to show instead.
 * @param {import('./terms.js').ComparisonItem} item
 * @returns {Record<string,string>}
 */
export function lineVars(item) {
  const n = item.numbers ?? {}
  switch (item.id) {
    case 'pay':
      return {
        net: formatPeso(n.takeHome?.net),
        hours: formatCount(n.newMonthlyHours - n.oldMonthlyHours),
        oldRate: formatRate(n.oldHourly),
        newRate: formatRate(n.newHourly),
      }
    case 'rest':
      return { old: formatHours(n.oldHours), new: formatHours(n.newHours) }
    case 'penalty':
      return { early: formatPeso(n.earlyPenalty), deposit: formatPeso(n.deposit) }
    case 'benefits':
      return { n: formatCount(n.added?.length ?? 0) }
    default:
      return {}
  }
}

/**
 * @param {import('./terms.js').ComparisonItem} item
 * @param {string} group  'changed' | 'means' | 'askA' | 'askB' | 'ask'
 * @returns {Record<string,string>}
 */
export function sentenceVars(item, group) {
  const n = item.numbers ?? {}

  if (item.id === 'pay') {
    return {
      amount: formatPeso(n.takeHome?.gross),
      pct: formatPercent(n.grossChangePct),
      oldHours: formatHours(n.oldHoursPerDay),
      newHours: formatHours(n.newHoursPerDay),
      rate: formatPeso(n.oldExtraPay?.amount),
    }
  }

  if (item.id === 'rest') {
    const w = n.newWindow
    return {
      from: formatTime(w?.from),
      to: formatTime(w?.to),
      hours: formatHours(n.diffHours === null || n.diffHours === undefined ? null : Math.abs(n.diffHours)),
    }
  }

  if (item.id === 'penalty') {
    // Part A questions talk about the leaving-early amount, Part B questions about the deposit.
    const amount = group === 'askB' ? n.deposit : n.earlyPenalty
    return {
      early: formatPeso(n.earlyPenalty),
      deposit: formatPeso(n.deposit),
      amount: formatPeso(amount),
      days: formatCount(n.noticeDays),
    }
  }

  if (item.id === 'benefits') {
    return {
      n: formatCount(n.added?.length ?? 0),
      amount: formatPeso(n.values?.cellphoneLoad),
    }
  }

  return {}
}
