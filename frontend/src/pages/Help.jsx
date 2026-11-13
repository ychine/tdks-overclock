import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import { Page, PageHeading } from '../components/ui/Page'
import { Callout, ListGroup } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'
import { agencies, telHref } from '../lib/agencies'

const officeSearch = (name) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} office`)}`

export default function Help() {
  const { t } = useI18n()
  const info = t('help.agencies')
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
    <Page>
      <PageHeading title={t('help.title')} text={t('help.text')} />

      {offline && (
        <Callout tone="info" icon="wifi" title={t('help.offlineTitle')} className="mb-3" role="status">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{t('help.offlineText')}</span>
            <Button variant="ghost" size="sm" icon="refresh" onClick={() => setOffline(!navigator.onLine)}>
              {t('app.retry')}
            </Button>
          </div>
        </Callout>
      )}
      {/* Dev-only: force the offline banner for testing. Never shown to workers. */}
      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={() => setOffline(true)}
          className="mb-4 min-h-12 rounded-btn px-1 text-sm text-subtle underline hover:text-ink"
        >
          {t('help.demo')}
        </button>
      )}

      <ListGroup>
        {agencies.map((a, i) => (
          <li key={a.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center md:p-5">
            <div className="flex items-start gap-4">
              <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-1.5">
                <img src={a.logo} alt="" className="size-full object-contain" loading="lazy" />
              </span>
              <div className="min-w-0">
                <h2 className="font-sans text-base font-bold">{info[i].full}</h2>
                <p className="mt-0.5 text-sm text-subtle">{info[i].for}</p>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 md:flex">
              <Button href={telHref(a.phone)} icon="phone" size="sm" className="tabular-nums">
                {a.phone}
              </Button>
              <Button href={officeSearch(info[i].full)} target="_blank" rel="noreferrer" variant="secondary" size="sm" icon="map">
                {t('help.find')}
              </Button>
            </div>
          </li>
        ))}
      </ListGroup>

      <Callout title={t('help.urgentTitle')} className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{t('help.urgentText')}</span>
        </div>
      </Callout>
    </Page>
  )
}
