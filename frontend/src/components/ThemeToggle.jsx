import { useI18n } from '../i18n/useI18n'
import { IconButton } from './ui/Button'

export default function ThemeToggle({ dark, setDark }) {
  const { t } = useI18n()
  return (
    <IconButton
      icon={dark ? 'sun' : 'moon'}
      label={dark ? t('app.themeLight') : t('app.themeDark')}
      onClick={() => setDark(!dark)}
    />
  )
}
