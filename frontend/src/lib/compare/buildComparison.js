// Turns two ContractTerms into the rows of the Compare screen. Pure: no React, no network.
// Phase 3 plugs a real extractor in front of this; nothing here needs to change for that.
//
// Two separate questions per row (never mixed):
//   status  WHAT happened      added | removed | changed | unchanged   (found by comparing the terms)
//   impact  GOOD or BAD for me better | worse | watch | same          (found by the rules below)
// See terms.js for the exact meaning of each status word and of "Not stated".

import {
  DEFAULT_WORK_DAYS_PER_WEEK,
  depositVsPay,
  effectiveHourly,
  monthlyHours,
  paydayAmounts,
  payBreakdown,
  penaltyVsPay,
  restHours,
  sameWorkloadPay,
  takeHomeChange,
  workDaysPerMonth,
  yearlyLoad,
} from './calc.js'

/** Row order in the table. */
export const ITEM_ORDER = ['pay', 'rest', 'medical', 'penalty', 'benefits']

/** 1 = most important. Decides which `worse` row becomes the "Biggest change" callout. */
export const PRIORITY = { penalty: 1, rest: 2, pay: 3, benefits: 4, medical: 5 }

const BENEFIT_KEYS = ['leaveDays', 'thirteenthMonth', 'mealsPerDay', 'privateRoom', 'cellphoneLoad', 'birthdayLeaveDays']

const EPS = 1e-9
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
/** "The contract gives me this": a real value that is not null, false or zero. */
const present = (v) => v !== null && v !== undefined && v !== false && v !== 0 && v !== ''

/**
 * Status from presence + equality:
 *   in new only -> added, in old only -> removed, in both and different -> changed, otherwise unchanged.
 */
export function statusOf(oldPresent, newPresent, same) {
  if (oldPresent && !newPresent) return 'removed'
  if (!oldPresent && newPresent) return 'added'
  if (!oldPresent && !newPresent) return 'unchanged'
  return same ? 'unchanged' : 'changed'
}

/** Table-cell value for an amount: null = Not stated, 0 = the contract says none. */
function moneyCell(v) {
  if (v === null || v === undefined) return { kind: 'notStated' }
  if (v === 0) return { kind: 'none' }
  return isNum(v) ? { kind: 'money', value: v } : { kind: 'notStated' }
}

const extraPayEqual = (a, b) => (a?.kind ?? null) === (b?.kind ?? null) && (a?.amount ?? null) === (b?.amount ?? null)
const samePaydays = (a, b) => (a ?? []).join() === (b ?? []).join()
const pct = (from, to) => (isNum(from) && from > 0 && isNum(to) ? (to - from) / from : null)

/** Verbatim clauses for the listed facts, skipping facts neither contract mentions. */
function clausesFor(o, n, facts) {
  return facts.flatMap((fact) => {
    const a = o.clauses?.[fact]
    const b = n.clauses?.[fact]
    if (!a && !b) return []
    const where = b ?? a
    return [{ fact, section: where.section, page: where.page, oldQuote: a?.quote ?? null, newQuote: b?.quote ?? null }]
  })
}

function makeItem(id, status, impact, fields) {
  // Identical in both contracts is always "same", whatever a rule would otherwise say.
  return { id, status, impact: status === 'unchanged' ? 'same' : impact, priority: PRIORITY[id], legalRefIds: [], ...fields }
}

