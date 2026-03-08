import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Scale, Laptop, Microscope, GraduationCap, Megaphone, PenLine, Globe, BarChart2, Wifi, Calendar, Clock, Users, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Volunteer',
  description: 'Join ODIPA as a volunteer. Share your expertise in privacy law, technology, research, advocacy, or education to help protect digital rights for everyone.',
  alternates: { canonical: 'https://odipa.org/get-involved/volunteer' },
}

const roles = [
  {
    icon: <Award className="w-5 h-5" />,
    title: 'Certification Assessor',
    commitment: '8–12 hrs/engagement',
    desc: 'Conduct structured privacy compliance assessments for organizations applying for the ODIPA Trust Seal. Review documentation, conduct assessment interviews, prepare gap analysis reports, and participate in the two-assessor certification decision panel. Requires active credential in at least one recognized framework.',
    skills: ['CIPP/US or CIPP/E', 'CISA · CISSP · QSA · CHPC or CAMS', 'Privacy audit experience'],
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: 'Privacy Attorney',
    commitment: '4–6 hrs/month',
    desc: 'Review position papers, advise on legislative submissions, assist with certification program legal framework, and provide guidance on consumer rights issues.',
    skills: ['Privacy law', 'CCPA · GDPR · GLBA · HIPAA · PCI DSS · BIPA', 'Regulatory compliance'],
  },
  {
    icon: <Laptop className="w-5 h-5" />,
    title: 'Software Developer',
    commitment: '4–8 hrs/month',
    desc: 'Contribute to our open-source privacy tools, maintain the ODIPA website, build new features, and help developer community members with code reviews.',
    skills: ['Next.js / React', 'TypeScript', 'Open-source collaboration'],
  },
  {
    icon: <Microscope className="w-5 h-5" />,
    title: 'Privacy Researcher',
    commitment: '6–10 hrs/month',
    desc: 'Conduct independent research, co-author research briefs and the annual State of Privacy report, and monitor emerging data threats and enforcement actions.',
    skills: ['Data analysis', 'Policy research', 'Technical writing'],
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: 'Educator / Trainer',
    commitment: '4–6 hrs/month',
    desc: 'Design and deliver consumer education workshops, webinars, and courses. Create curriculum materials and facilitate community learning sessions.',
    skills: ['Public speaking', 'Curriculum design', 'Adult education'],
  },
  {
    icon: <Megaphone className="w-5 h-5" />,
    title: 'Community Advocate',
    commitment: '2–4 hrs/month',
    desc: 'Represent ODIPA at community events, spread awareness on social media, facilitate local meetups, and help recruit participants for programs.',
    skills: ['Community organizing', 'Social media', 'Public outreach'],
  },
  {
    icon: <PenLine className="w-5 h-5" />,
    title: 'Content Writer',
    commitment: '3–5 hrs/month',
    desc: 'Write blog posts, campaign copy, research summaries, and educational materials. Help translate complex privacy topics into accessible consumer content.',
    skills: ['Copywriting', 'Plain language', 'Privacy knowledge'],
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Translator',
    commitment: '2–4 hrs/month',
    desc: 'Translate educational content, website materials, and consumer guides into Spanish, Mandarin, Tagalog, or other languages to expand ODIPA\'s reach.',
    skills: ['Bilingual fluency', 'Technical translation', 'Cultural awareness'],
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: 'Data Analyst',
    commitment: '4–6 hrs/month',
    desc: 'Analyze privacy breach datasets, track legislative trends, build visualizations for reports, and support evidence-based advocacy with quantitative research.',
    skills: ['Data analysis', 'Statistics', 'Data visualization'],
  },
]

const process = [
  { num: '01', title: 'Apply', desc: 'Submit your volunteer application below with your background, skills, and availability.' },
  { num: '02', title: 'Intro Call', desc: 'A 20-minute call with our volunteer coordinator to discuss your interests and match you with the right role.' },
  { num: '03', title: 'Onboarding', desc: 'Complete a short onboarding process — background context, tools access, and intro to your team lead.' },
  { num: '04', title: 'Contribute', desc: 'Start making an impact. Most volunteers contribute remotely on a flexible schedule.' },
]

const faqs = [
  { q: 'Is volunteering fully remote?', a: 'Yes — the vast majority of ODIPA volunteer work is remote and asynchronous. Some local volunteers may choose to help at in-person events in the Los Angeles area, but this is never required.' },
  { q: 'How much time do I need to commit?', a: 'Most roles require 2–10 hours per engagement depending on the position. We work around your schedule and never pressure volunteers to overextend. Quality over quantity.' },
  { q: 'Do I need privacy expertise to volunteer?', a: 'Not necessarily. While some roles require specific expertise (e.g., privacy law, software development), others need general skills like writing, translation, or community organizing. We train volunteers on privacy fundamentals.' },
  { q: 'What credentials do I need to be a Certification Assessor?', a: 'Assessors must hold at least one active, recognized credential relevant to privacy or information security — such as CIPP/US, CIPP/E, CIPM, CISA, CISSP, QSA, CHPC, or CAMS. Credentials must be current and in good standing. Lapsed credentials require renewal before assessor assignments resume. If you are working toward a credential, apply now and we will match you to an assessor shadow role while you complete certification.' },
  { q: 'Is there a background check?', a: 'Volunteers in roles involving direct community outreach or certification program work may be asked to complete a basic background check. This will be communicated clearly during onboarding.' },
  { q: 'Can I volunteer as part of a corporate social responsibility program?', a: 'Yes. Many of our volunteers are supported by their employers through CSR programs. If your company offers volunteer time off (VTO) or skills-based volunteering programs, ODIPA qualifies. Contact volunteer@odipa.org for a corporate volunteer letter.' },
]

