// Display-only money formatting for the Compare screen. Calculators never round; only these do.
// Returns '' for missing / non-finite input so the caller can show "Not stated" instead.

const MINUS = '\u2212' // a real minus sign, easier to read than a hyphen next to a peso sign

const isNum = (n) => typeof n === 'number' && Number.isFinite(n)

/** Whole pesos print without decimals (₱5,000); anything with centavos prints 2 decimals (₱2,897.50). */
function format(amount, forceDecimals) {
  const whole = !forceDecimals && Math.abs(amount - Math.round(amount)) < 0.005
  const digits = whole ? 0 : 2
  return amount.toLocaleString('en-PH', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function formatPeso(amount) {
  if (!isNum(amount)) return ''
  const text = format(Math.abs(amount))
  // Avoid printing "−₱0" for tiny negatives that round to zero.
  const isZero = Number(text.replace(/,/g, '')) === 0
  return `${amount < 0 && !isZero ? MINUS : ''}₱${text}`
}

/** Hourly rates always show 2 decimals (₱28.85, ₱31.25). */
export function formatRate(amount) {
  if (!isNum(amount)) return ''
  return `${amount < 0 ? MINUS : ''}₱${format(Math.abs(amount), true)}`
}

/** +₱930 / −₱930 / ₱0 */
export function formatSigned(amount) {
  if (!isNum(amount)) return ''
  const text = formatPeso(Math.abs(amount))
  if (Number(text.replace(/[^\d.]/g, '')) === 0) return text
  return `${amount < 0 ? MINUS : '+'}${text}`
}

/** A ratio (0.6667) as a whole percent ("67%"). */
export function formatPercent(ratio) {
  if (!isNum(ratio)) return ''
  return `${Math.round(ratio * 100)}%`
}

/** A plain count with thousands separators (208, 1,040). Rounds to whole numbers. */
export function formatCount(n) {
  if (!isNum(n)) return ''
  return Math.round(n).toLocaleString('en-PH')
}