// ---------- Pay ----------
// Impact: salary down -> worse. Pay per hour down: salary up -> watch (the bigger number hides longer
// work), salary not up -> worse. A cash advance newly taken in full: salary up -> watch, else worse.
// Salary up and nothing bad -> better. Anything else that changed (e.g. payday) -> watch.
function payItem(o, n) {
  const oldBreakdown = payBreakdown(o.salary)
  const newBreakdown = payBreakdown(n.salary)
  const oldHours = monthlyHours(o.hoursPerDay)
  const newHours = monthlyHours(n.hoursPerDay)
  const oldHourly = effectiveHourly(o.salary, oldHours)
  const newHourly = effectiveHourly(n.salary, newHours)

  const same =
    (o.salary ?? null) === (n.salary ?? null) &&
    samePaydays(o.paydays, n.paydays) &&
    (o.hoursPerDay ?? null) === (n.hoursPerDay ?? null) &&
    extraPayEqual(o.extraPay, n.extraPay) &&
    Boolean(o.cashAdvanceInFull) === Boolean(n.cashAdvanceInFull)
  const status = statusOf(present(o.salary), present(n.salary), same)

  const salaryUp = isNum(o.salary) && isNum(n.salary) && n.salary > o.salary
  const salaryDown = isNum(o.salary) && isNum(n.salary) && n.salary < o.salary
  const hourlyDown = oldHourly !== null && newHourly !== null && newHourly < oldHourly - EPS
  const newCashRule = !o.cashAdvanceInFull && Boolean(n.cashAdvanceInFull)

  let impact = 'watch'
  if (status === 'changed') {
    if (salaryDown) impact = 'worse'
    else if (hourlyDown) impact = salaryUp ? 'watch' : 'worse'
    else if (newCashRule) impact = salaryUp ? 'watch' : 'worse'
    else if (salaryUp) impact = 'better'
  }

  const sameWorkload = sameWorkloadPay(o, n.hoursPerDay)
  return makeItem('pay', status, impact, {
    old: moneyCell(o.salary),
    new: moneyCell(n.salary),
    numbers: {
      oldBreakdown,
      newBreakdown,
      takeHome: takeHomeChange(o.salary, n.salary),
      oldPayday: paydayAmounts(oldBreakdown.net, o.paydays),
      newPayday: paydayAmounts(newBreakdown.net, n.paydays),
      oldPaydays: o.paydays ?? [],
      newPaydays: n.paydays ?? [],
      grossChangePct: pct(o.salary, n.salary),
      oldHoursPerDay: o.hoursPerDay ?? null,
      newHoursPerDay: n.hoursPerDay ?? null,
      oldExtraPay: o.extraPay ?? null,
      newExtraPay: n.extraPay ?? null,
      oldMonthlyHours: oldHours,
      newMonthlyHours: newHours,
      hoursChangePct: pct(oldHours, newHours),
      oldHourly,
      newHourly,
      hourlyChangePct: pct(oldHourly, newHourly),
      sameWorkload,
      sameWorkloadGap: sameWorkload === null || !isNum(n.salary) ? null : sameWorkload - n.salary,
      newCashAdvanceRule: newCashRule,
      assumptions: { perWeek: DEFAULT_WORK_DAYS_PER_WEEK, workDays: workDaysPerMonth() },
    },
    clauses: clausesFor(o, n, ['wage', 'payday', 'hours', 'extraPay', 'deductions']),
  })
}

// ---------- Day off ----------
// Impact: weekly rest hours go down -> worse; go up -> better. If the new contract stops saying
// anything about rest -> worse; if it only starts saying so -> better; can't compare -> watch.
function restItem(o, n) {
  const oldHours = restHours(o.rest)
  const newHours = restHours(n.rest)
  const status = statusOf(oldHours !== null, newHours !== null, oldHours === newHours)

  let impact = 'watch'
  if (oldHours !== null && newHours !== null) {
    impact = newHours < oldHours ? 'worse' : newHours > oldHours ? 'better' : 'same'
  } else if (status === 'removed') impact = 'worse'
  else if (status === 'added') impact = 'better'

  const cell = (h) => (h === null ? { kind: 'notStated' } : { kind: 'hours', value: h })
  return makeItem('rest', status, impact, {
    old: cell(oldHours),
    new: cell(newHours),
    numbers: {
      oldHours,
      newHours,
      diffHours: oldHours !== null && newHours !== null ? newHours - oldHours : null,
      // Start and end times, when the rest day is a time window (the sheet quotes them as "8:00 AM to 5:00 PM").
      oldWindow: o.rest?.kind === 'window' ? { from: o.rest.from, to: o.rest.to } : null,
      newWindow: n.rest?.kind === 'window' ? { from: n.rest.from, to: n.rest.to } : null,
    },
    clauses: clausesFor(o, n, ['rest']),
  })
}

// ---------- Medical ----------
// Same in both -> unchanged / same. Never "added" just because the word appears in the new contract.
function medicalItem(o, n) {
  const a = Boolean(o.medical?.firstAid)
  const b = Boolean(n.medical?.firstAid)
  const status = statusOf(a, b, a === b)
  const impact = status === 'added' ? 'better' : status === 'removed' ? 'worse' : 'same'
  const cell = (v) => (v ? { kind: 'firstAid' } : { kind: 'notStated' })
  return makeItem('medical', status, impact, {
    old: cell(a),
    new: cell(b),
    numbers: {},
    clauses: clausesFor(o, n, ['medical']),
  })
}

// ---------- Penalty (leaving early) and deposit ----------
// Two separate money items. They are never added into one total: one is conditional, the other is
// handed over on signing.
// Impact: a new penalty or deposit, or a bigger one -> worse. Removed or smaller -> better.
const partStatus = (a, b) => statusOf(present(a), present(b), (a ?? 0) === (b ?? 0))
const partImpact = (a, b) => {
  const x = a ?? 0
  const y = b ?? 0
  return y > x ? 'worse' : y < x ? 'better' : 'same'
}

