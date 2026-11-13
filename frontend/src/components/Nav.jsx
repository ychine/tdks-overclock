import { motion } from 'motion/react'
import { SPRING_LAYOUT } from '@/lib/ease'
import { cn } from '@/lib/utils'
import { useI18n } from '../i18n/useI18n'
import Brand from './Brand'
import Icon from './Icon'
import LanguageSelect from './LanguageSelect'
import ThemeToggle from './ThemeToggle'

const items = [
  // Home and Summary are one item: the whole document flow (upload, check, summary, salary).
  { id: 'home', icon: 'home' },
  { id: 'chat', icon: 'chat' },
  { id: 'compare', icon: 'compare' },
  { id: 'help', icon: 'help' },
]

/** Screens that belong to a nav section even though they are not in the menu themselves. */
const sectionOf = { upload: 'home', reading: 'home', review: 'home', summary: 'home', salary: 'home', questions: 'home' }

function BottomNavButton({ item, active, go, label }) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() => go(item.id)}
      className={cn(
        'relative isolate flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-btn text-xs font-semibold transition-colors',
        active ? 'font-bold text-brand' : 'text-subtle hover:text-ink',
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active-bottom"
          transition={SPRING_LAYOUT}
          className="absolute inset-0 -z-10 rounded-btn bg-brand-soft"
        />
      )}
      <Icon name={item.icon} size={21} />
      <span>{label}</span>
    </button>
  )
}

export default function Nav({ screen, go: goScreen, onBrand, dark, setDark, resume = 'home' }) {
  const { t } = useI18n()
  const section = sectionOf[screen] ?? screen
  // From outside the flow, Home picks up where you left off (e.g. your summary). Inside the flow it starts over.
  const go = (id) => goScreen(id === 'home' && section !== 'home' ? resume : id)
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur print:hidden">
        <div className="mx-auto flex h-[74px] w-[min(1240px,calc(100%-32px))] items-center justify-between gap-4">
          <Brand onClick={onBrand} label={t('app.brandHome')} />
          <nav aria-label={t('nav.menu')} className="hidden items-center gap-1 lg:flex">
            {items.map((item) => {
              const active = section === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => go(item.id)}
                  className={cn(
                    'min-h-11 rounded-btn px-3 text-sm font-semibold transition-colors',
                    active ? 'text-brand' : 'text-subtle hover:text-ink',
                  )}
                >
                  {t(`nav.${item.id}`)}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSelect className="max-w-28" />
            <ThemeToggle dark={dark} setDark={setDark} />
          </div>
        </div>
      </header>
      <nav
        aria-label={t('nav.menu')}
        className="fixed inset-x-0 bottom-0 z-30 flex h-19 gap-1 border-t border-line bg-surface/95 px-2 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden print:hidden"
      >
        {items.map((item) => (
          <BottomNavButton key={item.id} item={item} active={section === item.id} go={go} label={t(`nav.${item.id}`)} />
        ))}
      </nav>
    </>
  )
}
