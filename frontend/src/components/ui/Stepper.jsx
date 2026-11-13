import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Loader2 } from 'lucide-react'
import { EASE_OUT, SPRING_PRESS } from '@/lib/ease'
import { cn } from '@/lib/utils'
import { useI18n } from '../../i18n/useI18n'
import Icon from '../Icon'

const steps = ['upload', 'review', 'summary']

/**
 * ROLE: progress through the 3-step flow. `current` is 0, 1 or 2.
 * `busy`: the current step is already in progress (optimistic: earlier steps show done, this one spins).
 * `failed`: the current step hit a problem; it shows an alert mark instead of its number.
 */
export default function Stepper({ current, busy = false, failed = false, className }) {
  const { t } = useI18n()
  const reduce = useReducedMotion() ?? false
  return (
    <ol aria-label={t('stepper.label')} className={cn('mb-7 flex items-center', className)}>
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        const spinning = state === 'current' && busy && !failed
        const alert = state === 'current' && failed
        return (
          <li key={step} aria-current={state === 'current' ? 'step' : undefined} className="flex items-center">
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  'grid size-8 place-items-center rounded-full border text-sm font-bold transition-colors duration-200',
                  state === 'done' && 'border-brand bg-brand text-on-solid',
                  state === 'current' && !alert && 'border-[#d9b600] bg-sun text-[#1b2433] ring-4 ring-sun/30',
                  alert && 'border-alert bg-alert-soft text-alert ring-4 ring-alert/15',
                  state === 'todo' && 'border-line bg-surface text-subtle',
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={state === 'done' ? 'done' : spinning ? 'busy' : alert ? 'alert' : 'num'}
                    className="grid place-items-center"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                    transition={reduce ? { duration: 0.12 } : SPRING_PRESS}
                  >
                    {state === 'done' ? (
                      <Icon name="check" size={16} />
                    ) : spinning ? (
                      <Loader2 aria-hidden="true" className={cn('size-4', !reduce && 'animate-spin')} />
                    ) : alert ? (
                      <Icon name="alert" size={16} />
                    ) : (
                      i + 1
                    )}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span
                aria-live={state === 'current' ? 'polite' : undefined}
                className={cn(
                  'text-sm',
                  state === 'current' ? 'font-bold' : 'hidden font-semibold text-subtle sm:inline',
                )}
              >
                {spinning ? t('stepper.scanning') : t(`stepper.${step}`)}
              </span>
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="relative mx-3 h-0.5 w-8 overflow-hidden rounded bg-line sm:mx-4 sm:w-16">
                <motion.span
                  className="absolute inset-0 origin-left bg-brand"
                  initial={false}
                  animate={{ scaleX: i < current ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
