import { motion } from 'motion/react'
import { EASE_OUT } from '@/lib/ease'
import { cn } from '@/lib/utils'
import { useI18n } from '../../i18n/useI18n'
import Icon from '../Icon'

const steps = ['upload', 'review', 'summary']

/** ROLE: progress through the 3-step flow. `current` is 0, 1 or 2. */
export default function Stepper({ current, className }) {
  const { t } = useI18n()
  return (
    <ol aria-label={t('stepper.label')} className={cn('mb-7 flex items-center', className)}>
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <li key={step} aria-current={state === 'current' ? 'step' : undefined} className="flex items-center">
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  'grid size-8 place-items-center rounded-full border text-sm font-bold transition-colors',
                  state === 'done' && 'border-brand bg-brand text-on-solid',
                  state === 'current' && 'border-brand bg-brand-soft text-brand ring-4 ring-brand/15',
                  state === 'todo' && 'border-line bg-surface text-subtle',
                )}
              >
                {state === 'done' ? <Icon name="check" size={16} /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-sm',
                  state === 'current' ? 'font-bold' : 'hidden font-semibold text-subtle sm:inline',
                )}
              >
                {t(`stepper.${step}`)}
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
