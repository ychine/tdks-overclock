import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import Icon from '../components/Icon'

const answers = {
  'Pwede ba akong umalis nang maaga?': {
    body: (
      <>
        Oo, puwede kang umalis bago matapos ang kontrata—pero may nakasulat na{' '}
        <strong>₱5,000 penalty</strong>. Bago pumirma, itanong kung kailan ito hindi sisingilin,
        halimbawa kung may emergency o hindi ligtas ang trabaho.
      </>
    ),
    source: {
      clause: 'Clause 8.2',
      quote: '“In case of early termination by the Employee, a fixed sum of PHP 5,000…”',
    },
  },
  'Tama ba ang mga bawas?': {
    body: (
      <>
        Ang <strong>₱1,260</strong> ay estimate ng mandatory na SSS (₱900), PhilHealth (₱270), at
        Pag-IBIG (₱90). Kinuwenta ito gamit ang formula, kaya hingin ang eksaktong halaga sa
        payslip mo.
      </>
    ),
  },
  'Ano ang dapat itanong bago pumirma?': {
    body: (
      <>
        May <strong>3 bagay</strong> na mas mabuting malinaw muna: ang ₱5,000 penalty, kung sino
        ang sagot sa medical, at ang eksaktong oras ng trabaho. Gawin natin itong checklist sa
        ibaba.
      </>
    ),
  },
}

const fallback = {
  body: 'Sa demo na ito, tatlong tanong lang ang masasagot ko. Subukan ang isa sa mga suggestion sa itaas.',
}

const checklistItems = [
  'Kailan hindi sisingilin ang ₱5,000 penalty? (halimbawa: emergency o hindi ligtas na trabaho)',
  'Sagot ba ng employer ang medical?',
  'Ilang oras talaga ang trabaho—8 oras lang ba, o may dagdag?',
]

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Chat() {
  const [text, setText] = useState('')
  const [thread, setThread] = useState([])
  const [checklist, setChecklist] = useState('idle')
  const textarea = useRef(null)
  const end = useRef(null)

  useEffect(() => {
    if (thread.length) end.current?.scrollIntoView({ block: 'end', behavior: reduceMotion() ? 'auto' : 'smooth' })
  }, [thread.length, checklist])

  const ask = (value) => {
    const question = (value ?? text).trim()
    if (!question) return
    setThread((t) => [...t, { id: t.length, question, answer: answers[question] ?? fallback }])
    setText('')
    if (textarea.current) textarea.current.style.height = 'auto'
  }

  return (
    <div className="page chat-page">
      <div className="chat-header">
        <h1>Ano ang gusto mong linawin?</h1>
        <span className="online">
          <i /> Handa akong tumulong
        </span>
      </div>
      <div className="suggestions">
        {Object.keys(answers).map((q) => (
          <button key={q} type="button" onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="messages" aria-live="polite">
        <div className="message assistant">
          <div className="bot-mark" aria-hidden="true">
            <Icon name="sun" size={18} />
          </div>
          <div className="bubble">
            <p>
              Kumusta! Nabasa ko na ang kontrata mo. Puwede kang magtanong sa Tagalog, English, o
              Taglish—kahit hindi kumpleto ang sentence.
            </p>
          </div>
        </div>
        {thread.map((turn) => (
          <div key={turn.id} className="grid gap-5">
            <div className="message user">
              <div className="bubble">
                <p>{turn.question}</p>
              </div>
            </div>
            <div className="message assistant">
              <div className="bot-mark" aria-hidden="true">
                <Icon name="sun" size={18} />
              </div>
              <div className="bubble answer">
                <p>
                  {turn.answer.body}
                  {turn.answer.source && <sup> 1</sup>}
                </p>
                {turn.answer.source && (
                  <details>
                    <summary>
                      <Icon name="file" size={17} /> Tingnan ang source
                    </summary>
                    <blockquote>
                      <b>{turn.answer.source.clause}</b> — {turn.answer.source.quote}
                    </blockquote>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
        {checklist === 'idle' && (
          <div className="approval-card card">
            <div className="approval-top">
              <span className="check-box" aria-hidden="true">
                <Icon name="check" size={17} />
              </span>
              <h3>Gumawa ng checklist ng itatanong bago pumirma?</h3>
            </div>
            <p>May nakita akong 3 bahagi na mas mabuting malinaw muna sa employer.</p>
            <div>
              <Button variant="primary" onClick={() => setChecklist('open')}>
                Oo, gawin natin
              </Button>
              <Button variant="ghost" onClick={() => setChecklist('later')}>
                Mamaya na
              </Button>
            </div>
          </div>
        )}
        {checklist === 'open' && (
          <fieldset className="checklist card">
            <legend>Mga tanong bago pumirma</legend>
            <ul>
              {checklistItems.map((item) => (
                <li key={item}>
                  <label>
                    <input type="checkbox" />
                    <span>{item}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}
        <div ref={end} className="scroll-mb-48" />
      </div>
      <div className="prompt-wrap">
        <textarea
          ref={textarea}
          rows={1}
          value={text}
          aria-label="Tanong mo"
          onChange={(e) => setText(e.target.value)}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto'
            e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 120)}px`
          }}
          placeholder="I-type ang tanong mo…"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              ask()
            }
          }}
        />
        <button type="button" aria-label="Ipadala" onClick={() => ask()}>
          <Icon name="send" size={20} />
        </button>
        <span>Base sa iyong kontrata · Hindi legal advice</span>
      </div>
    </div>
  )
}
