import { DETAIL_COUNTS, detailKey } from '../../lib/compare/copyKeys'
import { sentenceVars } from '../../lib/compare/detailVars'
import { useI18n } from '../../i18n/useI18n'
import { Badge } from '../ui/Surfaces'

/** A titled part of the sheet. Parts are separated by a hairline, never boxed in cards. */
export function Section({ title, children, className = '' }) {
  return (
    <section className={`mt-6 border-t border-line pt-5 ${className}`}>
      <h3 className="font-sans text-xl font-bold">{title}</h3>
      <div className="mt-2.5 grid gap-2.5">{children}</div>
    </section>
  )
}

/** A smaller heading inside a row block. */
export function SubHeading({ children }) {
  return <h4 className="font-sans text-lg font-bold">{children}</h4>
}

/** The numbered sentences `compare.detail.<id>.<group><n>` for a row, with their numbers filled in. */
export function Sentences({ item, group }) {
  const { t } = useI18n()
  const count = DETAIL_COUNTS[item.id]?.[group] ?? 0
  const vars = sentenceVars(item, group)
  return Array.from({ length: count }, (_, i) => <p key={i}>{t(detailKey(item.id, group, i + 1), vars)}</p>)
}

/** Marks a figure as an estimate and shows what it assumes. */
export function EstimateNote({ children }) {
  const { t } = useI18n()
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-subtle">
      <Badge tone="neutral" className="px-2.5 py-0.5 text-xs">
        {t('compare.detail.common.estimate')}
      </Badge>
      {children}
    </p>
  )
}

/** Verbatim contract wording. Never translated, never paraphrased. */
export function Quote({ children }) {
  return (
    <blockquote className="font-serif text-base leading-relaxed break-words text-ink">
      “{children}”
    </blockquote>
  )
}
