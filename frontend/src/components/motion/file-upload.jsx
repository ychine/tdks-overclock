/*
 * beUI Upload Queue (https://beui.dev/components/blocks/file-upload), ported to JSX and Linaw tokens.
 * Changes from upstream: theme tokens instead of shadcn colors, strings come from `labels` (react i18n
 * lives in the app), `item.retryable === false` hides the retry button (validation errors can't be retried),
 * and error rows don't count toward `maxFiles`.
 */
import {
  AlertCircle,
  CheckCircle2,
  FileIcon,
  FileImage,
  FileText,
  Loader2,
  RotateCcw,
  UploadCloud,
  X,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useId, useRef, useState } from 'react'
import { EASE_OUT, SPRING_PRESS } from '@/lib/ease'
import { cn } from '@/lib/utils'

const fileUploadMessages = {
  title: 'Drop files here',
  description: 'Add files to the upload queue',
  browse: 'Browse',
  input: 'Upload files',
  limitTitle: 'Upload limit reached',
  limitDescription: '{count} of {max} files added',
  queued: 'Queued',
  uploading: 'Uploading',
  success: 'Uploaded',
  error: 'Failed',
  retry: 'Retry {name}',
  remove: 'Remove {name}',
  progress: '{name} upload progress',
}

const ROW_TRANSITION = { duration: 0.22, ease: EASE_OUT }
const FAST_TRANSITION = { duration: 0.16, ease: EASE_OUT }

const STATUS_TONE = {
  queued: 'text-subtle',
  uploading: 'text-brand',
  success: 'text-ok',
  error: 'text-alert',
}

function useTranslate(labels) {
  return useCallback(
    (key, values) => {
      let text = labels?.[key] ?? fileUploadMessages[key]
      if (values) for (const [k, v] of Object.entries(values)) text = text.replaceAll(`{${k}}`, String(v))
      return text
    },
    [labels],
  )
}

function clampProgress(value, status) {
  if (status === 'success') return 100
  if (value === undefined || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

function formatBytes(bytes) {
  const positive = Number.isFinite(bytes) && bytes > 0
  const exponent = positive ? Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4) : 0
  const value = positive ? bytes / 1024 ** exponent : 0
  const digits = value >= 10 || exponent === 0 ? 0 : 1
  return `${value.toFixed(digits)} ${['B', 'KB', 'MB', 'GB', 'TB'][exponent]}`
}

function fileKind(item) {
  const extension = item.name.includes('.') ? item.name.split('.').pop() : undefined
  if (extension) return extension.toUpperCase()
  if (item.type) return item.type.split('/').pop()?.toUpperCase()
  return 'FILE'
}

function FileTypeIcon({ type = '', className }) {
  if (type.startsWith('image/')) return <FileImage className={className} aria-hidden="true" />
  if (type.includes('pdf') || type.startsWith('text/')) return <FileText className={className} aria-hidden="true" />
  return <FileIcon className={className} aria-hidden="true" />
}

let seq = 0
export function createFileUploadItem(file) {
  seq += 1
  return {
    id: `${Date.now()}-${seq}-${file.name}`,
    name: file.name,
    size: file.size,
    type: file.type,
    progress: 0,
    status: 'uploading',
    file,
  }
}

function StatusIcon({ status, reduce, t }) {
  const iconClassName = 'size-5'
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={status}
        initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(4px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-4px)' }}
        transition={FAST_TRANSITION}
        className={cn('grid size-8 place-items-center', STATUS_TONE[status])}
      >
        {status === 'success' ? (
          <CheckCircle2 className={iconClassName} aria-hidden="true" />
        ) : status === 'error' ? (
          <AlertCircle className={iconClassName} aria-hidden="true" />
        ) : status === 'uploading' ? (
          <Loader2 className={cn(iconClassName, !reduce && 'animate-spin')} aria-hidden="true" />
        ) : (
          <FileIcon className={iconClassName} aria-hidden="true" />
        )}
        <span className="sr-only">{t(status)}</span>
      </motion.span>
    </AnimatePresence>
  )
}

