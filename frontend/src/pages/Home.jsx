import Icon from '../components/Icon'
import { Segmented } from '../components/ui/Controls'
import Button from '../components/ui/Button'
import { Page } from '../components/ui/Page'
import { Badge, IconTile, ListGroup, ListRow, Panel } from '../components/ui/Surfaces'
import { LANGUAGES } from '../i18n/messages'
import { useI18n } from '../i18n/useI18n'
import { agencies, telHref } from '../lib/agencies'

const chevron = (
  <span className="shrink-0 text-subtle">
    <Icon name="chevron" size={20} />
  </span>
)

export default function Home({ go }) {
  const { t, language, setLanguage } = useI18n()
  return (
    <Page className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-14 lg:pt-16">
      <div>
        <h1 className="max-w-[16ch] text-5xl leading-[1.03] font-semibold md:text-6xl lg:text-7xl">
          {t('home.h1a')} <span className="text-brand">{t('home.h1b')}</span>
        </h1>
        <p className="mt-5 max-w-[54ch] text-lg text-subtle">{t('home.lead')}</p>

        <Segmented
          label={t('home.language')}
          value={language}
          onChange={setLanguage}
          options={LANGUAGES.map((name) => ({ value: name, label: name }))}
          className="mt-8 max-w-md"
        />

        <Button size="lg" icon="upload" className="mt-4 w-full max-w-md" onClick={() => go('upload')}>
          {t('home.upload')}
        </Button>
        <p className="mt-2 ml-1 text-sm text-subtle">{t('home.uploadDesc')}</p>

        <ListGroup className="mt-6 max-w-xl">
          <ListRow
            icon="file"
            tone="neutral"
            title={t('home.none')}
            detail={t('home.noneDesc')}
            onClick={() => go('questions')}
            trailing={chevron}
          />
          <ListRow
            icon="compare"
            tone="neutral"
            title={t('home.compare')}
            detail={t('home.compareDesc')}
            onClick={() => go('compare')}
            trailing={chevron}
          />
          <ListRow
            icon="help"
            tone="neutral"
            title={t('home.help')}
            detail={t('home.helpDesc')}
            onClick={() => go('help')}
            trailing={chevron}
          />
        </ListGroup>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-subtle">
          {[
            ['lock', t('home.trust1')],
            ['spark', t('home.trust2')],
            ['help', t('home.trust3')],
          ].map(([icon, text]) => (
            <li key={text} className="flex items-center gap-2">
              <span className="text-brand"><Icon name={icon} size={18} /></span>
              {text}
            </li>
          ))}
        </ul>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-2 text-sm text-subtle">
          <Icon name="alert" size={17} />
          {t('app.disclaimer')}
        </p>
      </div>

      <aside aria-label={t('home.hotlines')}>
        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-sans text-lg font-bold">{t('home.hotlines')}</h2>
            <Badge tone="ok" icon="phone">24/7</Badge>
          </div>
          <ListGroup>
            {agencies.map((a) => (
              <ListRow
                key={a.id}
                href={telHref(a.phone)}
                title={a.name}
                trailing={<span className="font-bold text-brand tabular-nums">{a.phone}</span>}
                className="min-h-14"
              />
            ))}
          </ListGroup>
        </Panel>
        <div className="banig mt-5 flex items-center gap-3 rounded-card border border-line p-4">
          <IconTile icon="sun" tone="sun" />
          <p className="text-sm text-subtle">{t('nav.kicker')}</p>
        </div>
      </aside>
    </Page>
  )
}
