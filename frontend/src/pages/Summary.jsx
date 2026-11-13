import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import SourcePeek from '../components/SourcePeek'
import NeedsUpload from '../components/NeedsUpload'
import Button from '../components/ui/Button'
import { Chip } from '../components/ui/Controls'
import { Page, PageHeading } from '../components/ui/Page'
import Sheet from '../components/ui/Sheet'
import { Badge, Callout, ListGroup, ListRow, Panel } from '../components/ui/Surfaces'
import { LANGUAGE_TAGS } from '../i18n/messages'
import { useI18n } from '../i18n/useI18n'
import { localizeFieldValue } from '../lib/extract'
import { findTerms } from '../lib/glossary'

/** Renders an OCR line with the matched term highlighted. */
function Quote({ text, match }) {
  const at = text.toLowerCase().indexOf(match.toLowerCase())
  if (at === -1) return text
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-sm bg-sun px-0.5 text-[#1b2433]">{text.slice(at, at + match.length)}</mark>
      {text.slice(at + match.length)}
    </>
  )
}

/** Builds the rows and the "things to ask" purely from the fields the user confirmed in Step 2. */
function buildSummary(fields, t, language) {
  const get = (key) => localizeFieldValue(fields.find((f) => f.key === key)?.value?.trim() || '', language)
  const salary = get('salary')
  const hours = get('hours')
  const rest = get('rest')
  const term = get('term')
  const start = get('start')
  const penalty = get('penalty')
  const perDay = /araw|day/i.test(hours) ? Number(hours.match(/\d+/)?.[0]) : null
  const overHours = perDay > 8
  const missing = t('summary.missing')
  const fromContract = t('summary.fromContract')

  const items = [
    {
      key: 'salary', icon: 'wallet', tone: 'brand', worry: !salary,
      title: t('summary.itemSalary'),
      value: salary || missing,
      detail: salary ? fromContract : t('summary.salaryAsk'),
    },
    {
      key: 'hours', icon: 'sun', tone: 'sun', worry: !hours || overHours,
      title: t('summary.itemHours'),
      value: hours || missing,
      detail: overHours ? t('summary.hoursOver') : hours ? fromContract : t('summary.hoursAsk'),
    },
    {
      key: 'rest', icon: 'home', tone: 'brand', worry: !rest,
      title: t('summary.itemRest'),
      value: rest ? t('summary.restValue', { day: rest }) : missing,
      detail: rest ? t('summary.restDetail') : t('summary.restAsk'),
    },
    {
      key: term ? 'term' : 'start', icon: 'file', tone: 'brand', worry: !term && !start,
      title: t('summary.itemTerm'),
      value: term || missing,
      detail: start ? t('summary.termFrom', { date: start }) : t('summary.termNoStart'),
    },
  ]
  if (penalty) {
    items.push({
      key: 'penalty', icon: 'alert', tone: 'alert', worry: true,
      title: t('summary.itemPenalty'),
      value: penalty,
      detail: t('summary.penaltyDetail'),
      why: t('summary.peekWhyPenalty'),
    })
  }

  const asks = [
    penalty && t('summary.askPenalty'),
    !salary && t('summary.askSalary'),
    overHours && t('summary.askOverHours'),
    !rest && t('summary.askRest'),
    !hours && t('summary.askHours'),
  ].filter(Boolean)

  return { items, asks }
}

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window
const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export default function Summary({ go, doc, confirmed }) {
  const { t, language } = useI18n()
  const [term, setTerm] = useState(null)
  const [speaking, setSpeaking] = useState(false)

  const { items, asks } = useMemo(
    () => (confirmed ? buildSummary(confirmed, t, language) : { items: [], asks: [] }),
    [confirmed, t, language],
  )
  // Terms come from scanning the OCR text of this document. Nothing is shown that isn't in it.
  const terms = useMemo(() => (doc ? findTerms(doc.lines) : []), [doc])

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

  if (!doc || !confirmed) return <NeedsUpload go={go} />

  return (
    <Page>
      <PageHeading centered title={t('summary.title')} text={t('summary.text')}>
        <div className="flex flex-wrap justify-center gap-2.5 print:hidden">
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

      {asks.length > 0 && (
        <Callout title={t('summary.asksTitle', { n: asks.length })} className="mb-6">
          {t('summary.asksText', { list: asks.join(', ') })}
        </Callout>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <ListGroup aria-label={t('summary.title')}>
          {items.map((item, i) => {
            const { icon, tone, worry } = item
            const row = (
              <ListRow
                key={item.title}
                icon={icon}
                tone={tone}
                title={item.title}
                detail={item.detail}
                value={item.value}
                badge={worry ? <Badge tone="alert">{t('summary.askBadge')}</Badge> : null}
                className={worry ? 'bg-alert-soft hover:bg-alert-soft/70' : i === 0 ? 'py-5' : undefined}
              />
            )
            if (!worry) return row
            // Worth-asking rows open a peek at the exact part of the document they came from.
            return (
              <SourcePeek
                key={item.title}
                pages={doc.lines}
                field={confirmed.find((f) => f.key === item.key)}
                title={item.title}
                why={item.why ?? item.detail}
              >
                {row}
              </SourcePeek>
            )
          })}
        </ListGroup>

        <div className="grid gap-4 lg:sticky lg:top-24">
          <Panel className="p-5">
            <h2 className="font-sans text-xl font-bold">{t('summary.termsTitle')}</h2>
            {terms.length > 0 ? (
              <>
                <p className="mt-1 text-subtle">{t('summary.termsHint', { n: terms.length })}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {terms.map((entry, i) => (
                    <Chip key={entry.id} onClick={() => setTerm(i)} className="inline-flex items-center gap-1.5">
                      {entry.name}
                      {entry.count > 1 && (
                        <span className="text-xs text-subtle" aria-label={t('summary.termsCount', { n: entry.count })}>
                          ×{entry.count}
                        </span>
                      )}
                      <span className="text-brand"><Icon name="plus" size={15} /></span>
                    </Chip>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-1 text-subtle">{t('summary.termsNone')}</p>
            )}
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
            <p className="mt-3 text-lg text-subtle">{terms[term].def[language] ?? terms[term].def.English}</p>
            <figure className="mt-5 mb-6 rounded-card bg-surface-2 px-4 py-3">
              <figcaption className="text-xs font-bold text-subtle">
                {t('summary.termsWhere', { page: terms[term].page })}
              </figcaption>
              <blockquote className="mt-1 font-serif text-ink">
                “<Quote text={terms[term].quote} match={terms[term].match} />”
              </blockquote>
            </figure>
            <Button className="w-full" onClick={closeSheet}>
              {t('summary.gotIt')}
            </Button>
          </>
        )}
      </Sheet>
    </Page>
  )
}
