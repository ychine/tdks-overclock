import { useState } from 'react'
import Button from '../components/Button'
import Icon from '../components/Icon'

const questions = [
  {
    q: 'Anong trabaho ang ginagawa mo?',
    options: ['Kasambahay', 'Local employee', 'OFW / abroad'],
  },
  {
    q: 'May malinaw ba kayong usapan sa sahod?',
    options: ['Oo, nakasulat sa chat', 'Verbal lang', 'Hindi pa malinaw'],
  },
  { q: 'May regular kang day off?', options: ['Oo, bawat linggo', 'Minsan lang', 'Wala'] },
]

const rights = [
  'Nakasulat na employment contract',
  'Minimum wage sa inyong rehiyon',
  'Isang buong araw na pahinga bawat linggo',
  'SSS, PhilHealth, at Pag-IBIG',
  'Maayos at ligtas na tulugan at pagkain',
]

export default function Questions({ go }) {
  const [step, setStep] = useState(0)
  const done = step >= questions.length
  const back = () => (step === 0 ? go('home') : setStep(step - 1))

  return (
    <div className="page question-page">
      {!done ? (
        <>
          <div className="question-progress">
            <span style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            <p>
              Tanong {step + 1} of {questions.length}
            </p>
          </div>
          <button type="button" className="back-link" onClick={back}>
            <Icon name="arrow" size={18} /> Bumalik
          </button>
          <div className="question-wrap">
            <p className="reassure">Walang kontrata? Okay lang.</p>
            <h1>{questions[step].q}</h1>
            <p>Piliin ang pinakamalapit sa sitwasyon mo.</p>
            <div className="choice-list">
              {questions[step].options.map((o, i) => (
                <button key={o} type="button" onClick={() => setStep(step + 1)}>
                  <span>{String.fromCharCode(65 + i)}</span>
                  {o}
                  <Icon name="arrow" />
                </button>
              ))}
            </div>
            <small>Walang maling sagot. Hindi namin ise-save ang sagot mo.</small>
          </div>
        </>
      ) : (
        <div className="result-wrap">
          <div className="result-sun" aria-hidden="true">
            <Icon name="sun" size={40} />
          </div>
          <h1>Ano ang karaniwang hinihingi ng Batas Kasambahay</h1>
          <p className="lead">Kahit walang written contract, may mga karapatan ka pa rin.</p>
          <div className="rights-list card">
            {rights.map((t) => (
              <div key={t}>
                <span aria-hidden="true">
                  <Icon name="check" size={17} />
                </span>
                {t}
              </div>
            ))}
          </div>
          <div className="notice">
            <Icon name="help" />
            <div>
              <strong>Hindi tugma ang sitwasyon mo?</strong>
              <p>Maaaring tumawag sa DOLE Hotline 1349 para magtanong nang libre.</p>
            </div>
          </div>
          <Button icon="phone" href="tel:1349">
            Tumawag sa DOLE 1349
          </Button>
          <Button variant="ghost" onClick={() => go('home')}>
            Bumalik sa Home
          </Button>
        </div>
      )}
    </div>
  )
}
