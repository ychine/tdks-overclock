import { useRef } from 'react'
import { AnimatePresence, motion, useDragControls } from 'motion/react'
import { SPRING_PANEL } from '@/lib/ease'
import Icon from '../Icon'
import { useDialogA11y } from './useDialogA11y'

/**
 * ROLE: modal detail that interrupts on purpose (a term's meaning, a comparison row). Bottom sheet.
 * Backdrop and dialog are separate top-level layers so iOS Safari keeps the backdrop covering the viewport.
 *
 * Layout: a fixed top (handle + optional `header`) and a scroll area for `children`, capped at ~88dvh.
 * Drag-to-dismiss starts ONLY from the handle / header, so scrolling the content never closes the sheet.
 * Escape, backdrop and the close button also close. Focus moves in, Tab stays inside, the page behind
 * does not scroll, and focus returns to the trigger on close (see useDialogA11y).
 *
 * Props: `header` (node, optional) stays pinned above the scrolling content, e.g. a title.
 *        `returnFocusRef` (ref, optional) is the element to refocus on close; defaults to whoever had focus.
 */
export default function Sheet({ open, onClose, titleId, closeLabel, header, returnFocusRef, children }) {
  const panel = useRef(null)
  const dragControls = useDragControls()
  useDialogA11y(open, panel, onClose, returnFocusRef)

  const startDrag = (e) => dragControls.start(e)

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
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="pointer-events-auto relative flex max-h-[88dvh] w-full max-w-[560px] flex-col rounded-t-3xl bg-surface shadow-float md:mb-10 md:max-h-[calc(88dvh-2.5rem)] md:rounded-3xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={SPRING_PANEL}
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => info.offset.y > 90 && onClose()}
            >
              {/* The drag handle. touch-none lets a finger drag it instead of scrolling the page. */}
              <div
                aria-hidden="true"
                onPointerDown={startDrag}
                className="absolute inset-x-0 top-0 z-10 h-8 cursor-grab touch-none rounded-t-3xl active:cursor-grabbing"
              >
                <div className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-sm bg-line" />
              </div>
              <button
                type="button"
                data-autofocus
                aria-label={closeLabel}
                onClick={onClose}
                className="absolute top-4 right-4 z-20 grid size-12 place-items-center rounded-full bg-surface-2 transition-colors hover:bg-line"
              >
                <Icon name="close" />
              </button>
              {header && (
                <div onPointerDown={startDrag} className="shrink-0 cursor-grab touch-none px-6 pt-8 pr-20 active:cursor-grabbing">
                  {header}
                </div>
              )}
              <div
                data-lenis-prevent
                className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-[max(24px,env(safe-area-inset-bottom))] md:pb-6 ${header ? 'pt-4' : 'pt-8'}`}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
