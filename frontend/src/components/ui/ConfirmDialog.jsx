import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE_OUT } from '@/lib/ease'
import Icon from '../Icon'
import Button from './Button'
import { IconTile } from './Surfaces'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  text,
  confirmLabel,
  cancelLabel,
  closeLabel,
  icon = 'alert',
  tone = 'alert',
}) {
  const panel = useRef(null)
  const titleId = 'confirm-dialog-title'
  const textId = 'confirm-dialog-text'

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    panel.current?.querySelector('[data-autofocus]')?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const nodes = panel.current.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="confirm-backdrop"
            className="fixed inset-0 z-60 bg-navy/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <div key="confirm-layer" className="pointer-events-none fixed inset-0 z-61 grid place-items-center p-4">
            <motion.div
              ref={panel}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={textId}
              className="pointer-events-auto w-full max-w-[440px] rounded-panel border border-line bg-surface p-6 shadow-float"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <div className="flex items-start justify-between gap-3">
                <IconTile icon={icon} tone={tone} size={24} className="size-12 rounded-2xl" />
                <button
                  type="button"
                  aria-label={closeLabel}
                  onClick={onClose}
                  className="grid size-12 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
              <h2 id={titleId} className="mt-4 font-sans text-xl font-bold">
                {title}
              </h2>
              <p id={textId} className="mt-2 text-subtle">
                {text}
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" onClick={onClose} data-autofocus>
                  {cancelLabel}
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