function penaltyItem(o, n) {
  const early = partStatus(o.earlyLeavePenalty, n.earlyLeavePenalty)
  const deposit = partStatus(o.deposit, n.deposit)
  const parts = [early, deposit]

  let status = 'unchanged'
  const hasAdded = parts.includes('added')
  const hasRemoved = parts.includes('removed')
  const hasChanged = parts.includes('changed')
  if (hasAdded && !hasRemoved && !hasChanged) status = 'added'
  else if (hasRemoved && !hasAdded && !hasChanged) status = 'removed'
  else if (hasAdded || hasRemoved || hasChanged) status = 'changed'

  const impacts = [partImpact(o.earlyLeavePenalty, n.earlyLeavePenalty), partImpact(o.deposit, n.deposit)]
  const impact = impacts.includes('worse') ? 'worse' : impacts.includes('better') ? 'better' : 'same'

  // Table cell: one entry per part, so the two amounts are shown side by side, never summed.
  const parted = (t) => ({
    kind: 'parts',
    parts: [
      { id: 'early', cell: moneyCell(t.earlyLeavePenalty) },
      { id: 'deposit', cell: moneyCell(t.deposit) },
    ],
  })

  return makeItem('penalty', status, impact, {
    old: parted(o),
    new: parted(n),
    numbers: {
      earlyStatus: early,
      depositStatus: deposit,
      oldEarlyPenalty: o.earlyLeavePenalty ?? null,
      earlyPenalty: n.earlyLeavePenalty ?? null,
      earlyVsPay: present(n.earlyLeavePenalty) ? penaltyVsPay(n.earlyLeavePenalty, n.salary) : null,
      oldDeposit: o.deposit ?? null,
      deposit: n.deposit ?? null,
      depositVsPay: present(n.deposit) ? depositVsPay(n.deposit, n.salary) : null,
      termYears: n.term?.years ?? null,
      termEnd: n.term?.end ?? null,
      oldTermYears: o.term?.years ?? null,
      noticeDays: n.noticeDays ?? null,
    },
    clauses: clausesFor(o, n, ['earlyLeave', 'deposit', 'notice', 'term']),
  })
}

// ---------- Other benefits ----------
// Impact: a benefit lost or reduced -> worse. Only new or bigger benefits -> better. Same -> same.
function benefitsItem(o, n) {
  const ob = o.benefits ?? {}
  const nb = n.benefits ?? {}
  const kept = []
  const added = []
  const removed = []
  const up = []
  const down = []
  for (const key of BENEFIT_KEYS) {
    const a = ob[key]
    const b = nb[key]
    if (!present(a) && present(b)) added.push(key)
    else if (present(a) && !present(b)) removed.push(key)
    else if (present(a) && present(b)) {
      if (isNum(a) && isNum(b) && b > a) (up.push(key), kept.push(key))
      else if (isNum(a) && isNum(b) && b < a) (down.push(key), kept.push(key))
      else kept.push(key)
    }
  }

  const gains = added.length + up.length
  const losses = removed.length + down.length
  // added = new benefits only, nothing lost or changed; removed = benefits lost only; otherwise changed.
  let status = 'unchanged'
  if (gains || losses) {
    const onlyAdded = added.length > 0 && !removed.length && !up.length && !down.length
    const onlyRemoved = removed.length > 0 && !added.length && !up.length && !down.length
    status = onlyAdded ? 'added' : onlyRemoved ? 'removed' : 'changed'
  }
  const impact = losses ? 'worse' : gains ? 'better' : 'same'
  const count = (b) => BENEFIT_KEYS.filter((k) => present(b[k])).length
  const cell = (b) => (count(b) ? { kind: 'count', value: count(b) } : { kind: 'notStated' })

  return makeItem('benefits', status, impact, {
    old: cell(ob),
    new: cell(nb),
    numbers: {
      same: kept.filter((k) => !up.includes(k) && !down.includes(k)),
      added,
      removed,
      increased: up,
      decreased: down,
      values: nb,
      loadYearly: yearlyLoad(nb.cellphoneLoad),
    },
    clauses: clausesFor(o, n, ['leave', 'benefits']),
  })
}

/**
 * @param {import('./terms.js').ContractTerms} oldTerms
 * @param {import('./terms.js').ContractTerms} newTerms
 * @returns {import('./terms.js').ComparisonItem[]} rows in table order
 */
export function buildComparison(oldTerms, newTerms) {
  const o = oldTerms ?? {}
  const n = newTerms ?? {}
  return [payItem(o, n), restItem(o, n), medicalItem(o, n), penaltyItem(o, n), benefitsItem(o, n)]
}

/** The `worse` row with the lowest priority number, or null when nothing got worse. */
export function biggestChange(items) {
  const worse = items.filter((i) => i.impact === 'worse')
  return worse.length ? worse.reduce((a, b) => (b.priority < a.priority ? b : a)) : null
}

/** Level 3 lists: what got better, and what to check (worse or watch), most important first. */
export function summaryLists(items) {
  const byPriority = (a, b) => a.priority - b.priority
  return {
    better: items.filter((i) => i.impact === 'better').sort(byPriority),
    check: items.filter((i) => i.impact === 'worse' || i.impact === 'watch').sort(byPriority),
  }
}
