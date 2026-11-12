import { useEffect, useMemo, useRef, useState } from 'react'
import { ApprovalCard } from '@/components/agents/approval-card'
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
import { Checkbox } from '@/components/motion/checkbox'
import { LocaleProvider } from '@/lib/i18n'
import Icon from '../components/Icon'
import Rich from '../components/Rich'
import Button from '../components/ui/Button'
import { Chip } from '../components/ui/Controls'
import { Page } from '../components/ui/Page'
import { Badge, Panel } from '../components/ui/Surfaces'
import { LANGUAGE_TAGS } from '../i18n/messages'
import { useI18n } from '../i18n/useI18n'
import { askContract, STARTER_INTENTS } from '../lib/contractQa'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const stripBold = (text) => text.replaceAll('**', '')

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
      citations: { title: t('chat.sources'), viewCitation: t('chat.viewCitation') },
      approvalCard: {
        title: t('chat.approvalShort'),
        approve: t('chat.approvalYes'),
        reject: t('chat.approvalLater'),
        inputRequired: t('chat.needsYou'),
        approved: t('chat.approved'),
        rejected: t('chat.later'),
      },
      loadingStates: { thinking: t('chat.thinking') },
    }),
    [t],
  )
}

export default function Chat({ go }) {
  const { t, language } = useI18n()
  const messages = useBeuiMessages(t)
  const [thread, setThread] = useState([])
  const [approval, setApproval] = useState('pending')
  const [checked, setChecked] = useState([])
  const [copied, setCopied] = useState(null)
  const nextId = useRef(0)
  const timers = useRef([])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const ask = (text, intent) => {
    const question = text.trim()
    if (!question) return
    const id = nextId.current++
    setThread((list) => [...list, { id, question, answer: askContract(question, intent), ready: false }])
    const delay = reduceMotion() ? 0 : 700
    timers.current.push(
      setTimeout(() => setThread((list) => list.map((turn) => (turn.id === id ? { ...turn, ready: true } : turn))), delay),
    )
  }

  const copy = async (turn) => {
    try {
      await navigator.clipboard.writeText(stripBold(t(`qa.${turn.answer.intent}`)))
      setCopied(turn.id)
      timers.current.push(setTimeout(() => setCopied(null), 1800))
    } catch {
      // clipboard can be unavailable (insecure context); nothing to do
    }
  }

  const last = thread[thread.length - 1]
  const busy = thread.some((turn) => !turn.ready)
  const suggestions = !last ? STARTER_INTENTS : last.ready ? last.answer.followUps : []
  const checklist = t('chat.checklist')

  return (
    <LocaleProvider locale={LANGUAGE_TAGS[language]} messages={messages}>
      <Page narrow className="flex h-[calc(100dvh-68px-76px)] flex-col py-3 md:py-4 lg:h-[calc(100dvh-68px)] lg:py-6">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <h1 className="text-2xl leading-tight font-semibold md:text-4xl">{t('chat.title')}</h1>
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

              {thread.map((turn) => {
                const { source, intent } = turn.answer
                const citationId = `clause-${turn.id}`
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
                        {turn.ready ? (
                          <>
                            <MessageBubble variant="soft">
                              <MessageBubbleContent>
                                <p>
                                  <Rich text={t(`qa.${intent}`)} />
                                  {source && <Citation citationId={citationId} index={1} idPrefix="cite" />}
                                </p>
                              </MessageBubbleContent>
                            </MessageBubble>
                            {source && (
                              <Citations
                                idPrefix="cite"
                                citations={[{ id: citationId, title: source.label, domain: source.quote }]}
                                className="w-full max-w-[82%]"
                              />
                            )}
                            <div className="-ml-2 flex flex-wrap items-center gap-x-1">
                              <Button variant="ghost" size="sm" icon={copied === turn.id ? 'check' : 'file'} onClick={() => copy(turn)}>
                                {copied === turn.id ? t('chat.copied') : t('chat.copy')}
                              </Button>
                              {['fallback', 'help'].includes(intent) && (
                                <Button variant="ghost" size="sm" icon="help" onClick={() => go('help')}>
                                  {t('chat.helpLink')}
                                </Button>
                              )}
                            </div>
                          </>
                        ) : (
                          <MessageBubble variant="ghost">
                            <MessageBubbleContent>
                              <span role="status">
                                <ThinkingShimmer>{t('chat.thinking')}</ThinkingShimmer>
                              </span>
                            </MessageBubbleContent>
                          </MessageBubble>
                        )}
                      </MessageContent>
                    </Message>
                  </div>
                )
              })}

              {approval !== 'later' && (
                <Message from="assistant">
                  <Avatar />
                  <MessageContent>
                    <ApprovalCard
                      status={approval}
                      description={`${t('chat.approvalTitle')} ${t('chat.approvalText')}`}
                      onApprove={() => setApproval('approved')}
                      onReject={() => setApproval('rejected')}
                      result={approval === 'approved' ? t('chat.checklistDone') : undefined}
                    >
                      {null}
                    </ApprovalCard>
                    {approval === 'approved' && (
                      <fieldset className="mt-3 w-full rounded-card border border-line bg-surface px-3 py-2">
                        <legend className="px-1.5 font-bold">{t('chat.checklistTitle')}</legend>
                        <ul className="divide-y divide-line">
                          {checklist.map((item, i) => (
                            <li key={item}>
                              <Checkbox
                                checked={checked.includes(i)}
                                onCheckedChange={(on) =>
                                  setChecked((list) => (on ? [...list, i] : list.filter((n) => n !== i)))
                                }
                                label={item}
                                className="min-h-14 w-full py-2"
                              />
                            </li>
                          ))}
                        </ul>
                      </fieldset>
                    )}
                  </MessageContent>
                </Message>
              )}
            </MessageGroup>
          </MessageScroller>

          <div className="border-t border-line bg-surface-2/50 px-3 pt-3 pb-3 md:px-4">
            {suggestions.length > 0 && (
              <div className="scrollbar-hide -mx-3 mb-2.5 flex gap-2 overflow-x-auto px-3 md:mx-0 md:flex-wrap md:px-0">
                {suggestions.map((id) => (
                  <Chip key={id} onClick={() => ask(t(`q.${id}`), id)}>
                    {t(`q.${id}`)}
                  </Chip>
                ))}
              </div>
            )}
            <PromptInput minRows={2} maxRows={4} onSubmit={(prompt) => ask(prompt)} className="rounded-card border-line shadow-card" />
            <p className="mt-2 px-1 text-sm text-subtle">{t('chat.footer')}</p>
          </div>
        </Panel>
      </Page>
    </LocaleProvider>
  )
}
