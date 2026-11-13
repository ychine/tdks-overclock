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
import { Paperclip } from 'lucide-react'
import Icon from '../components/Icon'
import Rich from '../components/Rich'
import Button from '../components/ui/Button'
import { Chip } from '../components/ui/Controls'
import { Page } from '../components/ui/Page'
import { Badge, Panel } from '../components/ui/Surfaces'
import { LANGUAGE_TAGS } from '../i18n/messages'
import { useI18n } from '../i18n/useI18n'
import { matchIntent } from '../lib/contractQa'
import { fullText } from '../lib/extract'
import { checkContractFile } from '../lib/files'
import { matchGlossary } from '../lib/glossary'
import { detectWorkerType } from '../lib/workerType'

const stripBold = (text) => text.replaceAll('**', '')
const hasValue = (field) => String(field?.value ?? '').trim() !== ''

// Definitions are the same for everyone, so they use the prewritten answers and cost no credits.
const FIXED_INTENTS = ['quitclaim', 'probationary']

// Before any contract is attached: term questions we can answer without the AI.
const GENERAL_SUGGESTIONS = ['whatQuitclaim', 'whatProbationary', 'whatLiquidated']

// Fields that have a "what does the law say" suggestion, in priority order.
const FIELD_SUGGESTIONS = ['penalty', 'rest', 'hours', 'salary', 'start']

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

export default function Chat({ go, doc, confirmed, onFile }) {
  const { t, language } = useI18n()
  const messages = useBeuiMessages(t)
  // Only a contract that was actually read AND confirmed counts. Without one the chat never
  // claims to have read anything and never calls the AI.
  const hasContract = Boolean(doc && Array.isArray(confirmed) && confirmed.length)
  const docName = doc?.record?.Name || t('chat.basisContract').toLowerCase()
  const fileInput = useRef(null)
  const [thread, setThread] = useState([])
  const [asked, setAsked] = useState([]) // suggestion ids already used
  const [sessionId, setSessionId] = useState(null) // one Lumen conversation per confirmed contract
  const [contract, setContract] = useState(confirmed)
  // Who the contract is for, read from the OCR text: 'kasambahay' | 'ofw' | 'local'. Never asked.
  const workerType = useMemo(() => detectWorkerType(doc ? fullText(doc.lines) : ''), [doc])
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

  const suggestions = useMemo(() => {
    const list = hasContract
      ? buildSuggestions(confirmed, t, workerType)
      : GENERAL_SUGGESTIONS.map((id) => ({ id, text: t(`chat.sugg.${id}`) }))
    return list.filter((s) => !asked.includes(s.id))
  }, [hasContract, confirmed, t, asked, workerType])

  const busy = thread.some((turn) => turn.status === 'loading')
  const update = (id, patch) => setThread((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)))

  // Paperclip: a picked file goes through the same flow as Home/Upload (OCR -> check -> summary).
  const attach = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problem = checkContractFile(file)
    if (problem) {
      const id = nextId.current++
      setThread((list) => [...list, { id, question: file.name, status: 'done', kind: 'fileProblem', problem }])
      return
    }
    onFile(file)
    go('reading')
  }

  const ask = async (text, suggestionId) => {
    const question = text.trim()
    if (!question || busy) return // one question at a time: no double charges
    const id = nextId.current++
    if (suggestionId) setAsked((list) => [...list, suggestionId])

    const intent = matchIntent(question)
    if (FIXED_INTENTS.includes(intent)) {
      setThread((list) => [...list, { id, question, status: 'done', kind: 'fixed', intent }])
      return
    }

    // No contract yet: explain known legal terms for free, otherwise ask for the contract.
    // Nothing is sent to the AI without a contract, so no credits are spent and nothing is guessed.
    if (!hasContract) {
      const entry = matchGlossary(question)
      setThread((list) => [
        ...list,
        entry
          ? { id, question, status: 'done', kind: 'glossary', entry }
          : { id, question, status: 'done', kind: 'needsDoc' },
      ])
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

  const noLawFor = (type) => coverage && coverage[type] === 0

  const retry = (turn) => {
    setThread((list) => list.filter((x) => x.id !== turn.id))
    ask(turn.question)
  }

  const answerText = (turn) => {
    if (turn.kind === 'fixed') return t(`qa.${turn.intent}`)
    if (turn.kind === 'glossary') return `**${turn.entry.name}**: ${turn.entry.def[language] ?? turn.entry.def.English}`
    if (turn.kind === 'needsDoc') return t('chat.needsDoc')
    if (turn.kind === 'fileProblem') return `**${t(`file.${turn.problem}.title`)}** ${t(`file.${turn.problem}.text`)}`
    return turn.text
  }
  const isGeneral = (turn) => turn.kind === 'fixed' || turn.kind === 'glossary'
  const wantsDoc = (turn) => turn.kind === 'needsDoc' || turn.kind === 'fileProblem'
  const attachButton = (
    <>
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={attach}
      />
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={busy}
        aria-label={hasContract ? t('chat.attachNew') : t('chat.attach')}
        title={hasContract ? t('chat.attachNew') : t('chat.attach')}
        className="grid size-11 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-brand-soft hover:text-brand disabled:opacity-50"
      >
        <Paperclip className="size-[18px]" aria-hidden="true" />
      </button>
    </>
  )

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
                      {hasContract ? (
                        <>
                          <p>{t('chat.greetingDoc', { name: docName })}</p>
                          {noLawFor(workerType) && <p className="mt-2 text-sm text-subtle">{t('chat.noLawYet')}</p>}
                        </>
                      ) : (
                        <>
                          <p>{t('chat.greetingNoDoc')}</p>
                          <Button variant="secondary" size="sm" icon="upload" className="mt-3" onClick={() => fileInput.current?.click()}>
                            {t('chat.attachCta')}
                          </Button>
                        </>
                      )}
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
                                {isGeneral(turn) && <p className="mt-2 text-sm text-subtle">{t('chat.generalAnswer')}</p>}
                                {wantsDoc(turn) && (
                                  <Button variant="secondary" size="sm" icon="upload" className="mt-3" onClick={() => fileInput.current?.click()}>
                                    {t('chat.attachCta')}
                                  </Button>
                                )}
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
              disabled={busy}
              onSubmit={(prompt) => ask(prompt)}
              leadingAction={attachButton}
              placeholder={hasContract ? undefined : t('chat.placeholderNoDoc')}
              className="rounded-card border-line shadow-card"
            />
            <p className="mt-2 px-1 text-sm text-subtle">{hasContract ? t('chat.footer') : t('chat.footerNoDoc')}</p>
          </div>
        </Panel>
      </Page>
    </LocaleProvider>
  )
}
