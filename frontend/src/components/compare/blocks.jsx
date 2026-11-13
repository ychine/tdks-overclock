import { formatDate, formatDays, formatHours } from '../../lib/compare/format'
import { formatCount, formatPercent, formatPeso, formatRate } from '../../lib/compare/money'
import { detailKey, DETAIL_COUNTS, MEDICAL_MISSING, PENALTY_NOT_STATED } from '../../lib/compare/copyKeys'
import { sentenceVars } from '../../lib/compare/detailVars'
import { useI18n } from '../../i18n/useI18n'
import { LANGUAGE_TAGS } from '../../i18n/messages'
import { Badge, ListGroup, ListRow } from '../ui/Surfaces'
import { EstimateNote, Quote, SubHeading } from './parts'

/** The row-specific part of the sheet. Every figure comes from item.numbers; nothing is computed here. */
const wrap = 'mt-6 grid gap-5 border-t border-line pt-5'

const clauseOf = (item, fact) => item.clauses.find((c) => c.fact === fact)

function NotStatedList({ title, keys }) {
  const { t } = useI18n()
  return (
    <div className="grid gap-2.5">
      <SubHeading>{title}</SubHeading>
      <ListGroup>
        {keys.map((key) => (
          <ListRow key={key} title={t(key)} badge={<Badge tone="neutral">{t('compare.detail.common.notStated')}</Badge>} />
        ))}
      </ListGroup>
    </div>
  )
}

