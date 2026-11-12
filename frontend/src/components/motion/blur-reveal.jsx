"use client"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

/** Marker underline: two quick uniform strokes, like someone underlining a word to stress it. */
function BrushUnderline({ delay = 0, animate = true }) {
  const stroke = {
    fill: "none",
    stroke: "var(--sun)",
    strokeWidth: 6,
    strokeLinecap: "round",
    vectorEffect: "non-scaling-stroke",
  }
  // Round caps render as dots at pathLength 0, so each stroke stays invisible until it starts drawing.
  const draw = ({ delay: d }) =>
    animate
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: d },
            opacity: { duration: 0.01, delay: d },
          },
        }
      : {}
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 24"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 -bottom-[0.26em] -z-10 h-[0.4em] w-full overflow-visible"
    >
      <motion.path d="M3 9C55 5 125 4 197 7" {...stroke} {...draw({ delay })} />
      <motion.path d="M22 19C80 16 135 15 178 17" {...stroke} {...draw({ delay: delay + 0.28 })} />
    </svg>
  )
}
export function BlurReveal({
  children,
  className,
  delay = 0,
  speedReveal = 1.5,
  speedSegment = 0.5,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  as = "p",
  style,
  inView = false,
  once = true,
  letterSpacing,
  underlineLast = false,
  underlineDelay,
}) {
  const reduce = useReducedMotion() ?? false
  const MotionTag = motion[as] ?? motion.p

  if (reduce) {
    const words = underlineLast ? children.split(" ") : null
    return (
      <MotionTag className={className} style={style}>
        {words ? (
          <>
            {words.slice(0, -1).join(" ")}{" "}
            <span className="relative isolate inline-block">
              {words.at(-1)}
              <BrushUnderline animate={false} />
            </span>
          </>
        ) : (
          children
        )}
      </MotionTag>
    )
  }

  const stagger = 0.03 / speedReveal
  const baseDuration = 0.3 / speedSegment

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
    exit: {
      transition: {
        staggerChildren: stagger,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, filter: "blur(12px)", y: 10 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: baseDuration,
      },
    },
    exit: { opacity: 0, filter: "blur(12px)", y: 10 },
  }

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <MotionTag
          initial="hidden"
          whileInView={inView ? "visible" : undefined}
          animate={inView ? undefined : "visible"}
          exit="exit"
          variants={containerVariants}
          viewport={{ once }}
          className={cn(className)}
          onAnimationComplete={onAnimationComplete}
          onAnimationStart={onAnimationStart}
          style={style}
        >
          <span className="sr-only">{children}</span>
          {children &&
            children.split(" ").map((word, wordIndex, wordsArray) => (
              <span
                key={`word-${wordIndex}`}
                className={cn("inline-block whitespace-nowrap", underlineLast && wordIndex === wordsArray.length - 1 && "relative isolate")}
                aria-hidden="true"
              >
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={`char-${wordIndex}-${charIndex}`}
                    variants={itemVariants}
                    className="inline-block"
                    style={letterSpacing ? { marginRight: letterSpacing } : undefined}
                  >
                    {char}
                  </motion.span>
                ))}
                {underlineLast && wordIndex === wordsArray.length - 1 && (
                  <BrushUnderline delay={underlineDelay ?? delay + 1.2} />
                )}
                {wordIndex < wordsArray.length - 1 && (
                  <motion.span
                    key={`space-${wordIndex}`}
                    variants={itemVariants}
                    className="inline-block"
                  >
                    &nbsp;
                  </motion.span>
                )}
              </span>
            ))}
        </MotionTag>
      )}
    </AnimatePresence>
  )
}
