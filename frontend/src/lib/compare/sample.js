// Sample fixture: the two demo contracts (linaw-compare-OLD-2026.pdf and linaw-compare-NEW-2027.pdf).
// This is the ONLY place the demo numbers live. Phase 3 replaces it with real extraction.
//
// Quotes are verbatim and never translated. Where the exact wording has not been stored, `quote`
// is null: we still show Section + Page, we do not make text up.

/** @typedef {import('./terms.js').ContractTerms} ContractTerms */

/** @type {ContractTerms} */
export const OLD_TERMS = {
  salary: 6500,
  paydays: [15, 30],
  workWindow: { from: '07:00', to: '17:00', breakHours: 2 },
  hoursPerDay: 8,
  extraPay: { kind: 'perHour', amount: 45 },
  rest: { kind: 'wholeDay', hours: 24 },
  cashAdvanceInFull: false,
  term: { years: 1, start: '2026-01-05', end: '2027-01-04' },
  noticeDays: 5,
  medical: { firstAid: true },
  benefits: {
    leaveDays: 5,
    thirteenthMonth: true,
    mealsPerDay: 3,
    privateRoom: true,
    cellphoneLoad: null,
    birthdayLeaveDays: null,
  },
  deposit: 0, // Sec 11 (Loan agreement): none
  earlyLeavePenalty: null, // no early-leaving penalty stated
  clauses: {
    wage: { section: '7(a)', page: 1, quote: null },
    payday: {
      section: '7(c)',
      page: 1,
      quote: 'Every 15th and 30th day of the month, with a pay slip showing all deductions',
    },
    hours: { section: '5', page: 1, quote: null },
    extraPay: { section: '7(b)', page: 1, quote: 'PHP 45.00 for every hour worked beyond 8 hours' },
    rest: { section: '6', page: 1, quote: 'Sunday, the whole day (24 consecutive hours)' },
    leave: { section: '9(a)', page: 1, quote: null },
    medical: { section: '9(b)', page: 1, quote: 'First-aid assistance in case of illness' },
    benefits: { section: '10', page: 2, quote: null },
    deposit: { section: '11', page: 2, quote: null },
    notice: { section: '13', page: 2, quote: null },
    term: { section: '2', page: 1, quote: null },
  },
}

/** @type {ContractTerms} */
export const NEW_TERMS = {
  salary: 7500,
  paydays: [30],
  workWindow: { from: '06:00', to: '18:00', breakHours: 2 },
  hoursPerDay: 10,
  extraPay: { kind: 'none' }, // "None. All overtime is included in the monthly wage." (stated, not missing)
  rest: { kind: 'window', from: '08:00', to: '17:00' },
  cashAdvanceInFull: true,
  term: { years: 2, start: '2027-01-05', end: '2029-01-04' },
  noticeDays: 5,
  medical: { firstAid: true },
  benefits: {
    leaveDays: 5,
    thirteenthMonth: true,
    mealsPerDay: 3,
    privateRoom: true,
    cellphoneLoad: 300,
    birthdayLeaveDays: 1,
  },
  deposit: 1000,
  earlyLeavePenalty: 5000,
  clauses: {
    wage: { section: '7(a)', page: 1, quote: null },
    payday: {
      section: '7(c)',
      page: 1,
      quote: 'Every 30th day of the month, with a pay slip showing all deductions',
    },
    hours: { section: '5', page: 1, quote: null },
    extraPay: { section: '7(b)', page: 1, quote: 'None. All overtime is included in the monthly wage.' },
    rest: { section: '6', page: 1, quote: 'Sunday, from 8:00 AM to 5:00 PM only' },
    deductions: { section: '8', page: 1, quote: 'Cash advances shall be deducted in full from the next wage.' },
    leave: { section: '9(a)', page: 1, quote: null },
    medical: { section: '9(b)', page: 1, quote: 'First-aid assistance in case of illness' },
    benefits: {
      section: '10',
      page: 2,
      quote: 'PHP 300.00 cellphone load every month; one (1) paid day off on her birthday.',
    },
    deposit: {
      section: '11',
      page: 2,
      quote: 'Upon signing this contract, the Kasambahay shall leave a deposit of PHP 1,000.00 to pay for any items she breaks or loses.',
    },
    notice: { section: '13', page: 2, quote: null },
    earlyLeave: {
      section: '15',
      page: 2,
      quote: 'If the Kasambahay leaves before the contract ends, she shall pay a penalty of PHP 5,000.00.',
    },
    term: { section: '2', page: 1, quote: null },
  },
}
