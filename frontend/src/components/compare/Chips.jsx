import { Badge } from '../ui/Surfaces'
import { useI18n } from '../../i18n/useI18n'
import { IMPACT_STYLE } from './styles'

/** Good or bad for the worker: icon + word + colour. Never colour alone. */
export function ImpactChip({ impact, className }) {
  const { t } = useI18n()
  const { icon, tone } = IMPACT_STYLE[impact]
  return (
    <Badge tone={tone} icon={icon} className={className ?? 'px-3 py-1 text-sm'}>
      {t(`compare.impact.${impact}`)}
    </Badge>
  )
}

/** What happened (added / removed / changed / unchanged): a plain text chip. */
export function StatusChip({ status, className }) {
  const { t } = useI18n()
  return (
    <Badge tone="neutral" className={className ?? 'px-3 py-1 text-sm'}>
      {t(`compare.status.${status}`)}
    </Badge>
  )
}
