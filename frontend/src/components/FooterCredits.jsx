import { cn } from '@/lib/utils'
import { useI18n } from '../i18n/useI18n'

/** Bottom strip shared by the landing and in-app footers: copyright on the left, the team credit on the right. */
export default function FooterCredits({ className }) {
  const { t } = useI18n()
  return (
    <div
      className={cn(
        'flex flex-col gap-3 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="tabular-nums">
        {'\u00a9'} {new Date().getFullYear()} Linaw. {t('landing.footerRights')}
      </p>
      <p className="flex items-center gap-3">
        <span>{t('landing.footerBy')}</span>
        {/* White-stroke wordmark used as a mask so it takes the theme ink in light and dark mode. */}
        <span
          role="img"
          aria-label="Dead Keys Society"
          className="block aspect-[790/92] h-[18px] bg-ink [mask:url(/tdks-logo.svg)_center/contain_no-repeat]"
        />
      </p>
    </div>
  )
}
