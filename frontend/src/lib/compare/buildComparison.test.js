import test from 'node:test'
import assert from 'node:assert/strict'
import { biggestChange, buildComparison, statusOf, summaryLists } from './buildComparison.js'
import { NEW_TERMS, OLD_TERMS } from './sample.js'

const items = buildComparison(OLD_TERMS, NEW_TERMS)
const byId = Object.fromEntries(items.map((i) => [i.id, i]))
const clone = (x) => structuredClone(x)

test('sample: rows come back in table order', () => {
  assert.deepEqual(items.map((i) => i.id), ['pay', 'rest', 'medical', 'penalty', 'benefits'])
})

test('sample: status and impact per row', () => {
  const got = Object.fromEntries(items.map((i) => [i.id, `${i.status}/${i.impact}`]))
  assert.deepEqual(got, {
    pay: 'changed/watch',
    rest: 'changed/worse',
    medical: 'unchanged/same',
    penalty: 'added/worse',
    benefits: 'added/better',
  })
})

test('sample: priorities', () => {
  const got = Object.fromEntries(items.map((i) => [i.id, i.priority]))
  assert.deepEqual(got, { penalty: 1, rest: 2, pay: 3, benefits: 4, medical: 5 })
})

test('Medical is unchanged, never added', () => {
  assert.equal(byId.medical.status, 'unchanged')
  assert.notEqual(byId.medical.status, 'added')
  assert.equal(byId.medical.impact, 'same')
  assert.deepEqual(byId.medical.old, { kind: 'firstAid' })
  assert.deepEqual(byId.medical.new, { kind: 'firstAid' })
})

test('statusOf', () => {
  assert.equal(statusOf(false, true, false), 'added')
  assert.equal(statusOf(true, false, false), 'removed')
  assert.equal(statusOf(true, true, false), 'changed')
  assert.equal(statusOf(true, true, true), 'unchanged')
  assert.equal(statusOf(false, false, true), 'unchanged')
})

test('pay numbers match the calculators', () => {
  const p = byId.pay.numbers
  assert.equal(p.oldBreakdown.net, 5795)
  assert.equal(p.newBreakdown.net, 6725)
  assert.deepEqual(p.takeHome, { gross: 1000, contributions: 70, net: 930 })
  assert.deepEqual(p.oldPayday, { count: 2, each: 2897.5 })
  assert.deepEqual(p.newPayday, { count: 1, each: 6725 })
  assert.equal(p.oldMonthlyHours, 208)
  assert.equal(p.newMonthlyHours, 260)
  assert.equal(p.oldHourly, 31.25)
  assert.ok(Math.abs(p.newHourly - 28.846) < 0.001)
  assert.equal(p.sameWorkload, 8840)
  assert.equal(p.sameWorkloadGap, 1340)
  assert.deepEqual(p.assumptions, { perWeek: 6, workDays: 26 })
  assert.deepEqual(p.newExtraPay, { kind: 'none' })
})

test('rest numbers are computed from the times', () => {
  assert.deepEqual(byId.rest.numbers, {
    oldHours: 24,
    newHours: 9,
    diffHours: -15,
    oldWindow: null,
    newWindow: { from: '08:00', to: '17:00' },
  })
  assert.deepEqual(byId.rest.old, { kind: 'hours', value: 24 })
  assert.deepEqual(byId.rest.new, { kind: 'hours', value: 9 })
})

test('penalty: two separate parts, Not stated vs None kept apart', () => {
  const pen = byId.penalty
  assert.deepEqual(pen.old.parts, [
    { id: 'early', cell: { kind: 'notStated' } },
    { id: 'deposit', cell: { kind: 'none' } },
  ])
  assert.deepEqual(pen.new.parts, [
    { id: 'early', cell: { kind: 'money', value: 5000 } },
    { id: 'deposit', cell: { kind: 'money', value: 1000 } },
  ])
  assert.equal(pen.numbers.earlyPenalty, 5000)
  assert.equal(pen.numbers.deposit, 1000)
  assert.equal(Math.round(pen.numbers.earlyVsPay * 100), 67)
  assert.equal(Math.round(pen.numbers.depositVsPay * 100), 13)
  assert.equal(pen.numbers.termYears, 2)
  assert.equal(pen.numbers.termEnd, '2029-01-04')
  assert.equal(pen.numbers.noticeDays, 5)
})

