import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Scale, BookOpen, Landmark, BarChart2, Laptop, Users, Lock, Microscope } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About ODIPA',
  description: 'Learn about ODIPA\'s mission, history, leadership, and the team of privacy advocates, attorneys, technologists, and educators driving our work.',
  alternates: { canonical: 'https://odipa.org/about' },
}

// ─── Filled seats ────────────────────────────────────────────────────────────
const filledSeats = [
  {
    name: 'Jasper Vale',
    title: 'Chair, Board of Directors',
    bio: "VP of Software Development with 15+ years in enterprise software, banking technology, and privacy-first architecture. Founder of Avallis LLC and ODIPA's founding Board Chair.",
    initials: 'JV',
    isChair: true,
  },
]

// ─── Open seats ───────────────────────────────────────────────────────────────
const openSeats = [
  { id: 'vice-chair',          title: 'Vice Chair',                 icon: <Scale className="w-4 h-4" />,     commitment: '8–10 hrs/mo', desc: "Leads meetings in the Chair's absence, oversees strategic partnerships and fundraising." },
  { id: 'secretary',           title: 'Secretary & General Counsel', icon: <BookOpen className="w-4 h-4" />,  commitment: '6–8 hrs/mo',  desc: 'Maintains corporate records, ensures legal compliance, manages nonprofit governance.' },
  { id: 'treasurer',           title: 'Treasurer',                  icon: <BarChart2 className="w-4 h-4" />, commitment: '6–8 hrs/mo',  desc: 'Oversees financial health, budgeting, audits, and the Finance Committee.' },
  { id: 'director-technology', title: 'Director — Technology',      icon: <Laptop className="w-4 h-4" />,    commitment: '4–6 hrs/mo',  desc: 'Provides technical oversight for the open-source platform and Privacy Tools program.' },
  { id: 'director-community',  title: 'Director — Community',       icon: <Users className="w-4 h-4" />,     commitment: '4–6 hrs/mo',  desc: 'Champions community engagement, volunteer programs, and equitable program access.' },
]

const values = [
  { icon: <Lock className="w-5 h-5" />,       title: 'Privacy as a Right',  desc: 'We believe digital privacy is a fundamental human right, not a premium feature or a compliance checkbox.' },
  { icon: <Landmark className="w-5 h-5" />,   title: 'Independence',         desc: 'ODIPA is beholden to no industry, government, or political party. Our positions reflect the evidence and the public interest.' },
  { icon: <BookOpen className="w-5 h-5" />,   title: 'Transparency',         desc: 'We publish our financials, our research methods, and our positions openly. Our code is open source.' },
  { icon: <Scale className="w-5 h-5" />,      title: 'Equity',               desc: 'Privacy protection should not depend on wealth or technical expertise. Our free programs serve all communities.' },
  { icon: <Users className="w-5 h-5" />,      title: 'Collaboration',        desc: 'We work with individuals, businesses, government, and the global privacy community — not against them.' },
  { icon: <Microscope className="w-5 h-5" />, title: 'Evidence-Based',       desc: 'Our advocacy, research, and education are grounded in data, legal analysis, and demonstrated outcomes.' },
]

const milestones = [
  { year: 'Nov 2024', event: 'ODIPA incorporated in California. Articles of incorporation filed November 14, 2024, establishing the organization\'s legal structure and charitable purpose.' },
  { year: '2024–2025', event: 'Filed Form 1023 with the IRS for 501(c)(3) tax-exempt status. Established founding board of directors and began developing ODIPA\'s eight core programs.' },
  { year: 'Jan 2026', event: 'Received IRS 501(c)(3) determination letter confirming tax-exempt status.' },
  { year: '2026', event: 'Launched odipa.org as a fully open-source website. Expanding to eight active programs, launching Corporate Certification, and growing national volunteer network.' },
]

