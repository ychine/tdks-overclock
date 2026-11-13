import FilePicker from '../components/FilePicker'
import Icon from '../components/Icon'
import { Page } from '../components/ui/Page'
import { ListRow } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'

const chevron = (
  <span className="shrink-0 text-subtle">
    <Icon name="chevron" size={20} />
  </span>
)

/** Step 1 of the document flow. The shared stepper above it lives in App's flow shell. */
export default function Home({ go, onFile }) {
  const { t } = useI18n()

  return (
    <Page className="flex flex-col items-center text-center">
      <h1 className="mx-auto max-w-[18ch] text-5xl leading-[1.03] font-semibold text-balance md:text-6xl">
        {t('home.h1a')} <span className="text-brand">{t('home.h1b')}</span>
      </h1>
      <p className="mx-auto mt-5 max-w-[54ch] text-lg text-pretty text-subtle">{t('home.lead')}</p>

      <FilePicker
        className="mt-8 w-full max-w-xl text-left"
        onFile={(file) => {
          onFile(file)
          go('reading')
        }}
      />

      {/* Same rows as before, no frame, separated by hairlines: stacked on phones, one row from md up. */}
      <ul className="mt-10 grid w-full divide-y divide-line text-left md:grid-cols-3 md:divide-x md:divide-y-0 [&>li]:flex [&>li>*]:rounded-btn">
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
      </ul>
    </Page>
  )
}
