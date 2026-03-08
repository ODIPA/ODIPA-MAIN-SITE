'use client'

import { useEffect, useRef } from 'react'
import SectionHeader from './SectionHeader'

const tiers = [
  {
    badge: 'Community Sponsor',
    name: 'Community',
    price: '$2,500',
    headerBg: '#1E3A5F',
    featured: false,
    benefits: [
      { text: 'Name & logo on ODIPA website sponsor page', active: true },
      { text: 'Acknowledgment in annual report', active: true },
      { text: 'IRC §513(i) sponsorship receipt', active: true },
      { text: 'Logo in email newsletter footer', active: false },
      { text: 'Logo on event & conference materials', active: false },
      { text: 'Homepage prominent placement', active: false },
    ],
  },
  {
    badge: 'Advocate Sponsor',
    name: 'Advocate',
    price: '$5,000',
    headerBg: '#152E52',
    featured: false,
    benefits: [
      { text: 'Name & logo on ODIPA website sponsor page', active: true },
      { text: 'Acknowledgment in annual report', active: true },
      { text: 'IRC §513(i) sponsorship receipt', active: true },
      { text: 'Logo in email newsletter footer', active: true },
      { text: 'Logo on event & conference materials', active: false },
      { text: 'Homepage prominent placement', active: false },
    ],
  },
  {
    badge: 'Champion Sponsor · Most Popular',
    name: 'Champion',
    price: '$10,000',
    headerBg: '#0B1F3A',
    featured: true,
    benefits: [
      { text: 'Name & logo on ODIPA website sponsor page', active: true },
      { text: 'Acknowledgment in annual report', active: true },
      { text: 'IRC §513(i) sponsorship receipt', active: true },
      { text: 'Logo in email newsletter footer', active: true },
      { text: 'Logo on event & conference materials', active: true },
      { text: 'Homepage prominent placement', active: false },
    ],
  },
  {
    badge: 'Founding Sponsor',
    name: 'Founding',
    price: '$25K+',
    headerBg: '#0A1628',
    featured: false,
    benefits: [
      { text: 'Name & logo on ODIPA website sponsor page', active: true },
      { text: 'Acknowledgment in annual report', active: true },
      { text: 'IRC §513(i) sponsorship receipt', active: true },
      { text: 'Logo in email newsletter footer', active: true },
      { text: 'Logo on event & conference materials', active: true },
      { text: 'Homepage prominent placement — permanent', active: true },
    ],
  },
]

