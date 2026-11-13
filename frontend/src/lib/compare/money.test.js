import test from 'node:test'
import assert from 'node:assert/strict'
import { formatCount, formatPercent, formatPeso, formatRate, formatSigned } from './money.js'

test('formatPeso: whole values have no decimals', () => {
  assert.equal(formatPeso(5000), '₱5,000')
  assert.equal(formatPeso(6725), '₱6,725')
  assert.equal(formatPeso(0), '₱0')
})

test('formatPeso: centavos print 2 decimals', () => {
  assert.equal(formatPeso(2897.5), '₱2,897.50')
  assert.equal(formatPeso(2897.456), '₱2,897.46')
})

test('formatPeso: negatives and missing input', () => {
  assert.equal(formatPeso(-930), '\u2212₱930')
  assert.equal(formatPeso(-0.001), '₱0')
  for (const bad of [null, undefined, NaN, Infinity, '12']) assert.equal(formatPeso(bad), '')
})

test('formatRate: always 2 decimals, rounded', () => {
  assert.equal(formatRate(31.25), '₱31.25')
  assert.equal(formatRate(7500 / 260), '₱28.85')
  assert.equal(formatRate(45), '₱45.00')
  assert.equal(formatRate(null), '')
})

test('formatSigned: shows the direction', () => {
  assert.equal(formatSigned(930), '+₱930')
  assert.equal(formatSigned(-1340), '\u2212₱1,340')
  assert.equal(formatSigned(0), '₱0')
  assert.equal(formatSigned(NaN), '')
})

test('formatPercent and formatCount', () => {
  assert.equal(formatPercent(5000 / 7500), '67%')
  assert.equal(formatPercent(1000 / 7500), '13%')
  assert.equal(formatPercent(null), '')
  assert.equal(formatCount(260), '260')
  assert.equal(formatCount(1040.4), '1,040')
  assert.equal(formatCount(undefined), '')
})
