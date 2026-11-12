// `active` is the index of the selected field in the Review screen:
// 0 sahod · 1 start date · 2 haba · 3 oras · 4 day off
export default function DocumentMock({ active }) {
  const uncertain = active === 3
  return (
    <div className="document-mock">
      <div className="doc-paper">
        <div className="doc-logo">EMPLOYMENT AGREEMENT</div>
        <p>
          This Agreement is entered into between Maria D. Santos (“Employee”) and ABC Household.
        </p>
        <p className={active === 0 ? 'located' : ''}>
          <b>1. COMPENSATION.</b> The Employee shall receive <mark>PHP 18,000 per month</mark>,
          payable every 15th and 30th.
        </p>
        <p className={active === 1 || active === 2 ? 'located' : ''}>
          <b>2. TERM.</b> Employment starts on <mark>15 June 2025</mark> and will continue for two
          (2) years.
        </p>
        <p className={uncertain ? 'located uncertain' : ''}>
          <b>3. HOURS.</b> The Employee shall work <mark>8 hours per day</mark>, six days each week.
        </p>
        <p className={active === 4 ? 'located' : ''}>
          <b>4. REST DAY.</b> The weekly rest day shall be Sunday.
        </p>
        <p className="tiny-lines">Signed by the parties on the date stated above.</p>
        <div className="signatures">
          <span>Employer</span>
          <span>Employee</span>
        </div>
      </div>
      <span className="page-count">Page 1 of 4</span>
    </div>
  )
}
