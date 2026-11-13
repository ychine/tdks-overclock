import { useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import CompareDetailSheet from '../components/CompareDetailSheet'
import CellValue from '../components/compare/CellValue'
import { ImpactChip, StatusChip } from '../components/compare/Chips'
import { IMPACT_STYLE } from '../components/compare/styles'
import Icon from '../components/Icon'
import Button from '../components/ui/Button'
import { Page, PageHeading } from '../components/ui/Page'
import { Callout, Card, IconTile, ListGroup, ListRow, Panel } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'
import { agencies, telHref } from '../lib/agencies'
import { biggestChange, buildComparison, summaryLists } from '../lib/compare/buildComparison'
import { lineVars } from '../lib/compare/detailVars'
import { IMPACTS, STATUSES, SUMMARY_LINES } from '../lib/compare/copyKeys'
import { NEW_TERMS, OLD_TERMS } from '../lib/compare/sample'
import { checkContractFile } from '../lib/files'

/** One short sentence for a row in the Level 3 lists. Falls back to a generic line for unusual combinations. */
function SummaryLine({ item }) {
  const { t } = useI18n()
  const vars = lineVars(item)
  // A missing amount reads as "None", not as an empty gap in the sentence.
  for (const key of Object.keys(vars)) if (vars[key] === '') vars[key] = t('compare.cell.none')
  const known = SUMMARY_LINES[item.id]?.includes(item.impact)
  const text = known
    ? t(`compare.summary.line.${item.id}.${item.impact}`, vars)
    : t('compare.summary.generic', { name: t(`compare.row.${item.id}`), impact: t(`compare.impact.${item.impact}`) })
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        <Icon name={IMPACT_STYLE[item.impact].icon} size={20} />
      </span>
      <span>{text}</span>
    </li>
  )
}

/** One upload slot. Empty: a dashed drop target. Filled: the file name with a replace action. */
function Slot({ title, hint, name, onPick }) {
  const { t } = useI18n()
  if (name) {
    return (
      <Card className="flex min-h-[230px] flex-col items-center justify-center p-8 text-center">
        <IconTile icon="file" tone="brand" size={26} className="size-14 rounded-2xl" />
        <h2 className="mt-4 mb-1 font-sans text-xl font-bold">{title}</h2>
        <p className="max-w-full truncate text-sm text-subtle">{t('compare.oldDone', { name })}</p>
        <Button variant="ghost" size="sm" icon="refresh" className="mt-3" onClick={onPick}>
          {t('compare.replace')}
        </Button>
      </Card>
    )
  }
  return (
    <button
      type="button"
      onClick={onPick}
      className="banig group flex min-h-[230px] flex-col items-center justify-center rounded-panel border-2 border-dashed border-line p-8 text-center transition-colors hover:border-brand hover:bg-brand-soft/40"
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-subtle transition-colors group-hover:bg-brand-soft group-hover:text-brand">
        <Icon name="plus" size={26} />
      </span>
      <h2 className="mt-4 mb-1 font-sans text-xl font-bold">{title}</h2>
      <p className="text-sm text-subtle">{hint}</p>
    </button>
  )
}

