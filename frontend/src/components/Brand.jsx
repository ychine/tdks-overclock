export default function Brand({ compact = false, onClick, label }) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      {...(onClick ? { type: 'button', 'aria-label': label, onClick } : {})}
      className={`inline-flex items-center rounded-btn ${onClick ? 'min-h-12 cursor-pointer transition-opacity hover:opacity-80' : ''}`}
    >
      <img
        src="/logo.svg"
        alt=""
        aria-hidden="true"
        className={`mr-1.5 -translate-y-px object-contain ${compact ? 'size-7' : 'size-9'}`}
      />
      <span
        className={`font-display font-bold tracking-tight text-ink ${compact ? 'text-2xl' : 'text-[2rem] leading-none'}`}
      >
        Linaw
      </span>
    </Tag>
  )
}
