import { useState } from 'react'
import { motion } from 'motion/react'
import { AgentDisclosure } from '@/components/agents/agent-disclosure'
import { SPRING_SWAP } from '@/lib/ease'
import { cn } from '@/lib/utils'
import Icon from '../components/Icon'
import NeedsUpload from '../components/NeedsUpload'
import OriginalView from '../components/OriginalView'
import Button from '../components/ui/Button'
import { Field, Segmented } from '../components/ui/Controls'
import { Page, PageHeading } from '../components/ui/Page'
import { Badge, Callout, ListGroup } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'
import { localizeFieldValue } from '../lib/extract'

// Fields come from the real OCR read (lib/extract.js). `low` = below Lumen's confidence threshold or not found.
export default function Review({ go, upload, doc, onConfirm }) {
  const { t, language } = useI18n()
  const [tab, setTab] = useState('fields')
  const [fields, setFields] = useState(() => doc?.fields ?? [])
  const [active, setActive] = useState(() => Math.max(0, (doc?.fields ?? []).findIndex((f) => f.low)))

  if (!upload || !doc) return <NeedsUpload go={go} />

  const toCheck = fields.filter((f) => f.low).length
  const update = (index, patch) =>
    setFields((list) => list.map((f, i) => (i === index ? { ...f, ...patch } : f)))

  const confirm = () => {
    onConfirm(fields.map((f) => ({ ...f, low: false })))
    go('summary')
  }

  return (
    <Page>
      <PageHeading centered title={t('review.title')} text={t('review.text')}>
        <Badge tone={toCheck ? 'sun' : 'ok'} icon={toCheck ? 'alert' : 'check'} className="w-max px-3.5 py-2 text-sm" role="status">
          {toCheck ? t('review.toCheck', { n: toCheck }) : t('review.allChecked')}
        </Badge>
      </PageHeading>

      <Segmented
        kind="tab"
        label={t('review.original')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'doc', label: t('review.tabOriginal') },
          { value: 'fields', label: t('review.tabFields') },
        ]}
        className="mb-4 lg:hidden"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(430px,1.2fr)_minmax(380px,0.8fr)] lg:items-start">
        <section
          aria-label={t('review.original')}
          className={cn(tab === 'doc' ? 'block' : 'hidden', 'lg:sticky lg:top-24 lg:block')}
        >
          <OriginalView upload={upload} lines={doc.lines} field={fields[active]} label={t('review.original')} />
        </section>

        <section className={cn(tab === 'fields' ? 'block' : 'hidden', 'lg:block')}>
          <div className="mb-3 flex items-end justify-between gap-2.5">
            <h2 className="font-sans text-xl font-bold">{t('review.panelTitle')}</h2>
            <span className="text-sm text-subtle">{t('review.panelHint')}</span>
          </div>

          <ListGroup>
            {fields.map((field, i) => {
              const open = active === i
              const label = t(`review.${field.key}`)
              const value = localizeFieldValue(field.value, language)
              return (
                <li key={field.key} className={cn('transition-colors', open && 'bg-brand-soft/60', field.low && !open && 'bg-sun/15')}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setActive(i)}
                    className="flex min-h-[68px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-soft/40"
                  >
                    <span className="grid min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm text-subtle">
                        {label}
                        {field.low && (
                          <Badge tone="sun">{value ? t('review.badge') : t('review.notFound')}</Badge>
                        )}
                      </span>
                      <strong className="mt-0.5 truncate">{value || '—'}</strong>
                    </span>
                    <motion.span
                      aria-hidden="true"
                      className="shrink-0 text-subtle"
                      animate={{ rotate: open ? 90 : 0 }}
                      transition={SPRING_SWAP}
                    >
                      <Icon name="chevron" size={19} />
                    </motion.span>
                  </button>
                  <AgentDisclosure open={open}>
                    <div className="grid gap-3 px-4 pt-1 pb-4">
                      <Field
                        label={t('review.edit', { label: label.toLowerCase() })}
                        id={`field-${field.key}`}
                        value={value}
                        placeholder={field.found ? undefined : t('review.placeholder')}
                        onChange={(e) => update(i, { value: e.target.value, low: false, edited: true })}
                      />
                      {field.source && (
                        <p className="text-sm text-subtle">
                          {t('review.source', { page: field.pageNumber, text: field.source })}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {field.low && value && (
                          <Button variant="secondary" size="sm" icon="check" onClick={() => update(i, { low: false })}>
                            {t('review.confirm')}
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => setTab('doc')}
                          className="inline-flex min-h-12 items-center gap-2 rounded-btn font-bold text-brand lg:hidden"
                        >
                          <Icon name="file" size={18} /> {t('review.viewOriginal')}
                        </button>
                      </div>
                    </div>
                  </AgentDisclosure>
                </li>
              )
            })}
          </ListGroup>

          {toCheck > 0 && (
            <Callout tone="sun" icon="alert" className="mt-4">
              {t('review.lowNoteReal')}
            </Callout>
          )}
          <Button icon="check" className="mt-4 w-full" onClick={confirm}>
            {t('review.cta')}
          </Button>
        </section>
      </div>
    </Page>
  )
}
