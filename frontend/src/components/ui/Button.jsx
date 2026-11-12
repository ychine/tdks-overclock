import { motion } from 'motion/react'
import { SPRING_PRESS } from '@/lib/ease'
import { cn } from '@/lib/utils'
import Icon from '../Icon'

/*
 * ROLE: an action. 12px radius, 48px minimum height, Motion press feedback.
 *   primary    solid brand blue          the one main action on a screen
 *   secondary  white, hairline border    supporting actions
 *   ghost      text only                 low-emphasis / tertiary
 *   sun        yellow fill, dark text    a highlight CTA on dark bands (yellow is never text)
 *   danger     solid alert red           destructive or emergency
 */
const variants = {
  primary:
    'border-brand bg-brand text-on-solid shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_16px_rgb(0_56_168/0.2)] hover:brightness-110',
  secondary: 'border-line bg-surface text-ink hover:border-ink/30 hover:bg-surface-2',
  ghost: 'border-transparent text-brand hover:bg-brand-soft',
  sun: 'border-[#d9b600] bg-sun text-[#1b2433] shadow-[inset_0_1px_0_rgb(255_255_255/0.4)] hover:brightness-105',
  danger: 'border-alert bg-alert text-on-solid hover:brightness-110',
}

const sizes = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-12 px-5',
  lg: 'min-h-14 px-6 text-lg',
}

const base =
  'inline-flex items-center justify-center gap-2.5 rounded-btn border font-bold whitespace-nowrap transition-[background-color,border-color,filter] duration-150 disabled:cursor-not-allowed disabled:opacity-45'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  className,
  href,
  type = 'button',
  ...rest
}) {
  const Comp = href ? motion.a : motion.button
  const props = href ? { href } : { type }
  return (
    <Comp
      whileTap={{ scale: 0.97 }}
      transition={SPRING_PRESS}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 22 : 20} />}
      <span>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} size={size === 'lg' ? 22 : 20} />}
    </Comp>
  )
}

/** Icon-only action. Always needs an accessible `label`. */
export function IconButton({ icon, label, variant = 'secondary', className, ...rest }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.94 }}
      transition={SPRING_PRESS}
      className={cn(
        'grid size-12 shrink-0 place-items-center rounded-btn border transition-colors',
        variant === 'secondary' && 'border-line bg-surface text-ink hover:border-ink/30 hover:bg-surface-2',
        variant === 'ghost' && 'border-transparent text-ink hover:bg-surface-2',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={20} />
    </motion.button>
  )
}
