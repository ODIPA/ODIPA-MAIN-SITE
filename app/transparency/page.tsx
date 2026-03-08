import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ExternalLink, Mail, Shield, BookOpen, ClipboardList, Building2, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Transparency & Financial Disclosures',
  description: 'ODIPA\'s public financial documents, Form 990 filings, IRS determination letter, and governance disclosures. All records available upon request.',
  alternates: { canonical: 'https://odipa.org/transparency' },
}

const documents = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Form 990 / 990-N',
    desc: 'Annual information return filed with the IRS. Public by law under IRC §6104. Year 1 filing will be Form 990-N (gross receipts under $50K). Full Form 990 upon exceeding threshold.',
    status: 'pending',
    statusLabel: 'Filed annually — available upon request',
    action: { label: 'Request a Copy', href: '/contact?topic=transparency' },
    external: { label: 'IRS Tax Exempt Search', href: 'https://apps.irs.gov/app/eos/' },
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'IRS Determination Letter',
    desc: 'Official letter from the IRS confirming ODIPA\'s 501(c)(3) tax-exempt status. Confirms donations are tax-deductible to the extent permitted by law.',
    status: 'available',
    statusLabel: '501(c)(3) status confirmed',
    action: { label: 'Request a Copy', href: '/contact?topic=transparency' },
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    title: 'Form 1023 Application',
    desc: 'ODIPA\'s original application for tax-exempt status, including program descriptions, activity breakdown, and projected budget. Filed and approved.',
    status: 'available',
    statusLabel: 'Available upon request',
    action: { label: 'Request a Copy', href: '/contact?topic=transparency' },
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Articles of Incorporation',
    desc: 'ODIPA\'s founding corporate documents filed with the State of California on November 14, 2024, establishing the organization\'s legal structure and charitable purpose.',
    status: 'available',
    statusLabel: 'Available upon request',
    action: { label: 'Request a Copy', href: '/contact?topic=transparency' },
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Bylaws',
    desc: 'Governing rules for ODIPA\'s board of directors, officer roles, meeting requirements, conflict of interest policy, and amendment procedures.',
    status: 'available',
    statusLabel: 'Available upon request',
    action: { label: 'Request a Copy', href: '/contact?topic=transparency' },
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: 'Conflict of Interest Policy',
    desc: 'ODIPA\'s board-adopted policy governing financial interests, disclosures, and recusal requirements for directors, officers, and key employees.',
    status: 'available',
    statusLabel: 'Available upon request',
    action: { label: 'Request a Copy', href: '/contact?topic=transparency' },
  },
]

const thirdPartyLinks = [
  {
    name: 'IRS Tax Exempt Organization Search',
    desc: 'Official IRS database. Search by EIN or organization name to verify exempt status and view filed 990s.',
    href: 'https://apps.irs.gov/app/eos/',
    note: 'Official IRS source',
  },
  {
    name: 'ProPublica Nonprofit Explorer',
    desc: 'Free public database indexing Form 990 filings for all US nonprofits. Searchable by name, EIN, or location.',
    href: 'https://projects.propublica.org/nonprofits/',
    note: 'Free public access',
  },
  {
    name: 'Candid / GuideStar',
    desc: 'Nonprofit intelligence platform used by foundations, grant reviewers, and major donors for due diligence.',
    href: 'https://candid.org',
    note: 'Used by grant reviewers',
  },
]

const serviceBreakdown = [
  { pct: '77%', label: 'Free public services', color: 'bg-navy', textColor: 'text-navy', items: 'Educational outreach · Advocacy · Research publications · Community events · Awareness campaigns · Open-source tools · International cooperation' },
  { pct: '19%', label: 'Fee-based services', color: 'bg-gold', textColor: 'text-gold', items: 'Corporate training · Business certification · Research sponsorships · Conference fees · Campaign sponsorships · Priority support' },
  { pct: '4%',  label: 'Governance & overhead', color: 'bg-slate-300', textColor: 'text-slate-500', items: 'Board governance · Financial management · Legal compliance · General administration' },
]

