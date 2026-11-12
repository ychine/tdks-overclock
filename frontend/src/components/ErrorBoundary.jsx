import { Component } from 'react'
import { useI18n } from '../i18n/useI18n'
import Icon from './Icon'
import Button from './ui/Button'

function Fallback() {
  const { t } = useI18n()
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center text-ink">
      <div className="max-w-md">
        <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-sun text-[#1b2433]">
          <Icon name="sun" size={30} />
        </span>
        <h1 className="text-3xl font-semibold">{t('app.errorTitle')}</h1>
        <p className="mt-3 text-subtle">{t('app.errorText')}</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          {t('app.reload')}
        </Button>
      </div>
    </div>
  )
}

/** Catches render errors so a broken screen never leaves a blank page. */
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}
