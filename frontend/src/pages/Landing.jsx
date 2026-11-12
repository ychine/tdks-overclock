import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
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
      <div className="mx-auto flex h-[74px] w-[min(1240px,calc(100%-32px))] items-center justify-between">
        <Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} label={t('app.brandHome')} />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-subtle lg:flex">
          <a className="hover:text-ink" href="#paano">{t('landing.navHow')}</a>
          <a className="hover:text-ink" href="#para-kanino">{t('landing.navWho')}</a>
          <a className="hover:text-ink" href="#privacy">{t('landing.navPrivacy')}</a>
          <a className="hover:text-ink" href="#faq">{t('landing.navFaq')}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelect className="max-w-28" />
          <ThemeToggle dark={dark} setDark={setDark} />
          <span className="hidden sm:block">
            <Button onClick={enter}>{t('landing.start')}</Button>
          </span>
        </div>
      </div>
    </header>
  )
}

/** The hero visual reuses the real ListGroup / ListRow / Badge, so the preview is the product. */
function ContractPreview({ t }) {
  return (
    <div data-hero="visual" className="relative mx-auto w-full max-w-[440px] py-8">
      <div data-parallax>
        <span
          aria-hidden="true"
          className="absolute -bottom-1 right-6 z-10 grid size-14 place-items-center rounded-full bg-sun text-[#1b2433] shadow-card"
        >
          <Icon name="sun" size={28} />
        </span>
        <Panel className="relative z-[2] w-[min(400px,94%)] rotate-[1.5deg] p-4 shadow-float">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <IconTile icon="file" tone="brand" />
            <div className="grid flex-1 text-sm">
              <strong>{t('landing.previewFile')}</strong>
              <small className="text-subtle">{t('landing.previewMeta')}</small>
            </div>
            <Badge tone="ok" icon="check">OK</Badge>
          </div>
          <p className="pt-4 pb-2 text-sm font-semibold text-subtle">{t('landing.previewLabel')}</p>
          <ListGroup>
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
          <div className="mt-3 flex gap-2.5 rounded-card bg-navy p-3.5 text-[#f8f4ec]">
            <span className="mt-0.5 shrink-0 text-sun">
              <Icon name="spark" size={18} />
            </span>
            <p className="text-sm leading-snug">{t('landing.previewChat')}</p>
          </div>
        </Panel>
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

export default function Landing({ enter, dark, setDark }) {
  const { t } = useI18n()
  const root = useRef(null)
  const trustIcons = ['lock', 'spark', 'help', 'sound']
  const statValues = [24, 3, 4, 0]

  // GSAP owns the scroll story. Everything is skipped for prefers-reduced-motion.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro
          .from('[data-hero="pill"]', { y: 12, opacity: 0, duration: 0.5 })
          .from('[data-hero="lead"]', { y: 14, opacity: 0, duration: 0.55 }, '-=0.1')
          .from('[data-hero="cta"]', { y: 14, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.35')
          .from('[data-hero="visual"]', { y: 40, opacity: 0, duration: 0.9 }, 0.25)

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
    <div ref={root} className="overflow-x-clip">
      <Header t={t} enter={enter} dark={dark} setDark={setDark} />

      <main>
        <section
          data-hero-section
          className="mx-auto grid w-[min(1240px,calc(100%-32px))] items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-20"
        >
          <div>
            <span
              data-hero="pill"
              className="flex w-max max-w-full items-center gap-2.5 rounded-full border border-line bg-surface px-3 py-2 text-sm font-semibold text-subtle"
            >
              <i className="size-2 shrink-0 rounded-full bg-ok ring-4 ring-ok/15" />
              {t('landing.pill')}
            </span>
            <h1 className="mt-6 text-5xl leading-[1.04] font-semibold md:text-6xl lg:text-[4.5rem]">
              <span className="block pb-1">
                <BlurReveal as="span" className="inline-block" delay={0.2} speedReveal={1.4} speedSegment={0.7}>
                  {t('landing.h1a')}
                </BlurReveal>
              </span>
              <span className="block pb-1 text-brand">
                <BlurReveal as="span" className="inline-block" delay={0.55} speedReveal={1.4} speedSegment={0.7}>
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
            <div data-hero="cta" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-subtle">
              <span className="flex items-center gap-1.5">
                <span className="text-brand"><Icon name="lock" size={18} /></span>
                {t('landing.reassure1')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-brand"><Icon name="check" size={18} /></span>
                {t('landing.reassure2')}
              </span>
            </div>
          </div>
          <ContractPreview t={t} />
        </section>

        <div className="banig h-3 border-y border-line" aria-hidden="true" />

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
                    <span data-count={statValues[i]}>{statValues[i]}</span>
                    {i === 0 && <span className="text-3xl">h</span>}
                    <span aria-hidden="true" className="mt-3 block h-1 w-8 rounded-full bg-sun" />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="faq" className="mx-auto w-[min(820px,calc(100%-32px))] scroll-mt-20 py-16 md:py-24">
          <h2 data-reveal className={h2}>{t('landing.faqTitle')}</h2>
          <p data-reveal className="mt-3 max-w-[60ch] text-lg text-subtle">{t('landing.faqText')}</p>
          <div data-reveal className="mt-8">
            <Accordion items={t('landing.faq')} />
          </div>
        </section>

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
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-10 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Brand compact onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} label={t('app.brandHome')} />
            <p className="mt-3 max-w-[32ch] text-subtle">{t('landing.footerTagline')}</p>
            <Button variant="secondary" onClick={enter} className="mt-5">
              {t('landing.footerApp')}
            </Button>
          </div>
          <div>
            <h3 className="font-bold">{t('landing.footerHelp')}</h3>
            <ul className="mt-3 grid gap-1">
              {agencies.map((a) => (
                <li key={a.id}>
                  <a
                    href={telHref(a.phone)}
                    className="flex min-h-11 items-center justify-between gap-4 rounded-btn text-subtle hover:text-ink"
                  >
                    <span className="font-semibold text-ink">{a.name}</span>
                    <span className="text-brand">{a.phone}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold">{t('landing.footerNote')}</h3>
            <p className="mt-3 text-subtle">{t('app.disclaimer')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
