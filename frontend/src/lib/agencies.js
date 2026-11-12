export const agencies = [
  { id: 'dole', name: 'DOLE', phone: '1349', color: 'brand' },
  { id: 'dmw', name: 'DMW', phone: '8722-1144', color: 'alert' },
  { id: 'owwa', name: 'OWWA', phone: '1348', color: 'sun' },
  { id: 'pao', name: 'PAO', phone: '(02) 8929-9436', color: 'ink' },
]

/** Digits-only form that is safe inside a tel: link. */
export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`
