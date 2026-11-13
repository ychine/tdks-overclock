import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import Icon from './Icon'
import PdfPage from './PdfPage'
import { useI18n } from '../i18n/useI18n'

// Shows the uploaded document and highlights where the active field was read.
// Images: the real photo with a box drawn over the source line.
// PDFs: the real page rendered with pdf.js and the same box drawn over it. If pdf.js can't render it,
// fall back to the OCR text laid out as a page with the source line highlighted. Both link to the real PDF.
const located = 'bg-[#eaf1ff] outline-3 outline-[#0038a8]'
const uncertain = 'bg-[#fff8cf] outline-3 outline-[#d2a900]'

export default function OriginalView({ upload, lines, field, label }) {
  const { t } = useI18n()
  const pageNumbers = lines.map((p) => p.pageNumber)

  // Show the selected field's page, unless the user paged manually while on that field.
  const [manual, setManual] = useState({ key: null, page: null })
  const page =
    (manual.key === (field?.key ?? null) && manual.page) || field?.pageNumber || pageNumbers[0] || 1
  const setPage = (p) => setManual({ key: field?.key ?? null, page: p })

  const isImage = upload.file.type.startsWith('image/')
  const onPage = Boolean(field && field.pageNumber === page)
  const tone = field?.low ? uncertain : located
  const pageLines = lines.find((p) => p.pageNumber === page)?.lines ?? []
  const index = pageNumbers.indexOf(page)
  const [pdfFailed, setPdfFailed] = useState(false)
  const onPdfError = useCallback(() => setPdfFailed(true), [])
  const tint = field?.low ? 'rgb(255 233 154 / 0.35)' : 'rgb(0 56 168 / 0.12)'

  return (
    <div
      role="group"
      aria-label={label}
      className="relative grid min-h-[600px] grid-cols-[minmax(0,1fr)] place-items-start justify-items-center overflow-hidden rounded-card bg-[#dbe0e5] p-[18px] pb-16 lg:min-h-[680px] dark:bg-[#293342]"
    >
      {isImage ? (
        <div className="relative w-full max-w-[520px] bg-white shadow-[0_12px_35px_rgb(0_0_0/0.18)]">
          <img src={upload.url} alt={upload.file.name} className="block h-auto w-full" />
          {onPage && field.box && (
            <span
              aria-hidden="true"
              className={cn('pointer-events-none absolute scale-[1.04] rounded-[3px] transition-all duration-200', tone)}
              style={{
                left: `${field.box.x * 100}%`,
                top: `${field.box.y * 100}%`,
                width: `${field.box.w * 100}%`,
                height: `${field.box.h * 100}%`,
                backgroundColor: field.low ? 'rgb(255 233 154 / 0.35)' : 'rgb(0 56 168 / 0.12)',
              }}
            />
          )}
        </div>
      ) : !pdfFailed ? (
        <div className="mx-auto max-h-[78vh] w-full max-w-[680px] justify-self-stretch overflow-y-auto overscroll-contain rounded-[2px]">
          <PdfPage
            url={upload.url}
            page={page}
            box={onPage ? field.box : null}
            toneClass={tone}
            tint={tint}
            label={t('review.pageAlt', { n: page, name: upload.file.name })}
            onError={onPdfError}
          />
        </div>
      ) : (
        <div className="max-h-[70vh] min-h-[540px] w-full max-w-[440px] overflow-y-auto bg-white p-8 font-serif text-[0.8125rem] leading-[1.55] break-words text-[#222] shadow-[0_12px_35px_rgb(0_0_0/0.18)] lg:px-11 lg:py-12 lg:text-sm">
          {pageLines.length === 0 && <p>{t('review.noText')}</p>}
          {pageLines.map((line, i) => {
            const hit = onPage && i >= field.lineIndex && i < field.lineIndex + field.lineCount
            return (
              <p key={i} className={cn('mb-0.5 rounded-[3px] px-1.5 py-0.5 transition duration-200', hit && tone)}>
                {line.text}
              </p>
            )
          })}
        </div>
      )}

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-1.5 text-xs whitespace-nowrap text-[#333]">
        {pageNumbers.length > 1 && (
          <button
            type="button"
            aria-label={t('review.prevPage')}
            disabled={index <= 0}
            onClick={() => setPage(pageNumbers[index - 1])}
            className="grid size-10 place-items-center disabled:opacity-35"
          >
            <span className="-scale-x-100"><Icon name="chevron" size={16} /></span>
          </button>
        )}
        <span className="px-2 py-1.5">{t('review.page', { n: page, total: pageNumbers.length })}</span>
        {pageNumbers.length > 1 && (
          <button
            type="button"
            aria-label={t('review.nextPage')}
            disabled={index >= pageNumbers.length - 1}
            onClick={() => setPage(pageNumbers[index + 1])}
            className="grid size-10 place-items-center disabled:opacity-35"
          >
            <Icon name="chevron" size={16} />
          </button>
        )}
        {!isImage && (
          <a href={upload.url} target="_blank" rel="noreferrer" className="px-2 py-2.5 font-bold text-[#0038a8]">
            {t('review.openPdf')}
          </a>
        )}
      </div>
    </div>
  )
}
