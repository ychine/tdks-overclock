import Button from '../components/Button'
import Icon from '../components/Icon'
import useCountUp from '../hooks/useCountUp'

const rows = [
  ['Gross pay', '₱18,000'],
  ['SSS', '− ₱900'],
  ['PhilHealth', '− ₱270'],
  ['Pag-IBIG', '− ₱90'],
]

const TAKE_HOME = 16740
const peso = (n) => `₱${n.toLocaleString('en-PH')}`

export default function Salary({ go }) {
  const counted = useCountUp(TAKE_HOME)
  return (
    <div className="page narrow-page salary-page">
      <div className="page-heading">
        <h1>Saan napupunta ang sahod?</h1>
        <p>Estimate ito base sa nakasulat sa kontrata.</p>
      </div>
      <div className="take-home card">
        <span>Estimated take-home pay</span>
        <strong aria-label={peso(TAKE_HOME)}>{peso(counted)}</strong>
        <p>kada buwan</p>
        <div className="pay-bar" aria-hidden="true">
          <span style={{ width: '93%' }} />
        </div>
        <small>93% ng gross pay ang maiuuwi mo</small>
      </div>
      <div className="salary-table card">
        {rows.map((r, i) => (
          <div className={i > 0 ? 'deduction' : ''} key={r[0]}>
            <span>
              {r[0]}
              {i > 0 && <small> mandatory</small>}
            </span>
            <strong>{r[1]}</strong>
          </div>
        ))}
        <div className="net">
          <span>Net pay</span>
          <strong>{peso(TAKE_HOME)}</strong>
        </div>
      </div>
      <div className="thirteenth card">
        <div className="thirteen-icon" aria-hidden="true">
          13
        </div>
        <div>
          <span>Estimated 13th month pay</span>
          <strong>₱18,000</strong>
          <p>Kung nakumpleto mo ang 12 buwan</p>
        </div>
      </div>
      <div className="formula-note">
        <Icon name="check" size={18} />
        <span>Kinuwenta ito gamit ang formula, hindi ng AI.</span>
      </div>
      <Button variant="secondary" icon="chat" onClick={() => go('chat')}>
        May tanong tungkol sa sahod
      </Button>
    </div>
  )
}
