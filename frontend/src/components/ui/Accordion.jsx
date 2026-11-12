import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { AgentDisclosure } from '@/components/agents/agent-disclosure'
import { SPRING_SWAP } from '@/lib/ease'
import { cn } from '@/lib/utils'
import Icon from '../Icon'

/** ROLE: collapsible Q&A. One panel open at a time; Motion handles the reveal and the plus→cross. */
export default function Accordion({ items, className }) {
  const base = useId()
  const [openIndex, setOpenIndex] = useState(null)
  return (
    <div className={cn('divide-y divide-line overflow-hidden rounded-card border border-line bg-surface', className)}>
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${base}-${i}`}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold transition-colors hover:bg-surface-2"
              >
                {item.q}
                <motion.span
                  aria-hidden="true"
                  className="shrink-0 text-brand"
                  animate={{ rotate: open ? 45 : 0 }}
                  transition={SPRING_SWAP}
                >
                  <Icon name="plus" size={20} />
                </motion.span>
              </button>
            </h3>
            <AgentDisclosure open={open} id={`${base}-${i}`} role="region">
              <p className="px-5 pb-5 text-subtle">{item.a}</p>
            </AgentDisclosure>
          </div>
        )
      })}
    </div>
  )
}
