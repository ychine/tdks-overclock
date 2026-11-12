import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import Icon from '../components/Icon'

const summaryItems = [
  {
    icon: 'wallet',
    title: 'Sahod',
    value: '₱18,000 / buwan',
    detail: 'Bayad tuwing ika-15 at ika-30',
  },
  {
    icon: 'alert',
    title: 'Bawas',
    value: '₱1,260 estimate',
    detail: 'SSS, PhilHealth, at Pag-IBIG',
    worry: true,
  },
  {
    icon: 'sun',
    title: 'Oras ng trabaho',
    value: '8 oras / araw',
    detail: 'Lunes–Sabado, may 1 oras na break',
  },
  {
    icon: 'home',
    title: 'Day off',
    value: 'Tuwing Linggo',
    detail: '24 oras na tuloy-tuloy na pahinga',
  },
  {
    icon: 'file',
    title: 'Haba ng kontrata',
    value: '2 taon',
    detail: 'Mula June 15, 2025',
  },
  {
    icon: 'alert',
    title: 'Parusa / penalties',
    value: 'May ₱5,000 penalty',
    detail: 'Kapag umalis bago matapos ang kontrata',
    worry: true,
  },
]

const terms = {
  Quitclaim:
    'Dokumentong nagsasabing natanggap mo na ang bayad at wala ka nang ibang hahabulin sa employer.',
  Probationary:
    'Trial period kung kailan tinitingnan kung pasado ka sa malinaw na standards ng trabaho.',
  'Liquidated damages': 'Halagang napagkasunduang bayaran kapag may hindi nasunod sa kontrata.',
}

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

export default function Summary({ go }) {
  const [term, setTerm] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const closeButton = useRef(null)

  // Close the term sheet with Escape and move focus into it when it opens.
  useEffect(() => {
    if (!term) return undefined
    closeButton.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setTerm(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [term])

  // Stop reading aloud when leaving the screen.
  useEffect(
    () => () => {
      if (canSpeak) window.speechSynthesis.cancel()
    },
    [],
  )

  const toggleSpeech = () => {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const text = summaryItems.map((i) => `${i.title}: ${i.value}. ${i.detail}.`).join(' ')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fil-PH'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synth.speak(utterance)
    setSpeaking(true)
  }

  return (
    <div className="page">
      <div className="page-heading summary-heading">
        <div>
          <span className="step-label">Step 3 of 3 · Tapos na</span>
          <h1>Ang kontrata mo, in 30 seconds</h1>
          <p>Unahin natin ang mga bagay na may epekto sa pera at oras mo.</p>
        </div>
        {canSpeak && (
          <Button variant="secondary" icon="sound" onClick={toggleSpeech}>
            {speaking ? 'Itigil ang pagbasa' : 'Basahin nang malakas'}
          </Button>
        )}
      </div>
      <div className="notice">
        <Icon name="alert" />
        <div>
          <strong>May 2 bagay na dapat mong tanungin.</strong>
          <p>
            May penalty sa maagang pag-alis at hindi malinaw kung sagot ng employer ang medical.
          </p>
        </div>
      </div>
      <div className="summary-grid">
        {summaryItems.map((item) => (
          <article key={item.title} className={`summary-card card ${item.worry ? 'worry' : ''}`}>
            <div className="summary-icon">
              <Icon name={item.icon} />
            </div>
            <div>
              <span>{item.title}</span>
              <h2>{item.value}</h2>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="terms-card card">
        <div>
          <h2>Hindi kailangang manghula.</h2>
          <p className="terms-hint">I-tap ang salitang hindi mo gets.</p>
        </div>
        <div className="term-list">
          {Object.keys(terms).map((t) => (
            <button key={t} type="button" onClick={() => setTerm(t)}>
              {t}
              <Icon name="plus" size={18} />
            </button>
          ))}
        </div>
      </div>
      <div className="summary-actions">
        <Button icon="wallet" onClick={() => go('salary')}>
          Tingnan ang salary breakdown
        </Button>
        <Button variant="secondary" icon="chat" onClick={() => go('chat')}>
          May itatanong ako
        </Button>
      </div>
      {term && (
        <div className="sheet-backdrop" onClick={() => setTerm(null)}>
          <div
            className="bottom-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="term-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" />
            <button
              ref={closeButton}
              type="button"
              className="sheet-close"
              aria-label="Isara"
              onClick={() => setTerm(null)}
            >
              <Icon name="close" />
            </button>
            <h2 id="term-title">{term}</h2>
            <p>{terms[term]}</p>
            <Button onClick={() => setTerm(null)}>Gets ko na</Button>
          </div>
        </div>
      )}
    </div>
  )
}
