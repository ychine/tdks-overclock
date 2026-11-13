// Types for the Compare screen. JSDoc only: this project is plain JavaScript.
//
// Words used everywhere (code, copy, help text):
//   Added      appears in the new contract, not in the old one.
//   Removed    appears in the old contract, not in the new one.
//   Changed    in both, with a different value.
//   Unchanged  the same in both. (Medical is Unchanged, never "Added".)
//   Not stated a VALUE meaning "we did not find it in this document". It is not a status and
//              it does not mean "no". A stated "none" (e.g. "no deposit") is different: use 0 / {kind:'none'}.

/**
 * One quoted piece of a contract. `quote` is verbatim and is never translated or paraphrased.
 * It is null when we know where a fact is (section, page) but have not stored the exact wording.
 * @typedef {Object} Clause
 * @property {string} section  e.g. "7(b)"
 * @property {number} page
 * @property {string|null} quote
 */

/**
 * Normalized facts from ONE contract. `null` / `undefined` means "Not stated".
 * @typedef {Object} ContractTerms
 * @property {number|null} salary                 monthly, pesos
 * @property {number[]} paydays                   days of the month, e.g. [15, 30] or [30]
 * @property {{from:string,to:string,breakHours:number}|null} workWindow  "07:00", "17:00", 2
 * @property {number|null} hoursPerDay            paid hours, excluding the break
 * @property {{kind:'perHour',amount:number}|{kind:'none'}|null} extraPay  pay beyond the agreed hours.
 *           {kind:'none'} is an explicit statement ("all overtime is included"); null is Not stated.
 * @property {{kind:'wholeDay',hours:24}|{kind:'window',from:string,to:string}|null} rest  weekly rest day
 * @property {boolean} cashAdvanceInFull          cash advance is deducted in full from the next wage
 * @property {{years:number,start:string,end:string}|null} term    dates as YYYY-MM-DD
 * @property {number|null} noticeDays             days of written notice to end the contract
 * @property {{firstAid:boolean}|null} medical
 * @property {Object} benefits                    leaveDays, thirteenthMonth, mealsPerDay, privateRoom,
 *           cellphoneLoad (pesos a month), birthdayLeaveDays. null / false / 0 = not in this contract.
 * @property {number|null} deposit                0 = the contract says there is none; null = Not stated
 * @property {number|null} earlyLeavePenalty      0 = the contract says there is none; null = Not stated
 * @property {Object<string, Clause>} clauses     fact name -> where it is and what it says
 */

/**
 * A table-cell value. Structured on purpose: the UI turns it into words with t() and money.js,
 * so this layer holds no translated text and no formatted pesos.
 * @typedef {{kind:'money',value:number}|{kind:'hours',value:number}|{kind:'count',value:number}
 *   |{kind:'firstAid'}|{kind:'none'}|{kind:'notStated'}
 *   |{kind:'parts',parts:{id:string,cell:CellValue}[]}} CellValue
 */

/**
 * @typedef {Object} ComparisonItem
 * @property {'pay'|'rest'|'medical'|'penalty'|'benefits'} id   (Phase 2 adds 'hours' and 'term')
 * @property {'added'|'removed'|'changed'|'unchanged'} status   WHAT happened
 * @property {'better'|'worse'|'watch'|'same'} impact           is it good or bad for the worker
 * @property {number} priority                                   1 = most important
 * @property {CellValue} old
 * @property {CellValue} new
 * @property {Object} numbers                                    computed figures for the sheet
 * @property {{fact:string,section:string,page:number,oldQuote?:string|null,newQuote?:string|null}[]} clauses
 * @property {string[]} legalRefIds                              Phase 2: ids of verified backend legal refs
 */

export {}