export default function TransparencyPage() {
  return (
    <div className="bg-cream min-h-screen overflow-x-clip">

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/80 to-navy" />
        <div className="relative max-w-[960px] mx-auto px-6 pt-32 pb-20">
          <Link href="/about" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← About ODIPA
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />Financial Transparency
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,60px)] font-black text-white leading-[1.08] mb-5">
            Open Books.<br />
            <span className="text-gold-light">Nothing to Hide.</span>
          </h1>
          <p className="text-[17px] text-white/65 leading-[1.8] max-w-[580px]">
            As a 501(c)(3) nonprofit, ODIPA&apos;s financial records are public by law. We go further — proactively making all key documents available upon request and disclosing our service delivery model in full.
          </p>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-16 space-y-16">

        {/* Key facts bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 rounded-xl overflow-hidden">
          {[
            { metric: '501(c)(3)', label: 'Tax-exempt status' },
            { metric: '33-2725121',     label: 'Employer ID number' },
            { metric: '990-N',     label: 'Year 1 filing type' },
            { metric: 'Public',    label: 'All filings by law' },
          ].map((item) => (
            <div key={item.label} className="bg-navy py-7 px-4 text-center">
              <div className="font-display text-[22px] font-black text-gold-light leading-none mb-1.5">{item.metric}</div>
              <div className="text-[11px] text-white/50 leading-snug">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Service delivery breakdown */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />Service Delivery Model
          </div>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
            The following breakdown was disclosed in ODIPA&apos;s Form 1023 application to the IRS and reflects our projected service delivery mix. These percentages describe how ODIPA delivers services — not how we spend money. A separate financial breakdown is available upon request.
          </p>
          <div className="flex rounded-full overflow-hidden h-3 mb-2">
            <div className="bg-navy" style={{ width: '77%' }} />
            <div className="bg-gold" style={{ width: '19%' }} />
            <div className="bg-slate-300" style={{ width: '4%' }} />
          </div>
          <div className="flex text-[10px] font-mono text-slate-400 mb-8">
            <span style={{ width: '77%' }}>77%</span>
            <span style={{ width: '19%' }}>19%</span>
            <span>4%</span>
          </div>
          <div className="space-y-3">
            {serviceBreakdown.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4 items-start">
                <div className={`flex-shrink-0 font-display text-[24px] font-black leading-none mt-0.5 ${s.textColor}`}>{s.pct}</div>
                <div className="min-w-0">
                  <div className="font-semibold text-[14px] text-navy mb-1">{s.label}</div>
                  <div className="text-[12px] text-slate-400 font-mono leading-relaxed">{s.items}</div>
                </div>
                <div className={`flex-shrink-0 w-2 h-full self-stretch rounded-full ${s.color} opacity-40 min-h-[40px]`} />
              </div>
            ))}
          </div>
        </section>

        {/* Public documents */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />Public Documents
          </div>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
            Under IRC §6104, ODIPA must provide copies of its three most recent Form 990s and its Form 1023 application to anyone who requests them. In-person requests are fulfilled same day; written requests within 30 days.
          </p>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.title} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand flex-shrink-0">
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[15px] text-navy">{doc.title}</h3>
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${
                      doc.status === 'available'
                        ? 'text-green-700 bg-green-100'
                        : 'text-gold bg-gold/10'
                    }`}>
                      {doc.statusLabel}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-3">{doc.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={doc.action.href}
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white bg-navy hover:opacity-80 px-3 py-1.5 rounded-lg no-underline transition-opacity">
                      <Mail className="w-3 h-3" />
                      {doc.action.label}
                    </Link>
                    {doc.external && (
                      <a href={doc.external.href} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-blue-brand border border-blue-brand/30 hover:bg-blue-brand/5 px-3 py-1.5 rounded-lg no-underline transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        {doc.external.label}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Third-party lookups */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />Verify Independently
          </div>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
            You don&apos;t have to take our word for it. ODIPA&apos;s filings are available through multiple independent third-party platforms once submitted to the IRS.
          </p>
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 overflow-hidden bg-white">
            {thirdPartyLinks.map((link, i) => (
              <div key={link.name} className={`flex flex-col sm:flex-row gap-3 sm:gap-5 p-5 ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-[14px] text-navy">{link.name}</span>
                    <span className="font-mono text-[9px] text-blue-brand bg-blue-brand/8 border border-blue-brand/20 px-2 py-0.5 rounded-full">{link.note}</span>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{link.desc}</p>
                </div>
                <a href={link.href} target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 self-start inline-flex items-center gap-1.5 font-mono text-[11px] text-blue-brand border border-blue-brand/30 hover:bg-blue-brand/5 px-3 py-1.5 rounded-lg no-underline transition-colors whitespace-nowrap">
                  <ExternalLink className="w-3 h-3" />
                  Visit →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* How to request */}
        <section>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />How to Request Documents
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {[
              { num: '01', title: 'Email Request', desc: 'Email transparency@odipa.org with the document name, your name, and intended use. We respond within 5 business days and fulfill within 30 days as required by law.' },
              { num: '02', title: 'In-Person Request', desc: 'Walk-in requests at ODIPA\'s registered office must be fulfilled same day during normal business hours. Contact us first to confirm availability.' },
              { num: '03', title: 'IRS Direct Request', desc: 'If ODIPA fails to fulfill a legitimate public inspection request, you may request the documents directly from the IRS by filing Form 4506-A. ODIPA is committed to full compliance.' },
            ].map((s, i) => (
              <div key={s.num} className={`flex gap-5 p-5 ${i % 2 === 1 ? 'bg-slate-50' : ''} ${i < 2 ? 'border-b border-slate-200' : ''}`}>
                <div className="flex-shrink-0 font-mono text-[11px] font-black text-gold/60 pt-0.5">{s.num}</div>
                <div>
                  <h3 className="font-semibold text-[14px] text-navy mb-1">{s.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-navy rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-[22px] font-bold text-white mb-2">Have a Question About Our Finances?</h3>
            <p className="text-[14px] text-white/55">We&apos;re happy to answer questions from donors, journalists, grant reviewers, or the general public.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/contact?topic=transparency"
              className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
              Contact Us
            </Link>
            <Link href="/annual-report"
              className="inline-block border border-white/20 hover:border-white/40 text-white font-medium text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
              Annual Report
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
