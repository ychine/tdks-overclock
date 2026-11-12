import { useRef, useState } from 'react'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { checkContractFile, fileProblems } from '../lib/files'

// Color is never the only signal: each change also carries an icon and hidden text.
const marks = {
  added: ['plus', 'Mas maganda'],
  changed: ['refresh', 'Nagbago'],
  removed: ['close', 'Mas masama'],
}

function Cell({ kind, children }) {
  const [icon, label] = marks[kind]
  return (
    <strong className={`cell ${kind}-cell`} role="cell">
      <Icon name={icon} size={16} />
      <span className="sr-only">{label}: </span>
      {children}
    </strong>
  )
}

export default function Compare() {
  const [oldName, setOldName] = useState('Contract_2024.pdf')
  const [newName, setNewName] = useState(null)
  const [problem, setProblem] = useState(null)
  const oldInput = useRef(null)
  const newInput = useRef(null)

  const pick = (setName) => (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const found = checkContractFile(file)
    if (found) return setProblem(found)
    setProblem(null)
    setName(file.name)
  }

  const accept = 'application/pdf,image/jpeg,image/png'

  return (
    <div className="page compare-page">
      <div className="page-heading">
        <h1>Ano ang nagbago?</h1>
        <p>Ilagay ang luma at bagong kontrata. Ipapakita namin ang mas okay at dapat bantayan.</p>
      </div>
      <input
        ref={oldInput}
        className="hidden"
        type="file"
        accept={accept}
        aria-label="Piliin ang lumang kontrata"
        onChange={pick(setOldName)}
      />
      <input
        ref={newInput}
        className="hidden"
        type="file"
        accept={accept}
        aria-label="Piliin ang bagong kontrata"
        onChange={pick(setNewName)}
      />
      {problem && (
        <p className="form-error" role="alert">
          {fileProblems[problem].title} {fileProblems[problem].text}
        </p>
      )}
      {!newName ? (
        <div className="compare-upload-grid">
          <div className="mini-upload card">
            <span>1</span>
            <Icon name="file" size={34} />
            <h2>Lumang kontrata</h2>
            <p>Na-upload · {oldName}</p>
            <button type="button" onClick={() => oldInput.current?.click()}>
              <Icon name="refresh" size={18} /> Palitan
            </button>
          </div>
          <button
            type="button"
            className="mini-upload card empty"
            onClick={() => newInput.current?.click()}
          >
            <span>2</span>
            <Icon name="plus" size={34} />
            <h2>Bagong kontrata</h2>
            <p>I-tap para mag-upload</p>
          </button>
        </div>
      ) : (
        <>
          <div className="compare-alert">
            <Icon name="alert" />
            <div>
              <span>Pinakamahalagang pagbabago</span>
              <h2>
                Mas mababa ang sahod sa bago: <s>₱18,000</s> <Icon name="arrow" size={18} /> ₱16,500
              </h2>
              <p>₱1,500 less bawat buwan, o ₱18,000 less kada taon.</p>
            </div>
          </div>
          <div className="legend">
            <span>
              <i className="added" />
              Added / better
            </span>
            <span>
              <i className="changed" />
              Changed
            </span>
            <span>
              <i className="removed" />
              Removed / worse
            </span>
          </div>
          <div className="comparison-table card" role="table" aria-label="Luma at bagong kontrata">
            <div className="compare-head" role="row">
              <span role="columnheader">Detalye</span>
              <strong role="columnheader">Luma</strong>
              <strong role="columnheader">Bago</strong>
            </div>
            <div role="row">
              <span role="rowheader">Sahod</span>
              <strong role="cell">₱18,000</strong>
              <Cell kind="removed">₱16,500</Cell>
            </div>
            <div role="row">
              <span role="rowheader">Day off</span>
              <strong role="cell">Sunday</strong>
              <Cell kind="changed">Flexible day</Cell>
            </div>
            <div role="row">
              <span role="rowheader">Medical</span>
              <strong role="cell">Hindi nakalagay</strong>
              <Cell kind="added">Covered</Cell>
            </div>
            <div role="row">
              <span role="rowheader">Penalty</span>
              <strong role="cell">₱5,000</strong>
              <Cell kind="removed">₱8,000</Cell>
            </div>
          </div>
          <div className="compare-summary card">
            <h2>May isang improvement, pero mas mababa ang overall value.</h2>
            <p>
              Covered na ang medical, pero bababa ang sahod at mas mataas ang penalty. Linawin din
              kung kailan ang “flexible” day off.
            </p>
          </div>
          <Button variant="ghost" icon="refresh" onClick={() => setNewName(null)}>
            Palitan ang bagong kontrata
          </Button>
        </>
      )}
    </div>
  )
}
