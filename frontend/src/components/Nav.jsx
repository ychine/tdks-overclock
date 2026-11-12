import { motion } from 'motion/react'
import { SPRING_LAYOUT } from '@/lib/ease'
import { cn } from '@/lib/utils'
import { useI18n } from '../i18n/useI18n'
import Brand from './Brand'
import Icon from './Icon'

const items = [
  { id: 'home', icon: 'home' },
  { id: 'summary', icon: 'spark' },
  { id: 'chat', icon: 'chat' },
  { id: 'compare', icon: 'compare' },
  { id: 'help', icon: 'help' },
]

/** Screens that belong to a nav section even though they are not in the menu themselves. */
const sectionOf = { upload: 'home', reading: 'home', review: 'home', salary: 'summary', questions: 'home' }

function NavButton({ item, active, go, label, layout }) {
  const side = layout === 'side'
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() => go(item.id)}
      className={cn(
        'relative isolate flex transition-colors',
        side
          ? 'min-h-12 items-center gap-3 rounded-btn px-3.5 font-semibold'
          : 'min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-btn text-xs font-semibold',
        active ? 'text-brand' : 'text-subtle hover:text-ink',
        active && !side && 'font-bold',
      )}
    >
      {active && (
        <motion.span
          layoutId={`nav-active-${layout}`}
          transition={SPRING_LAYOUT}
          className={cn('absolute inset-0 -z-10 rounded-btn bg-brand-soft')}
        />
      )}
      <Icon name={item.icon} size={side ? 22 : 21} />
      <span>{label}</span>
    </button>
  )
}

export default function Nav({ screen, go }) {
  const { t } = useI18n()
  const section = sectionOf[screen] ?? screen
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-line bg-surface px-[18px] py-7 lg:flex print:hidden">
        <Brand onClick={() => go('home')} label={t('app.brandHome')} />
        <p className="mt-1.5 mb-8 ml-1 text-sm text-subtle">{t('nav.kicker')}</p>
        <nav aria-label={t('nav.menu')} className="grid gap-1">
          {items.map((item) => (
            <NavButton key={item.id} item={item} active={section === item.id} go={go} label={t(`nav.${item.id}`)} layout="side" />
          ))}
        </nav>
        <div className="mt-auto flex items-start gap-2.5 rounded-card bg-surface-2 p-3.5 text-sm text-subtle">
          <span className="mt-0.5 shrink-0 text-brand">
            <Icon name="lock" size={18} />
          </span>
          <span>{t('nav.private')}</span>
        </div>
      </aside>
      <nav
        aria-label={t('nav.menu')}
        className="fixed inset-x-0 bottom-0 z-30 flex h-19 gap-1 border-t border-line bg-surface/95 px-2 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden print:hidden"
      >
        {items.map((item) => (
          <NavButton key={item.id} item={item} active={section === item.id} go={go} label={t(`nav.${item.id}`)} layout="bottom" />
        ))}
      </nav>
    </>
  )
}
