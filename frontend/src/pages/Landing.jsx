import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { EASE_OUT } from '@/lib/ease'
import { cn } from '@/lib/utils'
import Brand from '../components/Brand'
import Icon from '../components/Icon'
import LanguageSelect from '../components/LanguageSelect'
import ThemeToggle from '../components/ThemeToggle'
import Accordion from '../components/ui/Accordion'
import Button from '../components/ui/Button'
import { Segmented } from '../components/ui/Controls'
import { BlurReveal } from '../components/motion/blur-reveal'
import { Badge, IconTile, ListGroup, ListRow, Panel } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'
import { agencies, telHref } from '../lib/agencies'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Lenis gives the wheel / trackpad / touch scroll its inertia. One instance lives while the landing is mounted.
let lenis = null
function scrollToTop() {
  if (lenis) lenis.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

const wrap = 'mx-auto w-[min(1160px,calc(100%-32px))]'
const h2 = 'text-3xl leading-[1.08] font-semibold md:text-5xl'

/** Header gains a hairline and blur once the page scrolls (Motion scroll value, no listeners to manage). */
function Header({ t, enter, dark, setDark }) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 12))
  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-[background-color,border-color] duration-200',
        scrolled ? 'border-b border-line bg-canvas/85 backdrop-blur' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-[74px] w-[min(1240px,calc(100%-32px))] items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Brand onClick={() => scrollToTop()} label={t('app.brandHome')} />
        <nav className="hidden items-center gap-1 text-sm font-semibold text-subtle lg:flex">
          {[
            ['#paano', 'landing.navHow'],
            ['#para-kanino', 'landing.navWho'],
            ['#privacy', 'landing.navPrivacy'],
            ['#faq', 'landing.navFaq'],
          ].map(([href, key]) => (
            <a
              key={href}
              href={href}
              className="rounded-btn px-4 py-2.5 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {t(key)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 lg:justify-self-end">
          <LanguageSelect />
          <ThemeToggle dark={dark} setDark={setDark} />
          <span className="hidden sm:block">
            <Button onClick={enter}>{t('landing.start')}</Button>
          </span>
        </div>
      </div>
    </header>
  )
}

/* Rays fan evenly across the open quarter outside the card corner: 0° points up, 90° points right.
   [angle, inner radius, outer radius]. Long and short alternate so it reads as sunlight, not a burst. */
const SUN_RAYS = [
  [0, 18, 44],
  [30, 18, 34],
  [60, 18, 34],
  [90, 18, 44],
]

/**
 * Sunburst rays drawn from the card's top-right corner in the same marker style as the headline
 * underline: even width, round caps. Each ray draws outward once, after the card lands.
 */
function BrushSun() {
  const reduce = useReducedMotion()
  return (
    <svg
      aria-hidden="true"
      viewBox="-60 -60 120 120"
      className="pointer-events-none absolute -top-12 -right-5 z-0 size-28 overflow-visible sm:-top-[88px] sm:-right-[88px] sm:size-44"
    >
      {SUN_RAYS.map(([angle, r0, r1], i) => (
        <motion.path
          key={angle}
          d={`M0 ${-r0}L0 ${-r1}`}
          transform={`rotate(${angle})`}
          fill="none"
          stroke="var(--sun)"
          strokeWidth={6}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 1.3 + i * 0.06 },
            opacity: { duration: 0.01, delay: 1.3 + i * 0.06 },
          }}
        />
      ))}
    </svg>
  )
}

/** A contract page drawn with bars. Tinted rows mark what Linaw found; the page number shows when opened. */
function Page({ rows, open, reduce, label, className, animate }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={animate}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 24, mass: 0.9 }}
      style={{ transformOrigin: '100% 50%' }}
      className={cn('absolute inset-y-3 left-0 w-[64%] rounded-card border border-line bg-surface-2 p-5', className)}
    >
      <div className="h-3 w-2/5 rounded-full bg-ink/25" />
      {rows.map((group, g) => (
        <div key={g} className={cn('grid gap-2.5', g === 0 ? 'mt-5' : 'mt-6')}>
          {group.map(([width, tone], i) => (
            <div key={i} className={cn('rounded-full', tone ? 'h-2.5' : 'h-2 bg-line', width, tone)} />
          ))}
        </div>
      ))}
      <motion.span
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 6 }}
        transition={{ duration: reduce ? 0 : 0.25, delay: open && !reduce ? 0.15 : 0 }}
        className="absolute bottom-4 left-5 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-subtle tabular-nums"
      >
        {label}
      </motion.span>
    </motion.div>
  )
}

