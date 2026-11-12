import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE_OUT } from '@/lib/ease'
import Icon from '../components/Icon'
import Button from '../components/ui/Button'
import { Page } from '../components/ui/Page'
import { Callout, ListGroup } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'

// Answer indexes: job 0 kasambahay · 1 local · 2 ofw — wage 1/2 unclear — rest 1/2 irregular.
const JOBS = ['Kasambahay', 'Local', 'Ofw']

export default function Questions({ go }) {
  const { t } = useI18n()
  const items = t('questions.items')
  const [answers, setAnswers] = useState([])
  const step = answers.length
  const done = step >= items.length

  const choose = (index) => setAnswers((a) => [...a, index])
  const back = () => (step === 0 ? go('home') : setAnswers((a) => a.slice(0, -1)))

  const job = JOBS[answers[0] ?? 0]
  const flags = []
  if (answers[1] >= 1) flags.push(t('questions.flagWage'))
  if (answers[2] >= 1) flags.push(t('questions.flagRest'))

  return (
    <Page className="min-h-[calc(100dvh-74px-76px)] lg:min-h-[calc(100dvh-74px)]">
      {!done ? (
        <>
          <div className="mx-auto max-w-[660px]">
            <div className="flex items-center justify-between text-sm text-subtle">
              <button
                type="button"
                onClick={back}
                className="-ml-2 inline-flex min-h-12 items-center gap-2 rounded-btn px-2 font-bold text-brand hover:bg-brand-soft"
              >
                <span className="rotate-180"><Icon name="arrow" size={18} /></span> {t('app.back')}
              </button>
              <p aria-live="polite">{t('questions.progress', { n: step + 1, total: items.length })}</p>
            </div>
            <div
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={items.length}
              aria-valuenow={step + 1}
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2"
            >
              <motion.div
                className="h-full origin-left rounded-full bg-brand"
                initial={false}
                animate={{ width: `${((step + 1) / items.length) * 100}%` }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="mx-auto mt-10 max-w-[660px]"
            >
              <p className="mb-2 font-bold text-brand">{t('questions.reassure')}</p>
              <h1 className="text-4xl leading-[1.05] font-semibold md:text-6xl">{items[step].q}</h1>
              <p className="mt-3.5 mb-6 text-subtle">{t('questions.hint')}</p>
              <ul className="grid gap-2.5">
                {items[step].options.map((option, i) => (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => choose(i)}
                      className="group flex min-h-[68px] w-full items-center gap-3.5 rounded-card border border-line bg-surface px-4 py-2 text-left font-bold transition-colors hover:border-brand hover:bg-brand-soft/50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-soft text-brand">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                      <span className="ml-auto text-subtle transition-transform group-hover:translate-x-1">
                        <Icon name="arrow" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <small className="mt-5 block text-subtle">{t('questions.small')}</small>
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="mx-auto mt-4 max-w-[680px]"
        >
          <span aria-hidden="true" className="mb-5 grid size-[76px] place-items-center rounded-full bg-sun text-[#1b2433]">
            <Icon name="sun" size={40} />
          </span>
          <h1 className="text-4xl leading-[1.05] font-semibold md:text-5xl">{t(`questions.title${job}`)}</h1>
          <p className="mt-3.5 mb-5 text-lg text-subtle">{t('questions.lead')}</p>

          <ListGroup className="mb-4">
            {t(`questions.rights${job}`).map((right) => (
              <li key={right} className="flex min-h-14 items-center gap-3 px-4">
                <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
                  <Icon name="check" size={17} />
                </span>
                {right}
              </li>
            ))}
          </ListGroup>

          {flags.length > 0 && (
            <Callout title={t('questions.flagsTitle')} className="mb-4">
              <ul className="mt-2 grid gap-2 text-ink">
                {flags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </Callout>
          )}

          <Callout tone="info" icon="help" title={t('questions.noticeTitle')} className="mb-4">
            {t('questions.noticeText')}
          </Callout>
          <Button icon="phone" href="tel:1349" className="w-full">
            {t('questions.call')}
          </Button>
          <Button variant="ghost" className="mt-2.5 w-full" onClick={() => go('home')}>
            {t('questions.home')}
          </Button>
        </motion.div>
      )}
    </Page>
  )
}
