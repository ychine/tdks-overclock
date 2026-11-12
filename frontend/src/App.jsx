import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { EASE_OUT } from '@/lib/ease'
import ErrorBoundary from './components/ErrorBoundary'
import Nav from './components/Nav'
import { I18nProvider } from './i18n/I18nProvider'
import { useI18n } from './i18n/useI18n'

// Screens are code-split: the landing page (which carries GSAP) and the chat (which carries the
// beUI agent components) only load when someone opens them — kinder to cheap phones and slow data.
const Landing = lazy(() => import('./pages/Landing'))
const Home = lazy(() => import('./pages/Home'))
const Upload = lazy(() => import('./pages/Upload'))
const Reading = lazy(() => import('./pages/Reading'))
const Review = lazy(() => import('./pages/Review'))
const Summary = lazy(() => import('./pages/Summary'))
const Salary = lazy(() => import('./pages/Salary'))
const Chat = lazy(() => import('./pages/Chat'))
const Compare = lazy(() => import('./pages/Compare'))
const Questions = lazy(() => import('./pages/Questions'))
const Help = lazy(() => import('./pages/Help'))

function Loading() {
  return <div className="min-h-[60vh]" aria-busy="true" />
}

function Shell() {
  const { t } = useI18n()
  const [landed, setLanded] = useState(false)
  const [screen, setScreen] = useState('home')
  const [documentName, setDocumentName] = useState('')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Theme the page itself (overscroll, scrollbars, form controls), not just the app wrapper.
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  const go = useCallback((next) => {
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const content = {
    home: <Home go={go} />,
    upload: <Upload go={go} onFile={setDocumentName} />,
    reading: <Reading go={go} fileName={documentName} />,
    review: <Review go={go} />,
    summary: <Summary go={go} />,
    salary: <Salary go={go} />,
    chat: <Chat go={go} />,
    compare: <Compare />,
    questions: <Questions go={go} />,
    help: <Help />,
  }

  if (!landed) {
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <Suspense fallback={<Loading />}>
          <Landing
            dark={dark}
            setDark={setDark}
            enter={() => {
              setLanded(true)
              window.scrollTo(0, 0)
            }}
          />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors print:pl-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-btn focus:bg-brand focus:px-4 focus:py-3 focus:font-bold focus:text-on-solid"
      >
        {t('app.skip')}
      </a>
      <Nav screen={screen} go={go} dark={dark} setDark={setDark} />
      <main id="main" className="min-h-screen pb-22 lg:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            <Suspense fallback={<Loading />}>{content[screen]}</Suspense>
          </motion.div>
        </AnimatePresence>
        <footer className="mx-10 hidden h-24 items-center justify-between border-t border-line text-sm text-subtle lg:flex print:hidden">
          <span className="font-display text-xl text-ink">Linaw</span>
          <p>{t('app.disclaimer')}</p>
        </footer>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      {/* "user" turns Motion's transform / layout animation off for people who ask for less motion. */}
      <MotionConfig reducedMotion="user">
        <ErrorBoundary>
          <Shell />
        </ErrorBoundary>
      </MotionConfig>
    </I18nProvider>
  )
}
