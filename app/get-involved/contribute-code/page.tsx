import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Bug, Sparkles, BookOpen, TestTube, Globe } from 'lucide-react'
import CommunityTools from '@/components/CommunityTools'
import ToolSubmissionForm from '@/components/ToolSubmissionForm'
import ToolReviewStatus from '@/components/ToolReviewStatus'

export const metadata: Metadata = {
  title: 'Contribute Code & Privacy Tools',
  description: 'Join ODIPA\'s open-source community — contribute code, or submit a privacy tool for review and listing in the Community Privacy Tools directory.',
  alternates: { canonical: 'https://odipa.org/get-involved/contribute-code' },
}

const ways = [
  { icon: <Package className="w-5 h-5" />, title: 'Submit a Privacy Tool', desc: 'Built something that protects people\'s data? Submit it for ODIPA review. Approved tools are listed in our free Community Privacy Tools directory.', highlight: true },
  { icon: <Bug className="w-5 h-5" />, title: 'Fix Bugs', desc: 'Browse open issues on GitHub tagged "good first issue" — ideal for new contributors getting familiar with the codebase.' },
  { icon: <Sparkles className="w-5 h-5" />, title: 'Build Features', desc: 'Pick up feature requests from our roadmap or propose your own improvements to existing privacy tools.' },
  { icon: <BookOpen className="w-5 h-5" />, title: 'Improve Docs', desc: 'Clear documentation is critical for adoption. Help write guides, API references, and how-to tutorials.' },
  { icon: <TestTube className="w-5 h-5" />, title: 'Write Tests', desc: 'Expand test coverage across our repositories — unit tests, integration tests, and end-to-end scenarios.' },
  { icon: <Globe className="w-5 h-5" />, title: 'Translate', desc: 'Help make ODIPA\'s tools and educational content accessible in Spanish, Mandarin, and other languages.' },
]

const stack = [
  { label: 'Frontend', value: 'Next.js 14, React, TypeScript, Tailwind CSS' },
  { label: 'Analytics', value: 'Plausible (cookieless, privacy-first)' },
  { label: 'Hosting', value: 'Azure Static Web Apps + GitHub Actions CI/CD' },
  { label: 'License', value: 'MIT — free for all uses with attribution' },
  { label: 'Repo', value: 'github.com/odipa/ODIPA-MAIN-SITE' },
]

const steps = [
  { num: '01', title: 'Fork the Repo', desc: 'Fork the ODIPA repository on GitHub to your own account.' },
  { num: '02', title: 'Set Up Locally', desc: 'Clone your fork, run npm install, then npm run dev to start the local dev server.' },
  { num: '03', title: 'Pick an Issue', desc: 'Browse open issues and comment on one you\'d like to work on, or open a new issue to propose something.' },
  { num: '04', title: 'Submit a PR', desc: 'Push your changes to a feature branch and open a pull request against the main branch with a clear description.' },
]

