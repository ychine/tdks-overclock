import { agencies, telHref } from '../lib/agencies'
import { DETAIL_COUNTS, detailKey } from '../lib/compare/copyKeys'
import { sentenceVars } from '../lib/compare/detailVars'
import { formatDays, formatHours } from '../lib/compare/format'
import { formatSigned } from '../lib/compare/money'
import { useI18n } from '../i18n/useI18n'
import { formatTime } from '../lib/compare/format'
import CellValue from './compare/CellValue'
import { BenefitsBlock, MedicalBlock, PayBlock, PenaltyAsks, PenaltyBlock } from './compare/blocks'
import { ImpactChip, StatusChip } from './compare/Chips'
import { Quote, Section, Sentences, SubHeading } from './compare/parts'
import { DETAIL_TITLE_ID } from './compare/styles'
import Button from './ui/Button'
import Sheet from './ui/Sheet'

const FOOTER_AGENCIES = agencies.filter((a) => a.id === 'dole' || a.id === 'pao')

const BLOCKS = { pay: PayBlock, medical: MedicalBlock, penalty: PenaltyBlock, benefits: BenefitsBlock }

/**
 * ROLE: Level 2 of the Compare screen. One sheet for every row, driven by a ComparisonItem.
 * Fixed order: old vs new -> what changed -> what it means -> row details -> what to ask -> where it is
 * in the contract -> disclaimer + agencies. All numbers come from item.numbers (calc.js); all words from i18n.
 *
 * Props: item (ComparisonItem | null), open, onClose, returnFocusRef (the row button that opened it).
 */
export default function CompareDetailSheet({ item, open, onClose, returnFocusRef }) {
  const { t } = useI18n()

  const header = item && (
    <>
      <h2 id={DETAIL_TITLE_ID} className="text-3xl font-semibold break-words">
        {t(`compare.detail.${item.id}.title`)}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusChip status={item.status} />
        <ImpactChip impact={item.impact} />
      </div>
    </>
  )

  return (
    <Sheet open={open && Boolean(item)} onClose={onClose} titleId={DETAIL_TITLE_ID} closeLabel={t('app.close')} header={header} returnFocusRef={returnFocusRef}>
      {item && <Body item={item} onClose={onClose} />}
    </Sheet>
  )
}

