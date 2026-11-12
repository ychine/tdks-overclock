import Button from '../components/Button'
import Icon from '../components/Icon'

export default function Home({ go, language, setLanguage }) {
  return (
    <div className="home-page page">
      <div className="hero-copy">
        <h1>
          Intindihin ang kontrata mo <span>bago ka pumirma.</span>
        </h1>
        <p className="lead">
          I-upload ang kontrata o quitclaim mo. Ipapaliwanag namin ang mahalaga—sa salitang madaling
          maintindihan.
        </p>
      </div>
      <div className="home-card card">
        <div className="language-pills" aria-label="Choose language">
          {['English', 'Filipino', 'Taglish'].map((l) => (
            <button
              key={l}
              className={language === l ? 'active' : ''}
              onClick={() => setLanguage(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="home-actions">
          <Button icon="upload" onClick={() => go('upload')}>
            Mag-upload ng kontrata
          </Button>
          <Button variant="secondary" icon="file" onClick={() => go('questions')}>
            Wala akong kontrata
          </Button>
        </div>
        <button className="text-link" onClick={() => go('compare')}>
          <Icon name="compare" size={18} /> Ikumpara ang dalawang kontrata
        </button>
      </div>
      <div className="trust-row">
        <span>
          <Icon name="lock" size={18} /> Auto-delete after 24 hours
        </span>
        <span>
          <Icon name="spark" size={18} /> Simple at walang judgment
        </span>
        <span>
          <Icon name="help" size={18} /> May totoong ahensyang matatakbuhan
        </span>
      </div>
      <div className="disclaimer">
        <Icon name="alert" size={17} />
        <span>Nagpapaliwanag lang kami, hindi legal advice.</span>
      </div>
    </div>
  )
}
