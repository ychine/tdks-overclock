// The sample contract used throughout the demo. Numbers here are the single source of truth
// for the Salary screen, the Summary, and the contract Q&A engine.

export const contract = {
  salary: 18000,
  deductions: { sss: 900, philhealth: 270, pagibig: 90 },
  penalty: 5000,
  // Original wording of the clauses (the contract itself is in English).
  clauses: {
    compensation: {
      label: 'Clause 1',
      quote: '“The Employee shall receive PHP 18,000 per month, payable every 15th and 30th.”',
    },
    term: {
      label: 'Clause 2',
      quote: '“Employment starts on 15 June 2025 and will continue for two (2) years.”',
    },
    hours: {
      label: 'Clause 3',
      quote: '“The Employee shall work 8 hours per day, six days each week.”',
    },
    rest: { label: 'Clause 4', quote: '“The weekly rest day shall be Sunday.”' },
    early: {
      label: 'Clause 8.2',
      quote: '“In case of early termination by the Employee, a fixed sum of PHP 5,000…”',
    },
  },
}

export const totalDeductions =
  contract.deductions.sss + contract.deductions.philhealth + contract.deductions.pagibig
export const netPay = contract.salary - totalDeductions
export const perPayday = netPay / 2
export const takeHomePercent = Math.round((netPay / contract.salary) * 100)

export const peso = (amount) => `₱${amount.toLocaleString('en-PH')}`
