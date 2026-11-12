import { useEffect, useMemo, useRef, useState } from 'react'
import { Citation, Citations } from '@/components/agents/citations'
import { ThinkingShimmer } from '@/components/agents/loading-states/thinking-shimmer'
import {
  Message,
  MessageAvatar,
  MessageBubble,
  MessageBubbleContent,
  MessageContent,
  MessageGroup,
  MessageScroller,
} from '@/components/agents/message'
import { PromptInput } from '@/components/agents/prompt-input'
import { LocaleProvider } from '@/lib/i18n'
import { askChat, getCoverage, openChat } from '../api/chat'
import Icon from '../components/Icon'
import NeedsUpload from '../components/NeedsUpload'
import Rich from '../components/Rich'
import Button from '../components/ui/Button'
import { Chip } from '../components/ui/Controls'
import { Page } from '../components/ui/Page'
import { Badge, Panel } from '../components/ui/Surfaces'
import { LANGUAGE_TAGS } from '../i18n/messages'
import { useI18n } from '../i18n/useI18n'
import { matchIntent } from '../lib/contractQa'

const stripBold = (text) => text.replaceAll('**', '')
const hasValue = (field) => String(field?.value ?? '').trim() !== ''

// Definitions are the same for everyone, so they use the prewritten answers and cost no credits.
const FIXED_INTENTS = ['quitclaim', 'probationary']

// Fields that have a "what does the law say" suggestion, in priority order.
const FIELD_SUGGESTIONS = ['penalty', 'rest', 'hours', 'salary', 'start']

// Which law applies depends on who the worker is, so the user picks this before asking.
const WORKER_TYPES = ['kasambahay', 'ofw', 'local']

/**
 * Suggestions come from the user's own confirmed fields (no AI):
 * missing fields first, then fields the law file covers, then the "before signing" question.
 */
function buildSuggestions(confirmed, t, workerType) {
  const list = []
  for (const field of confirmed) {
    if (!hasValue(field)) {
      list.push({
        id: `missing-${field.key}`,
        text: t('chat.sugg.missing', { label: t(`review.${field.key}`).toLowerCase() }),
      })
    }
  }
  for (const key of FIELD_SUGGESTIONS) {
    // The SSS/PhilHealth/Pag-IBIG timing rule we have verified is the kasambahay one.
    if (key === 'start' && workerType !== 'kasambahay') continue
    if (hasValue(confirmed.find((f) => f.key === key))) list.push({ id: key, text: t(`chat.sugg.${key}`) })
  }
  return [...list.slice(0, 3), { id: 'checklist', text: t('chat.sugg.checklist') }]
}

function Avatar() {
  return (
    <MessageAvatar className="mt-0.5 size-9 bg-sun text-[#1b2433] [&_svg]:size-[18px]">
      <Icon name="sun" size={18} />
    </MessageAvatar>
  )
}

/** Reads the already-translated Linaw strings into the namespaces beUI components expect. */
function useBeuiMessages(t) {
  return useMemo(
    () => ({
      promptInput: {
        placeholder: t('chat.placeholder'),
        label: t('chat.inputAria'),
        send: t('chat.send'),
        stop: t('chat.stop'),
      },
      message: {
        user: t('chat.messageUser'),
        assistant: t('chat.messageAssistant'),
        typing: t('chat.responding'),
      },
      messageScroller: { label: t('chat.transcript') },
      citations: { title: t('chat.basis'), viewCitation: t('chat.viewCitation') },
      loadingStates: { thinking: t('chat.thinking') },
    }),
    [t],
  )
}