function Body({ item, onClose }) {
  const { t } = useI18n()
  // An unchanged row (e.g. Medical) has nothing to explain, except Medical, which says what is NOT covered.
  const hasStory = item.status !== 'unchanged' || item.id === 'medical'
  const Block = hasStory ? BLOCKS[item.id] : null
  const askCount = DETAIL_COUNTS[item.id]?.ask ?? 0

  return (
    <div className="pb-1">
      <OldNew item={item} />

      <Section title={t('compare.detail.common.changedTitle')}>
        {hasStory ? <Sentences item={item} group="changed" /> : <p>{t('compare.detail.common.nothingChanged')}</p>}
      </Section>

      {hasStory && (
        <Section title={t('compare.detail.common.meansTitle')}>
          <Sentences item={item} group="means" />
        </Section>
      )}

      {Block && <Block item={item} />}

      {hasStory && (
        <Section title={t('compare.detail.common.askTitle')}>
          {item.id === 'penalty' ? (
            <PenaltyAsks item={item} />
          ) : (
            <ul className="grid list-disc gap-1.5 pl-5">
              {Array.from({ length: askCount }, (_, i) => (
                <li key={i}>{t(detailKey(item.id, 'ask', i + 1), sentenceVars(item, 'ask'))}</li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <Section title={t('compare.detail.common.whereTitle')}>
        <div className="grid gap-4">
          {item.clauses.map((clause) => (
            <ClauseView key={clause.fact} clause={clause} />
          ))}
        </div>
      </Section>

      <footer className="mt-6 grid gap-3 border-t border-line pt-5">
        <p className="font-semibold">{t('app.disclaimer')}</p>
        <p className="text-sm text-subtle">{t('compare.detail.common.footer')}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {FOOTER_AGENCIES.map((a) => (
            <Button
              key={a.id}
              variant="secondary"
              icon="phone"
              href={telHref(a.phone)}
              aria-label={t('compare.detail.common.callAria', { name: a.name, phone: a.phone })}
              className="tabular-nums"
            >
              {a.name} {a.phone}
            </Button>
          ))}
        </div>
        <Button className="w-full" onClick={onClose}>
          {t('app.close')}
        </Button>
      </footer>
    </div>
  )
}

/** Old and new side by side from 640px, stacked on a phone. The values use Fraunces tabular numerals. */
function OldNew({ item }) {
  const { t } = useI18n()
  const change = changeLine(item, t)
  return (
    <div>
      <dl className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <Side label={t('compare.detail.common.old')} cell={item.old} sub={sub(item, 'old', t)} className="pb-4 sm:pr-5 sm:pb-0" />
        <Side label={t('compare.detail.common.new')} cell={item.new} sub={sub(item, 'new', t)} className="pt-4 sm:pl-5 sm:pt-0" />
      </dl>
      {change && <p className="mt-4 font-semibold">{change}</p>}
    </div>
  )
}

function Side({ label, cell, sub: subText, className }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-sm font-bold text-subtle">{label}</dt>
      <dd className="mt-1">
        <span className="block font-display text-3xl font-semibold tabular-nums break-words">
          <CellValue cell={cell} />
        </span>
        {subText && <span className="mt-1 block text-sm text-subtle">{subText}</span>}
      </dd>
    </div>
  )
}

/** The small line under a big value: payday for Pay, the Sunday window for Day off. */
function sub(item, side, t) {
  const n = item.numbers
  if (item.id === 'pay') {
    const days = formatDays(side === 'old' ? n.oldPaydays : n.newPaydays)
    return days ? t('compare.detail.pay.paydayLabel', { days }) : null
  }
  if (item.id === 'rest') {
    const window = side === 'old' ? n.oldWindow : n.newWindow
    const hours = side === 'old' ? n.oldHours : n.newHours
    if (window) return t('compare.detail.rest.subWindow', { from: formatTime(window.from), to: formatTime(window.to) })
    return hours === 24 ? t('compare.detail.rest.subWhole') : null
  }
  return null
}

/** "Change: +₱1,000" for Pay, "15 fewer hours" for Day off. */
function changeLine(item, t) {
  const n = item.numbers
  if (item.id === 'pay' && n.takeHome.gross !== 0) {
    return t('compare.detail.common.change', { amount: formatSigned(n.takeHome.gross) })
  }
  if (item.id === 'rest' && n.diffHours) {
    const hours = formatHours(Math.abs(n.diffHours))
    return n.diffHours < 0 ? t('compare.detail.rest.fewer', { hours }) : t('compare.detail.rest.more', { hours })
  }
  return null
}

/** One fact: where it is (Section, Page) and the exact words, never translated or paraphrased. */
function ClauseView({ clause }) {
  const { t } = useI18n()
  const { oldQuote, newQuote } = clause
  const sameQuote = oldQuote && oldQuote === newQuote
  const labelled = (label, text) => (
    <div className="grid gap-1">
      <span className="text-sm font-bold text-subtle">{label}</span>
      <Quote>{text}</Quote>
    </div>
  )
  return (
    <div className="grid gap-1.5">
      <SubHeading>{t(`compare.detail.fact.${clause.fact}`)}</SubHeading>
      <p className="text-sm text-subtle">
        {t('compare.detail.common.sectionPage', { section: clause.section, page: clause.page })}
      </p>
      {sameQuote && labelled(`${t('compare.detail.common.old')} · ${t('compare.detail.common.new')}`, oldQuote)}
      {!sameQuote && oldQuote && labelled(t('compare.detail.common.old'), oldQuote)}
      {!sameQuote && newQuote && labelled(t('compare.detail.common.new'), newQuote)}
      {!oldQuote && !newQuote && <p className="text-sm text-subtle">{t('compare.detail.common.noQuote')}</p>}
    </div>
  )
}