const actionClass =
  'grid size-11 place-items-center rounded-full text-subtle transition-colors duration-150 hover:bg-surface-2 hover:text-ink active:scale-95'

function FileUploadRow({ item, onRemove, onRetry, classNames, t }) {
  const reduce = useReducedMotion() ?? false
  const status = item.status ?? 'queued'
  const progress = clampProgress(item.progress, status)
  const showProgress = status === 'uploading' || status === 'success'

  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(8px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-6px)' }}
      transition={ROW_TRANSITION}
      className={cn(
        'relative overflow-hidden rounded-card border bg-surface p-3',
        status === 'error' ? 'border-alert/40 bg-alert-soft' : 'border-line',
        classNames?.item,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-xl',
            status === 'error' ? 'bg-surface text-alert' : 'bg-brand-soft text-brand',
            classNames?.leading,
          )}
        >
          <FileTypeIcon type={item.type} className="size-5" />
        </div>

        <div className={cn('min-w-0 flex-1', classNames?.content)}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className={cn('truncate font-semibold text-ink', classNames?.name)}>{item.name}</p>
              <p className={cn('mt-0.5 text-sm text-subtle', classNames?.meta)}>
                {fileKind(item)} · {formatBytes(item.size)}
                {status !== 'error' && ` · ${t(status)}`}
              </p>
            </div>

            <div className="flex shrink-0 items-center">
              <StatusIcon status={status} reduce={reduce} t={t} />
              {status === 'error' && item.retryable !== false && (
                <button
                  type="button"
                  onClick={() => onRetry(item)}
                  aria-label={t('retry', { name: item.name })}
                  className={cn(actionClass, classNames?.action)}
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(item)}
                aria-label={t('remove', { name: item.name })}
                className={cn(actionClass, classNames?.action)}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {status === 'error' && item.error && (
            <p className="mt-1 text-sm text-ink" role="alert">
              {item.error}
            </p>
          )}

          {showProgress && (
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-label={t('progress', { name: item.name })}
              className={cn('mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2', classNames?.progress)}
            >
              <motion.div
                className={cn('h-full rounded-full', status === 'success' ? 'bg-ok' : 'bg-brand')}
                style={{
                  transformOrigin: 'left',
                  transform: reduce ? `scaleX(${progress / 100})` : undefined,
                }}
                initial={false}
                animate={reduce ? undefined : { transform: `scaleX(${progress / 100})` }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.li>
  )
}

/**
 * Controlled drop zone + queue. `onFilesAdded(newItems, files)` fires with freshly created items;
 * the parent owns validation and status updates through `value` / `onValueChange`.
 */
export function FileUpload({
  value,
  defaultValue,
  onValueChange,
  onFilesAdded,
  onRemove,
  onRetry,
  accept,
  multiple = true,
  maxFiles,
  disabled = false,
  variant = 'default',
  title,
  description,
  browseLabel,
  labels,
  className,
  classNames,
}) {
  const t = useTranslate(labels)
  const inputId = useId()
  const inputRef = useRef(null)
  const dragDepthRef = useRef(0)
  const reduce = useReducedMotion() ?? false
  const [internal, setInternal] = useState(defaultValue ?? [])
  const items = value ?? internal
  const [dragging, setDragging] = useState(false)

  const commit = useCallback(
    (next) => {
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [value, onValueChange],
  )

  // Failed rows don't hold a slot: picking again replaces them.
  const active = items.filter((item) => item.status !== 'error')
  const maxReached = maxFiles !== undefined && active.length >= maxFiles
  const blocked = disabled || maxReached

  const addFiles = useCallback(
    (incoming) => {
      if (blocked || incoming.length === 0) return
      const slots = maxFiles === undefined ? incoming.length : maxFiles - active.length
      if (slots <= 0) return
      const files = incoming.slice(0, multiple ? slots : 1)
      const added = files.map((file) => createFileUploadItem(file))
      commit([...active, ...added])
      onFilesAdded?.(added, files)
    },
    [active, blocked, commit, maxFiles, multiple, onFilesAdded],
  )

  const removeItem = (item) => {
    commit(items.filter((entry) => entry.id !== item.id))
    onRemove?.(item)
  }

  const retryItem = (item) => {
    const retrying = { ...item, error: undefined, progress: 0, status: 'uploading' }
    commit(items.map((entry) => (entry.id === item.id ? retrying : entry)))
    onRetry?.(retrying)
  }

  const centered = variant === 'centered'

  return (
    <div className={cn('w-full space-y-3', className, classNames?.root)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        aria-label={t('input')}
        accept={accept}
        multiple={multiple}
        disabled={blocked}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          addFiles(Array.from(event.currentTarget.files ?? []))
          event.currentTarget.value = ''
        }}
      />

      <motion.button
        type="button"
        disabled={blocked}
        animate={reduce ? undefined : { scale: dragging ? 1.006 : 1 }}
        whileTap={reduce ? undefined : { scale: 0.995 }}
        transition={SPRING_PRESS}
        data-dragging={dragging}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          if (blocked) return
          event.preventDefault()
          dragDepthRef.current += 1
          setDragging(true)
        }}
        onDragOver={(event) => {
          if (blocked) return
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
          setDragging(true)
        }}
        onDragLeave={(event) => {
          if (blocked) return
          event.preventDefault()
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
          if (dragDepthRef.current === 0) setDragging(false)
        }}
        onDrop={(event) => {
          if (blocked) return
          event.preventDefault()
          dragDepthRef.current = 0
          setDragging(false)
          addFiles(Array.from(event.dataTransfer.files))
        }}
        className={cn(
          // beUI Attachment Upload treatment: a soft outer frame holding an inset dashed card.
          'group relative isolate flex w-full overflow-hidden rounded-panel bg-surface-2/70 p-2',
          'transition-colors duration-200 hover:bg-surface-2 data-[dragging=true]:bg-brand-soft',
          'disabled:pointer-events-none disabled:opacity-60',
          centered
            ? 'min-h-56 flex-col items-center justify-center gap-3 px-7 py-9 text-center'
            : 'items-center gap-4 p-5 text-left',
          classNames?.dropzone,
        )}
      >
        <span
          aria-hidden="true"
          className="banig absolute inset-2 -z-10 rounded-card border border-dashed border-subtle/30 bg-surface transition-[border-color,background-color] duration-200 group-hover:border-subtle/55 group-data-[dragging=true]:border-brand group-data-[dragging=true]:bg-brand-soft/40"
        />
        <motion.span
          aria-hidden="true"
          className={cn(
            'grid shrink-0 place-items-center bg-brand-soft text-brand transition-colors duration-200 group-data-[dragging=true]:bg-brand group-data-[dragging=true]:text-on-solid',
            centered ? 'size-16 rounded-card' : 'size-14 rounded-card',
          )}
          animate={reduce ? undefined : { y: dragging ? -4 : 0, scale: dragging ? 1.08 : 1 }}
          transition={ROW_TRANSITION}
        >
          <UploadCloud className={centered ? 'size-7' : 'size-6'} />
        </motion.span>

        <span className={cn('min-w-0', centered ? 'max-w-xs' : 'flex-1')}>
          <span className={cn('block font-bold text-ink', centered ? 'text-lg' : 'text-base')}>
            {maxReached ? t('limitTitle') : (title ?? t('title'))}
          </span>
          <span className={cn('block text-sm text-subtle', centered ? 'mt-1' : 'mt-0.5')}>
            {maxReached
              ? t('limitDescription', { count: active.length, max: maxFiles ?? 0 })
              : (description ?? t('description'))}
          </span>
        </span>

        {!maxReached && (
          <span
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center rounded-btn border border-line bg-surface px-4 text-sm font-bold text-ink transition-colors duration-150 group-hover:border-brand/50 group-hover:text-brand',
              centered && 'mt-1',
            )}
          >
            {browseLabel ?? t('browse')}
          </span>
        )}
      </motion.button>

      <ul className={cn('space-y-2', classNames?.queue)}>
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <FileUploadRow
              key={item.id}
              item={item}
              onRemove={removeItem}
              onRetry={retryItem}
              classNames={classNames}
              t={t}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
