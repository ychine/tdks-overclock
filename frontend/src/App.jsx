import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { EASE_OUT } from '@/lib/ease'
import {
  clearFile,
  loadConfirmed,
  loadDoc,
  loadFile,
  loadTheme,
  saveConfirmed,
  saveDoc,
  saveFile,
  saveTheme,
} from './lib/session'
import ErrorBoundary from './components/ErrorBoundary'
import Nav from './components/Nav'
import Stepper from './components/ui/Stepper'
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

// Every in-app screen id maps to a real URL. Pages keep calling go('upload') and friends.
const SCREENS = ['home', 'upload', 'reading', 'review', 'summary', 'salary', 'chat', 'compare', 'questions', 'help']
const pathOf = (screen) => `/${screen}`

// Screens that make up one continuous document flow, mapped to their stepper position.
// They share a persistent shell (stepper stays put) so moving between them doesn't feel like a page change.
const FLOW_STEP = { home: 0, upload: 0, reading: 0, review: 1, summary: 2, salary: 2, chat: 2 }

function Shell() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const screen = pathname.replace(/^\//, '')
  const [dark, setDarkState] = useState(() => (loadTheme() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark')

  // The document flow: Step 1 picks a file, Reading runs OCR, Step 2 confirms, Step 3 explains.
  // doc + confirmed + the file survive a refresh (sessionStorage), so reloading mid-flow keeps your place.
  const [upload, setUpload] = useState(null) // { file, url }
  const [doc, setDoc] = useState(loadDoc) // OCR result + extracted fields
  const [confirmed, setConfirmed] = useState(loadConfirmed) // fields the user approved
  const [readFailed, setReadFailed] = useState(false) // Reading reports OCR failure so the stepper can drop back
  const [restoring, setRestoring] = useState(true) // the saved file is rebuilt asynchronously

  // Remember an explicit theme choice; until then the page follows the system setting.
  const setDark = useCallback((value) => {
    setDarkState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      saveTheme(next ? 'dark' : 'light')
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    loadFile().then((restored) => {
      if (cancelled) {
        if (restored) URL.revokeObjectURL(restored.url)
        return
      }
      if (restored) setUpload((prev) => prev ?? restored)
      setRestoring(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    saveDoc(doc)
  }, [doc])
  useEffect(() => {
    saveConfirmed(confirmed)
  }, [confirmed])

  const onFile = useCallback((file) => {
    setUpload((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return { file, url: URL.createObjectURL(file) }
    })
    setDoc(null)
    setConfirmed(null)
    setReadFailed(false)
    clearFile()
    saveFile(file) // best effort: too big for storage just means "upload again" after a refresh
  }, [setDoc, setConfirmed, setReadFailed])

  // Theme the page itself (overscroll, scrollbars, form controls), not just the app wrapper.
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  const go = useCallback(
    (next) => {
      navigate(pathOf(next))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  const exitToLanding = useCallback(() => {
    navigate('/')
    window.scrollTo(0, 0)
  }, [navigate])

  if (pathname === '/') {
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <Suspense fallback={<Loading />}>
          <Landing
            dark={dark}
            setDark={setDark}
            enter={() => {
              navigate(pathOf('home'))
              window.scrollTo(0, 0)
            }}
          />
        </Suspense>
      </div>
    )
  }

  if (!SCREENS.includes(screen)) return <Navigate to="/" replace />
  const inFlow = screen in FLOW_STEP

  const content = {
    home: <Home go={go} onFile={onFile} />,
    upload: <Upload go={go} onFile={onFile} onExit={exitToLanding} />,
    reading: <Reading go={go} upload={upload} onRead={setDoc} onFailedChange={setReadFailed} />,
    review: <Review go={go} upload={upload} doc={doc} onConfirm={setConfirmed} />,
    summary: <Summary go={go} doc={doc} confirmed={confirmed} />,
    salary: <Salary go={go} confirmed={confirmed} />,
    chat: <Chat go={go} confirmed={confirmed} />,
    compare: <Compare />,
    questions: <Questions go={go} />,
    help: <Help />,
  }

  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors print:pl-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-btn focus:bg-brand focus:px-4 focus:py-3 focus:font-bold focus:text-on-solid"
      >
        {t('app.skip')}
      </a>
      <Nav screen={screen} go={go} onBrand={exitToLanding} dark={dark} setDark={setDark} resume={confirmed ? 'summary' : 'home'} />
      <main id="main" className="flex min-h-[calc(100dvh-74px)] flex-col pb-22 lg:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={inFlow ? 'flow' : screen}
            className="flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            {inFlow ? (
              <>
                {/* One stepper for the whole flow: it stays mounted and animates between steps. */}
                {screen !== 'chat' && (
                  <div className="mx-auto w-[calc(100%-32px)] max-w-[1180px] pt-8 md:w-[calc(100%-64px)] md:pt-10 print:hidden">
                    <Stepper
                      // Optimistic: once a file is in, Upload reads as done and Review spins while we scan.
                      current={screen === 'reading' && !readFailed ? 1 : FLOW_STEP[screen]}
                      busy={screen === 'reading'}
                      failed={screen === 'reading' && readFailed}
                      className="mb-0 justify-center"
                    />
                  </div>
                )}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={screen}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: EASE_OUT }}
                  >
                    <Suspense fallback={<Loading />}>{restoring ? <Loading /> : content[screen]}</Suspense>
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <Suspense fallback={<Loading />}>{restoring ? <Loading /> : content[screen]}</Suspense>
            )}
          </motion.div>
        </AnimatePresence>
        <footer className="mx-10 mt-auto hidden h-24 items-center justify-between border-t border-line text-sm text-subtle lg:flex print:hidden">
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
