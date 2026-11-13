// Small display formatters for the Compare sheet. Pure; relative imports only.
// Money formatting lives in money.js. These cover times, paydays, dates and hours.

/** "08:00" -> "8:00 AM", "17:00" -> "5:00 PM". '' for anything that is not HH:MM. */
export function formatTime(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm ?? ''))
  if (!m) return ''
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return ''
  return `${((h + 11) % 12) + 1}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`
}

/** Paydays as a short list: [30] -> "30", [15, 30] -> "15 & 30". */
export function formatDays(days) {
  const list = Array.isArray(days) ? days.filter((d) => Number.isFinite(d)) : []
  return list.join(' & ')
}

/** "2029-01-04" -> a short date in the given locale. Uses UTC so the day never shifts with the time zone. */
export function formatDate(iso, locale = 'en-PH') {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ''))
  if (!m) return ''
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
}

/** 9 -> "9", 8.5 -> "8.5". Hours are not rounded to whole numbers. */
export function formatHours(hours) {
  if (typeof hours !== 'number' || !Number.isFinite(hours)) return ''
  return Number.isInteger(hours) ? String(hours) : String(Math.round(hours * 10) / 10)
}