export default function Compare() {
  const { t } = useI18n()
  const [oldName, setOldName] = useState(null)
  const [newName, setNewName] = useState(null)
  const [problem, setProblem] = useState(null)
  const [current, setCurrent] = useState(null) // the row whose sheet is (or was just) open
  const [open, setOpen] = useState(false)
  const oldInput = useRef(null)
  const newInput = useRef(null)
  const trigger = useRef(null) // the row button that opened the sheet; focus returns to it

  // Nothing is really compared yet: this is the sample fixture (Phase 3 will build these from the uploads).
  const items = useMemo(() => buildComparison(OLD_TERMS, NEW_TERMS), [])
  const biggest = useMemo(() => biggestChange(items), [items])
  const { better, check } = useMemo(() => summaryLists(items), [items])

  const pick = (setName) => (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const found = checkContractFile(file)
    if (found) return setProblem(found)
    setProblem(null)
    setName(file.name)
  }

  const openRow = (item) => (e) => {
    trigger.current = e.currentTarget
    setCurrent(item)
    setOpen(true)
  }

  const accept = 'application/pdf,image/jpeg,image/png'
  const th = 'px-3 py-3.5 text-left text-sm font-bold md:px-4'

  return (
    <Page>
      <PageHeading title={t('compare.title')} text={t('compare.text')} />
      <input ref={oldInput} className="hidden" type="file" accept={accept} aria-label={t('compare.oldAria')} onChange={pick(setOldName)} />
      <input ref={newInput} className="hidden" type="file" accept={accept} aria-label={t('compare.newAria')} onChange={pick(setNewName)} />

      {problem && (
        <Callout title={t(`file.${problem}.title`)} className="mb-4" role="alert">
          {t(`file.${problem}.text`)}
        </Callout>
      )}

      {!(oldName && newName) ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Slot title={t('compare.old')} hint={t('compare.newHint')} name={oldName} onPick={() => oldInput.current?.click()} />
          <Slot title={t('compare.new')} hint={t('compare.newHint')} name={newName} onPick={() => newInput.current?.click()} />
        </div>
      ) : (
        <>
          {/* Honest about what this is. Always visible, never dismissible, until real extraction exists. */}
          <Callout tone="info" icon="help" title={t('compare.sample.title')} className="mb-4" role="note">
            {t('compare.sample.text')}
          <Callout tone="info" icon="spark" className="mb-4" role="note">
            {t('compare.demo')}
          </Callout>
          <Callout title={t('compare.alertLabel')} className="mb-5">
            <p className="font-sans text-lg font-bold text-ink">
              {t('compare.alertTitle')} <s>₱18,000</s>{' '}
              <span className="inline-block align-[-3px]">
                <Icon name="arrow" size={18} />
              </span>{' '}
              ₱16,500
            </p>
            <p className="mt-1">{t('compare.alertText')}</p>
          </Callout>

          {biggest && (
            <Callout title={t('compare.alertLabel')} className="mb-5">
              <p className="font-sans text-lg font-bold text-ink">{t(`compare.biggest.${biggest.id}.title`)}</p>
              <p className="mt-1">{t(`compare.biggest.${biggest.id}.text`, lineVars(biggest))}</p>
            </Callout>
          )}

          <section aria-labelledby="legend-title" className="mb-3">
            <h2 id="legend-title" className="font-sans text-base font-bold">{t('compare.legend.title')}</h2>
            <p className="mt-2 mb-1.5 text-sm font-bold text-subtle">{t('compare.legend.impact')}</p>
            <ul className="flex flex-wrap gap-2">
              {IMPACTS.map((impact) => (
                <li key={impact}>
                  <ImpactChip impact={impact} />
                </li>
              ))}
            </ul>
            <p className="mt-3 mb-1 text-sm font-bold text-subtle">{t('compare.legend.status')}</p>
            <ul className="grid gap-1 text-sm text-subtle">
              {STATUSES.map((status) => (
                <li key={status}>{t(`compare.def.${status}`)}</li>
              ))}
              <li>{t('compare.def.notStated')}</li>
            </ul>
          </section>

          <p className="mb-2 font-semibold">{t('compare.hint')}</p>

          <div className="overflow-hidden rounded-card border border-line bg-surface">
            <table className="w-full table-fixed border-collapse">
              <caption className="sr-only">{t('compare.tableAria')}</caption>
              <thead className="bg-surface-2">
                <tr>
                  <th scope="col" className={th}>{t('compare.detail')}</th>
                  <th scope="col" className={th}>{t('compare.colOld')}</th>
                  <th scope="col" className={th}>{t('compare.colNew')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item) => {
                  const name = t(`compare.row.${item.id}`)
                  return (
                    <tr key={item.id}>
                      <th scope="row" className="p-0 text-left font-normal">
                        {/* A real button, at least 48px tall. Not an onClick on the <tr>. */}
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          aria-label={t('compare.rowAria', { name, impact: t(`compare.impact.${item.impact}`) })}
                          onClick={openRow(item)}
                          className="flex min-h-14 w-full items-center justify-between gap-1 px-3 py-3 text-left font-semibold text-ink transition-colors hover:bg-surface-2 md:px-4"
                        >
                          <span className="min-w-0 break-words">{name}</span>
                          <span className="shrink-0 text-subtle" aria-hidden="true">
                            <Icon name="chevron" size={18} />
                          </span>
                        </button>
                      </th>
                      <td className="px-3 py-4 align-top font-bold break-words md:px-4">
                        <CellValue cell={item.old} />
                      </td>
                      <td className={cn('px-3 py-4 align-top font-bold break-words md:px-4', IMPACT_STYLE[item.impact].cell)}>
                        <span className="flex items-start gap-1.5 md:gap-2">
                          <span className="mt-0.5 shrink-0" aria-hidden="true">
                            <Icon name={IMPACT_STYLE[item.impact].icon} size={16} />
                          </span>
                          <span className="min-w-0">
                            <span className="sr-only">{t(`compare.impact.${item.impact}`)}: </span>
                            <CellValue cell={item.new} />
                            <span className="mt-1.5 block">
                              <StatusChip status={item.status} className="px-2 py-0.5 text-xs" />
                            </span>
                          </span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Panel className="mt-5 p-5 md:p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-semibold">{t('compare.summary.better.title')}</h2>
                {better.length ? (
                  <ul className="mt-3 grid gap-2.5">
                    {better.map((item) => (
                      <SummaryLine key={item.id} item={item} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-subtle">{t('compare.summary.none')}</p>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{t('compare.summary.check.title')}</h2>
                {check.length ? (
                  <ul className="mt-3 grid gap-2.5">
                    {check.map((item) => (
                      <SummaryLine key={item.id} item={item} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-subtle">{t('compare.summary.none')}</p>
                )}
              </div>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-3 font-semibold">{t('app.disclaimer')}</p>
              <ListGroup aria-label={t('compare.detail.common.footer')}>
                {agencies.map((a) => (
                  <ListRow
                    key={a.id}
                    href={telHref(a.phone)}
                    title={a.name}
                    trailing={<span className="font-bold text-brand tabular-nums">{a.phone}</span>}
                    className="min-h-14"
                  />
                ))}
              </ListGroup>
            </div>
          </Panel>

          <Button variant="ghost" icon="refresh" className="mt-3" onClick={() => setNewName(null)}>
            {t('compare.changeNew')}
          </Button>

          <CompareDetailSheet item={current} open={open} onClose={() => setOpen(false)} returnFocusRef={trigger} />
        </>
      )}
    </Page>
  )
}
