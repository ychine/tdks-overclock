import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// pdf.js is large, so it only loads the first time a PDF is shown. One loaded document per blob URL.
let pdfjsPromise
function loadPdfjs() {
  pdfjsPromise ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
    ([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      return pdfjs
    },
  )
  return pdfjsPromise
}
const docs = new Map()
function loadDoc(url) {
  if (!docs.has(url)) {
    const p = loadPdfjs().then((pdfjs) => pdfjs.getDocument({ url, isEvalSupported: false }).promise)
    p.catch(() => docs.delete(url))
    docs.set(url, p)
  }
  return docs.get(url)
}

/**
 * Renders one real page of the uploaded PDF to a canvas, sized to its container (sharp on high-DPI,
 * capped at 2x for cheap phones), with the active field's box drawn on top, the same way photos work.
 * `box` is normalized 0..1 page coordinates. Calls `onError` if the PDF can't be rendered.
 */
export default function PdfPage({ url, page, box, toneClass, tint, label, onError }) {
  const wrap = useRef(null)
  const canvas = useRef(null)
  const mark = useRef(null)
  const reduce = useReducedMotion() ?? false
  const [width, setWidth] = useState(0)
  const [ratio, setRatio] = useState(1.414) // A4 until the real page size is known
  // Which render finished last; the page is ready only when it matches what we want to show now.
  const [rendered, setRendered] = useState(null)
  const want = `${url}|${page}|${width}`
  const ready = rendered === want

  useEffect(() => {
    const el = wrap.current
    if (!el) return undefined
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!width) return undefined
    let cancelled = false
    let task
    loadDoc(url)
      .then((pdf) => pdf.getPage(Math.min(Math.max(1, page), pdf.numPages)))
      .then((pdfPage) => {
        if (cancelled) return
        const base = pdfPage.getViewport({ scale: 1 })
        setRatio(base.height / base.width)
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const viewport = pdfPage.getViewport({ scale: (width / base.width) * dpr })
        const c = canvas.current
        c.width = Math.floor(viewport.width)
        c.height = Math.floor(viewport.height)
        task = pdfPage.render({ canvas: c, canvasContext: c.getContext('2d'), viewport })
        return task.promise.then(() => !cancelled && setRendered(`${url}|${page}|${width}`))
      })
      .catch((err) => {
        if (!cancelled && err?.name !== 'RenderingCancelledException') onError?.(err)
      })
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [url, page, width, onError])

  // Bring the highlighted field into view inside the scrolling viewer.
  useEffect(() => {
    if (ready && box) mark.current?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }, [ready, box, reduce])

  return (
    <div ref={wrap} className="relative w-full bg-white shadow-[0_12px_35px_rgb(0_0_0/0.18)]" style={{ aspectRatio: `1 / ${ratio}` }}>
      <canvas
        ref={canvas}
        role="img"
        aria-label={label}
        className={cn('absolute inset-0 block h-full w-full transition-opacity duration-200', ready ? 'opacity-100' : 'opacity-0')}
      />
      {!ready && <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-[#f1f3f5]" />}
      {ready && box && (
        <span
          ref={mark}
          aria-hidden="true"
          className={cn('pointer-events-none absolute scale-[1.04] rounded-[3px] transition-all duration-200', toneClass)}
          style={{
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.w * 100}%`,
            height: `${box.h * 100}%`,
            backgroundColor: tint,
          }}
        />
      )}
    </div>
  )
}
