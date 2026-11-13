export const agencies = [
  {
    id: 'dole',
    name: 'DOLE',
    phone: '1349',
    color: 'brand',
    logo: '/Department_of_Labor_and_Employment_(DOLE).svg',
  },
  {
    id: 'dmw',
    name: 'DMW',
    phone: '8722-1144',
    color: 'alert',
    logo: '/Department_of_Migrant_Workers_(DMW).svg',
  },
  {
    id: 'owwa',
    name: 'OWWA',
    phone: '1348',
    color: 'sun',
    logo: '/Logo_of_Overseas_Workers_Welfare_Administration.png',
  },
  { id: 'pao', name: 'PAO', phone: '(02) 8929-9436', color: 'ink', logo: '/PAO.png' },
]

/** Digits-only form that is safe inside a tel: link. */
export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`
