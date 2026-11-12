import { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nContext } from './I18nContext'
import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_TAGS, messages } from './messages'

const STORAGE_KEY = 'linaw.language'

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGUAGES.includes(saved)) return saved
  } catch {
    // storage can be blocked; fall back to the default
  }
  return DEFAULT_LANGUAGE
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(initialLanguage)

  useEffect(() => {
    document.documentElement.lang = LANGUAGE_TAGS[language].split('-')[0]
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore
    }
  }, [language])

  const t = useCallback(
    (key, vars) => {
      let value = messages[language][key] ?? messages[DEFAULT_LANGUAGE][key]
      if (value === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`)
        return key
      }
      if (typeof value === 'string' && vars) {
        value = value.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''))
      }
      return value
    },
    [language],
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
