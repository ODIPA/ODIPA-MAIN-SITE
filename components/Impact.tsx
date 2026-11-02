'use client'

import { useEffect, useRef, useState } from 'react'
import SectionHeader from './SectionHeader'

const stats = [
  { target: 16, suffix: 'B+', label: 'Login credentials found in one exposed 2025 data compilation, including duplicates (Cybernews)' },
  { target: 99, suffix: '%', label: 'Of organizations had sensitive data exposed to AI tools, in an analysis of 1,000 environments (Varonis, 2025)' },
  { target: 11.5, suffix: 'M', prefix: '$', label: 'Average cost of a U.S. data breach in 2026, more than double the global average of $4.99M (IBM)' },
  { target: 3322, suffix: '', label: 'Data compromises reported in the U.S. in 2025, a record high (ITRC)' },
  { target: 20, suffix: '+', label: 'U.S. states have comprehensive consumer privacy laws on the books (IAPP, 2026)' },
  { target: 77, suffix: '%', label: 'Of ODIPA\'s services delivered completely free to the public we serve' },
]

function useCounter(target: number, triggered: boolean, decimals: number) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!triggered) return
    const duration = 2000
    const start = performance.now()

    function update(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * target)
      if (progress < 1) requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  }, [triggered, target])

  return decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString('en-US')
}

function StatCard({ stat, triggered }: { stat: typeof stats[0]; triggered: boolean }) {
  const decimals = (String(stat.target).split('.')[1] || '').length
  const value = useCounter(stat.target, triggered, decimals)

  return (
    <div className="bg-navy-mid py-12 px-9 text-center hover:bg-white/5 transition-colors">
      <span className="font-display text-[56px] font-black text-gold-light leading-none mb-3 block">
        {stat.prefix || ''}{value}{stat.suffix}
      </span>
      <div className="w-8 h-0.5 bg-gold rounded mx-auto mt-4 mb-3" />
      <div className="text-[14px] text-white/60 leading-relaxed max-w-[180px] mx-auto">
        {stat.label}
      </div>
    </div>
  )
}

export default function Impact() {
  const ref = useRef<HTMLElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    els?.forEach((el) => revealObserver.observe(el))

    const counterObserver = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !triggered) setTriggered(true) },
      { threshold: 0.3 }
    )
    if (ref.current) counterObserver.observe(ref.current)

    return () => { revealObserver.disconnect(); counterObserver.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      id="impact"
      ref={ref}
      className="bg-navy py-24 px-6 relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(26,95,168,0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(200,146,10,0.15) 0%, transparent 50%)
        `
      }}
    >
      <div className="max-w-content mx-auto relative">
        <SectionHeader
          eyebrow="Why It Matters"
          title={<>The Privacy Crisis<br />Is Real</>}
          body="Data privacy is no longer an abstract concern. The numbers tell a stark story of why ODIPA's mission matters urgently."
          light
        />

        <div className="reveal mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.08] rounded-xl overflow-hidden">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} triggered={triggered} />
          ))}
        </div>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-white/60 max-w-[760px] mx-auto">
          Sources:{' '}
          <a className="underline hover:text-white" href="https://www.ibm.com/reports/data-breach" target="_blank" rel="noopener noreferrer">IBM Cost of a Data Breach Report 2026<span className="sr-only"> (opens in a new tab)</span></a>,{' '}
          <a className="underline hover:text-white" href="https://www.idtheftcenter.org/post/2025-annual-data-breach-report/" target="_blank" rel="noopener noreferrer">ITRC 2025 Annual Data Breach Report<span className="sr-only"> (opens in a new tab)</span></a>,{' '}
          <a className="underline hover:text-white" href="https://iapp.org/resources/article/us-state-privacy-legislation-tracker/" target="_blank" rel="noopener noreferrer">IAPP US State Privacy Legislation Tracker<span className="sr-only"> (opens in a new tab)</span></a>,{' '}
          <a className="underline hover:text-white" href="https://www.scrippsnews.com/us-news/billions-of-login-credentials-have-been-leaked-online-cybernews-researchers-say" target="_blank" rel="noopener noreferrer">Cybernews, June 2025 (via Scripps News)<span className="sr-only"> (opens in a new tab)</span></a> and{' '}
          <a className="underline hover:text-white" href="https://www.varonis.com/blog/state-of-data-security-report" target="_blank" rel="noopener noreferrer">Varonis 2025 State of Data Security Report<span className="sr-only"> (opens in a new tab)</span></a>.
          ODIPA's own figure is from our published budget. Third-party figures are as reported by each source.
        </p>
      </div>
    </section>
  )
}
