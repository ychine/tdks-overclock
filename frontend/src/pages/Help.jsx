import { useEffect, useState } from 'react'
import Icon from '../components/Icon'

const agencies = [
  {
    name: 'DOLE',
    full: 'Department of Labor and Employment',
    for: 'Sahod, termination, benefits, at labor complaints',
    phone: '1349',
    color: 'blue',
  },
  {
    name: 'DMW',
    full: 'Department of Migrant Workers',
    for: 'Kontrata, recruiter, at problema ng OFW',
    phone: '8722-1144',
    color: 'red',
  },
  {
    name: 'OWWA',
    full: 'Overseas Workers Welfare Administration',
    for: 'Welfare support, repatriation, at pamilya ng OFW',
    phone: '1348',
    color: 'yellow',
  },
  {
    name: 'PAO',
    full: 'Public Attorney’s Office',
    for: 'Libreng legal assistance kung qualified',
    phone: '(02) 8929-9436',
    color: 'ink',
  },
]

const officeSearch = (agency) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${agency.full} office`)}`

export default function Help() {
  const [offline, setOffline] = useState(() => !navigator.onLine)

  // Follow the real connection state; the demo link below can still force the banner.
  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  return (
    <div className="page help-page">
      <div className="page-heading">
        <h1>Humingi ng tulong</h1>
        <p>Mga official na ahensya. Piliin kung alin ang pinakamalapit sa kailangan mo.</p>
      </div>
      {offline && (
        <div className="offline-banner" role="status">
          <Icon name="wifi" />
          <div>
            <strong>Offline ka ngayon.</strong>
            <p>Makikita mo pa rin ang saved hotline numbers.</p>
          </div>
          <button type="button" onClick={() => setOffline(!navigator.onLine)}>
            <Icon name="refresh" size={19} /> Retry
          </button>
        </div>
      )}
      <button type="button" className="offline-demo" onClick={() => setOffline(true)}>
        I-preview ang offline state
      </button>
      <div className="agency-grid">
        {agencies.map((a) => (
          <article className="agency-card card" key={a.name}>
            <div className={`agency-mark ${a.color}`} aria-hidden="true">
              {a.name}
            </div>
            <div className="agency-copy">
              <h2>{a.full}</h2>
              <p>{a.for}</p>
            </div>
            <div className="agency-actions">
              <a className="call" href={`tel:${a.phone}`}>
                <Icon name="phone" size={19} /> {a.phone}
              </a>
              <a href={officeSearch(a)} target="_blank" rel="noreferrer">
                <Icon name="map" size={19} /> Find office
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="urgent card">
        <Icon name="alert" />
        <div>
          <h2>Kung may agarang panganib</h2>
          <p>Tumawag sa 911 o lumapit sa pinakamalapit na barangay o police station.</p>
        </div>
        <a href="tel:911">Call 911</a>
      </div>
    </div>
  )
}
