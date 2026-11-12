import { useState } from 'react'
import Button from '../components/Button'
import DocumentMock from '../components/DocumentMock'
import Icon from '../components/Icon'

const initialFields = [
  { label: 'Sahod', value: '₱18,000 / buwan', confidence: true },
  { label: 'Start date', value: '15 June 2025', confidence: true },
  { label: 'Haba', value: '2 taon', confidence: true },
  { label: 'Oras', value: '8 oras / araw', confidence: false },
  { label: 'Day off', value: 'Linggo', confidence: true },
]

export default function Review({ go }) {
  const [tab, setTab] = useState('fields')
  const [active, setActive] = useState(3)
  const [fields, setFields] = useState(initialFields)

  const toCheck = fields.filter((f) => !f.confidence).length
  const update = (index, patch) =>
    setFields((list) => list.map((f, i) => (i === index ? { ...f, ...patch } : f)))

  return (
    <div className="page review-page">
      <div className="page-heading row-heading">
        <div>
          <span className="step-label">Step 2 of 3</span>
          <h1>Check natin kung tama</h1>
          <p>I-tap ang detalye para makita kung saan ito galing at itama kung mali.</p>
        </div>
        <span className="confidence" role="status">
          <Icon name={toCheck ? 'alert' : 'check'} size={17} />
          {toCheck ? `${toCheck} kailangang suriin` : 'Nasuri na lahat'}
        </span>
      </div>
      <div className="mobile-tabs">
        <button
          type="button"
          className={tab === 'doc' ? 'active' : ''}
          aria-pressed={tab === 'doc'}
          onClick={() => setTab('doc')}
        >
          Original
        </button>
        <button
          type="button"
          className={tab === 'fields' ? 'active' : ''}
          aria-pressed={tab === 'fields'}
          onClick={() => setTab('fields')}
        >
          Mga detalye
        </button>
      </div>
      <div className="review-grid">
        <section
          aria-label="Original na dokumento"
          className={`review-document ${tab !== 'doc' ? 'mobile-hidden' : ''}`}
        >
          <DocumentMock active={active} />
        </section>
        <section className={`fields-panel card ${tab !== 'fields' ? 'mobile-hidden' : ''}`}>
          <div className="panel-title">
            <h2>Nakuha naming detalye</h2>
            <span>Tap para i-edit</span>
          </div>
          <div className="field-list">
            {fields.map((field, i) => (
              <div
                key={field.label}
                className={`field-chip ${!field.confidence ? 'low' : ''} ${active === i ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="field-select"
                  aria-expanded={active === i}
                  onClick={() => setActive(i)}
                >
                  <span className="field-meta">
                    {field.label}
                    {!field.confidence && <em>Pakisuri</em>}
                  </span>
                  <strong>{field.value}</strong>
                  <Icon name="chevron" size={19} />
                </button>
                {active === i && (
                  <div className="field-edit">
                    <label htmlFor={`field-${i}`}>I-edit ang {field.label.toLowerCase()}</label>
                    <input
                      id={`field-${i}`}
                      value={field.value}
                      onChange={(e) => update(i, { value: e.target.value, confidence: true })}
                    />
                    <div className="field-edit-actions">
                      {!field.confidence && (
                        <Button
                          variant="secondary"
                          icon="check"
                          onClick={() => update(i, { confidence: true })}
                        >
                          Tama ito
                        </Button>
                      )}
                      <button
                        type="button"
                        className="inline-flex min-h-12 items-center gap-2 font-bold text-(--blue) lg:hidden"
                        onClick={() => setTab('doc')}
                      >
                        <Icon name="file" size={18} /> Tingnan sa original
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {toCheck > 0 && (
            <div className="low-note">
              <span className="yellow-dot" />
              <p>Hindi kami 100% sure sa naka-yellow. Tingnan kung tugma sa original.</p>
            </div>
          )}
          <Button icon="check" onClick={() => go('summary')}>
            Tama na ito, ipaliwanag
          </Button>
        </section>
      </div>
    </div>
  )
}
