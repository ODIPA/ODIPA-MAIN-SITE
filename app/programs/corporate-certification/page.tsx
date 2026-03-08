import type { Metadata } from 'next'
import { ClipboardCheck, Search, Users, ShieldAlert, BadgeCheck, RefreshCw, GraduationCap, Award, Scale, CreditCard, Stethoscope, Cpu } from 'lucide-react'
import ProgramLayout from '@/components/ProgramLayout'

export const metadata: Metadata = {
  title: 'Corporate Certification',
  description: 'ODIPA\'s Corporate Privacy Certification gives businesses a credible, independent seal that signals genuine commitment to consumer data protection.',
  alternates: { canonical: 'https://odipa.org/programs/corporate-certification' },
}

const credentials = [
  {
    icon: <GraduationCap className="w-5 h-5" />,
    name: 'CIPP/US',
    full: 'Certified Information Privacy Professional / United States',
    body: 'IAPP',
    scope: 'CCPA/CPRA, GLBA, HIPAA, US state privacy laws',
    color: 'text-blue-brand bg-blue-brand/10',
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    name: 'CIPP/E',
    full: 'Certified Information Privacy Professional / Europe',
    body: 'IAPP',
    scope: 'GDPR, LGPD, PIPEDA, international transfers',
    color: 'text-blue-brand bg-blue-brand/10',
  },
  {
    icon: <Award className="w-5 h-5" />,
    name: 'CIPM',
    full: 'Certified Information Privacy Manager',
    body: 'IAPP',
    scope: 'Privacy program governance and management',
    color: 'text-blue-brand bg-blue-brand/10',
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    name: 'CIPT',
    full: 'Certified Information Privacy Technologist',
    body: 'IAPP',
    scope: 'Privacy by design, PETs, technical controls',
    color: 'text-blue-brand bg-blue-brand/10',
  },
  {
    icon: <Scale className="w-5 h-5" />,
    name: 'CISA',
    full: 'Certified Information Systems Auditor',
    body: 'ISACA',
    scope: 'SOC 2, ISO 27001, IT audit and controls',
    color: 'text-gold bg-gold/10',
  },
  {
    icon: <Award className="w-5 h-5" />,
    name: 'CISSP',
    full: 'Certified Information Systems Security Professional',
    body: 'ISC2',
    scope: 'Broad security and privacy architecture',
    color: 'text-gold bg-gold/10',
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    name: 'QSA',
    full: 'Qualified Security Assessor',
    body: 'PCI SSC',
    scope: 'PCI DSS payment card data security',
    color: 'text-slate-600 bg-slate-100',
  },
  {
    icon: <Stethoscope className="w-5 h-5" />,
    name: 'CHPC',
    full: 'Certified in Healthcare Privacy Compliance',
    body: 'AAPC',
    scope: 'HIPAA, HITECH, healthcare data governance',
    color: 'text-slate-600 bg-slate-100',
  },
  {
    icon: <Scale className="w-5 h-5" />,
    name: 'CAMS',
    full: 'Certified Anti-Money Laundering Specialist',
    body: 'ACAMS',
    scope: 'BSA, AML, financial intelligence data',
    color: 'text-slate-600 bg-slate-100',
  },
]

const methodologySteps = [
  {
    num: '01',
    title: 'Credential Matching',
    desc: 'Every assessment is staffed by assessors holding credentials directly relevant to the organization\'s industry and applicable frameworks. A healthcare applicant is assessed by a CHPC/CIPP-credentialed assessor; a financial services applicant by CAMS/CIPP assessors.',
  },
  {
    num: '02',
    title: 'Framework Scoping',
    desc: 'Before assessment begins, ODIPA identifies all applicable frameworks based on the organization\'s industry, size, data types, and jurisdictions. Assessments are never one-size-fits-all.',
  },
  {
    num: '03',
    title: 'Independent Review Panel',
    desc: 'Certification decisions are made by a minimum two-assessor panel. No single assessor can unilaterally certify or deny an organization. Decisions are documented and retained.',
  },
  {
    num: '04',
    title: 'Conflicts of Interest Policy',
    desc: 'Assessors may not evaluate organizations they have a financial, employment, or advisory relationship with. All assessors sign ODIPA\'s conflict-of-interest disclosure annually.',
  },
  {
    num: '05',
    title: 'Continuing Education',
    desc: 'ODIPA assessors maintain active credentials and complete continuing education on evolving privacy law. Credential lapses result in suspension from the assessor panel pending renewal.',
  },
  {
    num: '06',
    title: 'Confidentiality Commitment',
    desc: 'All assessment materials, findings, and gap analyses are confidential. ODIPA publishes only certification status — never assessment details — and retains documents under strict access controls.',
  },
]

