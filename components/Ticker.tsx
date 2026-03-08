const items = [
  'Consumer Education',
  'Policy Advocacy',
  'Original Research',
  'Community Building',
  'Corporate Certification',
  'Awareness Campaigns',
  'Open-Source Tools',
  'International Cooperation',
  '77% Free to the Public',
  '501(c)(3) Tax Exempt',
]

// Duplicate for seamless loop
const allItems = [...items, ...items]

export default function Ticker() {
  return (
    <div className="bg-gold py-[18px] overflow-hidden">
      <div className="ticker-wrap">
        {allItems.map((item, i) => (
          <span
            key={i}
            className="font-mono text-[12px] font-medium text-navy uppercase tracking-[2px] flex items-center gap-5 flex-shrink-0 after:content-['◆'] after:text-[8px] after:opacity-50"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
