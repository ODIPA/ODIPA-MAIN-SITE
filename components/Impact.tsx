'use client'

import { useEffect, useRef, useState } from 'react'
import SectionHeader from './SectionHeader'

const stats = [
  { target: 4.5, suffix: 'B', label: 'Records exposed in data breaches globally in 2023 alone' },
  { target: 79, suffix: '%', label: 'Of Americans seriously concerned about how their data is collected and used' },
  { target: 9.48, suffix: 'M', prefix: '$', label: 'Average cost of a data breach in financial services — highest of any industry' },
  { target: 13, suffix: 'yr', label: 'Consecutive years financial services has led all industries in breach costs' },
  { target: 50, suffix: '+', label: 'Different US state privacy laws now in effect or pending' },
  { target: 77, suffix: '%', label: 'Of ODIPA\'s services delivered completely free to the public we serve' },
]

function useCounter(target: number, triggered: boolean, isDecimal: boolean) {
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

  return isDecimal ? value.toFixed(2) : Math.floor(value).toString()
}

function StatCard({ stat, triggered }: { stat: typeof stats[0]; triggered: boolean }) {
  const isDecimal = stat.target % 1 !== 0
  const value = useCounter(stat.target, triggered, isDecimal)

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
      </div>
    </section>
  )
}
