import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { AgentDisclosure } from '@/components/agents/agent-disclosure'
import { SPRING_SWAP } from '@/lib/ease'
import { cn } from '@/lib/utils'
import Icon from '../Icon'

/**
 * ROLE: collapsible Q&A. One panel open at a time; Motion handles the reveal and the plus→cross.
 * Items: { q, a, short?, points? }. `short` leads the answer in ink so the reply is readable at a glance;
 * `a` explains, and `points` lists concrete steps or facts.
 */
export default function Accordion({ items, defaultOpen = null, shortLabel, className }) {
  const base = useId()
  const [openIndex, setOpenIndex] = useState(defaultOpen)
  return (
    <div className={cn('border-t border-line', className)}>
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div
            key={item.q}
            className={cn('border-b border-line transition-colors duration-200', open && 'bg-surface')}
          >
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${base}-${i}`}
                id={`${base}-${i}-q`}
                onClick={() => setOpenIndex(open ? null : i)}
                className="group flex min-h-16 w-full items-center justify-between gap-5 px-1 py-5 text-left text-lg leading-snug font-bold text-ink sm:px-5"
              >
                <span className="text-balance transition-colors group-hover:text-brand">{item.q}</span>
                <motion.span
                  aria-hidden="true"
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-200',
                    open
                      ? 'border-brand bg-brand text-on-solid'
                      : 'border-line bg-surface text-brand group-hover:border-brand/50 group-hover:bg-brand-soft',
                  )}
                  animate={{ rotate: open ? 45 : 0 }}
                  transition={SPRING_SWAP}
                >
                  <Icon name="plus" size={18} />
                </motion.span>
              </button>
            </h3>
            <AgentDisclosure open={open} id={`${base}-${i}`} role="region" aria-labelledby={`${base}-${i}-q`}>
              <div className="grid max-w-[65ch] gap-3 px-1 pb-6 sm:px-5 sm:pr-16">
                {item.short && (
                  <p className="text-lg leading-snug font-semibold text-ink">
                    {shortLabel && <span className="sr-only">{shortLabel}: </span>}
                    {item.short}
                  </p>
                )}
                <p className="text-subtle">{item.a}</p>
                {item.points?.length > 0 && (
                  <ul className="mt-1 grid gap-2.5">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                          <Icon name="check" size={14} />
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </AgentDisclosure>
          </div>
        )
      })}
    </div>
  )
}