export default function VolunteerPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/photo-1593113598332-cd288d649433_1200.jpg"
            alt="Volunteers collaborating together"
            fill className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/85 to-navy" />
        </div>
        <div className="relative max-w-[960px] mx-auto px-6 pt-32 pb-20">
          <Link href="/#involved" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← Get Involved
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />Volunteer Program
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,60px)] font-black text-white leading-[1.08] mb-5">
            Volunteer With ODIPA
          </h1>
          <p className="text-[17px] text-white/65 leading-[1.8] max-w-[580px] mb-8">
            ODIPA is powered by skilled volunteers who believe privacy is a fundamental right. Bring your expertise — legal, technical, creative, or community — and help us protect people&apos;s digital lives.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Remote-friendly',   icon: <Wifi className="w-3.5 h-3.5" /> },
              { label: 'Flexible schedule', icon: <Calendar className="w-3.5 h-3.5" /> },
              { label: '2–10 hrs/month',    icon: <Clock className="w-3.5 h-3.5" /> },
              { label: 'All skill levels',  icon: <Users className="w-3.5 h-3.5" /> },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[13px] text-white/70">
                {b.icon}
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">
        <main className="space-y-16">

          {/* Open roles */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
              <span className="block w-5 h-px bg-blue-brand" />Open Volunteer Roles
            </div>
            <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
              We welcome volunteers across all disciplines. Find the role that matches your skills and interests — or reach out if you have something unique to offer.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((role) => (
                <div key={role.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-brand/30 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand flex-shrink-0">{role.icon}</div>
                    <span className="font-mono text-[10px] text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {role.commitment}
                    </span>
                  </div>
                  <h3 className="font-display text-[17px] font-bold text-navy mb-2">{role.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-[1.75] mb-4">{role.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.skills.map((s) => (
                      <span key={s} className="font-mono text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
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
              {process.map((s) => (
                <div key={s.num} className="bg-white p-6">
                  <div className="font-mono text-[28px] font-black text-gold/30 mb-3">{s.num}</div>
                  <h3 className="font-display text-[15px] font-bold text-navy mb-2">{s.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
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
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-[15px] text-navy mb-2">{faq.q}</h3>
                  <p className="text-[14px] text-slate-500 leading-[1.75]">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Application CTA */}
          <div className="bg-navy rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-[22px] font-bold text-white mb-2">Ready to Apply?</h3>
              <p className="text-[14px] text-white/55">We review all applications within 5 business days.</p>
            </div>
            <div className="flex gap-3 flex-wrap flex-shrink-0">
              <Link href="/contact"
                className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
                Apply to Volunteer
              </Link>
              <Link href="/#involved"
                className="inline-block border border-white/20 hover:border-white/40 text-white font-medium text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
                Other Ways to Help
              </Link>
            </div>
          </div>

        </main>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 space-y-5">

            <div>
              <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-4">At a Glance</div>
              {[
                { label: 'Format', value: 'Remote-first' },
                { label: 'Commitment', value: '2–10 hrs/month' },
                { label: 'Schedule', value: 'Flexible / async' },
                { label: 'Compensation', value: 'Volunteer (unpaid)' },
                { label: 'Open roles', value: '8 areas' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-slate-400 font-mono text-[10px]">{item.label}</span>
                  <span className="font-semibold text-navy text-[12px] text-right">{item.value}</span>
                </div>
              ))}
            </div>

            <Link href="/contact"
              className="block w-full text-center bg-gold hover:bg-gold-light text-navy font-bold text-[13px] py-3 rounded-lg transition-colors no-underline">
              Apply to Volunteer
            </Link>

            <div className="pt-2">
              <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-3">Other Ways to Help</div>
              <ul className="space-y-1">
                {[
                  { label: 'Donate', href: '/donate' },
                  { label: 'Corporate Partner', href: '/get-involved/corporate-partner' },
                  { label: 'Contribute Code', href: '/get-involved/contribute-code' },
                  { label: 'Get Certified', href: '/get-involved/get-certified' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="flex items-center gap-2 text-[12px] py-1.5 px-2 -mx-2 text-slate-500 hover:text-navy hover:bg-slate-50 rounded transition-colors no-underline">
                      <span className="text-gold font-bold">→</span>
                      {item.label}
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
