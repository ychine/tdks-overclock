import { cn } from '@/lib/utils'
import { LANGUAGES } from '../i18n/messages'
import { useI18n } from '../i18n/useI18n'

export default function LanguageSelect({ className }) {
  const { language, setLanguage, t } = useI18n()
  return (
    <select
      aria-label={t('app.language')}
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className={cn(
        'min-h-12 rounded-btn border border-line bg-surface px-3 font-semibold text-ink transition-colors hover:border-ink/30',
        className,
      )}
    >
      {LANGUAGES.map((name) => (
        <option key={name}>{name}</option>
      ))}
    </select>
  )
}
