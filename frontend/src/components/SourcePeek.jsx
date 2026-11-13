import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '../i18n/useI18n'
import Icon from './Icon'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

const OPEN_DELAY = 120
const CLOSE_DELAY = 180

/** The lines a confirmed field was read from, plus one line of context on each side. */
function excerpt(pages, field) {
  if (!field || field.pageNumber == null || field.lineIndex == null) return null
  const lines = pages?.find((p) => p.pageNumber === field.pageNumber)?.lines ?? []
  if (!lines.length) return null
  const start = field.lineIndex
  const end = start + (field.lineCount || 1)
  const from = Math.max(0, start - 1)
  const to = Math.min(lines.length, end + 1)
  return {
    page: field.pageNumber,
    lines: lines.slice(from, to).map((line, i) => ({ text: line.text, hit: from + i >= start && from + i < end })),
    cutTop: from > 0,
    cutBottom: to < lines.length,
  }
}

/**
 * ROLE: a sneak peek of where a worrying summary row came from in the user's own document.
 * shadcn Popover: opens on hover for mice (small delay, stays open while the pointer is over it)
 * and on tap/click or Enter for everyone else. The document text is rendered as plain text only.
 * `children` must be a single element that accepts a ref (e.g. an interactive ListRow).
 */
export default function SourcePeek({ pages, field, title, why, children }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const timer = useRef(null)
  const peek = excerpt(pages, field)

  useEffect(() => () => clearTimeout(timer.current), [])

  // Mouse hover opens/closes with a short delay; touch and pen fall through to tap (onOpenChange).
  const onHover = (e) => {
    if (e.pointerType !== 'mouse') return
    const entering = e.type === 'pointerenter'
    const delay = entering ? (e.currentTarget.dataset.peek === 'content' ? 0 : OPEN_DELAY) : CLOSE_DELAY
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(entering), delay)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onPointerEnter={onHover} onPointerLeave={onHover}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-[22rem] p-0"
        data-peek="content"
        onPointerEnter={onHover}
        onPointerLeave={onHover}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <span className="text-alert"><Icon name="alert" size={16} /></span>
            {t('summary.peekTitle', { title })}
          </p>
          {peek && <span className="shrink-0 text-sm text-subtle">{t('summary.peekPage', { n: peek.page })}</span>}
        </div>

        <div className="p-3">
          {peek ? (
            // Same look as the document view on Review: the page in serif on white, the source line marked.
            <div className="rounded-btn bg-[#dbe0e5] p-2 dark:bg-[#293342]">
              <div className="bg-white px-4 py-3 font-serif text-[0.8125rem] leading-[1.55] break-words text-[#222] shadow-[0_4px_14px_rgb(0_0_0/0.14)]">
                {peek.cutTop && <p className="px-1.5 text-[#8a8f98]" aria-hidden="true">…</p>}
                {peek.lines.map((line, i) => (
                  <p
                    key={i}
                    className={cn(
                      'rounded-[3px] px-1.5 py-0.5',
                      line.hit ? 'bg-[#fff0f1] text-[#222] outline-2 outline-[#ce1126]' : 'text-[#555]',
                    )}
                  >
                    {line.text}
                  </p>
                ))}
                {peek.cutBottom && <p className="px-1.5 text-[#8a8f98]" aria-hidden="true">…</p>}
              </div>
            </div>
          ) : (
            <p className="rounded-btn bg-surface-2 px-3 py-3 text-sm text-subtle">{t('summary.peekMissing')}</p>
          )}
          {why && <p className="mt-3 px-1 text-sm text-ink">{why}</p>}
        </div>
      </PopoverContent>
    </Popover>
  )
}
