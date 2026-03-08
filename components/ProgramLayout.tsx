import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface ProgramData {
  num: string
  pct: string
  pctFree?: string
  pctFee?: string
  title: string
  tag: string
  tagColor: string
  image: string
  imageAlt: string
  hero: string
  overview: string
  whatWeDo: { title: string; desc: string; icon: React.ReactNode }[]
  whoWeServe: { group: string; desc: string }[]
  outcomes: { metric: string; label: string }[]
  faqs: { q: string; a: string }[]
  cta: { label: string; href: string; secondary?: { label: string; href: string; download?: boolean } }
  children?: React.ReactNode
  contributorHub?: { href: string; label: string; desc: string }
}

const allPrograms = [
  { num: '01', title: 'Educational Outreach',       slug: 'educational-outreach' },
  { num: '02', title: 'Advocacy & Policy',           slug: 'advocacy-policy' },
  { num: '03', title: 'Research & Publications',     slug: 'research-publications' },
  { num: '04', title: 'Community Building',          slug: 'community-building' },
  { num: '05', title: 'Corporate Certification',     slug: 'corporate-certification' },
  { num: '06', title: 'Awareness Campaigns',         slug: 'awareness-campaigns' },
  { num: '07', title: 'Open-Source Development',     slug: 'open-source-development' },
  { num: '08', title: 'International Cooperation',   slug: 'international-cooperation' },
]

export default function ProgramLayout({ data, children }: { data: ProgramData; children?: React.ReactNode }) {
  return (
    <div className="bg-cream min-h-screen overflow-x-clip">

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image src={data.image} alt={data.imageAlt} fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/80 to-navy" />
        </div>

        <div className="relative max-w-[960px] mx-auto px-6 pt-32 pb-20">
          <Link href="/#programs"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← All Programs
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />
            Activity {data.num}
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,60px)] font-black text-white leading-[1.08] mb-5">
            {data.title}
          </h1>
          <p className="text-[17px] text-white/65 leading-[1.8] max-w-[600px] mb-8">
            {data.hero}
          </p>
          <span className={`inline-block font-mono text-[11px] px-4 py-2 rounded-full border ${data.tagColor}`}>
            {data.tag}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">

        <main className="space-y-16 min-w-0">

          {/* Overview */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-4">
              <span className="block w-5 h-px bg-blue-brand" />Overview
            </div>
            <p className="text-[16px] text-slate-600 leading-[1.9]">{data.overview}</p>
          </section>

          {/* What We Do */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />What We Do
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.whatWeDo.map((item) => (
                <div key={item.title}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-brand/30 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand mb-4">{item.icon}</div>
                  <h3 className="font-display text-[17px] font-bold text-navy mb-2">{item.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-[1.75]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Who We Serve */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Who We Serve
            </div>
            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 overflow-hidden bg-white">
              {data.whoWeServe.map((item, i) => (
                <div key={item.group} className={`flex flex-col sm:flex-row gap-2 sm:gap-5 p-5 ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                  <div className="font-mono text-[11px] font-bold text-gold bg-gold/10 px-3 py-1.5 rounded-full h-fit self-start sm:flex-shrink-0 sm:max-w-[180px] sm:leading-snug sm:text-center">
                    {item.group}
                  </div>
                  <p className="text-[14px] text-slate-600 leading-[1.7] sm:pt-0.5 min-w-0">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Outcomes */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Year 1 Targets
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 rounded-xl overflow-hidden">
              {data.outcomes.map((item) => (
                <div key={item.label} className="bg-navy py-8 px-2 text-center">
                  <div className="font-display text-[22px] font-black text-gold-light leading-none mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.metric}
                  </div>
                  <div className="text-[11px] text-white/55 leading-snug">{item.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Common Questions
            </div>
            <div className="space-y-4">
              {data.faqs.map((faq) => (
                <div key={faq.q} className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-[15px] text-navy mb-2">{faq.q}</h3>
                  <p className="text-[14px] text-slate-500 leading-[1.75]">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Extra content slot — e.g. CommunityTools on open-source page */}
          {children && <div>{children}</div>}

          {/* Contributor hub callout — shown when program has an action page */}
          {data.contributorHub && (
            <div className="bg-blue-brand/5 border-2 border-blue-brand/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex-1">
                <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-1.5">Contributor Hub</div>
                <p className="text-[14px] text-slate-600 leading-relaxed">{data.contributorHub.desc}</p>
              </div>
              <Link href={data.contributorHub.href}
                className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-brand hover:opacity-90 text-white font-bold text-[13px] px-5 py-3 rounded-xl transition-opacity no-underline">
                {data.contributorHub.label}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"/></svg>
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="bg-navy rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <h3 className="font-display text-[22px] font-bold text-white mb-2">Ready to Get Involved?</h3>
              <p className="text-[14px] text-white/55 leading-relaxed">Join ODIPA and help protect digital privacy for everyone.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.cta.href.startsWith('/') ? (
                <Link href={data.cta.href}
                  className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
                  {data.cta.label}
                </Link>
              ) : (
                <a href={data.cta.href}
                  className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
                  {data.cta.label}
                </a>
              )}
              {data.cta.secondary && (
                <a href={data.cta.secondary.href}
                  {...(data.cta.secondary.download ? { download: true } : {})}
                  className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-medium text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
                  {data.cta.secondary.download && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  )}
                  {data.cta.secondary.label}
                </a>
              )}
            </div>
          </div>

        </main>

        {/* Sidebar */}
        <aside className="space-y-6">

          {/* Quick facts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:sticky lg:top-24">
            <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-4">Program Details</div>
            <div className="space-y-3 text-[13px]">
              {[
                { label: 'Activity', value: `#${data.num} of 8` },
                { label: 'Focus', value: data.pct + ' of activity' },
                ...(data.pctFree ? [{ label: 'Free services', value: data.pctFree }] : []),
                ...(data.pctFee ? [{ label: 'Fee-based', value: data.pctFee }] : []),
                { label: 'Access', value: data.tag },
                { label: 'Frequency', value: 'Ongoing' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-slate-400 font-mono text-[11px]">{item.label}</span>
                  <span className="font-semibold text-navy text-right">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-3">All Programs</div>
              <ul className="space-y-1">
                {allPrograms.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/programs/${p.slug}`}
                      className={`flex items-center gap-2.5 text-[12px] py-1.5 no-underline transition-colors rounded px-2 -mx-2 ${
                        p.num === data.num
                          ? 'text-navy font-semibold bg-gold/10'
                          : 'text-slate-500 hover:text-navy hover:bg-slate-50'
                      }`}>
                      <span className="font-mono text-[10px] text-gold flex-shrink-0">{p.num}</span>
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>



        </aside>
      </div>
    </div>
  )
}
