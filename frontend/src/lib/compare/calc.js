// Deterministic numbers for the Compare screen. Pure functions: no React, no network, no rounding
// (rounding is display-only, see money.js). Bad input gives 0 or null, never NaN or a throw.
// Relative imports only so `node --test` can run these without the Vite "@/" alias.

import { computeDeductions } from '../payroll.js'

const isNum = (n) => typeof n === 'number' && Number.isFinite(n)
/** A usable amount: finite and not negative, else 0. */
const amt = (n) => (isNum(n) && n > 0 ? n : 0)

/** Assumption shown next to every estimate: Sunday is the rest day, so 6 work days a week. */
export const DEFAULT_WORK_DAYS_PER_WEEK = 6

/** Employee contributions and take-home for a monthly salary. Wraps computeDeductions. */
export function payBreakdown(salary) {
  const d = computeDeductions(amt(salary))
  return { salary: d.salary, sss: d.sss, philhealth: d.philhealth, pagibig: d.pagibig, total: d.total, net: d.net }
}

/** New minus old: gross pay, contributions, and what actually reaches the worker. */
export function takeHomeChange(oldSalary, newSalary) {
  const a = payBreakdown(oldSalary)
  const b = payBreakdown(newSalary)
  return { gross: b.salary - a.salary, contributions: b.total - a.total, net: b.net - a.net }
}

/** Splits take-home across paydays (e.g. [15, 30] -> 2 payments). */
export function paydayAmounts(net, paydays) {
  const count = Array.isArray(paydays) ? paydays.length : 0
  if (!count) return { count: 0, each: 0 }
  return { count, each: amt(net) / count }
}

/** 6 days x 52 weeks / 12 months = 26. */
export function workDaysPerMonth(perWeek = DEFAULT_WORK_DAYS_PER_WEEK) {
  return (amt(perWeek) * 52) / 12
}

/** Estimated paid hours in a month. The contract does not state days per week, so this is an assumption. */
export function monthlyHours(hoursPerDay, perWeek = DEFAULT_WORK_DAYS_PER_WEEK) {
  return amt(hoursPerDay) * workDaysPerMonth(perWeek)
}

/** Gross monthly pay divided by hours. null when hours are unknown. */
export function effectiveHourly(salary, hours) {
  return amt(hours) > 0 ? amt(salary) / amt(hours) : null
}

/**
 * What the OLD contract would pay for a longer day: old salary plus the extra hours at the old
 * per-hour rate. null if the old contract has no per-hour rate to apply.
 */
export function sameWorkloadPay(oldTerms, hoursPerDay, perWeek = DEFAULT_WORK_DAYS_PER_WEEK) {
  const extra = oldTerms?.extraPay
  if (extra?.kind !== 'perHour') return null
  const extraHours = Math.max(0, amt(hoursPerDay) - amt(oldTerms.hoursPerDay))
  return amt(oldTerms.salary) + workDaysPerMonth(perWeek) * extraHours * amt(extra.amount)
}

const toMinutes = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm ?? ''))
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  return h > 23 || min > 59 ? null : h * 60 + min
}

/** Weekly rest in hours, computed from the times (not typed). A window past midnight adds a day. */
export function restHours(rest) {
  if (!rest) return null
  if (rest.kind === 'wholeDay') return 24
  if (rest.kind === 'window') {
    const from = toMinutes(rest.from)
    const to = toMinutes(rest.to)
    if (from === null || to === null) return null
    return (to > from ? to - from : to + 24 * 60 - from) / 60
  }
  return null
}

/** Share of one month's pay (0.67 = 67%). null when salary is unknown. */
export function penaltyVsPay(penalty, salary) {
  return amt(salary) > 0 ? amt(penalty) / amt(salary) : null
}

export function depositVsPay(deposit, salary) {
  return amt(salary) > 0 ? amt(deposit) / amt(salary) : null
}

/** 20% of the monthly wage (used only for the Phase 2 legal example). */
export function loanDeductionCap(salary) {
  return amt(salary) / 5
}

export function yearlyLoad(monthly) {
  return amt(monthly) * 12
}
