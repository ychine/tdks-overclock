import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { EASE_OUT } from '@/lib/ease'
import Icon from '../components/Icon'
import Button from '../components/ui/Button'
import { Field } from '../components/ui/Controls'
import { Page, PageHeading } from '../components/ui/Page'
import { Card, IconTile, ListGroup, Panel } from '../components/ui/Surfaces'
import { useI18n } from '../i18n/useI18n'
import { contract, peso } from '../lib/contract'
import { localizeFieldValue } from '../lib/extract'
import { computeDeductions, parseSalary } from '../lib/payroll'

/** Starting salary: the one confirmed in Step 2 when it is monthly, otherwise the sample. */
function initialSalary(confirmed) {
  const raw = confirmed?.find((f) => f.key === 'salary')?.value
  const parsed = parseSalary(raw)
  if (parsed?.monthly) return { amount: parsed.amount, source: 'contract', raw }
  if (parsed) return { amount: contract.salary, source: 'notMonthly', raw }
  return { amount: contract.salary, source: 'sample', raw: null }
}

/** Counts the take-home figure up with a Motion value (no re-render per frame). */
function CountUp({ value }) {
  const reduce = useReducedMotion()
  const motionValue = useMotionValue(reduce ? value : 0)
  const text = useTransform(motionValue, (v) => peso(Math.round(v)))

  useEffect(() => {
    if (reduce) {
      motionValue.set(value)
      return undefined
    }
    const controls = animate(motionValue, value, { duration: 1.1, ease: EASE_OUT })
    return () => controls.stop()
  }, [value, reduce, motionValue])

  return <motion.strong aria-label={peso(value)} className="block font-display text-6xl font-semibold tabular-nums">{text}</motion.strong>
}

export default function Salary({ go, confirmed }) {
  const { t, language } = useI18n()
  const [start] = useState(() => initialSalary(confirmed))
  const [input, setInput] = useState(String(start.amount))

  const gross = Number(input.replace(/[^\d.]/g, '')) || 0
  const pay = computeDeductions(gross)
  const deductions = [
    { label: t('salary.sss'), amount: pay.sss },
    { label: t('salary.philhealth'), amount: pay.philhealth },
    { label: t('salary.pagibig'), amount: pay.pagibig },
  ]
  const sourceNote =
    start.source === 'contract'
      ? t('salary.fromContract')
      : start.source === 'notMonthly'
        ? t('salary.notMonthly', { value: localizeFieldValue(start.raw, language) })
        : t('salary.sample')

  return (
    <Page>
      <PageHeading centered title={t('salary.title')} text={t('salary.text')} />

      <div className="mb-6 max-w-sm">
        <Field
          label={t('salary.grossInput')}
          id="gross-pay"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <p className="mt-1.5 text-sm text-subtle">{sourceNote}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        <div className="grid gap-4">
          <Panel className="border-transparent bg-brand p-7 text-on-solid">
            <span className="text-sm font-semibold opacity-90">{t('salary.takeHome')}</span>
            <div className="mt-2">
              <CountUp value={pay.net} />
            </div>
            <p className="opacity-90">{t('salary.perMonth')}</p>
            <div aria-hidden="true" className="mt-6 mb-2 h-2 overflow-hidden rounded-full bg-on-solid/25">
              <motion.span
                className="block h-full origin-left rounded-full bg-sun"
                style={{ width: `${pay.takeHomePercent}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }}
              />
            </div>
            <small className="text-sm opacity-90">{t('salary.pct', { pct: pay.takeHomePercent })}</small>
          </Panel>

          <ListGroup>
            <li className="flex min-h-14 items-center justify-between px-5">
              <span>{t('salary.gross')}</span>
              <strong className="tabular-nums">{peso(gross)}</strong>
            </li>
            {deductions.map((row) => (
              <li key={row.label} className="flex min-h-14 items-center justify-between px-5">
                <span className="flex items-center gap-2">
                  {row.label}
                  <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs text-subtle">{t('salary.mandatory')}</span>
                </span>
                <strong className="shrink-0 whitespace-nowrap text-alert tabular-nums">−{'\u00a0'}{peso(row.amount)}</strong>
              </li>
            ))}
            <li className="flex min-h-16 items-center justify-between bg-brand-soft/60 px-5 text-lg">
              <span className="font-semibold">{t('salary.net')}</span>
              <strong className="text-brand tabular-nums">{peso(pay.net)}</strong>
            </li>
          </ListGroup>
        </div>

        <div className="grid gap-4">
          <Card className="flex items-center gap-4 p-5">
            <IconTile icon="wallet" tone="brand" className="size-14 rounded-2xl" size={24} />
            <div>
              <span className="text-sm text-subtle">{t('salary.payday')}</span>
              <strong className="block text-2xl tabular-nums">{peso(pay.perPayday)}</strong>
              <p className="text-sm text-subtle">{t('salary.paydayNote')}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun font-display text-2xl font-semibold text-[#1b2433]">
              13
            </span>
            <div>
              <span className="text-sm text-subtle">{t('salary.thirteenth')}</span>
              <strong className="block text-2xl tabular-nums">{peso(gross)}</strong>
              <p className="text-sm text-subtle">{t('salary.thirteenthNote')}</p>
            </div>
          </Card>
          <p className="flex items-start gap-2 px-1 text-sm text-subtle">
            <span className="mt-0.5 shrink-0 text-ok"><Icon name="check" size={18} /></span>
            {t('salary.formula')}
          </p>
          <Button variant="secondary" icon="chat" onClick={() => go('chat')}>
            {t('salary.ask')}
          </Button>
        </div>
      </div>
    </Page>
  )
}
