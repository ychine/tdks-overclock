// Mandatory monthly EMPLOYEE contributions (2026). Deterministic: same salary in, same numbers out.
//   SSS        5% of the Monthly Salary Credit (MSC): salary rounded to its ₱500 bracket,
//              floor ₱5,000, ceiling ₱35,000  -> ₱250 to ₱1,750
//   PhilHealth 5% premium split equally (2.5% employee) on salary clamped to ₱10,000–₱100,000
//              -> ₱250 to ₱2,500 (a ₱6,000 salary still pays ₱250)
//   Pag-IBIG   2% of salary, base capped at ₱10,000 -> at most ₱200
// Employers may round differently; the payslip is the final word.

export const RATES = {
  sss: 0.05,
  sssMscFloor: 5000,
  sssMscCeiling: 35000,
  sssBracket: 500,
  philhealth: 0.025,
  philhealthFloor: 10000,
  philhealthCeiling: 100000,
  pagibig: 0.02,
  pagibigCap: 10000,
}

// Work in centavos so 5% of an odd amount never drifts.
const pct = (amount, rate) => Math.round(amount * 100 * rate) / 100
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

/** SSS brackets are ₱500 wide and centred on the credit, e.g. ₱5,750–₱6,249.99 -> ₱6,000. */
export function sssSalaryCredit(salary) {
  const { sssBracket: step, sssMscFloor, sssMscCeiling } = RATES
  return clamp(Math.floor((salary + step / 2) / step) * step, sssMscFloor, sssMscCeiling)
}

export function computeDeductions(monthlySalary) {
  const salary = Math.max(0, Number(monthlySalary) || 0)
  if (!salary) {
    return { salary: 0, sss: 0, philhealth: 0, pagibig: 0, total: 0, net: 0, perPayday: 0, takeHomePercent: 0 }
  }
  const sss = pct(sssSalaryCredit(salary), RATES.sss)
  const philhealth = pct(clamp(salary, RATES.philhealthFloor, RATES.philhealthCeiling), RATES.philhealth)
  const pagibig = pct(Math.min(salary, RATES.pagibigCap), RATES.pagibig)
  const total = Math.round((sss + philhealth + pagibig) * 100) / 100
  const net = Math.round((salary - total) * 100) / 100
  return {
    salary,
    sss,
    philhealth,
    pagibig,
    total,
    net,
    perPayday: Math.round((net / 2) * 100) / 100,
    takeHomePercent: salary ? Math.round((net / salary) * 100) : 0,
  }
}

/**
 * Reads a confirmed salary value like "₱18,000 / buwan" or "PHP 18000".
 * Returns { amount, monthly } where monthly is false for daily/hourly/weekly rates.
 */
export function parseSalary(value) {
  if (!value) return null
  const m = String(value).match(/(\d{1,3}(?:[,\s]\d{3})+|\d+)(?:\.(\d{1,2}))?/)
  if (!m) return null
  const amount = Number(m[1].replace(/[,\s]/g, '') + (m[2] ? `.${m[2]}` : ''))
  const monthly = !/araw|day|daily|oras|hour|linggo|week/i.test(value)
  return { amount, monthly }
}