export default function ContributeCodePage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/photo-1555066931-4365d14bab8c_1200.jpg"
            alt="Developer writing code"
            fill className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/85 to-navy" />
        </div>
        <div className="relative max-w-[960px] mx-auto px-6 pt-32 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/#involved" className="font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors no-underline">
              Get Involved
            </Link>
            <span className="text-white/20 font-mono text-[11px]">/</span>
            <Link href="/programs/open-source-development" className="font-mono text-[11px] text-gold-light/70 hover:text-gold-light transition-colors no-underline">
              Program #07 — Open-Source Development
            </Link>
          </div>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />Open-Source Contribution
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,60px)] font-black text-white leading-[1.08] mb-5">
            Contribute Code<br />
            <span className="text-gold-light">&amp; Privacy Tools</span>
          </h1>
          <p className="text-[17px] text-white/65 leading-[1.8] max-w-[580px] mb-8">
            Help build the open-source infrastructure that protects people&apos;s digital privacy — or submit a tool you&apos;ve built to our free Community Privacy Tools directory.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a href="#community-tools"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-7 py-3.5 rounded-lg transition-colors no-underline">
              Browse Privacy Tools
            </a>
            <a href="#submit-tool"
              className="inline-block border border-white/25 hover:border-white/50 text-white font-medium text-[14px] px-7 py-3.5 rounded-lg transition-colors no-underline">
              Submit Your Tool
            </a>
            <a href="https://github.com/odipa/ODIPA-MAIN-SITE" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/15 hover:border-white/35 text-white/60 hover:text-white font-medium text-[14px] px-7 py-3.5 rounded-lg transition-colors no-underline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Program context banner */}
      <div className="bg-blue-brand/8 border-b border-blue-brand/15">
        <div className="max-w-[960px] mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-blue-brand bg-blue-brand/10 border border-blue-brand/20 px-2.5 py-1 rounded-full">Program #07</span>
            <span className="text-[13px] text-slate-600">
              This page is the contributor hub for ODIPA&apos;s{' '}
              <Link href="/programs/open-source-development" className="font-semibold text-navy hover:text-blue-brand transition-colors no-underline underline decoration-slate-300 hover:decoration-blue-brand">
                Open-Source Development
              </Link>
              {' '}program — where the tools in the directory below are built, reviewed, and maintained.
            </span>
          </div>
          <Link href="/programs/open-source-development"
            className="flex-shrink-0 font-mono text-[11px] text-blue-brand hover:text-navy border border-blue-brand/30 hover:border-navy px-3 py-1.5 rounded-lg transition-colors no-underline whitespace-nowrap">
            View Program →
          </Link>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">
        <main className="space-y-20">

          {/* ── Community Privacy Tools directory ── */}
          <CommunityTools />

          {/* ── Ways to contribute ── */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Other Ways to Contribute
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ways.map((w) => (
                <div key={w.title} className={`rounded-xl border p-6 hover:shadow-sm transition-all ${
                  w.highlight
                    ? 'bg-gold/5 border-gold/40 hover:border-gold/60'
                    : 'bg-white border-slate-200 hover:border-blue-brand/30'
                }`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand mb-4">{w.icon}</div>
                  <h3 className="font-display text-[16px] font-bold text-navy mb-2">{w.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-[1.75]">{w.desc}</p>
                  {w.highlight && (
                    <a href="#submit-tool" className="inline-block mt-3 font-mono text-[11px] text-gold hover:text-gold-light transition-colors no-underline">
                      Submit a tool →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── How to get started on the repo ── */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Contributing to the ODIPA Codebase
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 rounded-xl overflow-hidden">
              {steps.map((s) => (
                <div key={s.num} className="bg-white p-7">
                  <div className="font-mono text-[28px] font-black text-gold/30 mb-3">{s.num}</div>
                  <h3 className="font-display text-[17px] font-bold text-navy mb-2">{s.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Standards FAQ ── */}
          <section>
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-6">
              <span className="block w-5 h-px bg-blue-brand" />Standards & Guidelines
            </div>
            <div className="space-y-4">
              {[
                { q: 'What coding standards do you follow?', a: 'We use TypeScript for type safety, Tailwind CSS for styling, and conventional commits (feat/fix/docs/style/a11y) for a clean git history. All code is reviewed before merging.' },
                { q: 'Is there a Code of Conduct?', a: 'Yes. ODIPA adheres to the Contributor Covenant v2.1. We are committed to a welcoming, inclusive contributor community. See CODE_OF_CONDUCT.md in the repository.' },
                { q: 'How does content licensing work?', a: 'Code is licensed MIT — free for all uses with attribution. ODIPA branding, logos, and written content remain ODIPA\'s property and are not included in the MIT license.' },
                { q: 'Do you accept first-time contributors?', a: 'Absolutely. Issues tagged "good first issue" are specifically selected for contributors new to the project. We provide detailed context and are happy to mentor.' },
              ].map((faq) => (
                <div key={faq.q} className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-[15px] text-navy mb-2">{faq.q}</h3>
                  <p className="text-[14px] text-slate-500 leading-[1.75]">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Tool submission form ── */}
          <ToolSubmissionForm />

          {/* ── Bottom CTA ── */}
          <div className="bg-navy rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-[22px] font-bold text-white mb-2">Ready to Contribute?</h3>
              <p className="text-[14px] text-white/55">Your first PR — or first tool submission — is waiting.</p>
            </div>
            <div className="flex gap-3 flex-wrap flex-shrink-0">
              <a href="https://github.com/odipa/ODIPA-MAIN-SITE" target="_blank" rel="noopener noreferrer"
                className="inline-block bg-gold hover:bg-gold-light text-navy font-bold text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
                Fork on GitHub
              </a>
              <Link href="/contact"
                className="inline-block border border-white/20 hover:border-white/40 text-white font-medium text-[14px] px-6 py-3 rounded-lg transition-colors no-underline">
                Contact Dev Team
              </Link>
            </div>
          </div>

        </main>

        {/* Sidebar */}
        <aside>
          <div className="space-y-5 sticky top-24">

          {/* Quick nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-4">On This Page</div>
            <nav className="space-y-1">
              {[
                { href: '#community-tools',                     label: 'Community Privacy Tools' },
                { href: '#submit-tool',                          label: 'Submit a Tool' },
                { href: '/programs/open-source-development',     label: 'Program #07 Overview' },
              ].map(item => (
                <a key={item.href} href={item.href}
                  className="flex items-center gap-2 text-[13px] py-2 px-2.5 -mx-2.5 text-slate-500 hover:text-navy hover:bg-slate-50 rounded-lg transition-colors no-underline">
                  <span className="text-gold font-bold text-[10px]">→</span>
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="border-t border-slate-100 mt-5 pt-5">
              <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-3">Tech Stack</div>
              <div className="space-y-3">
                {stack.map(s => (
                  <div key={s.label} className="py-2 border-b border-slate-100 last:border-0">
                    <div className="font-mono text-[9px] text-slate-400 uppercase tracking-wide mb-0.5">{s.label}</div>
                    <div className="text-[12px] text-navy font-medium">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <a href="https://github.com/odipa/ODIPA-MAIN-SITE" target="_blank" rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full bg-navy text-white font-semibold text-[13px] py-3 rounded-lg hover:opacity-90 transition-opacity no-underline">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Open on GitHub
            </a>
          </div>

          {/* Tool submission status — live from GitHub Issues */}
          <ToolReviewStatus />

          </div>{/* end sticky wrapper */}
        </aside>
      </div>
    </div>
  )
}
