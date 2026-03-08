import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Award, FlaskConical, Wrench, FileText, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Corporate Partnership — ODIPA',
  description:
    'Purchase ODIPA services for your organization: privacy training, independent certification, research sponsorship, and technical support. A Corporate Partnership is a paid services engagement — not a sponsorship.',
  alternates: { canonical: 'https://odipa.org/get-involved/corporate-partner' },
}

const services = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    name: 'Privacy Training',
    price: null,
    color: 'border-blue-brand/30',
    desc: 'Live or virtual privacy training for your employees, management, or compliance team. Sessions cover CCPA/CPRA, GDPR, HIPAA, and applicable frameworks for your industry.',
    deliverables: [
      'Custom curriculum scoped to your industry and frameworks',
      'Facilitated session with credentialed ODIPA instructor',
      'Post-session resource packet for attendees',
      'Attendance certificate for each participant',
    ],
    note: 'Priced per session based on group size and customization.',
  },
  {
    icon: <Award className="w-6 h-6" />,
    name: 'Privacy Certification',
    price: null,
    color: 'border-gold',
    highlight: true,
    desc: 'Independent third-party assessment of your organization\'s data practices against applicable privacy frameworks. Successful completion earns the ODIPA Trust Seal for use on your website and materials.',
    deliverables: [
      'Full gap analysis report with findings and remediation recommendations',
      'Two-assessor independent review panel (minimum)',
      'ODIPA Trust Seal license upon certification (valid 1 year)',
      'Annual renewal assessment available',
    ],
    note: 'Pricing is based on organization size and number of applicable frameworks. Contact us for a quote. Certification is not a legal opinion or regulatory safe harbor. Organizations should continue working with qualified legal counsel on regulatory obligations.',
  },
  {
    icon: <FlaskConical className="w-6 h-6" />,
    name: 'Research Sponsorship',
    price: null,
    color: 'border-slate-200',
    desc: 'Fund specific ODIPA privacy research projects of public interest. Research findings are independently determined by ODIPA and publicly released — your sponsorship supports the work, not the conclusions.',
    deliverables: [
      'Acknowledgment in published research as research sponsor',
      'Advance copy of published findings before public release',
      'Invitation to research briefing call with lead researcher',
    ],
    note: 'ODIPA retains full editorial control. Research results are publicly released and available to all, including competitors and regulators. No exclusivity granted.',
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    name: 'Technical Support',
    price: null,
    color: 'border-slate-200',
    desc: 'Priority support or custom development for ODIPA\'s open-source privacy tools. Ideal for organizations that want tailored configurations, integrations, or accelerated assistance.',
    deliverables: [
      'Dedicated support queue access (priority response)',
      'Custom configuration or development per agreed scope',
      'Documentation for custom implementations',
      'Hand-off session with ODIPA technical team',
    ],
    note: 'Open-source tools remain MIT licensed and publicly available to all users regardless of technical support engagement.',
  },
]

const differences = [
  { label: 'What you receive', sponsor: 'Public acknowledgment only (name, logo, link)', partner: 'Specific deliverables: reports, certifications, training, support' },
  { label: 'Tax treatment', sponsor: 'IRC §513(i) qualified sponsorship payment — not a charitable contribution', partner: 'Payment for services rendered — may be deductible as ordinary business expense' },
  { label: 'Agreement type', sponsor: 'ODIPA Sponsorship Agreement', partner: 'ODIPA Corporate Partnership Agreement' },
  { label: 'ODIPA\'s role', sponsor: 'Acknowledges your support publicly', partner: 'Delivers contracted services to your organization' },
  { label: 'Influence over ODIPA', sponsor: 'None — recognition only', partner: 'None — all services conducted at arm\'s length, mission-independent' },
  { label: 'Right to use ODIPA name', sponsor: 'May state you are "an ODIPA sponsor"', partner: 'Certified organizations may display the Trust Seal per Brand Guidelines' },
]