export default function Sponsorship() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.08 }
    )
    els?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="sponsor" ref={ref} className="bg-cream py-24 px-6 overflow-hidden">
      <div className="max-w-content mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div className="reveal">
            <SectionHeader
              eyebrow="Corporate Sponsors"
              title={<>Why Sponsor<br /><span className="text-blue-brand">ODIPA</span></>}
            />
          </div>
          <div className="reveal reveal-delay-2">
            <p className="text-[16px] text-slate-500 leading-[1.8]">
              Data privacy is no longer a compliance checkbox — it is a strategic business imperative.
              Sponsoring ODIPA is a public acknowledgment relationship — your organization supports our
              mission and we recognize you by name and logo. If you need training, certification,
              or research services, see our Corporate Partnership program.
            </p>
          </div>
        </div>

        <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl bg-white ${
                tier.featured
                  ? 'border-gold shadow-[0_0_0_1px_#C8920A]'
                  : 'border-slate-200 hover:border-transparent'
              }`}
            >
              {/* Header */}
              <div className="px-6 pt-7 pb-5 text-center" style={{ background: tier.headerBg }}>
                <div className="font-mono text-[10px] text-gold-light uppercase tracking-[2px] mb-2">
                  {tier.badge}
                </div>
                <div className="font-display text-[22px] font-bold text-white mb-1.5">{tier.name}</div>
                <div className="font-display text-[28px] font-bold text-gold-light">
                  {tier.price}
                  <span className="text-[13px] text-white/40 font-normal">/yr</span>
                </div>
              </div>

              {/* Benefits */}
              <ul className="px-6 py-6 space-y-2.5">
                {tier.benefits.map((b) => (
                  <li
                    key={b.text}
                    className={`flex items-start gap-2.5 text-[13px] leading-relaxed ${
                      b.active ? 'text-slate-600' : 'text-slate-200'
                    }`}
                  >
                    <span className={`font-bold flex-shrink-0 mt-0.5 ${b.active ? 'text-gold' : 'text-slate-200'}`}>
                      {b.active ? '✓' : '—'}
                    </span>
                    {b.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="/become-a-sponsor"
                className={`block mx-6 mb-6 py-3 text-center rounded-md font-semibold text-[13px] no-underline transition-all ${
                  tier.featured
                    ? 'bg-gold text-navy hover:bg-gold-light'
                    : 'border border-navy text-navy hover:bg-navy hover:text-white'
                }`}
              >
                Become a Sponsor
              </a>
            </div>
          ))}
        </div>

        {/* Sponsorship vs Partnership cross-link */}
        <div className="reveal mt-6 bg-white border border-slate-200 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-[14px] text-navy mb-1">Looking for training, certification, or research services?</div>
            <p className="text-[13px] text-slate-500">Those are Corporate Partnership engagements — a separate agreement with deliverables, not sponsorship.</p>
          </div>
          <a href="/get-involved/corporate-partner"
            className="flex-shrink-0 inline-block border border-navy text-navy font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-navy hover:text-white transition-colors no-underline whitespace-nowrap">
            View Corporate Partnership →
          </a>
        </div>

        {/* 77/19/4 impact strip */}
        <div className="reveal mt-12 bg-navy rounded-2xl p-8">
          <div className="font-mono text-[10px] text-gold-light uppercase tracking-[3px] mb-5 text-center">Your sponsorship funds</div>
          <div className="flex rounded-full overflow-hidden h-3 mb-6">
            <div className="bg-white/90 transition-all" style={{ width: '77%' }} />
            <div className="bg-gold transition-all" style={{ width: '19%' }} />
            <div className="bg-white/20 transition-all" style={{ width: '4%' }} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { pct: '77%', label: 'Free public programs', sub: 'Education · Advocacy · Research · Open-source tools', color: 'text-white' },
              { pct: '19%', label: 'Fee-based operations', sub: 'Corporate training · Certification · Sponsorships', color: 'text-gold-light' },
              { pct: '4%',  label: 'Governance & overhead', sub: 'Board governance · Compliance · Financial management', color: 'text-white/40' },
            ].map((s) => (
              <div key={s.label}>
                <div className={`font-display text-[32px] font-black leading-none mb-1 ${s.color}`}>{s.pct}</div>
                <div className={`font-semibold text-[12px] mb-1 ${s.color}`}>{s.label}</div>
                <div className="font-mono text-[10px] text-white/30 leading-snug">{s.sub}</div>
              </div>
            ))}
          </div>
          <p className="text-center font-mono text-[10px] text-white/25 mt-6">
            These percentages describe how ODIPA delivers services — not how we spend money. A separate financial breakdown is available upon request.          </p>
        </div>

        {/* Corporate sponsors strip */}
        <div className="reveal mt-4 bg-white border border-slate-200 rounded-2xl px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="font-mono text-[10px] text-slate-400 uppercase tracking-[2px] whitespace-nowrap">Corporate Sponsors</div>
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-6 flex-wrap justify-center">
              {/* Avallis */}
              <a href="https://avallis.io" target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-2.5 no-underline opacity-70 hover:opacity-100 transition-opacity">
                <img
                  src="/images/avallis-logo.png"
                  alt="Avallis"
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                />
                <span className="font-mono text-[12px] font-semibold text-navy tracking-wide">avallis.io</span>
              </a>
              {/* Placeholder slot */}
              <div className="flex items-center gap-2 opacity-30">
                <div className="w-8 h-8 rounded-lg border border-dashed border-slate-300" />
                <span className="font-mono text-[11px] text-slate-400">Your brand</span>
              </div>
            </div>
          </div>
          <a href="/become-a-sponsor"
            className="flex-shrink-0 inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[13px] px-5 py-2.5 rounded-lg transition-colors no-underline whitespace-nowrap">
            Become a Sponsor
          </a>
        </div>

      </div>
    </section>
  )
}
