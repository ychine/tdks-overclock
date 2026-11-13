// Works out who a contract is for from its OCR text, so the user is never asked.
// Pure and deterministic: only the resulting label ('kasambahay' | 'ofw' | 'local') goes to the
// server, never the raw text. It picks which verified law applies.

const KASAMBAHAY =
  /kasambahay|domestic\s+(?:worker|helper|help|service)|household\s+(?:worker|helper|service|employee)|house\s?helper|\bhousemaid\b|\bmaid\b|\byaya\b|katulong|\bnanny\b|\bdriver\b.*\bhousehold|ra\s*10361|batas\s+kasambahay/i

const OFW =
  /\bofw\b|overseas\s+(?:filipino|employment|worker|contract)|migrant\s+worker|\bdmw\b|\bpoea\b|\bowwa\b|recruitment\s+agency|manning\s+agency|host\s+country|repatriation|\bseafarer\b|standard\s+employment\s+contract|ra\s*8042|ra\s*10022|\bsaudi\b|\bkuwait\b|\bqatar\b|\buae\b|united\s+arab\s+emirates|\bhong\s+kong\b|\bsingapore\b|\btaiwan\b|\bjapan\b|\bbahrain\b|\boman\b|\bisrael\b/i

/**
 * Kasambahay terms win over OFW terms, because a kasambahay contract can mention an agency.
 * With no clear signal we fall back to 'local': it has no verified law yet, so the app
 * explains the contract only. That is safer than showing the wrong worker's law.
 */
export function detectWorkerType(text = '') {
  if (KASAMBAHAY.test(text)) return 'kasambahay'
  if (OFW.test(text)) return 'ofw'
  return 'local'
}