const PAGE_ONE = [
  [['w-full'], ['w-11/12'], ['w-4/5', 'bg-brand-soft ring-1 ring-brand/40'], ['w-full'], ['w-9/12']],
  [['w-full'], ['w-10/12', 'bg-sun/60'], ['w-full'], ['w-7/12']],
  [['w-11/12'], ['w-full', 'bg-alert-soft ring-1 ring-alert/50'], ['w-8/12']],
]
const PAGE_TWO = [
  [['w-full'], ['w-10/12'], ['w-full'], ['w-8/12']],
  [['w-11/12'], ['w-full'], ['w-9/12', 'bg-brand-soft ring-1 ring-brand/40'], ['w-6/12']],
  [['w-full'], ['w-7/12']],
]
const SHADOW_REST = '0 10px 26px -14px rgb(16 23 34 / 0.22)'
const SHADOW_LIFTED = '0 26px 50px -20px rgb(16 23 34 / 0.4)'

/**
 * Hero visual. The worker's two photographed pages sit behind Linaw's summary card. Hover (or tap on touch)
 * opens the stack like a booklet: both pages swing out from the spine, the back one furthest, and the
 * summary lifts forward. The card reuses the real ListGroup / ListRow / Badge, so the preview is the product.
 */
function ContractPreview({ t }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const hover = (value) => (e) => e.pointerType === 'mouse' && setOpen(value)
  const tap = (e) => e.pointerType !== 'mouse' && setOpen((v) => !v)
  const spring = reduce ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 24, mass: 0.9 }
  return (
    <div data-hero="visual" className="relative mx-auto w-full max-w-[480px] py-10">
      <div
        data-parallax
        className="relative [perspective:1400px]"
        onPointerEnter={hover(true)}
        onPointerLeave={hover(false)}
        onPointerUp={tap}
      >
        <Page
          rows={PAGE_TWO}
          open={open}
          reduce={reduce}
          label="2 / 2"
          className="z-0"
          animate={
            open
              ? { x: '-22%', y: 8, rotate: -12, rotateY: 24, boxShadow: SHADOW_LIFTED }
              : { x: '-3%', y: 6, rotate: -6.5, rotateY: 0, boxShadow: SHADOW_REST }
          }
        />
        <Page
          rows={PAGE_ONE}
          open={open}
          reduce={reduce}
          label="1 / 2"
          className="z-[1]"
          animate={
            open
              ? { x: '-9%', y: -10, rotate: -5.5, rotateY: 14, boxShadow: SHADOW_LIFTED }
              : { x: 0, y: 0, rotate: -4, rotateY: 0, boxShadow: SHADOW_REST }
          }
        />

        <motion.div
          initial={false}
          animate={open ? { x: '7%', y: -14, rotate: 3, rotateY: -8 } : { x: 0, y: 0, rotate: 1.5, rotateY: 0 }}
          transition={spring}
          style={{ transformOrigin: '0% 50%' }}
          className="relative z-[2] mt-14 ml-auto w-[min(400px,90%)]"
        >
          <BrushSun />
          <Panel className="relative z-[1] p-4 shadow-float">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <IconTile icon="file" tone="brand" />
              <div className="grid flex-1 text-sm">
                <strong>{t('landing.previewFile')}</strong>
                <small className="text-subtle">{t('landing.previewMeta')}</small>
              </div>
              <Badge tone="ok" icon="check">OK</Badge>
            </div>
            <p className="pt-4 pb-2 text-sm font-semibold text-subtle">{t('landing.previewLabel')}</p>
            <ListGroup data-preview="rows">
              <ListRow icon="wallet" tone="brand" title={t('landing.previewSalary')} value={t('landing.previewSalaryValue')} />
              <ListRow icon="sun" tone="sun" title={t('landing.previewHours')} value={t('landing.previewHoursValue')} />
              <ListRow
                icon="alert"
                tone="alert"
                title={t('landing.previewAsk')}
                detail={t('landing.previewAskValue')}
                badge={<Badge tone="alert">{t('summary.askBadge')}</Badge>}
                className="bg-alert-soft"
              />
            </ListGroup>
            <div data-preview="chat" className="mt-3 flex gap-2.5 rounded-card bg-navy p-3.5 text-[#f8f4ec]">
              <span className="mt-0.5 shrink-0 text-sun">
                <Icon name="spark" size={18} />
              </span>
              <p className="text-sm leading-snug">{t('landing.previewChat')}</p>
            </div>
          </Panel>
        </motion.div>
      </div>
    </div>
  )
}

