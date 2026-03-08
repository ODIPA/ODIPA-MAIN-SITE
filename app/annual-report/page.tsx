import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Annual Report',
  description: 'ODIPA\'s annual report — program outcomes, financial transparency, impact metrics, and plans for the year ahead.',
  alternates: { canonical: 'https://odipa.org/annual-report' },
}

const programHighlights = [
  { num: '01', name: 'Educational Outreach', metric: 'Year 1', label: 'target: 500+ participants', href: '/programs/educational-outreach' },
  { num: '02', name: 'Advocacy & Policy', metric: 'Year 1', label: 'target: 8–12 position papers', href: '/programs/advocacy-policy' },
  { num: '03', name: 'Research & Publications', metric: 'Year 1', label: 'target: 4–7 reports', href: '/programs/research-publications' },
  { num: '04', name: 'Community Building', metric: 'Year 1', label: 'target: 20+ events', href: '/programs/community-building' },
  { num: '05', name: 'Corporate Certification', metric: 'Quote', label: 'based on size & scope', href: '/programs/corporate-certification' },
  { num: '06', name: 'Awareness Campaigns', metric: '365', label: 'days planned social presence', href: '/programs/awareness-campaigns' },
  { num: '07', name: 'Open-Source Development', metric: 'MIT', label: 'open license — free forever', href: '/programs/open-source-development' },
  { num: '08', name: 'International Cooperation', metric: 'Year 1', label: 'target: 3–5 partner orgs', href: '/programs/international-cooperation' },
]

const financials = [
  { category: 'Individual Donations', amount: '$15,000–$40,000', pct: '~45%', color: 'bg-navy' },
  { category: 'Corporate Sponsorships', amount: '$10,000–$30,000', pct: '~30%', color: 'bg-blue-brand' },
  { category: 'Certification Fees', amount: '$5,000–$15,000', pct: '~15%', color: 'bg-gold' },
  { category: 'Foundation Grants', amount: '$5,000–$15,000', pct: '~10%', color: 'bg-slate-400' },
]

const expenses = [
  { category: 'Program Services (Free Public)', pct: '77%', amount: '~$15,400', color: 'bg-navy' },
  { category: 'Fee-Based Program Operations', pct: '19%', amount: '~$3,800', color: 'bg-blue-brand' },
  { category: 'Administration & Overhead', pct: '4%', amount: '~$800', color: 'bg-gold' },
]

