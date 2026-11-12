import { useEffect, useState } from 'react'
import Icon from '../components/Icon'

const statuses = [
  'Binabasa ang pahina 1...',
  'Hinahanap ang sahod...',
  'Tinitingnan ang mga bawas...',
  'Halos tapos na...',
]

export default function Reading({ go }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, 3)), 1100)
    const done = window.setTimeout(() => go('review'), 5200)
    return () => {
      clearInterval(id)
      clearTimeout(done)
    }
  }, [go])
  return (
    <div className="page reading-page">
      <div className="reading-visual" aria-hidden="true">
        <div className="scan-doc">
          <div />
          <div />
          <div />
          <div />
          <span className="scan-line" />
        </div>
        <div className="orbit">
          <Icon name="spark" size={22} />
        </div>
      </div>
      <div className="reading-copy">
        <span className="step-label">Sandali lang</span>
        <h1>Inaalam namin ang mahalaga.</h1>
        <p className="shimmer-text" role="status">
          {statuses[step]}
        </p>
        <div className="activity card">
          {statuses.slice(0, 3).map((s, i) => (
            <div key={s} className={i < step ? 'done' : i === step ? 'current' : ''}>
              <span className="status-dot">
                {i < step ? <Icon name="check" size={15} /> : i + 1}
              </span>
              <span>{s.replace('...', '')}</span>
            </div>
          ))}
        </div>
        <p className="gentle-note">Okay lang lumipat ng app. Hindi mawawala ang progress mo.</p>
      </div>
    </div>
  )
}
