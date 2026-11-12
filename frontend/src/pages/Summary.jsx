import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import Button from '../components/ui/Button'
import { Chip } from '../components/ui/Controls'
import { Page, PageHeading } from '../components/ui/Page'
import Sheet from '../components/ui/Sheet'
import Stepper from '../components/ui/Stepper'
import { Badge, Callout, ListGroup, ListRow, Panel } from '../components/ui/Surfaces'
import { LANGUAGE_TAGS } from '../i18n/messages'
import { useI18n } from '../i18n/useI18n'

// Icons and "worrying" flags follow the order of `summary.items` in the message files.
const itemMeta = [
  { icon: 'wallet', tone: 'brand' },
  { icon: 'alert', tone: 'alert', worry: true },
  { icon: 'sun', tone: 'sun' },
  { icon: 'home', tone: 'brand' },
  { icon: 'file', tone: 'brand' },
  { icon: 'alert', tone: 'alert', worry: true },
]

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window
const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export default function Summary({ go }) {
  const { t, language } = useI18n()
  const items = t('summary.items')
  const terms = t('summary.terms')
  const [term, setTerm] = useState(null)
  const [speaking, setSpeaking] = useState(false)

  const summaryText = items.map((i) => `${i.title}: ${i.value}. ${i.detail}.`).join('\n')

  // Stop reading aloud when leaving the screen.
  useEffect(
    () => () => {
      if (canSpeak) window.speechSynthesis.cancel()
    },
    [],
  )

  const toggleSpeech = () => {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(summaryText.replace(/\n/g, ' '))
    utterance.lang = LANGUAGE_TAGS[language]
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synth.speak(utterance)
    setSpeaking(true)
  }

  const share = () => navigator.share({ title: t('summary.shareTitle'), text: summaryText }).catch(() => {})
  const closeSheet = () => setTerm(null)

  return (
    <Page>
      <Stepper current={2} />
      <PageHeading title={t('summary.title')} text={t('summary.text')}>
        <div className="flex flex-wrap gap-2.5 print:hidden">
          {canSpeak && (
            <Button variant="secondary" icon="sound" onClick={toggleSpeech}>
              {speaking ? t('summary.stop') : t('summary.speak')}
            </Button>
          )}
          <Button variant="secondary" icon="file" onClick={() => window.print()}>
            {t('summary.print')}
          </Button>
          {canShare && (
            <Button variant="secondary" icon="send" onClick={share}>
              {t('summary.share')}
            </Button>
          )}
        </div>
      </PageHeading>

      <Callout title={t('summary.noticeTitle')} className="mb-6">
        {t('summary.noticeText')}
      </Callout>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <ListGroup aria-label={t('summary.title')}>
          {items.map((item, i) => {
            const { icon, tone, worry } = itemMeta[i]
            return (
              <ListRow
                key={item.title}
                icon={icon}
                tone={tone}
                title={item.title}
                detail={item.detail}
                value={item.value}
                badge={worry ? <Badge tone="alert">{t('summary.askBadge')}</Badge> : null}
                className={worry ? 'bg-alert-soft' : i === 0 ? 'py-5' : undefined}
              />
            )
          })}
        </ListGroup>

        <div className="grid gap-4 lg:sticky lg:top-24">
          <Panel className="p-5">
            <h2 className="font-sans text-xl font-bold">{t('summary.termsTitle')}</h2>
            <p className="mt-1 text-subtle">{t('summary.termsHint')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {terms.map((entry, i) => (
                <Chip key={entry.name} onClick={() => setTerm(i)} className="inline-flex items-center gap-1.5">
                  {entry.name}
                  <span className="text-brand"><Icon name="plus" size={15} /></span>
                </Chip>
              ))}
            </div>
          </Panel>
          <div className="grid gap-2.5 print:hidden">
            <Button icon="wallet" onClick={() => go('salary')}>
              {t('summary.toSalary')}
            </Button>
            <Button variant="secondary" icon="chat" onClick={() => go('chat')}>
              {t('summary.toChat')}
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={term !== null} onClose={closeSheet} titleId="term-title" closeLabel={t('app.close')}>
        {term !== null && (
          <>
            <p className="text-sm font-bold text-brand">{t('summary.meaning')}</p>
            <h2 id="term-title" className="mt-1 pr-12 text-3xl font-semibold">
              {terms[term].name}
            </h2>
            <p className="mt-3 mb-6 text-lg text-subtle">{terms[term].def}</p>
            <Button className="w-full" onClick={closeSheet}>
              {t('summary.gotIt')}
            </Button>
          </>
        )}
      </Sheet>
    </Page>
  )
}
