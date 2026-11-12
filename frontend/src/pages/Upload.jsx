import { useRef, useState } from 'react'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { checkContractFile, fileProblems } from '../lib/files'

export default function Upload({ go }) {
  const [problem, setProblem] = useState(null)
  const cameraInput = useRef(null)
  const fileInput = useRef(null)

  const onPick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const found = checkContractFile(file)
    if (found) return setProblem(found)
    setProblem(null)
    go('reading')
  }

  return (
    <div className="page narrow-page">
      <div className="page-heading">
        <span className="step-label">Step 1 of 3</span>
        <h1>I-upload ang dokumento</h1>
        <p>Contract, quitclaim, offer letter—kahit photo lang, puwede.</p>
      </div>
      {problem && (
        <div className="error-banner" role="alert">
          <Icon name="alert" />
          <div>
            <strong>{fileProblems[problem].title}</strong>
            <p>{fileProblems[problem].text}</p>
          </div>
          <button type="button" aria-label="Isara ang mensahe" onClick={() => setProblem(null)}>
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
      <div className="upload-zone card">
        <div className="upload-illustration" aria-hidden="true">
          <Icon name="file" size={40} />
          <span>
            <Icon name="spark" size={18} />
          </span>
        </div>
        <h2>Ilagay dito ang kontrata</h2>
        <p>PDF, JPG, o PNG · hanggang 20 MB</p>
        <input
          ref={cameraInput}
          className="hidden"
          type="file"
          accept="image/*"
          capture="environment"
          aria-label="Kunan ng photo ang kontrata"
          onChange={onPick}
        />
        <input
          ref={fileInput}
          className="hidden"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          aria-label="Pumili ng file ng kontrata"
          onChange={onPick}
        />
        <div className="upload-buttons">
          <Button icon="camera" onClick={() => cameraInput.current?.click()}>
            Kunan ng photo
          </Button>
          <Button variant="secondary" icon="image" onClick={() => fileInput.current?.click()}>
            Pumili sa phone
          </Button>
        </div>
        <button type="button" className="demo-error" onClick={() => setProblem('blurry')}>
          I-preview ang blurry photo error
        </button>
      </div>
      <div className="tip-card">
        <div className="tip-icon" aria-hidden="true">
          <Icon name="sun" />
        </div>
        <div>
          <h3>Para malinaw ang basa</h3>
          <ul>
            {['Ipatag ang papel', 'Iwasan ang anino at glare', 'Isama ang buong page sa photo'].map(
              (tip) => (
                <li key={tip}>
                  <Icon name="check" size={16} /> {tip}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
      <div className="privacy-note">
        <Icon name="lock" />
        <div>
          <strong>Sa iyo ang dokumento mo.</strong>
          <p>
            Encrypted habang binabasa. Awtomatikong buburahin ang file at analysis matapos ang 24
            oras.
          </p>
        </div>
      </div>
    </div>
  )
}
