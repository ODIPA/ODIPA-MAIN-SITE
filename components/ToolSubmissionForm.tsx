'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, Search, Shield, BadgeCheck, Rocket } from 'lucide-react'

// ─── Replace with your Formspree endpoint ────────────────────────────────────
const API_ENDPOINT = '/api/tool-submit'

const CATEGORIES = [
  'Cookie Analysis',
  'Tracker Detection',
  'Policy Analysis',
  'Data Broker',
  'Fingerprinting',
  'Rights Requests',
  'Encryption / Anonymization',
  'Network Privacy',
  'Mobile Privacy',
  'Other',
]

const LICENSES = ['MIT', 'Apache 2.0', 'GPL v2', 'GPL v3', 'LGPL', 'BSD 2-Clause', 'BSD 3-Clause', 'MPL 2.0', 'Other Open Source']

const PLATFORMS = ['CLI', 'Web App', 'Browser Extension', 'Node.js', 'Python Package', 'Mobile App', 'Desktop App', 'API / Library', 'Cross-platform']

type Step = 1 | 2 | 3
type State = 'idle' | 'submitting' | 'success' | 'error'

interface AppFormData {
  // Step 1 — Tool info
  name: string
  tagline: string
  description: string
  category: string
  problem: string
  // Step 2 — Technical
  github: string
  docs: string
  lang: string
  platforms: string[]
  license: string
  // Step 3 — Contributor
  authorName: string
  authorEmail: string
  authorHandle: string
  org: string
  agree: boolean
}

const INIT: AppFormData = {
  name: '', tagline: '', description: '', category: '', problem: '',
  github: '', docs: '', lang: '', platforms: [], license: '',
  authorName: '', authorEmail: '', authorHandle: '', org: '', agree: false,
}

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block font-semibold text-[13px] text-navy mb-1.5">
        {label}{required && <span className="text-gold ml-1">*</span>}
        {hint && <span className="font-normal text-slate-400 ml-2">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
    </div>
  )
}

const inputCls = "w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-[14px] text-navy placeholder-slate-400 focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"

const APPROVAL_STEPS = [
  { num: '01', title: 'Submit',         time: 'Immediate', desc: 'Fill out the form. We acknowledge receipt within 2 business days.', icon: <Send className="w-5 h-5" /> },
  { num: '02', title: 'Initial Review', time: '1–2 weeks', desc: 'ODIPA dev team reviews code quality, documentation, and stated purpose.', icon: <Search className="w-5 h-5" /> },
  { num: '03', title: 'Security Audit', time: '1–3 weeks', desc: 'Volunteer security engineers run dependency scans, static analysis, and manual review.', icon: <Shield className="w-5 h-5" /> },
  { num: '04', title: 'Board Approval', time: '1 week',    desc: 'ODIPA board confirms the tool aligns with our mission and community standards.', icon: <BadgeCheck className="w-5 h-5" /> },
  { num: '05', title: 'Listed',         time: 'Ongoing',   desc: 'Your tool appears in the Community Privacy Tools directory and is promoted to our community.', icon: <Rocket className="w-5 h-5" /> },
]