export default function Page() {
  return (
    <ProgramLayout data={{
      num: '05',
      pct: '9%',
      pctFree: '4%',
      pctFee: '5%',
      title: 'Corporate Certification',
      tag: 'Fee-based',
      tagColor: 'text-gold border-gold/30 bg-gold/10',
      image: '/images/corporate-certification.jpg',
      imageAlt: 'Business professionals reviewing compliance documentation together',
      hero: `Consumers are skeptical of self-declared privacy commitments. ODIPA's Corporate Certification program provides independent, rigorous verification — giving privacy-committed organizations a seal that actually means something.`,
      overview: `ODIPA's Corporate Privacy Certification is a structured assessment of an organization's data practices against applicable privacy law and industry best practices. Unlike self-certification or checkbox compliance, ODIPA's process involves documentation review, staff training verification, breach response evaluation, and a structured interview with our assessment team. We benchmark against CCPA/CPRA, VCDPA, CPA, CTDPA, GLBA, BSA, PCI DSS, HIPAA, HITECH, NERC CIP, BIPA, FERPA, COPPA, SOC 2, NIST Privacy Framework, ISO 27001, GDPR, LGPD, PIPEDA, PIPL, and additional applicable state and international laws — covering financial services, healthcare, energy, education, technology, and all consumer-facing industries. Organizations that pass receive the ODIPA Trust Seal — a verifiable, annually renewed mark that signals genuine commitment to consumer privacy. Revenue from certifications directly funds ODIPA's free consumer programs.`,
      whatWeDo: [
        { icon: <ClipboardCheck className="w-5 h-5" />, title: 'Privacy Compliance Assessment', desc: 'Fee-based structured review of your organization\'s data collection, processing, retention, and sharing practices against applicable law. Fees are set at cost to sustain program operations.' },
        { icon: <Search className="w-5 h-5" />, title: 'Policy & Documentation Review', desc: 'Fee-based evaluation of your privacy policy, consent mechanisms, data subject request processes, and internal data governance documentation.' },
        { icon: <Users className="w-5 h-5" />, title: 'Employee Training Verification', desc: 'Fee-based assessment of staff privacy training programs, including frequency, content coverage, and completion rates.' },
        { icon: <ShieldAlert className="w-5 h-5" />, title: 'Breach Response Evaluation', desc: 'Fee-based review of your incident response plan, breach notification procedures, and historical response track record.' },
        { icon: <BadgeCheck className="w-5 h-5" />, title: 'ODIPA Trust Seal', desc: 'Certified organizations receive a verifiable digital seal they can display on their website, marketing materials, and consumer-facing touchpoints. The public certification directory — where consumers can look up any certified company — is free to access and represents the free public benefit of this program (4% of total activity).' },
        { icon: <RefreshCw className="w-5 h-5" />, title: 'Annual Recertification', desc: 'Certification is valid for one year, with streamlined annual renewal to reflect updates to your practices and applicable laws. Renewal fees are set at cost.' },
      ],
      whoWeServe: [
        { group: 'Privacy-Committed Businesses', desc: 'Organizations that take consumer privacy seriously and want independent verification to distinguish themselves from competitors.' },
        { group: 'Consumer-Facing Companies', desc: 'Businesses that collect significant personal data and want to demonstrate trustworthiness to privacy-aware consumers.' },
        { group: 'Regulated Industries', desc: 'Healthcare, financial services, and technology companies seeking a credible third-party assessment alongside regulatory compliance.' },
        { group: 'B2B Vendors', desc: 'Service providers who need to demonstrate privacy compliance to enterprise customers with vendor due diligence requirements.' },
      ],
      outcomes: [
        { metric: 'Annual', label: 'Renewal cycle' },
        { metric: '100%', label: 'Revenue funds free programs' },
        { metric: 'Verifiable', label: 'Digital trust seal' },
        { metric: 'Rigorous', label: 'Independent assessment' },
      ],
      faqs: [
        { q: 'How long does the certification process take?', a: 'The typical process takes 4–6 weeks from application to decision, depending on your organization\'s size and how quickly you submit documentation.' },
        { q: 'What does ODIPA certification cost?', a: 'Pricing is based on organization size. Contact certification@odipa.org for a quote. All revenue from certifications funds ODIPA\'s free consumer programs.' },
        { q: 'What happens if we don\'t pass?', a: 'We provide a confidential Gap Analysis report with specific recommendations. Many organizations address findings and reapply within 60–90 days.' },
      ],
      cta: { label: 'Apply for Certification', href: '/get-involved/get-certified', secondary: { label: 'Download Certification Guide', href: '/documents/ODIPA-Certification-Guide.pdf', download: true } },
    }}>

      {/* Fee funds free — breakdown callout */}
      <section>
        <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
          <span className="block w-5 h-px bg-blue-brand" />Your Fee Funds Our Free Programs
        </div>
        <p className="text-[15px] text-slate-500 leading-relaxed mb-5">
          100% of certification revenue is reinvested into ODIPA&apos;s free public programs. Every assessment fee directly expands the services available to consumers at no cost.
        </p>
        <div className="bg-navy rounded-xl p-6">
          <div className="flex rounded-full overflow-hidden h-2.5 mb-5">
            <div className="bg-white/90" style={{ width: '77%' }} />
            <div className="bg-gold" style={{ width: '19%' }} />
            <div className="bg-white/20" style={{ width: '4%' }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { pct: '77%', label: 'Free public programs', color: 'text-white' },
              { pct: '19%', label: 'Fee-based services', color: 'text-gold-light' },
              { pct: '4%',  label: 'Governance & overhead', color: 'text-white/40' },
            ].map((s) => (
              <div key={s.label}>
                <div className={`font-display text-[26px] font-black leading-none mb-1 ${s.color}`}>{s.pct}</div>
                <div className={`font-mono text-[10px] leading-snug ${s.color}`}>{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center font-mono text-[9px] text-white/25 mt-4">
            Staff compensation is allocated across program activities per IRS functional expense guidelines. Percentages reflect service delivery mix. Source: ODIPA Form 1023.
          </p>
        </div>
      </section>

      {/* Assessor Credentials & Methodology */}
      <section className="space-y-12">

        {/* Assessor Credentials */}
        <div>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />Assessor Credentials
          </div>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
            ODIPA certifications are conducted exclusively by assessors holding recognized, active credentials in the relevant frameworks. Every assessment is staffed based on the applicant&apos;s industry and applicable regulatory scope — no generalist assessors are assigned to specialized domains.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {credentials.map((c) => (
              <div key={c.name} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.color}`}>
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[13px] font-bold text-navy">{c.name}</span>
                    <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{c.body}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-1.5 leading-snug">{c.full}</div>
                  <div className="text-[12px] text-slate-600 leading-snug">{c.scope}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Methodology */}
        <div>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />Assessment Methodology
          </div>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
            ODIPA&apos;s assessment methodology is designed to ensure independence, consistency, and credibility. The following standards govern every certification engagement.
          </p>
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 overflow-hidden bg-white">
            {methodologySteps.map((s, i) => (
              <div key={s.num} className={`flex gap-5 p-5 ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                <div className="flex-shrink-0 font-mono text-[11px] font-black text-gold/60 pt-0.5">{s.num}</div>
                <div>
                  <h3 className="font-semibold text-[14px] text-navy mb-1">{s.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-slate-400 font-mono mt-4">
            ODIPA certification is an independent third-party assessment, not a legal opinion or regulatory safe harbor. Organizations should consult qualified legal counsel for regulatory compliance advice.
          </p>
        </div>

      </section>

    </ProgramLayout>
  )
}
