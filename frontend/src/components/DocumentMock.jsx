// `active` is the index of the selected field in the Review screen:
// 0 pay · 1 start date · 2 length · 3 hours · 4 day off
const clause = 'mb-2.5 rounded-[3px] p-1.5 transition duration-200'
const located = 'scale-[1.02] bg-[#eaf1ff] outline-3 outline-[#0038a8]'
const uncertain = 'scale-[1.02] bg-[#fff8cf] outline-3 outline-[#d2a900]'

export default function DocumentMock({ active, label }) {
  return (
    <div className="relative grid min-h-[600px] place-items-start justify-center overflow-hidden rounded-card bg-[#dbe0e5] p-[18px] pb-[45px] lg:min-h-[680px] dark:bg-[#293342]">
      <div
        role="group"
        aria-label={label}
        className="min-h-[540px] w-full max-w-[440px] bg-white p-8 font-serif text-[0.8125rem] leading-[1.55] text-[#222] shadow-[0_12px_35px_rgb(0_0_0/0.18)] lg:min-h-[610px] lg:px-11 lg:py-12 lg:text-sm [&_mark]:bg-[#ffe99a] [&_mark]:text-[#222]"
      >
        <div className="mb-8 text-center text-base font-bold">EMPLOYMENT AGREEMENT</div>
        <p className={clause}>
          This Agreement is entered into between Maria D. Santos (“Employee”) and ABC Household.
        </p>
        <p className={`${clause} ${active === 0 ? located : ''}`}>
          <b>1. COMPENSATION.</b> The Employee shall receive <mark>PHP 18,000 per month</mark>, payable every
          15th and 30th.
        </p>
        <p className={`${clause} ${active === 1 || active === 2 ? located : ''}`}>
          <b>2. TERM.</b> Employment starts on <mark>15 June 2025</mark> and will continue for two (2) years.
        </p>
        <p className={`${clause} ${active === 3 ? uncertain : ''}`}>
          <b>3. HOURS.</b> The Employee shall work <mark>8 hours per day</mark>, six days each week.
        </p>
        <p className={`${clause} ${active === 4 ? located : ''}`}>
          <b>4. REST DAY.</b> The weekly rest day shall be Sunday.
        </p>
        <p className={`${clause} mt-14`}>Signed by the parties on the date stated above.</p>
        <div className="mt-14 flex justify-between border-t border-[#555] pt-1">
          <span>Employer</span>
          <span>Employee</span>
        </div>
      </div>
      <span className="absolute bottom-3.5 rounded-full bg-white px-2.5 py-1 text-xs text-[#333]">
        Page 1 of 4
      </span>
    </div>
  )
}