export default function Chat({ go, confirmed }) {
  const { t, language } = useI18n()
  const messages = useBeuiMessages(t)
  const [thread, setThread] = useState([])
  const [asked, setAsked] = useState([]) // suggestion ids already used
  const [sessionId, setSessionId] = useState(null) // one Lumen conversation per confirmed contract
  const [contract, setContract] = useState(confirmed)
  const [workerType, setWorkerType] = useState(null) // 'kasambahay' | 'ofw' | 'local'
  const [coverage, setCoverage] = useState(null) // verified law entries per worker type
  const [copied, setCopied] = useState(null)
  const nextId = useRef(0)
  const timers = useRef([])

  // A newly confirmed contract starts a fresh conversation (React's "reset state on prop change" pattern).
  if (contract !== confirmed) {
    setContract(confirmed)
    setThread([])
    setAsked([])
    setSessionId(null)
    setWorkerType(null)
  }

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    let alive = true
    getCoverage().then((c) => alive && setCoverage(c))
    return () => {
      alive = false
    }
  }, [])

  const suggestions = useMemo(
    () => (confirmed && workerType ? buildSuggestions(confirmed, t, workerType).filter((s) => !asked.includes(s.id)) : []),
    [confirmed, t, asked, workerType],
  )

  // Chat only exists for a confirmed contract. No upload -> no AI call, no credits.
  if (!confirmed) return <NeedsUpload go={go} />

  const busy = thread.some((turn) => turn.status === 'loading')
  const update = (id, patch) => setThread((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)))

  const ask = async (text, suggestionId) => {
    const question = text.trim()
    if (!question || busy || !workerType) return // one question at a time: no double charges
    const id = nextId.current++
    if (suggestionId) setAsked((list) => [...list, suggestionId])

    const intent = matchIntent(question)
    if (FIXED_INTENTS.includes(intent)) {
      setThread((list) => [...list, { id, question, status: 'done', kind: 'fixed', intent }])
      return
    }

    setThread((list) => [...list, { id, question, status: 'loading' }])
    try {
      let sid = sessionId
      if (!sid) {
        sid = await openChat()
        setSessionId(sid)
      }
      const reply = await askChat(sid, { question, fields: confirmed, language, workerType })
      update(id, {
        status: 'done',
        kind: 'ai',
        text: reply.answer,
        citations: reply.citations,
        degraded: reply.degraded,
        noLaw: reply.lawAvailable === false,
      })
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') setSessionId(null) // the retry opens a new conversation
      update(id, { status: 'error', code: err.code, retryable: err.retryable })
    }
  }

  // Switching worker type means different law, so start a clean conversation.
  const chooseWorker = (type) => {
    setWorkerType(type)
    setThread([])
    setAsked([])
    setSessionId(null)
  }
  const noLawFor = (type) => coverage && coverage[type] === 0

  const retry = (turn) => {
    setThread((list) => list.filter((x) => x.id !== turn.id))
    ask(turn.question)
  }

  const answerText = (turn) => (turn.kind === 'fixed' ? t(`qa.${turn.intent}`) : turn.text)

  const copy = async (turn) => {
    try {
      await navigator.clipboard.writeText(stripBold(answerText(turn)))
      setCopied(turn.id)
      timers.current.push(setTimeout(() => setCopied(null), 1800))
    } catch {
      // clipboard can be unavailable (insecure context); nothing to do
    }
  }

  const citationItems = (turn) =>
    (turn.citations ?? []).map((c) => ({
      id: `${turn.id}-${c.type}-${c.id}`,
      title: c.type === 'contract' ? `${t('chat.basisContract')} · ${t(`review.${c.id}`)}` : c.label,
      domain: c.text,
    }))

  return (
    <LocaleProvider locale={LANGUAGE_TAGS[language]} messages={messages}>
      <Page narrow className="flex h-[calc(100dvh-74px-76px)] flex-col py-3 md:py-4 lg:h-[calc(100dvh-74px)] lg:py-6">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go('home')}
              aria-label={t('app.backHome')}
              className="grid size-11 shrink-0 place-items-center rounded-btn text-brand transition-colors hover:bg-brand-soft"
            >
              <span className="-scale-x-100" aria-hidden="true">
                <Icon name="arrow" size={20} />
              </span>
            </button>
            <h1 className="text-2xl leading-tight font-semibold md:text-4xl">{t('chat.title')}</h1>
          </div>
          <Badge tone="ok" className="hidden shrink-0 md:inline-flex">
            <i className="size-1.5 rounded-full bg-ok" /> {t('chat.online')}
          </Badge>
        </div>

        <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MessageScroller className="min-h-0 flex-1" busy={busy} viewportClassName="px-4 py-5 md:px-6" contentClassName="gap-5">
            <MessageGroup spacing="loose">
              <Message from="assistant">
                <Avatar />
                <MessageContent>
                  <MessageBubble variant="soft">
                    <MessageBubbleContent>
                      <p>{t('chat.greeting')}</p>
                    </MessageBubbleContent>
                  </MessageBubble>
                </MessageContent>
              </Message>

              <Message from="assistant">
                <Avatar />
                <MessageContent>
                  <MessageBubble variant="soft">
                    <MessageBubbleContent>
                      <p className="font-semibold">{t('chat.workerQ')}</p>
                      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t('chat.workerQ')}>
                        {WORKER_TYPES.map((type) => (
                          <Chip
                            key={type}
                            aria-pressed={workerType === type}
                            disabled={busy}
                            className={workerType === type ? 'border-brand bg-brand-soft' : undefined}
                            onClick={() => chooseWorker(type)}
                          >
                            {workerType === type ? '✓ ' : ''}
                            {t(`chat.worker.${type}`)}
                          </Chip>
                        ))}
                      </div>
                      {workerType && noLawFor(workerType) && <p className="mt-2 text-sm text-subtle">{t('chat.noLawYet')}</p>}
                    </MessageBubbleContent>
                  </MessageBubble>
                </MessageContent>
              </Message>

              {thread.map((turn) => {
                const items = citationItems(turn)
                const prefix = `cite-${turn.id}`
                return (
                  <div key={turn.id} className="grid gap-4">
                    <Message from="user" animateIn>
                      <MessageContent>
                        <MessageBubble variant="solid" animateIn>
                          <MessageBubbleContent>{turn.question}</MessageBubbleContent>
                        </MessageBubble>
                      </MessageContent>
                    </Message>
                    <Message from="assistant" animateIn>
                      <Avatar />
                      <MessageContent>
                        {turn.status === 'loading' && (
                          <MessageBubble variant="ghost">
                            <MessageBubbleContent>
                              <span role="status">
                                <ThinkingShimmer>{t('chat.thinking')}</ThinkingShimmer>
                              </span>
                            </MessageBubbleContent>
                          </MessageBubble>
                        )}

                        {turn.status === 'error' && (
                          <MessageBubble variant="soft">
                            <MessageBubbleContent>
                              <p role="alert">{t(`chat.err.${turn.code}`) === `chat.err.${turn.code}` ? t('chat.err.AI_UNAVAILABLE') : t(`chat.err.${turn.code}`)}</p>
                              {turn.retryable && (
                                <Button variant="ghost" size="sm" icon="arrow" className="-ml-2 mt-1" disabled={busy} onClick={() => retry(turn)}>
                                  {t('chat.retry')}
                                </Button>
                              )}
                            </MessageBubbleContent>
                          </MessageBubble>
                        )}

                        {turn.status === 'done' && (
                          <>
                            <MessageBubble variant="soft">
                              <MessageBubbleContent>
                                {/* Rich renders plain text plus **bold**: model output can never inject HTML. */}
                                <p className="whitespace-pre-line">
                                  <Rich text={answerText(turn)} />
                                  {items.map((c, i) => (
                                    <Citation key={c.id} citationId={c.id} index={i + 1} idPrefix={prefix} />
                                  ))}
                                </p>
                                {turn.kind === 'fixed' && <p className="mt-2 text-sm text-subtle">{t('chat.generalAnswer')}</p>}
                                {turn.degraded && <p className="mt-2 text-sm text-subtle">{t('chat.degraded')}</p>}
                                {turn.noLaw && <p className="mt-2 text-sm text-subtle">{t('chat.noLawYet')}</p>}
                              </MessageBubbleContent>
                            </MessageBubble>
                            {items.length > 0 && (
                              <Citations idPrefix={prefix} title={t('chat.basis')} citations={items} className="w-full max-w-[82%]" />
                            )}
                            <div className="-ml-2 flex flex-wrap items-center gap-x-1">
                              <Button variant="ghost" size="sm" icon={copied === turn.id ? 'check' : 'file'} onClick={() => copy(turn)}>
                                {copied === turn.id ? t('chat.copied') : t('chat.copy')}
                              </Button>
                              <Button variant="ghost" size="sm" icon="help" onClick={() => go('help')}>
                                {t('chat.helpLink')}
                              </Button>
                            </div>
                          </>
                        )}
                      </MessageContent>
                    </Message>
                  </div>
                )
              })}
            </MessageGroup>
          </MessageScroller>

          <div className="border-t border-line bg-surface-2/50 px-3 pt-3 pb-3 md:px-4">
            {suggestions.length > 0 && !busy && (
              <div className="scrollbar-hide -mx-3 mb-2.5 flex gap-2 overflow-x-auto px-3 md:mx-0 md:flex-wrap md:px-0">
                {suggestions.map((s) => (
                  <Chip key={s.id} onClick={() => ask(s.text, s.id)}>
                    {s.text}
                  </Chip>
                ))}
              </div>
            )}
            <PromptInput
              minRows={2}
              maxRows={4}
              disabled={busy || !workerType}
              placeholder={workerType ? undefined : t('chat.workerFirst')}
              onSubmit={(prompt) => ask(prompt)}
              className="rounded-card border-line shadow-card"
            />
            <p className="mt-2 px-1 text-sm text-subtle">{t('chat.footer')}</p>
          </div>
        </Panel>
      </Page>
    </LocaleProvider>
  )
}
