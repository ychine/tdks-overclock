import Button from './ui/Button'
import { Page } from './ui/Page'
import { IconTile, Panel } from './ui/Surfaces'
import { useI18n } from '../i18n/useI18n'

/** Shown on Reading, Step 2 and Step 3 when no document has been uploaded/read yet. */
export default function NeedsUpload({ go }) {
  const { t } = useI18n()
  return (
    <Page narrow>
      <Panel className="grid justify-items-center gap-3 px-5 py-12 text-center">
        <IconTile icon="file" tone="brand" size={32} className="size-16 rounded-[18px]" />
        <h1 className="mt-2 text-3xl font-semibold">{t('flow.needsTitle')}</h1>
        <p className="text-subtle">{t('flow.needsText')}</p>
        <Button icon="upload" className="mt-3" onClick={() => go('upload')}>
          {t('flow.needsCta')}
        </Button>
      </Panel>
    </Page>
  )
}
