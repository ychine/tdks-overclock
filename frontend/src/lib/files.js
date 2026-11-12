export const MAX_MB = 20

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

/** Returns null when the file is acceptable, otherwise 'type' or 'size' (see `file.*` messages). */
export function checkContractFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_MB * 1024 * 1024) return 'size'
  return null
}
