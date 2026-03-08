'use client'

import { useEffect, useRef } from 'react'
import SectionHeader from './SectionHeader'

// Circumference = 2 * PI * 70 = 439.82
// 77% = 338.66  gap = 101.16  offset = 0
// 19% = 83.57   gap = 356.25  offset = -338.66
//  4% = 17.59   gap = 422.23  offset = -422.23
const segments = [
  { color: '#0B1F3A', dash: 338.66, gap: 101.16, offset: 0 },
  { color: '#C8920A', dash: 83.57, gap: 356.25, offset: -338.66 },
  { color: '#94A3B8', dash: 17.59, gap: 422.23, offset: -422.23 },
]

const legend = [
  { color: '#0B1F3A', label: '77% Free public services' },
  { color: '#C8920A', label: '19% Fee-based business services' },
  { color: '#94A3B8', label: '4% Governance & overhead' },
]

const modelItems = [
  { num: '01', title: 'Free Educational Courses', tag: 'FREE', tagColor: 'text-green-600 bg-green-100', desc: 'Public courses, webinars, and workshops for underserved communities' },
  { num: '02', title: 'Corporate Training', tag: 'FEE-BASED', tagColor: 'text-blue-brand bg-blue-brand/10', desc: 'Privacy training for businesses and corporations. Scoped and priced per engagement. Revenue funds free public programs.' },
  { num: '03', title: 'Certification Program', tag: 'FEE-BASED', tagColor: 'text-blue-brand bg-blue-brand/10', desc: 'Priced by organization size and number of standards in scope. Independent third-party certification against applicable privacy frameworks.' },
  { num: '04', title: 'Research & Publications', tag: 'FREE', tagColor: 'text-green-600 bg-green-100', desc: 'All annual reports, research briefs, and special publications freely available to the public.' },
  { num: '05', title: 'Open-Source Platform', tag: 'FREE', tagColor: 'text-green-600 bg-green-100', desc: 'Privacy tools and libraries available free to all individuals, developers, and community organizations.' },
]

export default function ServiceModel() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    els?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="model" ref={ref} className="bg-white py-24 px-6 overflow-hidden">
      <div className="max-w-content mx-auto">
        <SectionHeader
          eyebrow="Our Service Model"
          title={<>Built for Public<br /><span className="text-blue-brand">Benefit First</span></>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16 items-center">
          {/* Donut chart */}
          <div className="reveal">
            <div className="w-[280px] h-[280px] mx-auto relative">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background track */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#E2E8F0" strokeWidth="32" />
                {/* Segments */}
                {segments.map((s, i) => (
                  <circle
                    key={i}
                    cx="100" cy="100" r="70"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="32"
                    strokeDasharray={`${s.dash} ${s.gap}`}
                    strokeDashoffset={s.offset}
                    transform="rotate(-90 100 100)"
                    className="donut-segment"
                  />
                ))}
              </svg>
              {/* Center label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="font-display text-[40px] font-black text-navy block leading-none">77%</span>
                <span className="font-mono text-[12px] text-slate-500 tracking-[1px]">FREE</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 grid gap-3 max-w-[280px] mx-auto">
              {legend.map((l) => (
                <div key={l.label} className="flex items-center gap-3 text-[14px] text-slate-500">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                These percentages describe how ODIPA delivers services — not how we spend money. A separate financial breakdown is available upon request.              </p>
            </div>
          </div>

          {/* List */}
          <div className="reveal reveal-delay-2">
            <ul className="divide-y divide-slate-200">
              {modelItems.map((item) => (
                <li key={item.num} className="flex items-start gap-4 py-5">
                  <span className="font-mono text-[12px] text-blue-brand font-medium pt-0.5 flex-shrink-0">
                    {item.num}
                  </span>
                  <div>
                    <div className="font-semibold text-[14px] text-navy mb-1">
                      {item.title}
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ml-2 align-middle ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>
                    <div className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
