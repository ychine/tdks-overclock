import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import Icon from '../components/Icon'
import Button from '../components/ui/Button'
import { Page, PageHeading } from '../components/ui/Page'
import { Callout, Card, IconTile, Panel } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'
import { checkContractFile } from '../lib/files'

// Color is never the only signal: each change also carries an icon and hidden text.
const kinds = {
  added: { icon: 'plus', cell: 'bg-brand-soft', dot: 'bg-brand-soft' },
  changed: { icon: 'refresh', cell: 'bg-sun/35', dot: 'bg-sun/60' },
  removed: { icon: 'close', cell: 'bg-alert-soft', dot: 'bg-alert-soft' },
}

function Cell({ kind, children }) {
  const { t } = useI18n()
  const { icon, cell } = kinds[kind]
  return (
    <td className={cn('px-3 py-4 font-bold md:px-4', cell)}>
      <span className="flex items-center gap-1.5 md:gap-2">
        <Icon name={icon} size={16} />
        <span className="sr-only">{t(`compare.${kind}`)}: </span>
        {children}
      </span>
    </td>
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
  const oldInput = useRef(null)
  const newInput = useRef(null)

  const pick = (setName) => (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const found = checkContractFile(file)
    if (found) return setProblem(found)
    setProblem(null)
    setName(file.name)
  }

  const accept = 'application/pdf,image/jpeg,image/png'
  const th = 'px-3 py-3.5 text-left text-sm font-bold md:px-4'
  const rowHead = 'px-3 py-4 text-left font-normal text-subtle md:px-4'

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

          <ul className="mb-2.5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-subtle">
            {Object.keys(kinds).map((kind) => (
              <li key={kind} className="flex items-center gap-1.5">
                <i className={cn('size-3 rounded-[3px] ring-1 ring-line', kinds[kind].dot)} />
                {t(`compare.${kind}`)}
              </li>
            ))}
          </ul>

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
                <tr>
                  <th scope="row" className={rowHead}>{t('compare.rowSalary')}</th>
                  <td className="px-3 py-4 font-bold md:px-4">₱18,000</td>
                  <Cell kind="removed">₱16,500</Cell>
                </tr>
                <tr>
                  <th scope="row" className={rowHead}>{t('compare.rowRest')}</th>
                  <td className="px-3 py-4 font-bold md:px-4">{t('compare.restOld')}</td>
                  <Cell kind="changed">{t('compare.restNew')}</Cell>
                </tr>
                <tr>
                  <th scope="row" className={rowHead}>{t('compare.rowMedical')}</th>
                  <td className="px-3 py-4 font-bold md:px-4">{t('compare.medicalOld')}</td>
                  <Cell kind="added">{t('compare.medicalNew')}</Cell>
                </tr>
                <tr>
                  <th scope="row" className={rowHead}>{t('compare.rowPenalty')}</th>
                  <td className="px-3 py-4 font-bold md:px-4">₱5,000</td>
                  <Cell kind="removed">₱8,000</Cell>
                </tr>
              </tbody>
            </table>
          </div>

          <Panel className="mt-5 p-5 md:p-6">
            <h2 className="text-2xl font-semibold">{t('compare.summaryTitle')}</h2>
            <p className="mt-2 text-subtle">{t('compare.summaryText')}</p>
          </Panel>
          <Button variant="ghost" icon="refresh" className="mt-3" onClick={() => setNewName(null)}>
            {t('compare.changeNew')}
          </Button>
        </>
      )}
    </Page>
  )
}
