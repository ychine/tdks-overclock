import { useState } from 'react'
import Icon from '../components/Icon'
import Button from '../components/ui/Button'
import { Page, PageHeading } from '../components/ui/Page'
import Stepper from '../components/ui/Stepper'
import { Callout, Card, ListGroup, ListRow } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'

/** ROLE: the explicit privacy gate before any file is accepted (R10). */
export default function Consent({ go }) {
  const { t } = useI18n()
  const [agreed, setAgreed] = useState(false)

  const facts = [
    { icon: 'file', title: t('consent.whatTitle'), detail: t('consent.what') },
    { icon: 'spark', title: t('consent.useTitle'), detail: t('consent.use') },
    { icon: 'lock', title: t('consent.keepTitle'), detail: t('consent.keep') },
  ]

  return (
    <Page narrow>
      <div className="mb-2">
        <button
          type="button"
          onClick={() => go('home')}
          className="inline-flex min-h-12 items-center gap-2 rounded-btn px-1 text-sm font-bold text-brand transition-colors hover:text-ink"
        >
          <span className="-scale-x-100" aria-hidden="true">
            <Icon name="arrow" size={18} />
          </span>
          {t('app.backHome')}
        </button>
      </div>
      <Stepper current={0} />
      <PageHeading centered title={t('consent.title')} text={t('consent.text')} />

      <ListGroup aria-label={t('consent.title')}>
        {facts.map((fact) => (
          <ListRow key={fact.title} icon={fact.icon} tone="brand" title={fact.title} detail={fact.detail} />
        ))}
      </ListGroup>

      <Callout tone="info" icon="lock" className="mt-4">
        {t('consent.noAccount')}
      </Callout>

      <Card className="mt-4 p-4">
        <label className="flex min-h-12 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-[var(--brand)]"
          />
          <span className="font-semibold">{t('consent.agree')}</span>
        </label>
      </Card>

      <Button size="lg" icon="upload" className="mt-4 w-full" disabled={!agreed} onClick={() => go('upload')}>
        {t('consent.cta')}
      </Button>
      <div className="mt-2 grid gap-1 sm:grid-cols-2">
        <Button variant="ghost" onClick={() => go('home')}>
          {t('consent.notNow')}
        </Button>
        <Button variant="ghost" icon="help" onClick={() => go('help')}>
          {t('consent.help')}
        </Button>
      </div>
    </Page>
  )
}
