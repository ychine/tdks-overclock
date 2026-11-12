import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SPRING_PANEL } from '@/lib/ease'
import Icon from '../Icon'

/**
 * ROLE: modal detail that interrupts on purpose (a term's meaning). Bottom sheet that can be
 * dragged down to dismiss; Escape and backdrop also close. Backdrop and dialog are separate
 * top-level layers so iOS Safari keeps the backdrop covering the viewport.
 */
export default function Sheet({ open, onClose, titleId, closeLabel, children }) {
  const closeButton = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    closeButton.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-60 bg-navy/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <div key="layer" className="pointer-events-none fixed inset-0 z-61 flex items-end justify-center">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="pointer-events-auto relative w-full max-w-[560px] rounded-t-3xl bg-surface px-6 pt-8 pb-[max(24px,env(safe-area-inset-bottom))] shadow-float md:mb-10 md:rounded-3xl md:pb-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={SPRING_PANEL}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => info.offset.y > 90 && onClose()}
            >
              <div aria-hidden="true" className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-sm bg-line" />
              <button
                ref={closeButton}
                type="button"
                aria-label={closeLabel}
                onClick={onClose}
                className="absolute top-4 right-4 grid size-12 place-items-center rounded-full bg-surface-2 transition-colors hover:bg-line"
              >
                <Icon name="close" />
              </button>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
