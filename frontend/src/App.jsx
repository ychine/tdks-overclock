import { useCallback, useEffect, useRef, useState } from 'react'
import Nav from './components/Nav'
import Topbar from './components/Topbar'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Reading from './pages/Reading'
import Review from './pages/Review'
import Summary from './pages/Summary'
import Salary from './pages/Salary'
import Chat from './pages/Chat'
import Compare from './pages/Compare'
import Questions from './pages/Questions'
import Help from './pages/Help'

const labels = {
  home: 'Home',
  upload: 'Upload',
  reading: 'Binabasa',
  review: 'Check & Correct',
  summary: '30-Second Summary',
  salary: 'Salary Breakdown',
  chat: 'Magtanong',
  compare: 'Compare',
  questions: 'Walang kontrata',
  help: 'Get Help',
}

export default function App() {
  const [landed, setLanded] = useState(false)
  const [screen, setScreen] = useState('home')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [language, setLanguage] = useState('Taglish')
  const firstRender = useRef(true)

  // Theme the page itself (overscroll, scrollbars, form controls), not just .app.
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  // After a screen change, move focus to the new heading for keyboard and screen-reader users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const heading = document.querySelector('.main-shell h1')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }, [screen, landed])

  const go = useCallback((next) => {
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const content = {
    home: <Home go={go} language={language} setLanguage={setLanguage} />,
    upload: <Upload go={go} />,
    reading: <Reading go={go} />,
    review: <Review go={go} />,
    summary: <Summary go={go} />,
    salary: <Salary go={go} />,
    chat: <Chat />,
    compare: <Compare />,
    questions: <Questions go={go} />,
    help: <Help />,
  }

  if (!landed) {
    return (
      <div className={dark ? 'app dark' : 'app'}>
        <Landing
          dark={dark}
          setDark={setDark}
          enter={() => {
            setLanded(true)
            window.scrollTo(0, 0)
          }}
        />
      </div>
    )
  }

  return (
    <div className={dark ? 'app with-nav dark' : 'app with-nav'}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-xl focus:bg-(--blue) focus:px-4 focus:py-3 focus:font-bold focus:text-(--on-solid)"
      >
        Lumaktaw sa nilalaman
      </a>
      <Nav screen={screen} go={go} />
      <main id="main" className="main-shell">
        <Topbar
          title={labels[screen]}
          onHome={() => {
            setLanded(false)
            window.scrollTo(0, 0)
          }}
          dark={dark}
          setDark={setDark}
          language={language}
          setLanguage={setLanguage}
        />
        {content[screen]}
        <footer>
          <span>Linaw</span>
          <p>Nagpapaliwanag lang kami, hindi legal advice.</p>
        </footer>
      </main>
    </div>
  )
}
