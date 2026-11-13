import FilePicker from '../components/FilePicker'
import Icon from '../components/Icon'
import { Page, PageHeading } from '../components/ui/Page'
import { Callout } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'

export default function Upload({ go, onFile, onExit }) {
  const { t } = useI18n()

  return (
    <Page narrow>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
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
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-12 items-center gap-1.5 rounded-btn px-1 text-sm font-semibold text-subtle transition-colors hover:text-ink"
          >
            <Icon name="close" size={16} />
            {t('app.backLanding')}
          </button>
        )}
      </div>
      <PageHeading centered title={t('upload.title')} text={t('upload.text')} />

      <FilePicker
        onFile={(file) => {
          onFile(file)
          go('reading')
        }}
      />

      <Callout tone="sun" icon="sun" title={t('upload.tipsTitle')} className="mt-5">
        <ul className="mt-2 grid gap-1.5">
          {t('upload.tips').map((tip) => (
            <li key={tip} className="flex items-center gap-2 text-ink">
              <span className="shrink-0 text-brand"><Icon name="check" size={16} /></span>
              {tip}
            </li>
          ))}
        </ul>
      </Callout>

      <div className="mt-5 flex gap-4 px-1 text-subtle">
        <span className="shrink-0 text-brand"><Icon name="lock" /></span>
        <div>
          <strong className="text-ink">{t('upload.privacyTitle')}</strong>
          <p className="mt-0.5 text-sm">{t('upload.privacyText')}</p>
        </div>
      </div>
    </Page>
  )
}
