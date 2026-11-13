import { cn } from '@/lib/utils'
import { useI18n } from '../i18n/useI18n'
import Brand from './Brand'
import FooterCredits from './FooterCredits'
import Icon from './Icon'

const LINKS = ['home', 'summary', 'chat', 'compare', 'help']

/**
 * In-app footer, the quieter sibling of the landing footer: same brand lockup, credits strip, and type,
 * minus the marketing blocks. On phones it sits above the fixed bottom nav (main already pads for it).
 */
export default function AppFooter({ screen, go, onBrand }) {
  const { t } = useI18n()
  return (
    <footer className="mt-auto border-t border-line bg-surface print:hidden">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 md:py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Brand compact onClick={onBrand} label={t('app.brandLanding')} />
            <p className="text-subtle">{t('landing.footerTagline')}</p>
          </div>
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-2 px-3.5 py-2 text-sm text-subtle">
            <Icon name="alert" size={16} />
            {t('app.disclaimer')}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 text-sm text-subtle md:flex-row md:items-center md:justify-between">
          <nav aria-label={t('landing.footerLinks')} className="-mx-3 flex flex-wrap">
            {LINKS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={screen === id ? 'page' : undefined}
                className={cn(
                  'min-h-11 rounded-btn px-3 font-semibold transition-colors hover:text-ink',
                  screen === id && 'text-brand',
                )}
              >
                {t(`nav.${id}`)}
              </button>
            ))}
          </nav>
          <p className="flex items-center gap-2">
            <Icon name="lock" size={16} />
            {t('landing.footerPrivacy')}
          </p>
        </div>

        <FooterCredits className="mt-6 border-t border-line pt-6" />
      </div>
    </footer>
  )
}
