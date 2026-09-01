import type { Metadata } from 'next'
import Link from 'next/link'
import criteria from '@/data/certification-criteria.json'

export const metadata: Metadata = {
  title: 'Certification Criteria | ODIPA Corporate Privacy Certification',
  description:
    'The published criteria ODIPA assesses organizations against for its Corporate Privacy Certification, with evidence expectations, framework references, rating scale, and certification decision rule.',
  alternates: { canonical: 'https://www.odipa.org/programs/corporate-certification/criteria' },
}

type Criterion = { id: string; m: boolean; title: string; req: string; ev: string[]; refs: string[] }
type Domain = { id: string; name: string; intro: string; criteria: Criterion[] }

export default function CertificationCriteriaPage() {
  const domains = criteria.domains as Domain[]
  const total = domains.reduce((n, d) => n + d.criteria.length, 0)
  const mandatory = domains.reduce((n, d) => n + d.criteria.filter(c => c.m).length, 0)

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-14">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[2px] font-bold mb-5">
            <span className="block w-5 h-px bg-gold-light" />Corporate Privacy Certification
          </div>
          <h1 className="font-display text-[34px] sm:text-[42px] font-bold text-white leading-[1.1] mb-4">
            Certification Criteria
          </h1>
          <p className="text-white/70 text-[16px] leading-[1.7] max-w-2xl">
            These are the criteria ODIPA assesses organizations against. We publish them in full because a
            certification is only as meaningful as the standard behind it, and because organizations deserve
            to know exactly what they are being evaluated on before they apply.
          </p>
          <div className="flex flex-wrap gap-2 mt-7">
            {[
              `Version ${criteria.version}`,
              `${total} criteria across ${domains.length} domains`,
              `${mandatory} mandatory`,
            ].map(b => (
              <span key={b} className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[12px] text-white/70 font-mono">{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-14">

        {/* Status */}
        <div className="bg-gold/10 border border-gold/40 rounded-xl px-5 py-4 text-[13.5px] text-navy leading-[1.7]">
          <span className="font-mono text-[10px] uppercase tracking-[2px] font-bold text-gold block mb-1">Status</span>
          {criteria.status} Effective date, {criteria.effectiveDate}.
        </div>

        {/* What certification means */}
        <section>
          <h2 className="font-display text-[22px] font-bold text-navy mb-4">What certification attests</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 text-[14.5px] text-slate-600 leading-[1.75]">
            <p>ODIPA certification is a conformity assessment. It attests that, on the assessment date, an organization met the criteria on this page as evidenced to ODIPA-qualified assessors. The criteria draw on established privacy and security frameworks, and each criterion cites the provisions that informed it.</p>
            <p className="text-navy font-semibold">Certification is not a determination of legal compliance. Only regulators and courts can make that determination. The framework references below show where a criterion comes from. They do not certify that an organization complies with the cited law.</p>
          </div>
        </section>

        {/* Rating scale */}
        <section>
          <h2 className="font-display text-[22px] font-bold text-navy mb-4">Rating scale</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {criteria.ratings.map(([name, desc]) => (
              <div key={name} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="font-mono text-[11px] uppercase tracking-[1.5px] font-bold text-blue-brand mb-1">{name}</p>
                <p className="text-[13.5px] text-slate-600 leading-[1.7]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Decision rule */}
        <section>
          <h2 className="font-display text-[22px] font-bold text-navy mb-4">Certification decision rule</h2>
          <ol className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 list-decimal list-inside text-[14.5px] text-slate-600 leading-[1.75]">
            {criteria.decisionRule.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
        </section>

        {/* Domain index */}
        <nav className="flex flex-wrap gap-2">
          {domains.map(d => (
            <a key={d.id} href={`#${d.id}`} className="border border-navy/20 rounded-full px-4 py-1.5 text-[12.5px] text-navy hover:bg-navy hover:text-white transition-colors">{d.id} · {d.name}</a>
          ))}
        </nav>

        {/* Domains */}
        {domains.map(d => (
          <section key={d.id} id={d.id} className="scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-mono text-[12px] font-bold text-gold">{d.id}</span>
              <h2 className="font-display text-[24px] font-bold text-navy">{d.name}</h2>
            </div>
            <p className="text-[14px] text-slate-500 leading-[1.7] mb-5 max-w-2xl">{d.intro}</p>
            <div className="space-y-3">
              {d.criteria.map(c => (
                <article key={c.id} id={c.id} className="bg-white rounded-xl border border-slate-200 p-5 scroll-mt-28">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <a href={`#${c.id}`} className="font-mono text-[12px] font-bold text-blue-brand">{c.id}</a>
                    <h3 className="font-display text-[16px] font-bold text-navy">{c.title}</h3>
                    {c.m && <span className="ml-auto font-mono text-[9px] uppercase tracking-[1.5px] font-bold bg-navy text-gold px-2 py-0.5 rounded">Mandatory</span>}
                  </div>
                  <p className="text-[14.5px] text-slate-700 leading-[1.75] mb-3">{c.req}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px] leading-[1.6]">
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-[1.5px] font-bold text-slate-400 mb-1">Evidence accepted</p>
                      <ul className="text-slate-600 list-disc list-inside">{c.ev.map(e => <li key={e}>{e}</li>)}</ul>
                    </div>
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-[1.5px] font-bold text-slate-400 mb-1">Framework references</p>
                      <ul className="text-slate-600 list-disc list-inside">{c.refs.map(r => <li key={r}>{r}</li>)}</ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* Footer links */}
        <section className="bg-navy rounded-2xl p-8 text-center">
          <h2 className="font-display text-[22px] font-bold text-white mb-2">Ready to be assessed against these criteria?</h2>
          <p className="text-white/60 text-[14px] mb-6 max-w-xl mx-auto">The program is accepting inquiries for its founding cohort. Founding organizations help shape how these criteria are applied in practice.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/get-involved/get-certified" className="bg-gold text-navy font-semibold rounded-lg px-6 py-3 text-[14px]">Inquire about certification</Link>
            <Link href="/programs/corporate-certification" className="border border-white/30 text-white rounded-lg px-6 py-3 text-[14px]">Program overview</Link>
            <a href="/documents/ODIPA-Certification-Criteria-v1.pdf" className="border border-white/30 text-white rounded-lg px-6 py-3 text-[14px]">Download PDF</a>
          </div>
        </section>
      </div>
    </div>
  )
}
