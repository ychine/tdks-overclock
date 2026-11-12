import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ThinkingShimmer } from '@/components/agents/loading-states/thinking-shimmer'
import { SPRING_SWAP } from '@/lib/ease'
import { cn } from '@/lib/utils'
import Icon from '../components/Icon'
import { Page } from '../components/ui/Page'
import Stepper from '../components/ui/Stepper'
import { Card } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'

export default function Reading({ go, fileName }) {
  const { t } = useI18n()
  const statuses = t('reading.statuses')
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, 3)), 1100)
    const done = window.setTimeout(() => go('review'), 5200)
    return () => {
      clearInterval(id)
      clearTimeout(done)
    }
  }, [go])

  return (
    <Page narrow>
      <Stepper current={0} />
      <div className="grid content-center gap-10 md:min-h-[420px] md:grid-cols-[1fr_1.3fr] md:items-center">
        <div aria-hidden="true" className="relative grid h-60 place-items-center">
          <div className="relative h-[210px] w-40 -rotate-2 overflow-hidden rounded-xl border border-line bg-surface px-5 py-[30px] shadow-card">
            {['w-full', 'w-[78%]', 'w-[90%]', 'w-[62%]'].map((w) => (
              <div key={w} className={`mb-[18px] h-[7px] rounded bg-line ${w}`} />
            ))}
            <span className="absolute inset-x-2 top-5 h-0.5 animate-scan bg-brand shadow-[0_0_15px_5px_color-mix(in_srgb,var(--brand)_20%,transparent)] motion-reduce:animate-none" />
          </div>
          <div className="absolute size-[215px] animate-orbit rounded-full border border-dashed border-brand/45 motion-reduce:animate-none">
            <span className="absolute top-3.5 left-5 text-brand"><Icon name="spark" size={22} /></span>
          </div>
        </div>
        <div>
          <h1 className="text-4xl leading-tight font-semibold">{t('reading.title')}</h1>
          {fileName && (
            <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-sm text-subtle">
              <Icon name="file" size={16} />
              <span className="truncate">{t('reading.file', { name: fileName })}</span>
            </p>
          )}
          <p className="mt-3 mb-5 text-lg" role="status">
            <ThinkingShimmer key={step}>{statuses[step]}</ThinkingShimmer>
          </p>
          <Card className="px-[18px] py-1">
            {statuses.slice(0, 3).map((s, i) => {
              const state = i < step ? 'done' : i === step ? 'current' : 'todo'
              return (
                <div
                  key={s}
                  className={cn(
                    'flex items-center gap-3 border-b border-line py-3.5 last:border-0',
                    state === 'todo' ? 'text-subtle' : 'text-ink',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-7 shrink-0 place-items-center rounded-full border text-xs transition-colors',
                      state === 'done' && 'border-brand bg-brand text-on-solid',
                      state === 'current' && 'animate-pulse-ring border-2 border-brand text-brand motion-reduce:animate-none',
                      state === 'todo' && 'border-line',
                    )}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={state}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={SPRING_SWAP}
                        className="grid place-items-center"
                      >
                        {state === 'done' ? <Icon name="check" size={15} /> : i + 1}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span>{s.replace('...', '')}</span>
                </div>
              )
            })}
          </Card>
          <p className="mt-3.5 text-center text-sm text-subtle">{t('reading.note')}</p>
        </div>
      </div>
    </Page>
  )
}
