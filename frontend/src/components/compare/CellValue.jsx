import { formatHours } from '../../lib/compare/format'
import { formatCount, formatPeso } from '../../lib/compare/money'
import { useI18n } from '../../i18n/useI18n'

/**
 * A table-cell value from buildComparison ({kind, value}) as readable text.
 * The logic layer holds no words and no formatted pesos; they are made here with t() and money.js.
 */
export default function CellValue({ cell }) {
  const { t } = useI18n()
  switch (cell?.kind) {
    case 'money':
      return <>{formatPeso(cell.value)}</>
    case 'hours':
      return <>{t('compare.cell.hours', { hours: formatHours(cell.value) })}</>
    case 'count':
      return <>{t('compare.cell.count', { n: formatCount(cell.value) })}</>
    case 'firstAid':
      return <>{t('compare.cell.firstAid')}</>
    case 'none':
      return <>{t('compare.cell.none')}</>
    case 'parts':
      // Two separate amounts, one per line. They are never added together.
      return (
        <span className="grid gap-1.5">
          {cell.parts.map((part) => (
            <span key={part.id} className="block">
              <span className="block font-sans text-sm font-normal text-subtle">
                {part.id === 'early' ? t('compare.cell.early') : t('compare.cell.deposit')}
              </span>
              <CellValue cell={part.cell} />
            </span>
          ))}
        </span>
      )
    default:
      return <>{t('compare.cell.notStated')}</>
  }
}
