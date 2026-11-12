import { useI18n } from '../i18n/useI18n'
import Brand from './Brand'
import LanguageSelect from './LanguageSelect'
import ThemeToggle from './ThemeToggle'

export default function Topbar({ title, onHome, dark, setDark }) {
  const { t } = useI18n()
  return (
    <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-line bg-canvas/90 px-[18px] backdrop-blur lg:px-10 print:hidden">
      <button
        type="button"
        aria-label={t('app.brandHome')}
        onClick={onHome}
        className="flex min-h-12 items-center rounded-btn lg:hidden"
      >
        <Brand compact />
      </button>
      <p className="hidden items-center gap-2 text-sm text-subtle lg:flex">
        <button type="button" onClick={onHome} className="min-h-12 rounded-btn font-semibold hover:text-ink">
          Linaw
        </button>
        <span aria-hidden="true">/</span>
        <span className="font-bold text-ink">{title}</span>
      </p>
      <div className="flex items-center gap-2">
        <LanguageSelect className="max-w-28" />
        <ThemeToggle dark={dark} setDark={setDark} />
      </div>
    </header>
  )
}