export default function ToolSubmissionForm() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<AppFormData>(INIT)
  const [errors, setErrors] = useState<Partial<Record<keyof AppFormData, string>>>({})
  const [state, setState] = useState<State>('idle')
  const [honeypot, setHoneypot] = useState('')

  function set<K extends keyof AppFormData>(field: K) {
    return (val: AppFormData[K]) => {
      setForm(prev => ({ ...prev, [field]: val }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const fmtEmail = (v: string) => v.toLowerCase().replace(/\s/g, '')

  function togglePlatform(p: string) {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p]
    }))
  }

  function validateStep(s: Step): boolean {
    const e: Partial<Record<keyof AppFormData, string>> = {}
    if (s === 1) {
      if (!form.name.trim())        e.name = 'Tool name is required'
      if (!form.tagline.trim())     e.tagline = 'A short tagline is required'
      if (!form.description.trim() || form.description.length < 50) e.description = 'Please write at least 50 characters'
      if (!form.category)           e.category = 'Select a category'
      if (!form.problem.trim())     e.problem = 'Describe the privacy problem your tool solves'
    }
    if (s === 2) {
      if (!form.github.trim() || !form.github.startsWith('https://github.com/'))
        e.github = 'Must be a valid public GitHub URL (https://github.com/…)'
      if (!form.lang.trim())        e.lang = 'Primary language is required'
      if (form.platforms.length === 0) e.platforms = 'Select at least one platform'
      if (!form.license)            e.license = 'Select a license'
    }
    if (s === 3) {
      if (!form.authorName.trim())  e.authorName = 'Your name is required'
      if (!form.authorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.authorEmail))
        e.authorEmail = 'A valid email address is required'
      if (!form.agree)              e.agree = 'You must confirm your tool meets ODIPA standards'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() { if (validateStep(step)) setStep(s => Math.min(3, s + 1) as Step) }
  function back() { setStep(s => Math.max(1, s - 1) as Step) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return
    if (!validateStep(3)) return
    setState('submitting')
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject:     `Tool Submission: ${form.name}`,
          _replyto:     form.authorEmail,
          _hp: honeypot,
          'Tool Name':        form.name,
          'Tagline':          form.tagline,
          'Description':      form.description,
          'Category':         form.category,
          'Privacy Problem':  form.problem,
          'GitHub URL':       form.github,
          'Docs URL':         form.docs || '—',
          'Language':         form.lang,
          'Platforms':        form.platforms.join(', '),
          'License':          form.license,
          'Contributor Name': form.authorName,
          'Contributor Email':form.authorEmail,
          'GitHub Handle':    form.authorHandle || '—',
          'Organization':     form.org || '—',
          'Agreed to Standards': form.agree ? 'Yes' : 'No',
        }),
      })
      setState(res.ok ? 'success' : 'error')
    } catch { setState('error') }
  }

  if (state === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-10 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 className="font-display text-[24px] font-bold text-navy mb-3">Tool Submitted!</h3>
        <p className="text-[14px] text-slate-500 leading-[1.8] mb-2">
          We&apos;ve received your submission for <strong className="text-navy">{form.name}</strong>.
          Our team will acknowledge receipt within 2 business days and begin the review process.
        </p>
        <p className="text-[13px] text-slate-400 mb-7">Review typically takes 4–6 weeks end-to-end.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => { setForm(INIT); setStep(1); setState('idle') }}
            className="inline-block border border-slate-200 text-slate-600 font-medium text-[13px] px-5 py-2.5 rounded-lg hover:border-slate-300 transition-colors">
            Submit Another Tool
          </button>
          <a href="#community-tools"
            className="inline-block bg-navy text-white font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity no-underline">
            View Approved Tools ↑
          </a>
        </div>
      </div>
    )
  }

  return (
    <div id="submit-tool">
      {/* Approval process */}
      <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-4">
        <span className="block w-5 h-px bg-blue-brand" />Approval Process
      </div>
      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
        <div className="grid grid-cols-5 gap-px bg-slate-200 rounded-xl overflow-hidden mb-10 min-w-[480px] sm:min-w-0">
          {APPROVAL_STEPS.map((s, i) => (
            <div key={s.num} className="bg-white p-2 sm:p-4 text-center">
              <div className="w-9 h-9 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand mx-auto mb-2">{s.icon}</div>
              <div className="font-mono text-[9px] text-gold font-bold mb-1">{s.num}</div>
              <div className="font-display text-[10px] sm:text-[12px] font-bold text-navy mb-1 leading-tight">{s.title}</div>
              <div className="font-mono text-[8px] sm:text-[9px] text-slate-400 mb-2">{s.time}</div>
              <p className="text-[11px] text-slate-500 leading-snug hidden sm:block">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step indicator */}
      <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-4">
        <span className="block w-5 h-px bg-blue-brand" />Submit Your Privacy Tool
      </div>
      <div className="flex items-center gap-3 mb-6">
        {([1,2,3] as Step[]).map(s => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[12px] font-bold transition-all ${
              step === s ? 'bg-gold text-navy' : step > s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
            }`}>
              {step > s ? '✓' : s}
            </div>
            <span className={`text-[12px] font-medium hidden sm:block ${step === s ? 'text-navy' : 'text-slate-400'}`}>
              {s === 1 ? 'Tool Details' : s === 2 ? 'Technical' : 'Contributor'}
            </span>
            {s < 3 && <div className="w-8 h-px bg-slate-200" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
            <h3 className="font-display text-[20px] font-bold text-navy pb-4 border-b border-slate-100">Tool Details</h3>

            <Field label="Tool Name" required error={errors.name}>
              <input type="text" placeholder="e.g. Cookie Harvester & Analyzer" value={form.name}
                onChange={e => set('name')(e.target.value)} className={inputCls} />
            </Field>

            <Field label="One-line Tagline" required hint="max 80 chars" error={errors.tagline}>
              <input type="text" placeholder="Scan and classify cookies from any domain" value={form.tagline}
                onChange={e => set('tagline')(e.target.value)} maxLength={80} className={inputCls} />
              <div className="text-right font-mono text-[11px] text-slate-300 mt-1">{form.tagline.length}/80</div>
            </Field>

            <Field label="Category" required error={errors.category}>
              <select value={form.category} onChange={e => set('category')(e.target.value)} className={inputCls}>
                <option value="">Select a category…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Full Description" required hint="min 50 chars" error={errors.description}>
              <textarea rows={4} placeholder="Describe what your tool does, how it works, and who it's for."
                value={form.description} onChange={e => set('description')(e.target.value)} className={`${inputCls} resize-none`} />
              <div className="flex justify-between font-mono text-[11px] text-slate-300 mt-1">
                <span>{form.description.length < 50 ? `${50 - form.description.length} more chars needed` : '✓ Good'}</span>
                <span>{form.description.length}/1000</span>
              </div>
            </Field>

            <Field label="Privacy Problem Solved" required error={errors.problem}>
              <textarea rows={3} placeholder="What specific privacy threat or gap does this tool address? Why does it matter?"
                value={form.problem} onChange={e => set('problem')(e.target.value)} className={`${inputCls} resize-none`} />
            </Field>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={next}
                className="bg-navy hover:opacity-90 text-white font-bold text-[14px] px-8 py-3 rounded-xl transition-opacity">
                Next: Technical Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
            <h3 className="font-display text-[20px] font-bold text-navy pb-4 border-b border-slate-100">Technical Details</h3>

            <Field label="GitHub Repository URL" required error={errors.github}>
              <input type="url" placeholder="https://github.com/yourname/your-tool"
                value={form.github} onChange={e => set('github')(e.target.value)} className={inputCls} />
              <p className="text-[11px] text-slate-400 mt-1 font-mono">Repository must be public and contain a README.</p>
            </Field>

            <Field label="Documentation / Demo URL" hint="optional" error={errors.docs}>
              <input type="url" placeholder="https://yourtool.dev/docs"
                value={form.docs} onChange={e => set('docs')(e.target.value)} className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-5">
              <Field label="Primary Language" required error={errors.lang}>
                <input type="text" placeholder="Python, TypeScript, Go…"
                  value={form.lang} onChange={e => set('lang')(e.target.value)} className={inputCls} />
              </Field>
              <Field label="License" required error={errors.license}>
                <select value={form.license} onChange={e => set('license')(e.target.value)} className={inputCls}>
                  <option value="">Select…</option>
                  {LICENSES.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Platform / Runtime" required error={errors.platforms}>
              <div className="flex flex-wrap gap-2 mt-1">
                {PLATFORMS.map(p => (
                  <button key={p} type="button" onClick={() => togglePlatform(p)}
                    className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                      form.platforms.includes(p)
                        ? 'bg-gold/10 border-gold text-navy shadow-[0_0_0_1px_#C8920A]'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
              {errors.platforms && <p className="text-red-500 text-[12px] mt-1">{errors.platforms}</p>}
            </Field>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={back}
                className="border border-slate-200 text-slate-500 font-medium text-[14px] px-6 py-3 rounded-xl hover:border-slate-300 transition-colors">
                ← Back
              </button>
              <button type="button" onClick={next}
                className="bg-navy hover:opacity-90 text-white font-bold text-[14px] px-8 py-3 rounded-xl transition-opacity">
                Next: Your Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
            <h3 className="font-display text-[20px] font-bold text-navy pb-4 border-b border-slate-100">Contributor Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Your Name" required error={errors.authorName}>
                <input type="text" placeholder="Jane Smith"
                  value={form.authorName} onChange={e => set('authorName')(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Email Address" required error={errors.authorEmail}>
                <input type="email" placeholder="jane@example.com"
                  value={form.authorEmail} onChange={e => set('authorEmail')(fmtEmail(e.target.value))} onBlur={e => set('authorEmail')(fmtEmail(e.target.value).trim())} className={inputCls} />
              </Field>
              <Field label="GitHub Handle" hint="optional" error={errors.authorHandle}>
                <input type="text" placeholder="@yourhandle"
                  value={form.authorHandle} onChange={e => set('authorHandle')(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Organization" hint="optional" error={errors.org}>
                <input type="text" placeholder="Company, school, or independent"
                  value={form.org} onChange={e => set('org')(e.target.value)} className={inputCls} />
              </Field>
            </div>

            {/* Standards checklist */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-2.5">
              <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-3">Submission Standards</div>
              {[
                'My tool is released under an approved open-source license',
                'The repository is public and contains a README with setup instructions',
                'The tool does not collect, transmit, or store user data without disclosure',
                'The tool serves a genuine privacy-protective purpose',
                'I have the right to submit this code under the declared license',
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                  <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </div>
              ))}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agree}
                onChange={e => set('agree')(e.target.checked)}
                className="accent-gold w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-[13px] text-slate-600 leading-relaxed">
                I confirm this submission meets ODIPA&apos;s standards and I agree to our{' '}
                <Link href="/privacy-policy" className="text-blue-brand underline hover:text-navy transition-colors">
                  Privacy Policy
                </Link>.
              </span>
            </label>
            {errors.agree && <p className="text-red-500 text-[12px]">{errors.agree}</p>}

            {state === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
                Something went wrong. Please try again or email{' '}
                <a href="mailto:dev@odipa.org" className="underline font-semibold">dev@odipa.org</a>.
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button type="button" onClick={back}
                className="border border-slate-200 text-slate-500 font-medium text-[14px] px-6 py-3 rounded-xl hover:border-slate-300 transition-colors">
                ← Back
              </button>
              <button type="submit" disabled={state === 'submitting'}
                className="bg-gold hover:bg-gold-light disabled:opacity-60 text-navy font-bold text-[14px] px-8 py-3 rounded-xl transition-colors flex items-center gap-2.5">
                {state === 'submitting' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Submitting…
                  </>
                ) : (
                  'Submit for Review'
                )}
              </button>
            </div>
          </div>
        )}
          {/* Honeypot — hidden from real users, bots fill it in */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
          />
      </form>
    </div>
  )
}
