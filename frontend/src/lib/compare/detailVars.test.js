import test from 'node:test'
import assert from 'node:assert/strict'
import { buildComparison } from './buildComparison.js'
import { lineVars, sentenceVars } from './detailVars.js'
import { formatDate, formatDays, formatHours, formatTime } from './format.js'
import { NEW_TERMS, OLD_TERMS } from './sample.js'

const byId = Object.fromEntries(buildComparison(OLD_TERMS, NEW_TERMS).map((i) => [i.id, i]))

test('formatTime', () => {
  assert.equal(formatTime('08:00'), '8:00 AM')
  assert.equal(formatTime('17:00'), '5:00 PM')
  assert.equal(formatTime('00:30'), '12:30 AM')
  assert.equal(formatTime('12:00'), '12:00 PM')
  for (const bad of ['', null, undefined, '8am', '25:00', '10:75']) assert.equal(formatTime(bad), '')
})

test('formatDays, formatHours, formatDate', () => {
  assert.equal(formatDays([15, 30]), '15 & 30')
  assert.equal(formatDays([30]), '30')
  assert.equal(formatDays(undefined), '')
  assert.equal(formatHours(9), '9')
  assert.equal(formatHours(8.5), '8.5')
  assert.equal(formatHours(NaN), '')
  assert.match(formatDate('2029-01-04', 'en-PH'), /2029/)
  assert.match(formatDate('2029-01-04', 'en-PH'), /\b4\b/)
  assert.equal(formatDate('nope'), '')
})

test('pay sentence values', () => {
  assert.deepEqual(sentenceVars(byId.pay, 'changed'), {
    amount: '₱1,000',
    pct: '15%',
    oldHours: '8',
    newHours: '10',
    rate: '₱45',
  })
})

test('rest sentence values come from the times', () => {
  assert.deepEqual(sentenceVars(byId.rest, 'changed'), { from: '8:00 AM', to: '5:00 PM', hours: '15' })
})

test('penalty: Part A questions use the penalty, Part B the deposit; never a sum', () => {
  const a = sentenceVars(byId.penalty, 'askA')
  const b = sentenceVars(byId.penalty, 'askB')
  assert.equal(a.amount, '₱5,000')
  assert.equal(b.amount, '₱1,000')
  assert.equal(a.days, '5')
  assert.ok(!JSON.stringify([a, b]).includes('6,000'))
})

test('benefits sentence values', () => {
  assert.deepEqual(sentenceVars(byId.benefits, 'ask'), { n: '2', amount: '₱300' })
})

test('callout and summary line values', () => {
  assert.deepEqual(lineVars(byId.pay), { net: '₱930', hours: '52', oldRate: '₱31.25', newRate: '₱28.85' })
  assert.deepEqual(lineVars(byId.rest), { old: '24', new: '9' })
  assert.deepEqual(lineVars(byId.penalty), { early: '₱5,000', deposit: '₱1,000' })
  assert.deepEqual(lineVars(byId.benefits), { n: '2' })
  assert.deepEqual(lineVars(byId.medical), {})
})

test('rows without placeholders return an empty object', () => {
  assert.deepEqual(sentenceVars(byId.medical, 'changed'), {})
})