export default function AboutPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/photo-1522071820081-009f0129c71c_1200.jpg"
            alt="Diverse team of professionals collaborating in discussion"
            fill className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/85 to-navy" />
        </div>
        <div className="relative max-w-[960px] mx-auto px-6 pt-32 pb-20">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← ODIPA.org
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />About ODIPA
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,60px)] font-black text-white leading-[1.08] mb-5">
            Protecting Privacy<br />for Everyone
          </h1>
          <p className="text-[17px] text-white/65 leading-[1.8] max-w-[600px]">
            ODIPA is a 501(c)(3) nonprofit organization dedicated to educating consumers, advocating for stronger privacy laws, and building open-source tools that protect people&apos;s digital rights.
          </p>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-16 space-y-20">

        {/* Mission */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-4">
              <span className="block w-5 h-px bg-blue-brand" />Our Mission
            </div>
            <h2 className="font-display text-[clamp(28px,4vw,42px)] font-bold text-navy leading-tight mb-5">
              Privacy is a fundamental right — not a luxury.
            </h2>
            <p className="text-[15px] text-slate-600 leading-[1.85] mb-4">
              ODIPA was founded on the conviction that ordinary people deserve to understand and control their personal information — and that achieving this requires education, advocacy, and technology working together.
            </p>
            <p className="text-[15px] text-slate-600 leading-[1.85]">
              We deliver 77% of our services completely free to the public, reaching consumers, students, seniors, and community organizations who are most affected by data exploitation and have the fewest resources to protect themselves.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { metric: '8', label: 'Active programs' },
              { metric: '77%', label: 'Services free to public' },
              { metric: '501(c)(3)', label: 'Tax-exempt status' },
              { metric: '2024', label: 'Year founded' },
            ].map((s) => (
              <div key={s.label} className="bg-navy rounded-xl p-6 text-center">
                <div className="font-display text-[32px] font-black text-gold-light mb-1">{s.metric}</div>
                <div className="text-[12px] text-white/50 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
            <span className="block w-5 h-px bg-blue-brand" />Our Values
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm hover:border-blue-brand/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand mb-4">{v.icon}</div>
                <h3 className="font-display text-[16px] font-bold text-navy mb-2">{v.title}</h3>
                <p className="text-[13px] text-slate-500 leading-[1.75]">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
            <span className="block w-5 h-px bg-blue-brand" />Our History
          </div>
          <div className="space-y-px rounded-xl overflow-hidden border border-slate-200">
            {milestones.map((m, i) => (
              <div key={m.year} className={`flex gap-6 p-5 ${i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}>
                <div className="font-mono text-[12px] font-bold text-gold bg-gold/10 px-3 py-1 rounded-full h-fit flex-shrink-0 whitespace-nowrap">
                  {m.year}
                </div>
                <p className="text-[14px] text-slate-600 leading-relaxed pt-0.5">{m.event}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Board */}
        <section id="board">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />Board of Directors
          </div>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
            ODIPA is governed by an independent board of directors with expertise spanning privacy law, technology, nonprofit management, and community advocacy.
            Five seats are currently open — we are actively recruiting qualified candidates.
          </p>

          {/* Filled seat — Chair */}
          <div className="mb-6">
            <div className="font-mono text-[10px] text-slate-400 uppercase tracking-[2px] mb-3">Current Board</div>
            {filledSeats.map((member) => (
              <div key={member.initials} className="bg-white rounded-xl border-2 border-gold/40 p-6 flex items-start gap-5 max-w-sm">
                <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center font-mono text-[15px] font-bold text-gold flex-shrink-0">
                  {member.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="font-display text-[17px] font-bold text-navy">{member.name}</div>
                    {member.isChair && (
                      <span className="font-mono text-[9px] text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-full">FOUNDING CHAIR</span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-gold uppercase tracking-[1px] mb-2">{member.title}</div>
                  <p className="text-[12px] text-slate-500 leading-[1.75]">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Open seats */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="font-mono text-[10px] text-slate-400 uppercase tracking-[2px]">Open Seats — Now Recruiting</div>
              <Link href="/board-application"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white bg-navy hover:bg-navy-mid px-3 py-1.5 rounded-lg transition-colors no-underline">
                Apply for a Seat →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {openSeats.map((seat) => (
                <Link key={seat.id} href={`/board-application`}
                  className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-5 hover:border-blue-brand/40 hover:shadow-sm transition-all no-underline group block">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-brand/8 flex items-center justify-center text-navy group-hover:text-blue-brand transition-colors">
                      {seat.icon}
                    </div>
                    <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{seat.commitment}</span>
                  </div>
                  <div className="font-display text-[15px] font-bold text-navy mb-1 group-hover:text-blue-brand transition-colors">{seat.title}</div>
                  <p className="text-[12px] text-slate-500 leading-[1.7] mb-3">{seat.desc}</p>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-blue-brand">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Accepting Applications
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Financials teaser */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-4">
            <span className="block w-5 h-px bg-blue-brand" />Financials & Transparency
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {[
              { label: 'Program Services', value: '77%+', sub: 'of budget toward free public programs' },
              { label: 'Administration', value: '~19%', sub: 'fee-based program operations' },
              { label: 'Fundraising', value: '~4%', sub: 'administration and overhead' },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 rounded-xl bg-slate-50">
                <div className="font-display text-[30px] font-black text-navy mb-1">{s.value}</div>
                <div className="font-semibold text-[13px] text-navy mb-1">{s.label}</div>
                <div className="text-[12px] text-slate-400">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link href="/annual-report"
              className="inline-block bg-navy text-white font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-navy-mid transition-colors no-underline">
              View Annual Report
            </Link>
            <Link href="/contact"
              className="inline-block border border-navy text-navy font-medium text-[13px] px-5 py-2.5 rounded-lg hover:bg-navy hover:text-white transition-colors no-underline">
              Request Form 990
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-navy rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-[22px] font-bold text-white mb-2">Ready to Get Involved?</h3>
            <p className="text-[14px] text-white/55">Volunteer, donate, or partner with ODIPA to protect privacy for everyone.</p>
          </div>
          <div className="flex gap-3 flex-wrap flex-shrink-0">
            <Link href="/donate" className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
              Donate
            </Link>
            <Link href="/get-involved/volunteer" className="inline-block border border-white/20 hover:border-white/40 text-white font-medium text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
              Volunteer
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
