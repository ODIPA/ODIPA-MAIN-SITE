import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, Database, CheckSquare, Inbox, GraduationCap, ShieldAlert } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Get Certified',
  description: 'Earn ODIPA certification and demonstrate your organization\'s compliance with state and federal privacy laws. Build consumer trust with independent third-party verification.',
  alternates: { canonical: 'https://odipa.org/get-involved/get-certified' },
}

const certProcess = [
  { num: '01', title: 'Application', duration: 'Day 1', desc: 'Submit your application with basic organizational information and your primary data privacy contact.' },
  { num: '02', title: 'Documentation Review', duration: 'Week 1–2', desc: 'Submit your privacy policy, data maps, consent mechanisms, and employee training records for review.' },
  { num: '03', title: 'Assessment Interview', duration: 'Week 2–3', desc: 'A 60–90 minute structured interview with ODIPA\'s assessment team covering your data practices in depth.' },
  { num: '04', title: 'Gap Analysis', duration: 'Week 3–4', desc: 'We identify any gaps and provide a confidential report with recommendations before making a certification decision.' },
  { num: '05', title: 'Certification Decision', duration: 'Week 4–6', desc: 'Receive your certification decision. Certified organizations receive the ODIPA Trust Seal and certificate.' },
  { num: '06', title: 'Annual Renewal', duration: 'Annually', desc: 'Streamlined renewal review to reflect changes in your practices and evolving privacy laws.' },
]

const whatsCovered = [
  { icon: <FileText className="w-5 h-5" />, title: 'Privacy Policy', desc: 'Clarity, accuracy, and completeness of your consumer-facing privacy disclosures.' },
  { icon: <Database className="w-5 h-5" />, title: 'Data Inventory', desc: 'Documentation of what personal data you collect, why, how long you keep it, and who you share it with.' },
  { icon: <CheckSquare className="w-5 h-5" />, title: 'Consent Mechanisms', desc: 'How you obtain and record consent, and whether it meets applicable legal standards.' },
  { icon: <Inbox className="w-5 h-5" />, title: 'Consumer Rights', desc: 'Your processes for handling data subject requests: access, deletion, correction, and opt-out.' },
  { icon: <GraduationCap className="w-5 h-5" />, title: 'Employee Training', desc: 'Privacy training programs, completion rates, and how staff are kept current on evolving requirements.' },
  { icon: <ShieldAlert className="w-5 h-5" />, title: 'Breach Response', desc: 'Your incident response plan, notification procedures, and historical response track record.' },
]

