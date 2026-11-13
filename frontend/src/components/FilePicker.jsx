import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { checkContractFile } from '../lib/files'
import { FileUpload, createFileUploadItem } from './motion/file-upload'
import Button from './ui/Button'

const ACCEPT = 'application/pdf,image/jpeg,image/png'
const CONTINUE_DELAY = 700 // long enough to see the "Ready" check before the flow moves on

/**
 * ROLE: the one way a document enters the flow. One file per upload.
 * beUI Upload Queue (centered drop zone + a single progress row) plus a camera button for phones.
 * Progress is real: it tracks reading the file into the browser. Invalid files show an error row
 * with the reason; picking again replaces it. A ready file hands off to `onFile` automatically.
 */
export default function FilePicker({ onFile, className }) {
  const { t } = useI18n()
  const [items, setItems] = useState([])
  const cameraInput = useRef(null)
  const timers = useRef(new Map())
  const readers = useRef(new Map())

  useEffect(
    () => () => {
      timers.current.forEach((id) => clearTimeout(id))
      readers.current.forEach((r) => r.abort())
    },
    [],
  )

  const patch = (id, changes) => setItems((cur) => cur.map((it) => (it.id === id ? { ...it, ...changes } : it)))

  const prepare = (item) => {
    const problem = checkContractFile(item.file)
    if (problem) {
      patch(item.id, { status: 'error', error: t(`file.${problem}.text`), retryable: false })
      return
    }
    const reader = new FileReader()
    readers.current.set(item.id, reader)
    reader.onprogress = (e) => e.lengthComputable && patch(item.id, { progress: (e.loaded / e.total) * 100 })
    reader.onerror = () => patch(item.id, { status: 'error', error: t('upload.readError'), retryable: true })
    reader.onload = () => {
      readers.current.delete(item.id)
      patch(item.id, { status: 'success', progress: 100 })
      timers.current.set(item.id, setTimeout(() => onFile(item.file), CONTINUE_DELAY))
    }
    reader.readAsArrayBuffer(item.file)
  }

  const onCamera = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const item = createFileUploadItem(file)
    setItems((cur) => [...cur.filter((it) => it.status !== 'error'), item])
    prepare(item)
  }

  const busy = items.some((it) => it.status !== 'error')

  return (
    <div className={className}>
      <FileUpload
        value={items}
        onValueChange={setItems}
        onFilesAdded={(added) => added.forEach(prepare)}
        onRetry={prepare}
        onRemove={(item) => {
          readers.current.get(item.id)?.abort()
          readers.current.delete(item.id)
          clearTimeout(timers.current.get(item.id))
          timers.current.delete(item.id)
        }}
        accept={ACCEPT}
        multiple={false}
        maxFiles={1}
        variant="centered"
        labels={{
          title: t('upload.zoneTitle'),
          description: t('upload.zoneHint'),
          browse: t('upload.pick'),
          input: t('upload.pickAria'),
          limitTitle: t('upload.limitTitle'),
          limitDescription: t('upload.limitText'),
          queued: t('upload.status.queued'),
          uploading: t('upload.status.uploading'),
          success: t('upload.status.success'),
          error: t('upload.status.error'),
          retry: t('upload.retry'),
          remove: t('upload.remove'),
          progress: t('upload.progress'),
        }}
      />

      <input
        ref={cameraInput}
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label={t('upload.cameraAria')}
        onChange={onCamera}
      />
      <Button
        size="lg"
        variant="secondary"
        icon="camera"
        className="mt-3 w-full"
        disabled={busy}
        onClick={() => cameraInput.current?.click()}
      >
        {t('upload.camera')}
      </Button>
    </div>
  )
}