export default function CorporatePartnerPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/photo-1556761175-4b46a572b786_1200.jpg"
            alt="Business professionals in a meeting"
            fill className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/85 to-navy" />
        </div>
        <div className="relative max-w-[960px] mx-auto px-6 pt-32 pb-20">
          <Link href="/#involved" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← Get Involved
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />Corporate Partnership — Paid Services
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,60px)] font-black text-white leading-[1.08] mb-5">
            Engage ODIPA<br />for Your Organization
          </h1>
          <p className="text-[17px] text-white/65 leading-[1.8] max-w-[580px] mb-6">
            A Corporate Partnership is a paid services engagement. You purchase training,
            certification, research sponsorship, or technical support — and receive specific
            deliverables in return. This is different from sponsorship.
          </p>

          {/* Sponsorship vs Partnership callout */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-5 max-w-[580px] mb-8">
            <div className="flex items-start gap-3">
              <div className="text-gold-light mt-0.5 flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] text-white/70 leading-relaxed">
                  <span className="text-white font-semibold">Not what you&apos;re looking for?</span>{' '}
                  If you want to support ODIPA&apos;s mission in exchange for public recognition
                  (name and logo placement), that&apos;s a{' '}
                  <Link href="/become-a-sponsor" className="text-gold-light underline hover:text-white transition-colors">
                    Sponsorship
                  </Link>{' '}
                  — a separate agreement under IRC §513(i).
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <a href="/contact?topic=corporate-partnership"
              className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-7 py-3.5 rounded-lg transition-colors no-underline">
              Request Partnership Agreement
            </a>
            <Link href="/contact"
              className="inline-block border border-white/25 hover:border-white/50 text-white font-medium text-[14px] px-7 py-3.5 rounded-lg transition-colors no-underline">
              Contact Partnerships Team
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-16 space-y-20">

        {/* Services */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-3">
            <span className="block w-5 h-px bg-blue-brand" />Available Services
          </div>
          <h2 className="font-display text-[28px] font-bold text-navy mb-2">What You Can Engage ODIPA For</h2>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-10 max-w-[620px]">
            Each service type has its own scope and deliverables. Pricing is tailored to your
            organization — contact us to discuss your needs and receive a quote. All engagements are
            governed by ODIPA&apos;s Corporate Partnership Agreement and conducted at arm&apos;s length
            at fair market value.
          </p>
          <div className="space-y-6">
            {services.map((svc) => (
              <div key={svc.name}
                className={`bg-white rounded-2xl border-2 p-8 ${svc.color} ${svc.highlight ? 'shadow-[0_0_0_1px_#C8920A]' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="w-12 h-12 rounded-xl bg-navy/8 flex items-center justify-center text-navy flex-shrink-0">
                    {svc.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <h3 className="font-display text-[20px] font-bold text-navy">{svc.name}</h3>
                      {svc.highlight && (
                        <span className="font-mono text-[10px] text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-full self-start">
                          MOST REQUESTED
                        </span>
                      )}
                      <span className="font-mono text-[12px] text-gold sm:ml-auto">
                        <a href="/contact?topic=corporate-partnership"
                          className="inline-flex items-center gap-1 text-gold hover:text-gold-light transition-colors no-underline">
                          Request a quote →
                        </a>
                      </span>
                    </div>
                    <p className="text-[14px] text-slate-600 leading-[1.75] mb-5">{svc.desc}</p>
                    <div className="mb-4">
                      <div className="font-semibold text-[12px] text-navy uppercase tracking-wide mb-3">Deliverables</div>
                      <ul className="space-y-2">
                        {svc.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                            <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {svc.note && (
                      <p className="text-[12px] text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 leading-relaxed">
                        <span className="font-semibold">Note:</span> {svc.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sponsorship vs Partnership comparison */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-3">
            <span className="block w-5 h-px bg-blue-brand" />Know the Difference
          </div>
          <h2 className="font-display text-[28px] font-bold text-navy mb-2">Sponsorship vs. Corporate Partnership</h2>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-8 max-w-[620px]">
            These are two separate legal and tax relationships. Make sure you&apos;re engaging the right one.
          </p>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_1fr_1fr] bg-navy text-white text-[13px] font-semibold">
              <div className="px-6 py-4 border-r border-white/10 text-white/60 font-mono text-[11px] uppercase tracking-wide"></div>
              <div className="px-6 py-4 border-r border-white/10">
                <Link href="/become-a-sponsor" className="text-gold-light hover:text-white transition-colors no-underline">
                  Sponsorship →
                </Link>
              </div>
              <div className="px-6 py-4 text-gold">Corporate Partnership</div>
            </div>
            {differences.map((row, i) => (
              <div key={row.label}
                className={`grid grid-cols-[1fr_1fr_1fr] text-[13px] border-t border-slate-100 ${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                <div className="px-6 py-4 font-semibold text-navy border-r border-slate-100">{row.label}</div>
                <div className="px-6 py-4 text-slate-500 border-r border-slate-100">{row.sponsor}</div>
                <div className="px-6 py-4 text-slate-700">{row.partner}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
            <span className="block w-5 h-px bg-blue-brand" />How It Works
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-slate-200 rounded-xl overflow-hidden">
            {[
              { step: '01', title: 'Request Agreement', desc: 'Contact us to receive the Corporate Partnership Agreement for your legal team to review.' },
              { step: '02', title: 'Scope Your Engagement', desc: 'We work with you to define the Statement of Work — services, deliverables, timeline, and pricing.' },
              { step: '03', title: 'Execute & Pay', desc: 'Sign the agreement and submit payment per the schedule. Engagements begin upon execution.' },
              { step: '04', title: 'Receive Deliverables', desc: 'ODIPA delivers your training, certification report, research acknowledgment, or technical output.' },
            ].map((s) => (
              <div key={s.step} className="bg-white p-6">
                <div className="font-mono text-[28px] font-black text-gold/30 mb-3">{s.step}</div>
                <h3 className="font-display text-[16px] font-bold text-navy mb-2">{s.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Agreement CTA */}
        <div className="bg-navy rounded-2xl p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-3">Before You Engage</div>
              <h2 className="font-display text-[28px] font-bold text-white mb-3">Review the Corporate Partnership Agreement</h2>
              <p className="text-[14px] text-white/55 leading-relaxed">
                All engagements are governed by ODIPA&apos;s Corporate Partnership Agreement — a
                formal services contract covering scope, deliverables, payment terms, operational
                independence, conflict of interest disclosure, and IP ownership. Request a copy
                to review with your legal team before we begin.
              </p>
            </div>
            <div className="space-y-3">
              <a href="/contact?topic=corporate-partnership"
                className="flex items-center justify-between w-full bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-7 py-4 rounded-xl transition-colors no-underline">
                <span>Request Corporate Partnership Agreement</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </a>
              <Link href="/contact"
                className="flex items-center justify-center w-full border border-white/20 hover:border-white/40 text-white font-medium text-[14px] px-7 py-4 rounded-xl transition-colors no-underline">
                Contact Partnerships Team
              </Link>
              <p className="text-center font-mono text-[11px] text-white/25 pt-1">
                All engagements at fair market value · Arm&apos;s-length transactions · 501(c)(3) compliant
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
