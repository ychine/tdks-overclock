import { cn } from '@/lib/utils'
import Icon from '../Icon'

/** ROLE: the single primary working surface of a screen. 24px radius, inner highlight ring, raised. */
export function Panel({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('rounded-panel border border-line bg-surface shadow-panel', className)} {...props}>
      {children}
    </Tag>
  )
}

/** ROLE: a self-contained item (an agency, a file). 16px radius, hairline, flat. */
export function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('rounded-card border border-line bg-surface', className)} {...props}>
      {children}
    </Tag>
  )
}

/** ROLE: related rows of facts. One hairline frame; rows are divided, never boxed individually. */
export function ListGroup({ as: Tag = 'ul', className, children, ...props }) {
  return (
    <Tag className={cn('divide-y divide-line overflow-hidden rounded-card border border-line bg-surface', className)} {...props}>
      {children}
    </Tag>
  )
}

const tiles = {
  brand: 'bg-brand-soft text-brand',
  alert: 'bg-alert-soft text-alert',
  sun: 'bg-sun text-[#1b2433]',
  ok: 'bg-ok-soft text-ok',
  neutral: 'bg-surface-2 text-ink',
}

/** Small rounded square holding an icon. */
export function IconTile({ icon, tone = 'brand', size = 22, className }) {
  return (
    <span aria-hidden="true" className={cn('grid size-11 shrink-0 place-items-center rounded-xl', tiles[tone], className)}>
      <Icon name={icon} size={size} />
    </span>
  )
}

/** One row inside a ListGroup. Renders a button or link when it is interactive. */
export function ListRow({ icon, tone, title, detail, value, badge, trailing, onClick, href, className, children, ref, ...buttonProps }) {
  const inner = (
    <>
      {icon && <IconTile icon={icon} tone={tone} />}
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-semibold">{title}</span>
        {detail && <span className="mt-0.5 block text-sm text-subtle">{detail}</span>}
        {children}
      </span>
      {(value || badge) && (
        <span className="flex shrink-0 flex-col items-end gap-1 text-right">
          {value && <strong className="tabular-nums">{value}</strong>}
          {badge}
        </span>
      )}
      {trailing}
    </>
  )
  const row = 'flex w-full items-center gap-3.5 px-4 py-3.5'
  if (href) {
    return (
      <li>
        <a href={href} className={cn(row, 'transition-colors hover:bg-surface-2', className)}>
          {inner}
        </a>
      </li>
    )
  }
  if (onClick) {
    return (
      <li>
        {/* Extra props and the ref land on the button, so a row can be a Radix trigger (asChild). */}
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          className={cn(row, 'min-h-14 transition-colors hover:bg-surface-2', className)}
          {...buttonProps}
        >
          {inner}
        </button>
      </li>
    )
  }
  return <li className={cn(row, className)}>{inner}</li>
}

const callouts = {
  alert: { box: 'bg-alert-soft', icon: 'text-alert', title: 'text-ink' },
  info: { box: 'bg-brand-soft', icon: 'text-brand', title: 'text-ink' },
  ok: { box: 'bg-ok-soft', icon: 'text-ok', title: 'text-ink' },
  sun: { box: 'bg-sun/25', icon: 'text-ink', title: 'text-ink' },
}

/** ROLE: a message that needs attention. Tinted fill, icon, no border and no side stripe. */
export function Callout({ tone = 'alert', icon = 'alert', title, children, className, ...props }) {
  const c = callouts[tone]
  return (
    <div className={cn('flex gap-3.5 rounded-card px-4 py-3.5', c.box, className)} {...props}>
      <span className={cn('mt-0.5 shrink-0', c.icon)}>
        <Icon name={icon} size={22} />
      </span>
      <div className="min-w-0 flex-1">
        {title && <strong className={c.title}>{title}</strong>}
        {children && <div className="mt-0.5 text-sm text-subtle">{children}</div>}
      </div>
    </div>
  )
}

const badges = {
  alert: 'bg-alert-soft text-alert',
  ok: 'bg-ok-soft text-ok',
  sun: 'bg-sun text-[#1b2433]',
  brand: 'bg-brand-soft text-brand',
  neutral: 'bg-surface-2 text-subtle',
}

/** ROLE: a status label. Pill, tinted fill, never interactive. */
export function Badge({ tone = 'neutral', icon, children, className, ...props }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold', badges[tone], className)} {...props}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  )
}