test('no combined 6,000 anywhere in the numbers', () => {
  const found = []
  const walk = (v) => {
    if (typeof v === 'number') found.push(v)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  for (const item of items) walk(item.numbers)
  assert.ok(!found.includes(6000))
})

test('benefits: what stayed and what is new', () => {
  const b = byId.benefits.numbers
  assert.deepEqual(b.same, ['leaveDays', 'thirteenthMonth', 'mealsPerDay', 'privateRoom'])
  assert.deepEqual(b.added, ['cellphoneLoad', 'birthdayLeaveDays'])
  assert.deepEqual(b.removed, [])
  assert.equal(b.loadYearly, 3600)
  assert.deepEqual(byId.benefits.old, { kind: 'count', value: 4 })
  assert.deepEqual(byId.benefits.new, { kind: 'count', value: 6 })
})

test('clauses carry section, page and verbatim quotes', () => {
  const rest = byId.rest.clauses[0]
  assert.equal(rest.section, '6')
  assert.equal(rest.page, 1)
  assert.equal(rest.oldQuote, 'Sunday, the whole day (24 consecutive hours)')
  assert.equal(rest.newQuote, 'Sunday, from 8:00 AM to 5:00 PM only')

  const extra = byId.pay.clauses.find((c) => c.fact === 'extraPay')
  assert.equal(extra.section, '7(b)')
  assert.equal(extra.oldQuote, 'PHP 45.00 for every hour worked beyond 8 hours')
  assert.equal(extra.newQuote, 'None. All overtime is included in the monthly wage.')

  const early = byId.penalty.clauses.find((c) => c.fact === 'earlyLeave')
  assert.deepEqual([early.section, early.page], ['15', 2])
  assert.equal(early.newQuote, 'If the Kasambahay leaves before the contract ends, she shall pay a penalty of PHP 5,000.00.')

  const deposit = byId.penalty.clauses.find((c) => c.fact === 'deposit')
  assert.deepEqual([deposit.section, deposit.page], ['11', 2])

  const cash = byId.pay.clauses.find((c) => c.fact === 'deductions')
  assert.equal(cash.newQuote, 'Cash advances shall be deducted in full from the next wage.')
  assert.equal(cash.oldQuote, null)
})

test('every row has a legalRefIds array (empty in Phase 1)', () => {
  for (const item of items) assert.deepEqual(item.legalRefIds, [])
})

test('biggestChange is the penalty row; summary lists are split by impact', () => {
  assert.equal(biggestChange(items).id, 'penalty')
  const { better, check } = summaryLists(items)
  assert.deepEqual(better.map((i) => i.id), ['benefits'])
  assert.deepEqual(check.map((i) => i.id), ['penalty', 'rest', 'pay'])
})

test('biggestChange: null when nothing got worse', () => {
  assert.equal(biggestChange(buildComparison(OLD_TERMS, OLD_TERMS)), null)
})

test('equal contracts: everything unchanged / same', () => {
  for (const item of buildComparison(OLD_TERMS, clone(OLD_TERMS))) {
    assert.equal(item.status, 'unchanged', item.id)
    assert.equal(item.impact, 'same', item.id)
  }
})

test('empty benefits on both sides', () => {
  const a = { ...clone(OLD_TERMS), benefits: {} }
  const b = { ...clone(NEW_TERMS), benefits: {} }
  const row = buildComparison(a, b).find((i) => i.id === 'benefits')
  assert.equal(row.status, 'unchanged')
  assert.equal(row.impact, 'same')
  assert.deepEqual(row.old, { kind: 'notStated' })
})

test('lost benefit -> removed / worse', () => {
  const a = clone(NEW_TERMS)
  const b = { ...clone(NEW_TERMS), benefits: { ...NEW_TERMS.benefits, cellphoneLoad: null } }
  const row = buildComparison(a, b).find((i) => i.id === 'benefits')
  assert.equal(row.status, 'removed')
  assert.equal(row.impact, 'worse')
})

test('missing fields give Not stated and never throw', () => {
  const rows = buildComparison({}, {})
  for (const row of rows) {
    assert.equal(row.status, 'unchanged', row.id)
    assert.equal(row.impact, 'same', row.id)
  }
  const [pay, rest] = rows
  assert.deepEqual(pay.old, { kind: 'notStated' })
  assert.deepEqual(rest.new, { kind: 'notStated' })
  assert.doesNotThrow(() => buildComparison(undefined, null))
})

test('salary 0 does not break the numbers', () => {
  const zero = { ...clone(NEW_TERMS), salary: 0 }
  const row = buildComparison(zero, zero).find((i) => i.id === 'pay')
  assert.equal(row.numbers.newBreakdown.net, 0)
  assert.equal(row.numbers.newHourly, 0)
  const pen = buildComparison(zero, zero).find((i) => i.id === 'penalty')
  assert.equal(pen.numbers.earlyVsPay, null)
})

test('pay impact rules', () => {
  const pay = (changes) => buildComparison(OLD_TERMS, { ...clone(OLD_TERMS), ...changes }).find((i) => i.id === 'pay')
  assert.equal(pay({ salary: 5000 }).impact, 'worse') // salary down
  assert.equal(pay({ salary: 7500 }).impact, 'better') // salary up, same hours
  assert.equal(pay({ salary: 7500, hoursPerDay: 10 }).impact, 'watch') // up, but pay per hour down
  assert.equal(pay({ hoursPerDay: 10 }).impact, 'worse') // same salary, longer day
  assert.equal(pay({ cashAdvanceInFull: true }).impact, 'worse') // new deduction rule only
  assert.equal(pay({ paydays: [30] }).impact, 'watch') // only the payday moved
})

test('rest impact rules', () => {
  const rest = (r) => buildComparison(OLD_TERMS, { ...clone(OLD_TERMS), rest: r }).find((i) => i.id === 'rest')
  assert.equal(rest({ kind: 'window', from: '08:00', to: '17:00' }).impact, 'worse')
  assert.equal(rest(null).status, 'removed')
  assert.equal(rest(null).impact, 'worse')
  const grew = buildComparison(
    { ...clone(OLD_TERMS), rest: { kind: 'window', from: '08:00', to: '17:00' } },
    OLD_TERMS,
  ).find((i) => i.id === 'rest')
  assert.equal(grew.impact, 'better')
})

test('penalty impact rules', () => {
  const pen = (changes) => buildComparison(NEW_TERMS, { ...clone(NEW_TERMS), ...changes }).find((i) => i.id === 'penalty')
  assert.equal(pen({ earlyLeavePenalty: 8000 }).impact, 'worse')
  assert.equal(pen({ earlyLeavePenalty: 8000 }).status, 'changed')
  assert.equal(pen({ earlyLeavePenalty: 0, deposit: 0 }).impact, 'better')
  assert.equal(pen({ earlyLeavePenalty: 0, deposit: 0 }).status, 'removed')
})

test('the input terms are not mutated', () => {
  const before = JSON.stringify([OLD_TERMS, NEW_TERMS])
  buildComparison(OLD_TERMS, NEW_TERMS)
  assert.equal(JSON.stringify([OLD_TERMS, NEW_TERMS]), before)
})
