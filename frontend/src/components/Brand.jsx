import Icon from './Icon'

export default function Brand({ compact = false }) {
  return (
    <div className="brand">
      <span className="brand-sun" aria-hidden="true">
        <Icon name="sun" size={compact ? 17 : 20} />
      </span>
      <span className={compact ? 'brand-word compact' : 'brand-word'}>Linaw</span>
    </div>
  )
}
