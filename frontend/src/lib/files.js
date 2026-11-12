export const MAX_MB = 20

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export const fileProblems = {
  blurry: {
    title: 'Medyo malabo ang photo.',
    text: 'Subukang kunan ulit sa maliwanag at patag na lugar.',
  },
  type: {
    title: 'Hindi mabasa ang file na iyon.',
    text: 'PDF, JPG, o PNG lang ang tinatanggap.',
  },
  size: {
    title: 'Masyadong malaki ang file.',
    text: `Hanggang ${MAX_MB} MB lang. Subukang kunan ulit ng photo.`,
  },
}

/** Returns null when the file is acceptable, otherwise a key of `fileProblems`. */
export function checkContractFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_MB * 1024 * 1024) return 'size'
  return null
}
