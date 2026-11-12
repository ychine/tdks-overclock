import { LanguagesIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LANGUAGES } from '../i18n/messages'
import { useI18n } from '../i18n/useI18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

/** Icon-only trigger that opens a radio menu of languages. Same 48px footprint as ThemeToggle. */
export default function LanguageSelect({ className }) {
  const { language, setLanguage, t } = useI18n()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t('app.language')}: ${language}`}
        className={cn(
          'grid size-12 shrink-0 place-items-center rounded-btn border border-line bg-surface text-ink transition-colors',
          'hover:border-ink/30 hover:bg-surface-2 data-[state=open]:bg-surface-2',
          className,
        )}
      >
        <LanguagesIcon size={20} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('app.language')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
          {LANGUAGES.map((name) => (
            <DropdownMenuRadioItem key={name} value={name}>
              {name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
