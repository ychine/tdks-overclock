import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Standard page container. `narrow` is for single-column task screens.
 * On mount it moves focus to the page's <h1> so keyboard and screen-reader users land on the new
 * screen. (The enter/exit transition lives in App, around the whole screen.)
 */
export function Page({ narrow = false, className, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const heading = ref.current?.querySelector('h1')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'mx-auto w-[calc(100%-32px)] py-8 md:w-[calc(100%-64px)] md:py-12',
        narrow ? 'max-w-[760px]' : 'max-w-[1180px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Page title block. `children` is an optional action area, right-aligned on wide screens. */
export function PageHeading({ title, text, children, className }) {
  return (
    <div className={cn('mt-1 mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-[780px]">
        <h1 className="text-4xl leading-[1.05] font-semibold md:text-5xl">{title}</h1>
        {text && <p className="mt-3 max-w-[60ch] text-lg text-subtle">{text}</p>}
      </div>
      {children}
    </div>
  )
}
