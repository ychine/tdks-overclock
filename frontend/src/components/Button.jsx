import Icon from './Icon'

export default function Button({
  children,
  onClick,
  variant = 'primary',
  icon,
  disabled = false,
  className = '',
  href,
}) {
  const classes = `button ${variant} ${className}`
  const content = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </>
  )

  if (href) {
    return (
      <a className={classes} href={href}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={classes} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  )
}