function Audiences({ t, enter }) {
  const audiences = t('landing.audiences')
  const icons = ['home', 'file', 'compare']
  const [active, setActive] = useState(0)
  const current = audiences[active]
  return (
    <div>
      <Segmented
        kind="tab"
        label={t('landing.navWho')}
        value={active}
        onChange={setActive}
        options={audiences.map((a, i) => ({ value: i, label: a.title }))}
        className="w-full [&>button]:px-2 [&>button]:text-sm sm:[&>button]:text-base"
      />
      <Panel role="tabpanel" className="mt-3 min-h-[300px] p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            <IconTile icon={icons[active]} tone="brand" className="mb-4" />
            <h3 className="font-display text-2xl font-semibold">{current.title}</h3>
            <p className="mt-1.5 text-subtle">{current.text}</p>
            <ul className="mt-5 grid gap-3">
              {current.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand text-on-solid">
                    <Icon name="check" size={14} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Button variant="secondary" className="mt-6" onClick={enter}>
              {t('landing.cta')}
            </Button>
          </motion.div>
        </AnimatePresence>
      </Panel>
    </div>
  )
}

/** Human fallback under the FAQ: a free call to DOLE, or start checking the contract. */
function StillHelp({ t, enter, className }) {
  return (
    <div className={cn('rounded-card bg-navy p-6 text-[#f8f4ec] dark:ring-1 dark:ring-line', className)}>
      <p className="font-display text-2xl font-semibold">{t('landing.faqStillTitle')}</p>
      <p className="mt-2 text-[#f8f4ec]/80">{t('landing.faqStillText')}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="sun" href={telHref('1349')} icon="phone">
          {t('landing.faqCall')}
        </Button>
        <Button variant="ghost" onClick={enter} trailingIcon="arrow" className="text-[#f8f4ec] hover:bg-white/10">
          {t('landing.cta')}
        </Button>
      </div>
    </div>
  )
}
/** FAQ: topic filter and a human fallback on the left (sticky on desktop), the questions on the right. */
function Faq({ t, enter }) {
  const topics = t('landing.faqTopics')
  const all = t('landing.faq')
  const [topic, setTopic] = useState(0)
  const items = topic === 0 ? all : all.filter((item) => item.topic === topic)
  return (
    <section id="faq" className={`${wrap} scroll-mt-20 py-16 md:py-24`}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:gap-16">
        <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
          <h2 className={cn(h2, 'max-w-[14ch] text-balance')}>{t('landing.faqTitle')}</h2>
          <p className="mt-4 max-w-[40ch] text-lg text-subtle">{t('landing.faqText')}</p>

          <div role="group" aria-label={t('landing.faqTitle')} className="mt-7 flex flex-wrap gap-2">
            {topics.map((label, i) => {
              const active = topic === i
              const count = i === 0 ? all.length : all.filter((item) => item.topic === i).length
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTopic(i)}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                    active
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-surface text-ink hover:border-brand/50 hover:bg-brand-soft',
                  )}
                >
                  {label}
                  <span className={cn('tabular-nums', active ? 'text-canvas/70' : 'text-subtle')}>{count}</span>
                </button>
              )
            })}
          </div>

          <StillHelp t={t} enter={enter} className="mt-8 hidden lg:block" />
        </div>

        <div data-reveal>
          <Accordion
            key={topic}
            items={items}
            defaultOpen={topic === 0 ? 0 : null}
            shortLabel={t('landing.faqShort')}
          />
          <StillHelp t={t} enter={enter} className="mt-8 lg:hidden" />
        </div>
      </div>
    </section>
  )
}
export default function Landing({ enter, dark, setDark }) {
  const { t } = useI18n()
  const info = t('help.agencies')
  const root = useRef(null)
  const trustIcons = ['lock', 'refresh', 'check', 'spark']
  const statValues = [0, 3, 4, 0]

  // Smooth, inertial scrolling. Skipped for prefers-reduced-motion. Driven by GSAP's ticker so
  // ScrollTrigger stays in sync.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const instance = new Lenis({ lerp: 0.1, anchors: { offset: -90 } })
    lenis = instance
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis = null
    }
  }, [])

  // GSAP owns the scroll story. Everything is skipped for prefers-reduced-motion.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro
          .from('[data-hero="lead"]', { y: 14, opacity: 0, duration: 0.55 }, 0.2)
          .from('[data-hero="cta"]', { y: 14, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.35')
          .from('[data-hero="visual"]', { y: 40, opacity: 0, duration: 0.9 }, 0.25)
          .from('[data-preview="rows"] > li', { y: 10, opacity: 0, duration: 0.45, stagger: 0.14 }, 0.95)
          .from('[data-preview="rows"] > li:last-child', { backgroundColor: 'rgba(0,0,0,0)', duration: 0.7, clearProps: 'backgroundColor' }, 1.5)
          .from('[data-preview="chat"]', { y: 10, opacity: 0, duration: 0.5 }, 1.55)

        gsap.set('[data-reveal]', { opacity: 0, y: 24 })
        ScrollTrigger.batch('[data-reveal]', {
          start: 'top 90%',
          once: true,
          onEnter: (els) =>
            gsap.to(els, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', overwrite: true }),
        })

        gsap.fromTo(
          '[data-line]',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { trigger: '[data-steps]', start: 'top 80%', end: 'bottom 55%', scrub: true },
          },
        )

        gsap.to('[data-parallax]', {
          yPercent: -5,
          ease: 'none',
          scrollTrigger: { trigger: '[data-hero-section]', start: 'top top', end: 'bottom top', scrub: true },
        })

        gsap.utils.toArray('[data-count]').forEach((el) => {
          const end = Number(el.dataset.count)
          if (!end) return
          const counter = { value: 0 }
          el.textContent = '0'
          gsap.to(counter, {
            value: end,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = String(Math.round(counter.value))
            },
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const steps = t('landing.steps')

  return (
    <div ref={root} className="relative isolate overflow-x-clip">
      {/* banig weave from the very top of the page, behind the header nav, dissolving downward into the hero */}
      <div
        aria-hidden="true"
        className="banig pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 [mask-image:linear-gradient(to_top,transparent,rgba(0,0,0,0.35))] sm:h-48"
      />
      <Header t={t} enter={enter} dark={dark} setDark={setDark} />

      <main>
        {/* First screen fills the viewport (minus the 74px header) so the trust strip sits at its bottom edge. */}
        <div className="flex min-h-[calc(100svh-74px)] flex-col">
        <section
          data-hero-section
          className="mx-auto grid w-[min(1240px,calc(100%-32px))] flex-1 content-center items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-12"
        >
          <div>
            {/* The pill that used to sit here is gone; this margin (pill height + old gap) keeps the headline where it was. */}
            <h1 className="mt-[62px] text-5xl leading-[1.04] font-semibold md:text-6xl lg:text-[4.5rem]">
              <span className="block pb-1">
                <BlurReveal as="span" className="inline-block" delay={0.2} speedReveal={1.4} speedSegment={0.7}>
                  {t('landing.h1a')}
                </BlurReveal>
              </span>
              <span className="block pb-1 text-brand">
                <BlurReveal as="span" className="inline-block" delay={0.55} speedReveal={1.4} speedSegment={0.7} underlineLast>
                  {t('landing.h1b')}
                </BlurReveal>
              </span>
            </h1>
            <p data-hero="lead" className="mt-6 max-w-[56ch] text-lg text-subtle">{t('landing.lead')}</p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span data-hero="cta" className="block">
                <Button size="lg" icon="upload" onClick={enter} className="w-full sm:w-auto sm:min-w-60">
                  {t('landing.cta')}
                </Button>
              </span>
              <a
                data-hero="cta"
                href="#paano"
                className="flex min-h-14 items-center justify-center gap-2 rounded-btn px-2 font-bold text-brand hover:underline"
              >
                {t('landing.how')} <Icon name="arrow" size={18} />
              </a>
            </div>
          </div>
          <ContractPreview t={t} />
        </section>

        {/* banig weave: the top dissolves into the hero, the bottom stays crisp against the trust strip */}
        <div className="relative h-3" aria-hidden="true">
          <div className="banig pointer-events-none absolute inset-x-0 bottom-0 h-16 border-b border-line opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_75%)] sm:h-24" />
        </div>

        <section className="border-b border-line bg-surface">
          <ul className="mx-auto grid w-[min(1240px,calc(100%-32px))] grid-cols-2 gap-x-3 gap-y-5 py-6 md:grid-cols-4">
            {t('landing.trust').map((text, i) => (
              <li key={text} className="flex items-center justify-center gap-2 text-sm font-semibold text-subtle">
                <span className="text-brand"><Icon name={trustIcons[i]} size={20} /></span>
                {text}
              </li>
            ))}
          </ul>
        </section>
        </div>

        <section id="paano" className={`${wrap} scroll-mt-20 py-16 md:py-24`}>
          <div data-reveal className="max-w-[700px]">
            <h2 className={h2}>{t('landing.howTitle')}</h2>
            <p className="mt-4 text-lg text-subtle">{t('landing.howText')}</p>
          </div>
          <div data-steps className="relative mt-12">
            <div aria-hidden="true" className="absolute top-[22px] right-0 left-0 hidden h-px bg-line md:block">
              <div data-line className="h-full origin-left bg-brand" />
            </div>
            <ol className="relative grid gap-10 md:grid-cols-3 md:gap-10">
              {steps.map((step, i) => (
                <li key={step.title} data-reveal>
                  <span className="relative grid size-11 place-items-center rounded-full border border-brand bg-canvas font-display text-lg font-semibold text-brand">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-subtle">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="para-kanino" className={`${wrap} grid scroll-mt-20 items-start gap-10 pb-16 md:grid-cols-[1fr_1.05fr] md:gap-14 md:pb-24`}>
          <div data-reveal>
            <h2 className={h2}>{t('landing.whoTitle')}</h2>
            <p className="mt-4 text-lg text-subtle">{t('landing.whoText')}</p>
            <ul className="mt-7 grid gap-3.5">
              {t('landing.whoPoints').map((point) => (
                <li key={point} className="flex items-center gap-3 font-semibold">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
                    <Icon name="check" size={16} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal>
            <Audiences t={t} enter={enter} />
          </div>
        </section>

        <section id="privacy" className="scroll-mt-16 bg-navy py-16 text-[#f8f4ec] md:py-24">
          <div className={`${wrap} grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16`}>
            <div data-reveal>
              <span className="mb-6 grid size-14 place-items-center rounded-full bg-sun text-[#1b2433]">
                <Icon name="lock" size={26} />
              </span>
              <h2 className={h2}>{t('landing.privacyTitle')}</h2>
              <p className="mt-4 max-w-[52ch] text-lg text-[#f8f4ec]/80">{t('landing.privacyText')}</p>
            </div>
            <dl data-reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-[#f8f4ec]/15">
              {t('landing.statLabels').map((label, i) => (
                <div key={label} className="flex flex-col bg-navy p-6">
                  <dt className="order-2 mt-1 text-sm text-[#f8f4ec]/75">{label}</dt>
                  <dd className="font-display text-5xl font-semibold tabular-nums">
                    <span data-count={statValues[i]}>{i === 0 ? t('landing.statNone') : statValues[i]}</span>
                    <span aria-hidden="true" className="mt-3 block h-1 w-8 rounded-full bg-sun" />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <Faq t={t} enter={enter} />

        <section className="border-t border-line bg-surface-2/60">
          <div data-reveal className="mx-auto grid w-[min(850px,calc(100%-32px))] justify-items-center py-16 text-center md:py-24">
            <span className="mb-6 grid size-[74px] place-items-center rounded-full bg-sun text-[#1b2433]">
              <Icon name="sun" size={36} />
            </span>
            <h2 className="text-4xl leading-[1.05] font-semibold md:text-6xl">{t('landing.finalTitle')}</h2>
            <p className="mt-4 mb-7 text-lg text-subtle">{t('landing.finalText')}</p>
            <Button size="lg" onClick={enter} className="min-w-60" trailingIcon="arrow">
              {t('landing.finalCta')}
            </Button>
            <small className="mt-4 text-sm text-subtle">{t('app.disclaimer')}</small>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className={`${wrap} py-14 md:py-20`}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16">
            <div>
              <h2 className="max-w-[16ch] text-3xl leading-[1.08] font-semibold text-balance md:text-4xl">
                {t('landing.footerHelpTitle')}
              </h2>
              <p className="mt-3 max-w-[38ch] text-subtle">{t('landing.footerHelpText')}</p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
              {agencies.map((a, i) => (
                <li key={a.id} className="bg-canvas">
                  <a
                    href={telHref(a.phone)}
                    aria-label={`${a.name} ${a.phone}`}
                    className="group flex min-h-24 items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-2 md:p-5"
                  >
                    <span className="min-w-0">
                      <span className="block text-lg font-bold text-ink">{a.name}</span>
                      <span className="mt-0.5 block text-sm text-subtle">{info[i]?.for}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-soft px-3.5 py-2 font-bold text-brand tabular-nums transition-transform group-hover:scale-[1.03]">
                      <Icon name="phone" size={16} />
                      {a.phone}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Brand compact onClick={() => scrollToTop()} label={t('app.brandHome')} />
              <p className="text-subtle">{t('landing.footerTagline')}</p>
            </div>
            <Button onClick={enter} trailingIcon="arrow" className="self-start md:self-auto">
              {t('landing.footerApp')}
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-4 text-sm text-subtle md:flex-row md:items-center md:justify-between">
            <nav aria-label={t('landing.footerLinks')} className="-mx-3 flex flex-wrap">
              {[
                ['#paano', 'landing.navHow'],
                ['#para-kanino', 'landing.navWho'],
                ['#privacy', 'landing.navPrivacy'],
                ['#faq', 'landing.navFaq'],
              ].map(([href, key]) => (
                <a key={href} href={href} className="rounded-btn px-3 py-3 font-semibold transition-colors hover:text-ink">
                  {t(key)}
                </a>
              ))}
            </nav>
            <p className="flex items-center gap-2">
              <Icon name="lock" size={16} />
              {t('landing.footerPrivacy')}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
            <p className="tabular-nums">{'\u00a9'} {new Date().getFullYear()} Linaw. {t('landing.footerRights')}</p>
            <p className="flex items-center gap-3">
              <span>{t('landing.footerBy')}</span>
              {/* White-stroke wordmark used as a mask so it takes the theme ink in light and dark mode. */}
              <span
                role="img"
                aria-label="Dead Keys Society"
                className="block aspect-[790/92] h-[18px] bg-ink [mask:url(/tdks-logo.svg)_center/contain_no-repeat]"
              />
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}