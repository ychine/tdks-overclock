import test from 'node:test'
import assert from 'node:assert/strict'
import {
  depositVsPay,
  effectiveHourly,
  loanDeductionCap,
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

const close = (actual, expected, eps = 0.005) =>
  assert.ok(Math.abs(actual - expected) < eps, `expected ${actual} to be within ${eps} of ${expected}`)

const OLD = { salary: 6500, hoursPerDay: 8, extraPay: { kind: 'perHour', amount: 45 } }

test('payBreakdown: old contract', () => {
  const b = payBreakdown(6500)
  assert.deepEqual(
    { sss: b.sss, philhealth: b.philhealth, pagibig: b.pagibig, total: b.total, net: b.net },
    { sss: 325, philhealth: 250, pagibig: 130, total: 705, net: 5795 },
  )
})

test('payBreakdown: new contract', () => {
  const b = payBreakdown(7500)
  assert.deepEqual(
    { sss: b.sss, philhealth: b.philhealth, pagibig: b.pagibig, total: b.total, net: b.net },
    { sss: 375, philhealth: 250, pagibig: 150, total: 775, net: 6725 },
  )
})

test('takeHomeChange: +930 take-home from +1000 gross and +70 contributions', () => {
  assert.deepEqual(takeHomeChange(6500, 7500), { gross: 1000, contributions: 70, net: 930 })
})

test('paydayAmounts', () => {
  assert.deepEqual(paydayAmounts(5795, [15, 30]), { count: 2, each: 2897.5 })
  assert.deepEqual(paydayAmounts(6725, [30]), { count: 1, each: 6725 })
  assert.deepEqual(paydayAmounts(6725, []), { count: 0, each: 0 })
  assert.deepEqual(paydayAmounts(6725, undefined), { count: 0, each: 0 })
})

test('monthlyHours: 26 work days a month, 208 and 260 hours', () => {
  assert.equal(workDaysPerMonth(), 26)
  assert.equal(monthlyHours(8), 208)
  assert.equal(monthlyHours(10), 260)
  close((monthlyHours(10) - monthlyHours(8)) / monthlyHours(8), 0.25, 1e-9)
})

test('effectiveHourly: 31.25 -> 28.85 (-7.7%)', () => {
  const oldRate = effectiveHourly(6500, 208)
  const newRate = effectiveHourly(7500, 260)
  assert.equal(oldRate, 31.25)
  close(newRate, 28.85)
  close((newRate - oldRate) / oldRate, -0.077, 0.001)
})

test('sameWorkloadPay: old contract at 10 hours/day pays 8,840, which is 1,340 more than 7,500', () => {
  const pay = sameWorkloadPay(OLD, 10)
  assert.equal(pay, 8840)
  assert.equal(pay - 7500, 1340)
})

test('sameWorkloadPay: null without a per-hour rate; no extra pay when hours are not longer', () => {
  assert.equal(sameWorkloadPay({ ...OLD, extraPay: { kind: 'none' } }, 10), null)
  assert.equal(sameWorkloadPay({ ...OLD, extraPay: null }, 10), null)
  assert.equal(sameWorkloadPay(undefined, 10), null)
  assert.equal(sameWorkloadPay(OLD, 8), 6500)
  assert.equal(sameWorkloadPay(OLD, 6), 6500)
})

test('restHours: computed from times', () => {
  assert.equal(restHours({ kind: 'wholeDay', hours: 24 }), 24)
  assert.equal(restHours({ kind: 'window', from: '08:00', to: '17:00' }), 9)
  assert.equal(24 - restHours({ kind: 'window', from: '08:00', to: '17:00' }), 15)
})

test('restHours: window past midnight, bad or missing input', () => {
  assert.equal(restHours({ kind: 'window', from: '22:00', to: '06:00' }), 8)
  assert.equal(restHours({ kind: 'window', from: '8am', to: '17:00' }), null)
  assert.equal(restHours({ kind: 'window', from: '25:00', to: '17:00' }), null)
  assert.equal(restHours({ kind: 'other' }), null)
  assert.equal(restHours(null), null)
  assert.equal(restHours(undefined), null)
})

test('penaltyVsPay and depositVsPay', () => {
  close(penaltyVsPay(5000, 7500), 0.6667, 0.0001)
  assert.equal(Math.round(penaltyVsPay(5000, 7500) * 100), 67)
  assert.equal(Math.round(depositVsPay(1000, 7500) * 100), 13)
})

test('loanDeductionCap and yearlyLoad', () => {
  assert.equal(loanDeductionCap(7500), 1500)
  assert.equal(yearlyLoad(300), 3600)
})

test('edge cases: salary 0, negative, NaN, missing', () => {
  assert.deepEqual(payBreakdown(0), { salary: 0, sss: 0, philhealth: 0, pagibig: 0, total: 0, net: 0 })
  assert.equal(payBreakdown(-100).net, 0)
  assert.equal(payBreakdown(NaN).net, 0)
  assert.equal(payBreakdown(undefined).net, 0)
  assert.deepEqual(takeHomeChange(0, 0), { gross: 0, contributions: 0, net: 0 })
  assert.equal(effectiveHourly(6500, 0), null)
  assert.equal(effectiveHourly(0, 208), 0)
  assert.equal(monthlyHours(0), 0)
  assert.equal(monthlyHours(undefined), 0)
  assert.equal(penaltyVsPay(5000, 0), null)
  assert.equal(depositVsPay(1000, 0), null)
  assert.equal(penaltyVsPay(null, 7500), 0)
  assert.equal(loanDeductionCap(0), 0)
  assert.equal(yearlyLoad(undefined), 0)
})

test('no calculator returns NaN for junk input', () => {
  const junk = [undefined, null, NaN, -5, 'abc']
  for (const j of junk) {
    for (const value of [
      payBreakdown(j).net,
      monthlyHours(j),
      loanDeductionCap(j),
      yearlyLoad(j),
      paydayAmounts(j, [30]).each,
    ]) {
      assert.ok(!Number.isNaN(value), `NaN for ${String(j)}`)
    }
  }
})
