import { useId, useRef } from 'react'
import { motion } from 'motion/react'
import { SPRING_LAYOUT, SPRING_PRESS } from '@/lib/ease'
import { cn } from '@/lib/utils'
import Icon from '../Icon'

/**
 * ROLE: switch between modes. A radiogroup (setting) or tablist (content). 12px track, a single
 * Motion-animated thumb glides between options. Arrow keys move the selection.
 */
export function Segmented({ options, value, onChange, label, kind = 'radio', className }) {
  const group = useId()
  const refs = useRef([])
  const isRadio = kind === 'radio'

  const move = (event, index) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    if (!(event.key in keys)) return
    event.preventDefault()
    const next = (index + keys[event.key] + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role={isRadio ? 'radiogroup' : 'tablist'}
      aria-label={label}
      className={cn('flex rounded-btn bg-surface-2 p-1', className)}
    >
      {options.map((option, i) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            ref={(node) => (refs.current[i] = node)}
            type="button"
            role={isRadio ? 'radio' : 'tab'}
            aria-checked={isRadio ? active : undefined}
            aria-selected={isRadio ? undefined : active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => move(e, i)}
            className={cn(
              'relative isolate min-h-12 flex-1 rounded-[9px] px-4 font-semibold transition-colors',
              active ? 'text-ink' : 'text-subtle hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${group}`}
                transition={SPRING_LAYOUT}
                className="absolute inset-0 -z-10 rounded-[9px] bg-surface shadow-card"
              />
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** ROLE: a suggestion the user can tap. Full pill, hairline, fills with brand tint on hover. */
export function Chip({ children, className, ...props }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      transition={SPRING_PRESS}
      className={cn(
        'min-h-12 shrink-0 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-brand/50 hover:bg-brand-soft',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/** ROLE: a text input with label, hint and error. 10px radius, inset shadow, brand focus ring. */
export function Field({ label, hint, error, id, className, ...props }) {
  const auto = useId()
  const fieldId = id ?? auto
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-sm font-semibold text-subtle">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-12 rounded-field border bg-surface px-3.5 font-semibold text-ink shadow-[inset_0_1px_2px_rgb(16_24_40/0.06)] transition-[border-color,box-shadow] outline-none focus:border-brand focus:ring-4 focus:ring-brand/20',
          error ? 'border-alert' : 'border-line',
        )}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} role="alert" className="flex items-center gap-1.5 text-sm font-semibold text-alert">
          <Icon name="alert" size={15} /> {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-sm text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
