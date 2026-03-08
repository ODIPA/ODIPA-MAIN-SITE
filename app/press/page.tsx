import type { Metadata } from 'next'
import Link from 'next/link'
import { Landmark, ShieldOff, Smartphone, Users, Building2, BrainCircuit } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Press & Media',
  description: 'ODIPA press resources — media kit, expert commentary, press releases, and contact information for journalists covering digital privacy and data protection.',
  alternates: { canonical: 'https://odipa.org/press' },
}

const coverageAreas = [
  { icon: <Landmark className="w-6 h-6" />, title: 'Privacy Legislation', desc: 'State and federal privacy bills, regulatory rulemaking, and enforcement actions by the FTC and state attorneys general.' },
  { icon: <ShieldOff className="w-6 h-6" />, title: 'Data Breaches', desc: 'Consumer impact analysis, breach notification requirements, and guidance on protective steps for affected individuals.' },
  { icon: <Smartphone className="w-6 h-6" />, title: 'Platform Privacy', desc: 'Social media data practices, ad targeting, terms of service analysis, and consumer rights vis-à-vis tech platforms.' },
  { icon: <Users className="w-6 h-6" />, title: 'Vulnerable Populations', desc: 'Privacy issues disproportionately affecting seniors, children, and low-income communities — and the policies that address them.' },
  { icon: <Building2 className="w-6 h-6" />, title: 'Corporate Compliance', desc: 'How businesses are (and aren\'t) complying with CCPA/CPRA, GDPR, GLBA, BSA, PCI DSS, HIPAA, HITECH, NERC CIP, BIPA, FERPA, COPPA, SOC 2, NIST, and the growing patchwork of state privacy laws.' },
  { icon: <BrainCircuit className="w-6 h-6" />, title: 'AI & Data Privacy', desc: 'The intersection of artificial intelligence, machine learning, and consumer privacy rights in an evolving regulatory landscape.' },
]

const releases = [
  {
    date: 'January 2026',
    headline: 'ODIPA Receives IRS 501(c)(3) Tax-Exempt Status',
    summary: 'ODIPA announced receipt of its IRS determination letter granting 501(c)(3) tax-exempt status, confirming the organization\'s standing as a public charity and enabling tax-deductible contributions.',
  },
  {
    date: '2026',
    headline: 'ODIPA Launches odipa.org and Eight Public Programs',
    summary: 'ODIPA released odipa.org as a fully open-source Next.js website and launched eight consumer education, advocacy, and technical programs as part of its public debut.',
  },
  {
    date: 'November 2024',
    headline: 'ODIPA Incorporated in California',
    summary: 'ODIPA — Organization for Digital Information Privacy & Awareness — was incorporated in California on November 14, 2024, establishing its legal structure and charitable purpose.',
  },
]

const expertTopics = [
  'CCPA/CPRA consumer rights and business compliance',
  'Financial services privacy — GLBA, BSA, PCI DSS, and data sharing',
  'Healthcare data privacy — HIPAA, HITECH, and emerging threats',
  'Federal privacy legislation landscape',
  'Data broker industry and opt-out strategies',
  'Privacy implications of AI and machine learning',
  'Senior and vulnerable population privacy risks',
  'Children\'s online privacy (COPPA and beyond)',
  'Corporate data practices and certification standards',
  'International privacy law comparisons (GDPR vs US)',
]

