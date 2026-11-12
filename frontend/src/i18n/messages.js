import english from './english'
import filipino from './filipino'
import taglish from './taglish'

export const LANGUAGES = ['English', 'Filipino', 'Taglish']
export const DEFAULT_LANGUAGE = 'Taglish'

export const messages = { English: english, Filipino: filipino, Taglish: taglish }

/** BCP-47 tags used for <html lang> and speech synthesis. */
export const LANGUAGE_TAGS = { English: 'en-PH', Filipino: 'fil-PH', Taglish: 'fil-PH' }
