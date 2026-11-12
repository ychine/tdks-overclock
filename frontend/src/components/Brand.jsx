import Icon from './Icon'

export default function Brand({ compact = false, onClick, label }) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      {...(onClick ? { type: 'button', 'aria-label': label, onClick } : {})}
      className={`inline-flex items-center rounded-btn ${onClick ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
    >
      <span
        aria-hidden="true"
        className="mr-2 grid size-[34px] place-items-center rounded-full bg-sun text-[#1b2433]"
      >
        <Icon name="sun" size={compact ? 17 : 20} />
      </span>
      <span
        className={`font-display font-bold tracking-tight text-ink ${compact ? 'text-2xl' : 'text-[2rem] leading-none'}`}
      >
        Linaw
      </span>
    </Tag>
  )
}
