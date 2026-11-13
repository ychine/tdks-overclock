import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { SPRING_LAYOUT } from '@/lib/ease'
import { cn } from '@/lib/utils'
import { useI18n } from '../i18n/useI18n'
import { agencies, telHref } from '../lib/agencies'
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

/** Help nav item: click goes to the full page; hover or the chevron opens quick-call numbers. */
function HelpMenu({ active, go }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={() => {
          setOpen(false)
          go('help')
        }}
        className={cn(
          'min-h-11 rounded-btn pl-3 text-sm font-semibold transition-colors',
          active ? 'text-brand' : 'text-subtle hover:text-ink',
        )}
      >
        {t('nav.help')}
      </button>
      <button
        type="button"
        aria-label={t('nav.quickCalls')}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'grid min-h-11 w-11 place-items-center rounded-btn transition-colors',
          active ? 'text-brand' : 'text-subtle hover:text-ink',
        )}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn('transition-transform', open && 'rotate-180')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 w-64 pt-1">
          <div role="menu" className="rounded-card border border-line bg-surface p-2 shadow-lg">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-bold tracking-wide text-subtle uppercase">{t('nav.quickCalls')}</span>
            </div>
            <ul>
              {agencies.map((a) => (
                <li key={a.id}>
                  <a
                    role="menuitem"
                    href={telHref(a.phone)}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-btn px-2 text-sm hover:bg-brand-soft"
                  >
                    <span className="font-bold">{a.name}</span>
                    <span className="font-semibold text-brand tabular-nums">{a.phone}</span>
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                go('help')
              }}
              className="mt-1 flex min-h-11 w-full items-center rounded-btn border-t border-line px-2 text-sm font-semibold text-subtle hover:text-ink"
            >
              {t('nav.viewAllHelp')}
            </button>
          </div>
        </div>
      )}
    </div>
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
          <Brand onClick={onBrand ?? (() => go('home'))} label={t('app.brandLanding')} />
          <nav aria-label={t('nav.menu')} className="hidden items-center gap-1 lg:flex">
            {items.map((item) => {
              const active = section === item.id
              if (item.id === 'help') return <HelpMenu key={item.id} active={active} go={go} />
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
