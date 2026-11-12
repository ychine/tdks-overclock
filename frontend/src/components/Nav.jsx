import Brand from './Brand'
import Icon from './Icon'

const primaryNav = [
  { id: 'home', icon: 'home', short: 'Home' },
  { id: 'summary', icon: 'spark', short: 'Buod' },
  { id: 'chat', icon: 'chat', short: 'Tanong' },
  { id: 'compare', icon: 'compare', short: 'Compare' },
  { id: 'help', icon: 'help', short: 'Tulong' },
]

function NavButtons({ screen, go, iconSize }) {
  return primaryNav.map((item) => (
    <button
      key={item.id}
      type="button"
      className={screen === item.id ? 'active' : ''}
      aria-current={screen === item.id ? 'page' : undefined}
      onClick={() => go(item.id)}
    >
      <Icon name={item.icon} size={iconSize} />
      <span>{item.short}</span>
    </button>
  ))
}

export default function Nav({ screen, go }) {
  return (
    <>
      <aside className="side-nav">
        <Brand />
        <p className="nav-kicker">Ang kontrata mo, malinaw.</p>
        <nav aria-label="Pangunahing menu">
          <NavButtons screen={screen} go={go} iconSize={22} />
        </nav>
        <div className="side-note">
          <Icon name="lock" size={18} />
          <span>Private at ligtas ang dokumento mo.</span>
        </div>
      </aside>
      <nav className="bottom-nav" aria-label="Pangunahing menu">
        <NavButtons screen={screen} go={go} iconSize={21} />
      </nav>
    </>
  )
}
