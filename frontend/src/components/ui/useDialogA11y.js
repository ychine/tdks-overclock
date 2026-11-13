import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * ROLE: the keyboard and focus behaviour every modal needs.
 *  - on open: remember who had focus, then move focus inside (`[data-autofocus]`, else the first control)
 *  - Tab / Shift+Tab stay inside the panel; Escape closes
 *  - the page behind cannot scroll while it is open
 *  - on close: focus goes back to where it came from
 *
 * `returnFocusRef` (optional) names the element to refocus. Safari does not focus a button when it is
 * clicked, so document.activeElement can be <body> there; the caller can point at the real trigger.
 */
export function useDialogA11y(open, panelRef, onClose, returnFocusRef) {
  // Keep the latest onClose without restarting the effect (callers often pass a new function each render).
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined
    // The trigger is known before the dialog opens (the caller sets the ref in its click handler).
    const returnTo = returnFocusRef?.current ?? document.activeElement
    const panel = panelRef.current
    const first = panel?.querySelector('[data-autofocus]') ?? panel?.querySelector(FOCUSABLE)
    first?.focus({ preventScroll: true }) // the panel is still sliding in; do not let focus scroll the page

    // Lock page scroll. Keep the layout from jumping when the scrollbar disappears.
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current?.()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = panelRef.current.querySelectorAll(FOCUSABLE)
      if (!nodes.length) return
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      const active = document.activeElement
      if (!panelRef.current.contains(active)) {
        e.preventDefault()
        firstNode.focus()
      } else if (e.shiftKey && active === firstNode) {
        e.preventDefault()
        lastNode.focus()
      } else if (!e.shiftKey && active === lastNode) {
        e.preventDefault()
        firstNode.focus()
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus()
    }
  }, [open, panelRef, returnFocusRef])
}