export default function AnnualReportPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy pt-28 pb-16 px-6 overflow-hidden">
        <div className="max-w-[960px] mx-auto">
          <Link href="/about" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← About ODIPA
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />Transparency & Impact
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <div>
              <h1 className="font-display text-[clamp(34px,5vw,56px)] font-black text-white leading-[1.08] mb-4">
                Annual Report<br />
                <span className="text-gold-light">Founding Year — 2024–2026</span>
              </h1>
              <p className="text-[16px] text-white/60 leading-[1.8]">
                From incorporation in November 2024 through our 501(c)(3) determination in January 2026 — the story of ODIPA&apos;s founding, structure, and launch of eight public programs.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { n: '8', l: 'Programs active' },
                { n: '77%', l: 'Services free' },
                { n: '501(c)(3)', l: 'Tax-exempt' },
              ].map((s) => (
                <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-4 text-center">
                  <div className="font-display text-[16px] sm:text-[26px] font-black text-gold-light leading-none mb-1 sm:mb-2 break-all">{s.n}</div>
                  <div className="text-[9px] sm:text-[11px] text-white/45 leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-16 space-y-20">

        {/* Message from leadership */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-12">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-5">
            <span className="block w-5 h-px bg-blue-brand" />Message from the Board
          </div>
          <blockquote className="font-display text-[clamp(18px,3vw,26px)] font-bold text-navy leading-[1.4] mb-6 max-w-[720px]">
            &ldquo;ODIPA was built to prove that a nonprofit dedicated entirely to digital privacy education and advocacy can build real infrastructure, reach real people, and make a real difference — and our founding year laid that foundation.&rdquo;
          </blockquote>
          <p className="text-[15px] text-slate-600 leading-[1.85] mb-4">
            Incorporated in November 2024, we spent our founding period building eight programs, establishing governance, and completing the 501(c)(3) process — receiving our IRS determination letter in January 2026. We then launched odipa.org as a fully open-source platform, making our tools, research, and programs available to the public.
          </p>
          <p className="text-[15px] text-slate-600 leading-[1.85]">
            The year ahead brings even greater ambition: expanding our Corporate Certification program, deepening our community presence, publishing our first comprehensive State of Consumer Privacy report, and growing the volunteer network that makes everything possible.
          </p>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="font-semibold text-navy text-[14px]">Board of Directors</div>
            <div className="font-mono text-[11px] text-slate-400">ODIPA — Organization for Digital Information Privacy &amp; Awareness</div>
          </div>
        </section>

        {/* Program outcomes */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
            <span className="block w-5 h-px bg-blue-brand" />Program Targets — Launch Year
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {programHighlights.map((p) => (
              <Link key={p.num} href={p.href}
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-5 hover:border-blue-brand/30 hover:shadow-sm transition-all no-underline group">
                <div className="font-mono text-[11px] font-bold text-gold bg-gold/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  {p.num}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[14px] text-navy group-hover:text-blue-brand transition-colors">{p.name}</div>
                  <div className="text-[12px] text-slate-400">{p.metric} {p.label}</div>
                </div>
                <span className="text-gold text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Revenue */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />Revenue — Year 1 Projection
          </div>
          <p className="text-[14px] text-slate-400 font-mono mb-6">Conservative estimate: $35,000 — Optimistic estimate: $100,000</p>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {financials.map((f, i) => (
              <div key={f.category} className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-5 p-5 ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                <div className={`hidden sm:block w-3 h-3 rounded-full flex-shrink-0 ${f.color}`} />
                <div className="flex items-center gap-2.5 sm:hidden">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${f.color}`} />
                  <div className="font-medium text-[14px] text-navy">{f.category}</div>
                </div>
                <div className="hidden sm:block flex-1 font-medium text-[14px] text-navy">{f.category}</div>
                <div className="flex items-center justify-between sm:contents gap-4 pl-5 sm:pl-0">
                  <div className="text-[13px] text-slate-500">{f.amount}</div>
                  <div className="font-mono text-[12px] font-bold text-gold sm:w-12 sm:text-right">{f.pct}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Expenses */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />Expenses — Year 1 Budget ($20,000)
          </div>
          <p className="text-[14px] text-slate-400 font-mono mb-6">77% of every dollar goes directly to free public programs</p>
          <div className="space-y-3">
            {expenses.map((e) => (
              <div key={e.category} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-5">
                <div className="flex-1">
                  <div className="font-medium text-[14px] text-navy mb-2">{e.category}</div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${e.color}`}
                      style={{ width: e.pct }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-[16px] font-bold text-navy">{e.pct}</div>
                  <div className="font-mono text-[11px] text-slate-400">{e.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Forward look */}
        <section className="bg-navy rounded-2xl p-8 lg:p-10">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-5 h-px bg-gold-light" />Our Goals — Year One
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {[
              { goal: 'Launch full Corporate Certification program with 10+ initial applicants' },
              { goal: 'Publish inaugural State of Consumer Privacy annual report' },
              { goal: 'Expand volunteer network to 50+ active contributors' },
              { goal: 'File 12 position papers across federal and state regulatory proceedings' },
              { goal: 'Host inaugural ODIPA Privacy Summit in Los Angeles' },
              { goal: 'Secure first major foundation grant ($25,000+)' },
            ].map((item) => (
              <div key={item.goal} className="flex items-start gap-3 text-[14px] text-white/70">
                <span className="text-gold font-bold flex-shrink-0 mt-0.5">→</span>
                {item.goal}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/donate" className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
              Support Year One
            </Link>
            <Link href="/contact" className="inline-block border border-white/20 hover:border-white/40 text-white font-medium text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
              Request Full Report
            </Link>
          </div>
        </section>

        {/* Transparency note */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand flex-shrink-0"><ClipboardList className="w-5 h-5" /></div>
          <div>
            <h3 className="font-semibold text-[15px] text-navy mb-1">Full Financial Transparency</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-3">
              ODIPA files Form 990 annually with the IRS. All filings are public by law under IRC §6104 — including our Form 1023 application, IRS determination letter, articles of incorporation, and bylaws. In-person requests are fulfilled same day; written requests within 30 days.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/transparency"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white bg-navy hover:opacity-80 px-3 py-1.5 rounded-lg no-underline transition-opacity">
                View Transparency Page
              </Link>
              <Link href="/contact?topic=transparency"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-blue-brand border border-blue-brand/30 hover:bg-blue-brand/5 px-3 py-1.5 rounded-lg no-underline transition-colors">
                Request Documents
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