export default function PressPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy pt-28 pb-16 px-6 overflow-hidden">
        <div className="max-w-[960px] mx-auto">
          <Link href="/about" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← About ODIPA
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />Press & Media
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h1 className="font-display text-[clamp(34px,5vw,56px)] font-black text-white leading-[1.08] mb-4">
                Media Resources
              </h1>
              <p className="text-[16px] text-white/60 leading-[1.8] mb-6">
                ODIPA&apos;s experts are available for interviews, commentary, and background briefings on digital privacy, data protection policy, and consumer rights.
              </p>
              <a href="mailto:press@odipa.org"
                className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-7 py-3.5 rounded-lg transition-colors no-underline">
                Contact Press Team
              </a>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Press inquiries', value: 'press@odipa.org' },
                { label: 'Response time', value: 'Same business day' },
                { label: 'Availability', value: 'Phone, video, on-record, background' },
                { label: 'Incorporated', value: 'November 14, 2024 — California' },
                { label: 'Nonprofit status', value: '501(c)(3) — EIN: 33-2725121' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <span className="font-mono text-[11px] text-white/40">{item.label}</span>
                  <span className="text-[13px] text-white font-medium sm:text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">
        <main className="space-y-16">

          {/* Coverage areas */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
              <span className="block w-5 h-px bg-blue-brand" />Areas of Expert Commentary
            </div>
            <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
              ODIPA staff and advisors are available to provide independent, nonpartisan expert commentary across a wide range of privacy topics.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coverageAreas.map((area) => (
                <div key={area.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm hover:border-blue-brand/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy mb-3">{area.icon}</div>
                  <h3 className="font-display text-[16px] font-bold text-navy mb-2">{area.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-[1.75]">{area.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Press releases */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Press Releases
            </div>
            <div className="space-y-4">
              {releases.map((r) => (
                <div key={r.headline} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-all">
                  <div className="font-mono text-[10px] text-gold uppercase tracking-[1px] mb-2">{r.date}</div>
                  <h3 className="font-display text-[17px] font-bold text-navy mb-2 leading-snug">{r.headline}</h3>
                  <p className="text-[13px] text-slate-500 leading-[1.75] mb-3">{r.summary}</p>
                  <a href="mailto:press@odipa.org" className="font-mono text-[11px] text-blue-brand hover:text-navy transition-colors">
                    Request full release →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Expert topics */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Expert Interview Topics
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expertTopics.map((topic) => (
                  <div key={topic} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                    <span className="text-gold font-bold flex-shrink-0 mt-0.5">✓</span>
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Media guidelines */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Media Guidelines
            </div>
            <div className="space-y-4">
              {[
                { q: 'How should ODIPA be identified in coverage?', a: 'ODIPA (Organization for Digital Information Privacy & Awareness) is a 501(c)(3) nonprofit organization based in Los Angeles, California, focused on consumer digital privacy education and advocacy.' },
                { q: 'Is ODIPA available for on-the-record quotes?', a: 'Yes. ODIPA spokespeople are available for on-the-record commentary, background briefings, and attributed expert analysis. We are nonpartisan and do not make political endorsements.' },
                { q: 'Can I use ODIPA\'s logo and materials?', a: 'Press and media may use ODIPA\'s logo and research with proper attribution. High-resolution assets are available by request at press@odipa.org.' },
                { q: 'What is your embargo policy?', a: 'ODIPA will honor reasonable embargo requests from media partners for joint announcements. Contact press@odipa.org to discuss.' },
              ].map((item) => (
                <div key={item.q} className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-[15px] text-navy mb-2">{item.q}</h3>
                  <p className="text-[14px] text-slate-500 leading-[1.75]">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

        </main>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="bg-navy rounded-2xl p-6 sticky top-24">
            <div className="font-mono text-[10px] text-gold-light uppercase tracking-[2px] mb-4">Press Contact</div>
            <p className="text-[13px] text-white/60 leading-relaxed mb-5">
              For media inquiries, interview requests, and press materials, contact our communications team directly.
            </p>
            <a href="mailto:press@odipa.org"
              className="block w-full text-center bg-gold hover:bg-gold-light text-navy font-bold text-[13px] py-3 rounded-lg transition-colors no-underline mb-3">
              press@odipa.org
            </a>
            <p className="font-mono text-[10px] text-white/30 text-center">Same-day response during business hours</p>

            <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
              <div className="font-mono text-[10px] text-gold-light uppercase tracking-[2px] mb-3">Also Available</div>
              {[
                { label: 'Media Kit', action: 'Request via email' },
                { label: 'Hi-res Logo', action: 'press@odipa.org' },
                { label: 'Fact Sheet', action: 'Request via email' },
                { label: 'Annual Report', href: '/annual-report' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-[12px]">
                  <span className="text-white/50">{item.label}</span>
                  {item.href
                    ? <Link href={item.href} className="text-gold-light hover:text-gold no-underline transition-colors">{item.action || 'View →'}</Link>
                    : <span className="text-white/30 italic">{item.action}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