// ---------------------------------------------------------------- PAY
export function PayBlock({ item }) {
  const { t } = useI18n()
  const n = item.numbers
  const oldDays = formatDays(n.oldPaydays)
  const newDays = formatDays(n.newPaydays)
  const payday = (side, days) =>
    side.count === 1
      ? t('compare.detail.pay.paydayOnce', { amount: formatPeso(side.each), days })
      : t('compare.detail.pay.paydayEach', { amount: formatPeso(side.each), days })
  const extraQuote = clauseOf(item, 'extraPay')?.newQuote
  const num = 'px-3 py-2.5 text-right tabular-nums'

  const rows = [
    ['salary', 'salary', false],
    ['sss', 'sss', false],
    ['philhealth', 'philhealth', false],
    ['pagibig', 'pagibig', false],
    ['total', 'total', false],
    ['takeHome', 'net', true],
  ]

  return (
    <div className={wrap}>
      <div className="grid gap-3">
        <SubHeading>{t('compare.detail.pay.tbl.caption')}</SubHeading>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-base" aria-label={t('compare.detail.pay.tbl.caption')}>
            <thead>
              <tr className="border-b border-line text-sm text-subtle">
                <th scope="col" className="px-3 py-2 text-left font-normal">
                  <span className="sr-only">{t('compare.detail')}</span>
                </th>
                <th scope="col" className="px-3 py-2 text-right font-bold">{t('compare.detail.common.old')}</th>
                <th scope="col" className="px-3 py-2 text-right font-bold">{t('compare.detail.common.new')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(([label, field, strong]) => (
                <tr key={label} className={strong ? 'bg-brand-soft/60 font-bold' : ''}>
                  <th scope="row" className="px-3 py-2.5 text-left font-normal">
                    <span className={strong ? 'font-bold' : ''}>{t(`compare.detail.pay.tbl.${label}`)}</span>
                  </th>
                  <td className={num}>{formatPeso(n.oldBreakdown[field])}</td>
                  <td className={num}>{formatPeso(n.newBreakdown[field])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EstimateNote>{t('compare.detail.common.ratesNote')}</EstimateNote>
        <p>
          {t('compare.detail.pay.takeHomeLine', {
            net: formatPeso(n.takeHome.net),
            gross: formatPeso(n.takeHome.gross),
            contrib: formatPeso(n.takeHome.contributions),
          })}
        </p>
        <ul className="grid gap-1.5">
          <li>{payday(n.oldPayday, oldDays)}</li>
          <li>{payday(n.newPayday, newDays)}</li>
        </ul>
      </div>

      <div className="grid gap-3 border-t border-line pt-5">
        <SubHeading>{t('compare.detail.pay.hoursTitle')}</SubHeading>
        <p>{t('compare.detail.pay.hoursPerDay', { old: formatHours(n.oldHoursPerDay), new: formatHours(n.newHoursPerDay) })}</p>
        {n.oldExtraPay?.kind === 'perHour' && (
          <p>{t('compare.detail.pay.extraWas', { rate: formatPeso(n.oldExtraPay.amount) })}</p>
        )}
        {n.newExtraPay?.kind === 'none' && (
          <>
            <p>{t('compare.detail.pay.extraNow')}</p>
            {/* An explicit statement in the contract, shown word for word. It is not "not stated". */}
            {extraQuote && <Quote>{extraQuote}</Quote>}
          </>
        )}
        {n.newExtraPay?.kind === 'perHour' && (
          <p>{t('compare.detail.pay.extraRate', { rate: formatPeso(n.newExtraPay.amount) })}</p>
        )}
        {!n.newExtraPay && <p>{t('compare.detail.common.notStated')}</p>}
        {n.oldHourly !== null && n.newHourly !== null && (
          <p>
            {t('compare.detail.pay.estimate', {
              oldHours: formatCount(n.oldMonthlyHours),
              newHours: formatCount(n.newMonthlyHours),
              oldRate: formatRate(n.oldHourly),
              newRate: formatRate(n.newHourly),
            })}
          </p>
        )}
        {n.sameWorkload !== null && (
          <p>
            {t('compare.detail.pay.sameWorkload', {
              hoursPerDay: formatHours(n.newHoursPerDay),
              oldPay: formatPeso(n.sameWorkload),
              newPay: formatPeso(n.newBreakdown.salary),
            })}
          </p>
        )}
        <EstimateNote>
          {t('compare.detail.common.assumptions', {
            perWeek: formatCount(n.assumptions.perWeek),
            workDays: formatCount(n.assumptions.workDays),
          })}
        </EstimateNote>
      </div>

      <div className="grid gap-2.5 border-t border-line pt-5">
        <SubHeading>{t('compare.detail.pay.dedTitle')}</SubHeading>
        <p>{t('compare.detail.pay.dedSame')}</p>
        {n.newCashAdvanceRule && <p className="font-semibold">{t('compare.detail.pay.dedNew')}</p>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- MEDICAL
export function MedicalBlock() {
  const { t } = useI18n()
  const keys = Array.from({ length: MEDICAL_MISSING }, (_, i) => `compare.detail.medical.missing${i + 1}`)
  return (
    <div className={wrap}>
      <NotStatedList title={t('compare.detail.medical.missingTitle')} keys={keys} />
    </div>
  )
}

// ---------------------------------------------------------------- PENALTY + DEPOSIT
// Two separate amounts with their own "when it applies". They are never added into one total.
export function PenaltyBlock({ item }) {
  const { t, language } = useI18n()
  const n = item.numbers
  const hasEarly = n.earlyPenalty > 0
  const hasDeposit = n.deposit > 0
  const noticeSection = clauseOf(item, 'notice')?.section ?? ''
  const nsKeys = Array.from({ length: PENALTY_NOT_STATED }, (_, i) => `compare.detail.penalty.ns${i + 1}`)

  return (
    <div className={wrap}>
      {hasEarly && (
        <div className="grid gap-2">
          <SubHeading>{t('compare.detail.penalty.aTitle')}</SubHeading>
          <p className="font-display text-3xl font-semibold tabular-nums">{formatPeso(n.earlyPenalty)}</p>
          <p>{t('compare.detail.penalty.aWhen')}</p>
          {n.earlyVsPay !== null && <p>{t('compare.detail.penalty.aShare', { pct: formatPercent(n.earlyVsPay) })}</p>}
        </div>
      )}
      {hasDeposit && (
        <div className={`grid gap-2 ${hasEarly ? 'border-t border-line pt-5' : ''}`}>
          <SubHeading>{t('compare.detail.penalty.bTitle')}</SubHeading>
          <p className="font-display text-3xl font-semibold tabular-nums">{formatPeso(n.deposit)}</p>
          <p>{t('compare.detail.penalty.bWhen')}</p>
          {n.depositVsPay !== null && <p>{t('compare.detail.penalty.bShare', { pct: formatPercent(n.depositVsPay) })}</p>}
          <p className="text-sm text-subtle">{t('compare.detail.penalty.bCite')}</p>
        </div>
      )}

      {(n.termYears || n.noticeDays) && (
        <div className="grid gap-2 border-t border-line pt-5">
          {hasEarly && n.termYears && n.termEnd && (
            <p>
              {t('compare.detail.penalty.ctxTerm', {
                years: formatCount(n.termYears),
                end: formatDate(n.termEnd, LANGUAGE_TAGS[language]),
                amount: formatPeso(n.earlyPenalty),
              })}
            </p>
          )}
          {hasEarly && n.noticeDays && (
            <p>
              {t('compare.detail.penalty.ctxNotice', {
                days: formatCount(n.noticeDays),
                section: noticeSection,
                amount: formatPeso(n.earlyPenalty),
              })}
            </p>
          )}
        </div>
      )}

      {hasDeposit && (
        <div className="border-t border-line pt-5">
          <NotStatedList title={t('compare.detail.penalty.nsTitle')} keys={nsKeys} />
        </div>
      )}
    </div>
  )
}

/** Penalty questions come in two groups: leaving early, and the deposit. */
export function PenaltyAsks({ item }) {
  const { t } = useI18n()
  const n = item.numbers
  const groups = [
    { group: 'askA', show: n.earlyPenalty > 0 },
    { group: 'askB', show: n.deposit > 0 },
  ].filter((g) => g.show)

  return groups.map(({ group }) => {
    const vars = sentenceVars(item, group)
    return (
      <div key={group} className="grid gap-1.5">
        <SubHeading>{t(`compare.detail.penalty.${group}Title`)}</SubHeading>
        <ul className="grid list-disc gap-1.5 pl-5">
          {Array.from({ length: DETAIL_COUNTS.penalty[group] }, (_, i) => (
            <li key={i}>{t(detailKey('penalty', group, i + 1), vars)}</li>
          ))}
        </ul>
      </div>
    )
  })
}

// ---------------------------------------------------------------- OTHER BENEFITS
export function BenefitsBlock({ item }) {
  const { t } = useI18n()
  const n = item.numbers
  const vars = (key) => ({
    n: formatCount(n.values?.[key]),
    amount: formatPeso(n.values?.cellphoneLoad),
    yearly: formatPeso(n.loadYearly),
  })
  const group = (title, keys, extra) =>
    keys.length > 0 && (
      <div className="grid gap-2.5">
        <SubHeading>{title}</SubHeading>
        <ListGroup>
          {keys.map((key) => (
            <ListRow key={key} icon={extra ? 'check' : undefined} tone={extra ? 'ok' : undefined} title={t(`compare.detail.benefits.item.${key}`, vars(key))} />
          ))}
        </ListGroup>
      </div>
    )

  return (
    <div className={wrap}>
      {group(t('compare.detail.benefits.sameTitle'), n.same, false)}
      {group(t('compare.detail.benefits.newTitle'), n.added, true)}
    </div>
  )
}