export default function GetCertifiedPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/photo-1454165804606-c3d57bc86b40_1200.jpg"
            alt="Digital security shield representing certification"
            fill className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/85 to-navy" />
        </div>
        <div className="relative max-w-[960px] mx-auto px-6 pt-32 pb-20">
          <Link href="/#involved" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← Get Involved
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />ODIPA Trust Certification
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,60px)] font-black text-white leading-[1.08] mb-5">
            Get ODIPA Certified
          </h1>
          <p className="text-[17px] text-white/65 leading-[1.8] max-w-[580px] mb-8">
            Independent, third-party verification that your organization actually complies with data privacy laws — not just claims to.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/contact"
              className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-7 py-3.5 rounded-lg transition-colors no-underline">
              Apply for Certification
            </Link>
            <Link href="/contact"
              className="inline-block border border-white/25 hover:border-white/50 text-white font-medium text-[14px] px-7 py-3.5 rounded-lg transition-colors no-underline">
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">
        <main className="space-y-16">

          {/* What is covered */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
              <span className="block w-5 h-px bg-blue-brand" />What We Assess
            </div>
            <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
              Our certification framework evaluates six core dimensions of your privacy program — benchmarked against CCPA/CPRA, VCDPA, CPA, CTDPA and other state laws, GLBA, BSA, PCI DSS, HIPAA, HITECH, NERC CIP, BIPA, FERPA, COPPA, SOC 2, NIST Privacy Framework, ISO 27001, GDPR, LGPD, PIPEDA, and PIPL.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whatsCovered.map((item) => (
                <div key={item.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm hover:border-blue-brand/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand mb-4">{item.icon}</div>
                  <h3 className="font-display text-[16px] font-bold text-navy mb-2">{item.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-[1.75]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Process */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Certification Process
            </div>
            <div className="space-y-px rounded-xl overflow-hidden border border-slate-200">
              {certProcess.map((s, i) => (
                <div key={s.num} className={`flex gap-5 p-5 bg-white ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                  <div className="flex-shrink-0 text-center">
                    <div className="font-mono text-[11px] font-black text-gold/60">{s.num}</div>
                    <div className="font-mono text-[9px] text-slate-300 mt-1 whitespace-nowrap">{s.duration}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[14px] text-navy mb-1">{s.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
              <span className="block w-5 h-px bg-blue-brand" />Pricing
            </div>
            <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
              Certification pricing is determined by two factors: the size of your organization and the number of privacy standards your assessment must cover. Every quote is tailored — there are no fixed tiers, because a small healthcare startup and a small retail company face fundamentally different compliance scopes.
            </p>

            {/* Two factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Factor 1 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center mb-4">
                  <span className="font-mono text-[11px] font-black text-gold">01</span>
                </div>
                <h3 className="font-display text-[16px] font-bold text-navy mb-2">Organization Size</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                  Assessed by both employee headcount and annual revenue. The larger of the two measures determines your size band.
                </p>
                <div className="space-y-2">
                  {[
                    { band: 'Small', detail: 'Under 50 employees  ·  Under $5M revenue' },
                    { band: 'Mid-Market', detail: '50–500 employees  ·  $5M–$50M revenue' },
                    { band: 'Enterprise', detail: '500+ employees  ·  Over $50M revenue' },
                  ].map((row) => (
                    <div key={row.band} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <span className="font-mono text-[10px] font-bold text-gold w-20 flex-shrink-0">{row.band}</span>
                      <span className="font-mono text-[10px] text-slate-400">{row.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Factor 2 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center mb-4">
                  <span className="font-mono text-[11px] font-black text-gold">02</span>
                </div>
                <h3 className="font-display text-[16px] font-bold text-navy mb-2">Standards in Scope</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                  The number of privacy frameworks your assessment must cover — determined by your industry, data types, and jurisdictions of operation.
                </p>
                <div className="space-y-2">
                  {[
                    { example: 'Retail (California)', standards: 'CCPA/CPRA' },
                    { example: 'Healthcare startup', standards: 'HIPAA · HITECH · CCPA' },
                    { example: 'Financial services', standards: 'GLBA · PCI DSS · BSA · CCPA · NYDFS' },
                    { example: 'Global SaaS', standards: 'GDPR · CCPA · PIPEDA · PIPL · ISO 27701' },
                  ].map((row) => (
                    <div key={row.example} className="py-2 border-b border-slate-100 last:border-0">
                      <div className="font-mono text-[10px] font-bold text-navy mb-0.5">{row.example}</div>
                      <div className="font-mono text-[10px] text-slate-400">{row.standards}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote CTA */}
            <div className="bg-navy rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <h3 className="font-display text-[18px] font-bold text-white mb-1">Get a Custom Quote</h3>
                <p className="text-[13px] text-white/55 leading-relaxed">
                  Tell us your industry, size, and jurisdictions. We&apos;ll identify applicable standards and send a quote within 3 business days.
                </p>
              </div>
              <Link href="/contact"
                className="inline-block flex-shrink-0 bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-6 py-3 rounded-lg transition-colors no-underline whitespace-nowrap">
                Request a Quote
              </Link>
            </div>

            <p className="text-[12px] text-slate-400 mt-4 font-mono">
              All certification fees fund ODIPA&apos;s free consumer programs. ODIPA certification is not legal advice.
            </p>
          </section>

          {/* FAQs */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Common Questions
            </div>
            <div className="space-y-4">
              {[
                { q: 'Does ODIPA certification replace legal compliance?', a: 'No. ODIPA certification is an independent third-party assessment, not a legal opinion. We strongly recommend working with a qualified privacy attorney alongside the certification process.' },
                { q: 'What happens if we don\'t pass?', a: 'If our assessment identifies gaps, we provide a confidential gap analysis report with recommendations. You can address the gaps and reapply — there is no penalty for a first-attempt finding.' },
                { q: 'How do we display the Trust Seal?', a: 'Certified organizations receive a digital Trust Seal with a unique verification link. Display it on your website privacy page, footer, or any consumer-facing materials. The seal links to a public verification page.' },
                { q: 'Is our assessment data confidential?', a: 'Yes. All information submitted during the certification process is treated as confidential. ODIPA publishes only that an organization is certified — never the details of the assessment.' },
              ].map((faq) => (
                <div key={faq.q} className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-[15px] text-navy mb-2">{faq.q}</h3>
                  <p className="text-[14px] text-slate-500 leading-[1.75]">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-navy rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-[22px] font-bold text-white mb-2">Ready to Get Certified?</h3>
              <p className="text-[14px] text-white/55">We respond to all applications within 3 business days.</p>
            </div>
            <div className="flex gap-3 flex-wrap flex-shrink-0">
              <Link href="/contact"
                className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
                Apply Now
              </Link>
              <Link href="/programs/corporate-certification"
                className="inline-block border border-white/20 hover:border-white/40 text-white font-medium text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
                Learn More
              </Link>
            </div>
          </div>

        </main>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 space-y-5">
            <div>
              <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-3">Quick Facts</div>
              {[
                { label: 'Timeline', value: '4–8 weeks' },
                { label: 'Validity', value: '1 year' },
                { label: 'Renewal', value: 'Annual streamlined review' },
                { label: 'Standards', value: 'CCPA/CPRA, VCDPA, CPA, CTDPA, GLBA, BSA, PCI DSS, HIPAA, HITECH, NERC CIP, BIPA, FERPA, COPPA, SOC 2, NIST, ISO 27001, GDPR, LGPD, PIPEDA, PIPL' },
                { label: 'Confidential', value: 'Yes — assessment details are private' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-slate-400 font-mono text-[10px]">{item.label}</span>
                  <span className="font-semibold text-navy text-[12px] text-right">{item.value}</span>
                </div>
              ))}
            </div>
            <Link href="/contact"
              className="block w-full text-center bg-gold hover:bg-gold-light text-navy font-bold text-[13px] py-3 rounded-lg transition-colors no-underline">
              Apply for Certification
            </Link>
            <Link href="/programs/corporate-certification"
              className="block w-full text-center border border-navy text-navy font-medium text-[13px] py-3 rounded-lg hover:bg-navy hover:text-white transition-colors no-underline">
              Full Program Details
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
