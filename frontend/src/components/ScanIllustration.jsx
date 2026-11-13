import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/*
 * A looping, low-detail version of the Review screen's document highlight.
 * A simple page; a scan line sweeps it; the same blue "located" box we draw on the real document
 * hops between three fields (pay, hours, rest day), and the last one turns yellow ("please check"),
 * matching OriginalView's located / uncertain styles. Purely decorative: aria-hidden.
 */

const PERIOD = 6 // seconds for one full loop

// Three highlight targets in viewBox units: [x, y, width, height].
const TARGETS = [
  [102, 110, 66, 22],
  [102, 170, 76, 22],
  [102, 220, 58, 22],
]

// Each target is held for most of its third, then the box glides to the next.
const TIMES = [0, 0.05, 0.28, 0.38, 0.61, 0.71, 0.94, 1]
const at = (i) => [TARGETS[2][i], TARGETS[0][i], TARGETS[0][i], TARGETS[1][i], TARGETS[1][i], TARGETS[2][i], TARGETS[2][i], TARGETS[2][i]]

const BLUE = { fill: '#eaf1ff', stroke: '#0038a8' }
const YELLOW = { fill: '#fff8cf', stroke: '#d2a900' }
const colorKeys = (k) => [YELLOW[k], BLUE[k], BLUE[k], BLUE[k], BLUE[k], YELLOW[k], YELLOW[k], YELLOW[k]]

const loop = { duration: PERIOD, times: TIMES, ease: 'easeInOut', repeat: Infinity }

// Text lines on the page: [x, y, width, tone]. 'ink' is a heading/label, 'line' is body copy.
const LINES = [
  [36, 46, 92, 'ink', 9],
  [36, 70, 136, 'line'],
  [36, 82, 122, 'line'],
  [36, 94, 130, 'line'],
  [36, 118, 44, 'ink'],
  [110, 118, 50, 'value'],
  [36, 146, 134, 'line'],
  [36, 158, 112, 'line'],
  [36, 178, 40, 'ink'],
  [110, 178, 60, 'value'],
  [36, 204, 126, 'line'],
  [36, 228, 48, 'ink'],
  [110, 228, 42, 'value'],
]

export default function ScanIllustration({ className }) {
  const reduce = useReducedMotion() ?? false
  const [x0, y0, w0, h0] = TARGETS[0]

  return (
    <svg viewBox="0 0 240 290" aria-hidden="true" className={cn('h-auto w-full max-w-[260px]', className)}>
      <defs>
        <linearGradient id="scan-glow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0038a8" stopOpacity="0" />
          <stop offset="1" stopColor="#0038a8" stopOpacity="0.18" />
        </linearGradient>
        <clipPath id="scan-page">
          <rect x="20" y="20" width="176" height="244" rx="12" />
        </clipPath>
      </defs>

      {/* back sheet, for a sense of "more than one page" */}
      <rect x="32" y="30" width="176" height="244" rx="12" className="fill-surface-2 stroke-line" strokeWidth="1.5" />
      {/* page */}
      <rect x="20" y="20" width="176" height="244" rx="12" className="fill-surface stroke-line" strokeWidth="1.5" />

      {/* the highlight box sits under the text, like a marker */}
      {reduce ? (
        <rect x={x0} y={y0} width={w0} height={h0} rx="5" fill={BLUE.fill} stroke={BLUE.stroke} strokeWidth="2.5" />
      ) : (
        <motion.rect
          rx="5"
          strokeWidth="2.5"
          initial={false}
          animate={{ x: at(0), y: at(1), width: at(2), height: at(3), fill: colorKeys('fill'), stroke: colorKeys('stroke') }}
          transition={loop}
        />
      )}

      {LINES.map(([x, y, w, tone, h = 6]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={tone === 'value' ? 8 : h}
          rx={h / 2}
          className={tone === 'line' ? 'fill-line' : 'fill-ink'}
          opacity={tone === 'ink' ? 0.55 : tone === 'value' ? 0.85 : 1}
        />
      ))}

      {/* "found" ticks beside each field, lighting up in turn */}
      {TARGETS.map(([x, y, w, h], i) => (
        <motion.g
          key={i}
          initial={false}
          animate={reduce ? { opacity: i === 0 ? 1 : 0.25 } : { opacity: i === 2 ? [0.2, 0.2, 0.2, 0.2, 0.2, 1, 1, 0.2] : i === 1 ? [0.2, 0.2, 0.2, 1, 1, 0.2, 0.2, 0.2] : [0.2, 1, 1, 0.2, 0.2, 0.2, 0.2, 0.2] }}
          transition={reduce ? undefined : loop}
        >
          <circle cx={x + w + 14} cy={y + h / 2} r="7" fill={i === 2 ? YELLOW.stroke : BLUE.stroke} />
          {i === 2 ? (
            <g fill="#1b2433"><rect x={x + w + 13} y={y + h / 2 - 4.5} width="2" height="5" rx="1" /><circle cx={x + w + 14} cy={y + h / 2 + 3} r="1.1" /></g>
          ) : (
            <path
              d={`M${x + w + 10.5} ${y + h / 2} l2.5 2.5 l4.5 -5`}
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </motion.g>
      ))}

      {/* scan line with a soft trailing glow */}
      {!reduce && (
        <g clipPath="url(#scan-page)">
          <motion.g initial={{ y: 0 }} animate={{ y: [0, 236] }} transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}>
            <rect x="20" y="0" width="176" height="28" fill="url(#scan-glow)" />
            <rect x="24" y="27" width="168" height="2" rx="1" fill="#0038a8" />
          </motion.g>
        </g>
      )}
    </svg>
  )
}
