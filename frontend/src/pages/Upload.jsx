import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE_OUT } from '@/lib/ease'
import Icon from '../components/Icon'
import Button from '../components/ui/Button'
import { Page, PageHeading } from '../components/ui/Page'
import Stepper from '../components/ui/Stepper'
import { Callout, IconTile, Panel } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'
import { checkContractFile } from '../lib/files'

export default function Upload({ go, onFile }) {
  const { t } = useI18n()
  const [problem, setProblem] = useState(null)
  const cameraInput = useRef(null)
  const fileInput = useRef(null)

  const onPick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const found = checkContractFile(file)
    if (found) return setProblem(found)
    setProblem(null)
    onFile(file.name)
    go('reading')
  }

  return (
    <Page narrow>
      <button
        type="button"
        onClick={() => go('home')}
        className="mb-2 inline-flex min-h-12 items-center gap-2 rounded-btn px-1 text-sm font-bold text-brand transition-colors hover:text-ink"
      >
        <span className="-scale-x-100" aria-hidden="true">
          <Icon name="arrow" size={18} />
        </span>
        {t('app.backHome')}
      </button>
      <Stepper current={0} />
      <PageHeading title={t('upload.title')} text={t('upload.text')} />

      <AnimatePresence initial={false}>
        {problem && (
          <motion.div
            key={problem}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="overflow-hidden"
            role="alert"
          >
            <Callout title={t(`file.${problem}.title`)} className="mb-4">
              <div className="flex items-start justify-between gap-3">
                <span>{t(`file.${problem}.text`)}</span>
                <button
                  type="button"
                  aria-label={t('upload.dismiss')}
                  onClick={() => setProblem(null)}
                  className="-mt-3 -mr-3 grid size-12 shrink-0 place-items-center rounded-full text-ink hover:bg-alert/10"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            </Callout>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel className="banig border-2 border-dashed px-5 py-9 text-center md:py-12">
        <div aria-hidden="true" className="relative mx-auto w-fit">
          <IconTile icon="file" tone="brand" size={36} className="size-20 -rotate-3 rounded-[22px]" />
          <span className="absolute -top-2 -right-2 grid size-8 place-items-center rounded-full bg-sun text-[#1b2433]">
            <Icon name="spark" size={18} />
          </span>
        </div>
        <h2 className="mt-5 mb-1 font-sans text-2xl font-bold">{t('upload.zoneTitle')}</h2>
        <p className="text-sm text-subtle">{t('upload.zoneHint')}</p>
        <input
          ref={cameraInput}
          className="hidden"
          type="file"
          accept="image/*"
          capture="environment"
          aria-label={t('upload.cameraAria')}
          onChange={onPick}
        />
        <input
          ref={fileInput}
          className="hidden"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          aria-label={t('upload.pickAria')}
          onChange={onPick}
        />
        <div className="mx-auto mt-7 grid max-w-md gap-2.5 md:grid-cols-2">
          <Button icon="camera" onClick={() => cameraInput.current?.click()}>
            {t('upload.camera')}
          </Button>
          <Button variant="secondary" icon="image" onClick={() => fileInput.current?.click()}>
            {t('upload.pick')}
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setProblem('blurry')}
          className="mt-3 min-h-12 rounded-btn px-3 text-sm text-subtle underline hover:text-ink"
        >
          {t('upload.demo')}
        </button>
      </Panel>

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
