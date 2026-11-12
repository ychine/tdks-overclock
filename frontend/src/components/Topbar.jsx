import Brand from './Brand'
import Icon from './Icon'

export default function Topbar({ title, onHome, dark, setDark, language, setLanguage }) {
  return (
    <header className="topbar">
      <button type="button" className="brand-button" aria-label="Bumalik sa simula" onClick={onHome}>
        <Brand compact />
      </button>
      <span className="top-title">{title}</span>
      <div className="top-actions">
        <select
          aria-label="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>Taglish</option>
          <option>Filipino</option>
          <option>English</option>
        </select>
        <button
          type="button"
          className="icon-button"
          aria-label={dark ? 'Use light mode' : 'Use dark mode'}
          onClick={() => setDark(!dark)}
        >
          <Icon name={dark ? 'sun' : 'moon'} size={20} />
        </button>
      </div>
    </header>
  )
}
