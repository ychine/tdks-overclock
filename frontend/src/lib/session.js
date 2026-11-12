// Keeps the document flow alive across a page refresh.
//
// - doc + confirmed + the uploaded file go in sessionStorage: cleared when the tab closes, so a worker's
//   contract never lingers on a shared phone.
// - The theme choice goes in localStorage: it is a preference, not data, so it outlives the tab.
//
// Storage can be blocked or full (~5 MB). Every call fails soft: the app just behaves as if nothing was saved.

const DOC = 'linaw.doc'
const CONFIRMED = 'linaw.confirmed'
const FILE = 'linaw.file'
const THEME = 'linaw.theme'

function read(store, key) {
  try {
    const raw = store.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(store, key, value) {
  try {
    if (value == null) store.removeItem(key)
    else store.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const loadDoc = () => read(sessionStorage, DOC)
export const saveDoc = (doc) => write(sessionStorage, DOC, doc)

export const loadConfirmed = () => read(sessionStorage, CONFIRMED)
export const saveConfirmed = (confirmed) => write(sessionStorage, CONFIRMED, confirmed)

/** Remember the uploaded file as a data URL. Returns false if it was too big to keep. */
export function saveFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(write(sessionStorage, FILE, { name: file.name, type: file.type, dataUrl: reader.result }))
    reader.onerror = () => resolve(false)
    reader.readAsDataURL(file)
  })
}

export const clearFile = () => write(sessionStorage, FILE, null)

/** Rebuild { file, url } from the saved data URL, or null if nothing (usable) was saved. */
export async function loadFile() {
  const saved = read(sessionStorage, FILE)
  if (!saved?.dataUrl) return null
  try {
    const blob = await (await fetch(saved.dataUrl)).blob()
    const file = new File([blob], saved.name, { type: saved.type })
    return { file, url: URL.createObjectURL(file) }
  } catch {
    return null
  }
}

export function clearSession() {
  write(sessionStorage, DOC, null)
  write(sessionStorage, CONFIRMED, null)
  write(sessionStorage, FILE, null)
}

/** 'dark' | 'light' if the user ever chose one, otherwise null (follow the system). */
export function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME)
    return saved === 'dark' || saved === 'light' ? saved : null
  } catch {
    return null
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME, theme)
  } catch {
    // ignore
  }
}
