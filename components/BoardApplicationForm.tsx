'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scale, ScrollText, BarChart2, Code2, Handshake } from 'lucide-react'

const API_ENDPOINT = '/api/board-apply'

// ─── Open seats ──────────────────────────────────────────────────────────────
const OPEN_SEATS = [
  {
    id: 'vice-chair',
    title: 'Vice Chair',
    icon: <Scale className="w-6 h-6" />,
    commitment: '8–10 hrs/month',
    term: '2 years',
    description: 'Supports the Chair in governance, leads meetings in the Chair\'s absence, and oversees strategic partnerships and fundraising.',
    qualifications: [
      'Executive leadership experience in nonprofit, legal, or tech sectors',
      'Background in privacy law, consumer advocacy, or data governance',
      'Strong relationship-building and external-facing communication skills',
      'Availability for board meetings plus committee work',
    ],
    responsibilities: [
      'Chair board committees as assigned',
      'Support strategic planning and organizational priorities',
      'Lead major donor and partner relationship development',
      'Represent ODIPA at external events and conferences',
    ],
  },
  {
    id: 'secretary',
    title: 'Secretary & General Counsel',
    icon: <ScrollText className="w-6 h-6" />,
    commitment: '6–8 hrs/month',
    term: '2 years',
    description: 'Maintains corporate records, manages legal compliance, takes meeting minutes, and ensures the organization meets all nonprofit governance requirements.',
    qualifications: [
      'Licensed attorney (CA bar preferred, other states considered)',
      'Experience in nonprofit law, privacy law, or technology law',
      'Strong organizational and written communication skills',
      'Familiarity with 501(c)(3) governance requirements',
    ],
    responsibilities: [
      'Maintain corporate records, bylaws, and board minutes',
      'Ensure compliance with all legal and regulatory requirements',
      'Review contracts, partnerships, and legal filings',
      'Advise board on legal matters and risk management',
    ],
  },
  {
    id: 'treasurer',
    title: 'Treasurer',
    icon: <BarChart2 className="w-6 h-6" />,
    commitment: '6–8 hrs/month',
    term: '2 years',
    description: 'Oversees financial health of the organization, manages budgeting and reporting, ensures proper financial controls, and chairs the Finance Committee.',
    qualifications: [
      'CPA, CFO, or senior financial management experience',
      'Nonprofit accounting experience strongly preferred',
      'Understanding of grant management and fund accounting',
      'Proficiency with financial reporting and audit processes',
    ],
    responsibilities: [
      'Present financial reports at each board meeting',
      'Lead the annual budgeting process',
      'Oversee external audit and Form 990 preparation',
      'Manage banking relationships and financial controls',
    ],
  },
  {
    id: 'director-technology',
    title: 'Director — Technology',
    icon: <Code2 className="w-6 h-6" />,
    commitment: '4–6 hrs/month',
    term: '2 years',
    description: 'Provides technical oversight for ODIPA\'s open-source platform, data security practices, and the Community Privacy Tools program.',
    qualifications: [
      'Senior software engineering, architecture, or CTO-level experience',
      'Background in privacy-by-design, security, or open-source development',
      'Familiarity with web technologies (preferred: TypeScript, React, cloud)',
      'Passion for privacy as a public good',
    ],
    responsibilities: [
      'Review and approve tool submissions to the Community Privacy Tools directory',
      'Advise on technology strategy, platform security, and infrastructure',
      'Mentor volunteer developers and oversee code quality',
      'Represent ODIPA in technical communities and developer outreach',
    ],
  },
  {
    id: 'director-community',
    title: 'Director — Community',
    icon: <Handshake className="w-6 h-6" />,
    commitment: '4–6 hrs/month',
    term: '2 years',
    description: 'Champions community engagement, volunteer programs, and equitable access to ODIPA\'s educational resources across diverse populations.',
    qualifications: [
      'Background in community organizing, education, or social services',
      'Experience working with underserved communities (seniors, low-income, non-English speaking)',
      'Strong relationship-building and volunteer management skills',
      'Familiarity with consumer advocacy or digital equity issues',
    ],
    responsibilities: [
      'Oversee volunteer recruitment, onboarding, and retention',
      'Guide community outreach strategy and partnership development',
      'Ensure programs reach underserved and vulnerable populations',
      'Represent ODIPA at community events and advocacy coalitions',
    ],
  },
]

const EXPERTISE = [
  'Privacy Law', 'Technology Law', 'Nonprofit Law', 'Consumer Advocacy',
  'Cybersecurity', 'Software Engineering', 'Data Science', 'Product Management',
  'Finance / Accounting', 'Fundraising / Development', 'Marketing / Communications',
  'Government / Policy', 'Academic / Research', 'Community Organizing', 'Education',
]

type Step = 1 | 2 | 3 | 4
type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface AppFormData {
  seat: string
  firstName: string
  lastName: string
  email: string
  phone: string
  linkedin: string
  currentRole: string
  currentOrg: string
  city: string
  expertise: string[]
  whyInterested: string
  relevantExperience: string
  privacyVision: string
  commitment: string
  conflict: string
  references: string
  consent: boolean
}

const INIT: AppFormData = {
  seat: '', firstName: '', lastName: '', email: '', phone: '',
  linkedin: '', currentRole: '', currentOrg: '', city: '',
  expertise: [], whyInterested: '', relevantExperience: '',
  privacyVision: '', commitment: '', conflict: '', references: '',
  consent: false,
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[14px] text-navy placeholder-slate-400 focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
const textareaCls = `${inputCls} resize-none`

function Label({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <label className="block font-semibold text-[13px] text-navy mb-1.5">
      {children}
      {required && <span className="text-gold ml-1">*</span>}
      {hint && <span className="font-normal text-slate-400 text-[12px] ml-2">{hint}</span>}
    </label>
  )
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-500 text-[12px] mt-1.5">{msg}</p> : null
}

const STEP_LABELS: Record<Step, string> = {
  1: 'Position',
  2: 'Background',
  3: 'Your Vision',
  4: 'Final Details',
}

export default function BoardApplicationForm() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<AppFormData>(INIT)
  const [errors, setErrors] = useState<Partial<Record<keyof AppFormData, string>>>({})
  const [formState, setFormState] = useState<FormState>('idle')
  const [honeypot, setHoneypot] = useState('')

  const selectedSeat = OPEN_SEATS.find(s => s.id === form.seat)

  function set<K extends keyof AppFormData>(field: K) {
    return (val: AppFormData[K]) => {
      setForm(prev => ({ ...prev, [field]: val }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const fmtEmail = (v: string) => v.toLowerCase().replace(/\s/g, '')
  const fmtPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  }

  function toggleExpertise(e: string) {
    setForm(prev => ({
      ...prev,
      expertise: prev.expertise.includes(e)
        ? prev.expertise.filter(x => x !== e)
        : [...prev.expertise, e],
    }))
  }

  function validate(s: Step): boolean {
    const e: Partial<Record<keyof AppFormData, string>> = {}
    if (s === 1) {
      if (!form.seat) e.seat = 'Please select a position'
    }
    if (s === 2) {
      if (!form.firstName.trim())   e.firstName   = 'First name is required'
      if (!form.lastName.trim())    e.lastName    = 'Last name is required'
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = 'Valid email address required'
      if (!form.currentRole.trim()) e.currentRole = 'Current role is required'
      if (!form.currentOrg.trim())  e.currentOrg  = 'Organization is required'
      if (!form.city.trim())        e.city        = 'City / location is required'
      if (form.expertise.length === 0) e.expertise = 'Select at least one area'
    }
    if (s === 3) {
      if (!form.whyInterested.trim() || form.whyInterested.length < 100)
        e.whyInterested = 'Please write at least 100 characters'
      if (!form.relevantExperience.trim() || form.relevantExperience.length < 100)
        e.relevantExperience = 'Please write at least 100 characters'
      if (!form.privacyVision.trim() || form.privacyVision.length < 80)
        e.privacyVision = 'Please write at least 80 characters'
    }
    if (s === 4) {
      if (!form.commitment.trim()) e.commitment = 'Please confirm your availability'
      if (!form.conflict.trim())   e.conflict   = 'Please disclose or confirm no conflicts'
      if (!form.references.trim()) e.references = 'At least one reference required'
      if (!form.consent)           e.consent    = 'Please confirm your consent'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() { if (validate(step)) setStep(s => Math.min(4, s + 1) as Step) }
  function back() { setStep(s => Math.max(1, s - 1) as Step) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return
    if (!validate(4)) return
    setFormState('submitting')
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Board Application: ${selectedSeat?.title} — ${form.firstName} ${form.lastName}`,
          _replyto: form.email,
          _hp: honeypot,
          'Position Applied':    selectedSeat?.title,
          'Name':                `${form.firstName} ${form.lastName}`,
          'Email':               form.email,
          'Phone':               form.phone || '—',
          'LinkedIn':            form.linkedin || '—',
          'Current Role':        form.currentRole,
          'Organization':        form.currentOrg,
          'City':                form.city,
          'Areas of Expertise':  form.expertise.join(', '),
          'Why Interested':      form.whyInterested,
          'Relevant Experience': form.relevantExperience,
          'Privacy Vision':      form.privacyVision,
          'Time Commitment':     form.commitment,
          'Conflicts':           form.conflict,
          'References':          form.references,
          'Consented':           form.consent ? 'Yes' : 'No',    
        }),
      })
      setFormState(res.ok ? 'success' : 'error')
    } catch { setFormState('error') }
  }

  if (formState === 'success') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6 py-24">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-[520px] w-full shadow-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="font-display text-[28px] font-bold text-navy mb-3">Application Received</h2>
          <p className="text-[15px] text-slate-500 leading-[1.8] mb-2">
            Thank you, <strong className="text-navy">{form.firstName}</strong>. Your application for{' '}
            <strong className="text-navy">{selectedSeat?.title}</strong> has been submitted to ODIPA&apos;s Board Chair for review.
          </p>
          <p className="text-[13px] text-slate-400 mb-8 font-mono">
            We acknowledge all applications within 5 business days.<br />
            Full review takes 4–8 weeks.
          </p>
          <div className="space-y-3 text-left bg-slate-50 rounded-xl p-5 mb-8">
            <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-3">What Happens Next</div>
            {[
              { n: '01', t: 'Acknowledgement', d: 'You\'ll receive a confirmation email within 5 business days.' },
              { n: '02', t: 'Initial Screening', d: 'Board Chair reviews applications against position requirements.' },
              { n: '03', t: 'Interview', d: 'Shortlisted candidates are invited for a 45-minute video call.' },
              { n: '04', t: 'Board Vote', d: 'Final candidates are presented to the board for a vote.' },
            ].map(item => (
              <div key={item.n} className="flex gap-3 text-[13px]">
                <span className="font-mono text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full h-fit flex-shrink-0 mt-0.5">{item.n}</span>
                <div><span className="font-semibold text-navy">{item.t}</span> — <span className="text-slate-500">{item.d}</span></div>
              </div>
            ))}
          </div>
          <Link href="/about#board"
            className="inline-block bg-navy text-white font-semibold text-[14px] px-8 py-3 rounded-xl hover:opacity-90 transition-opacity no-underline">
            Back to About ODIPA
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* Header */}
      <div className="bg-navy pt-28 pb-16 px-6 overflow-hidden">
        <div className="max-w-[760px] mx-auto">
          <Link href="/about#board" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← Board of Directors
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />Board Recruitment
          </div>
          <h1 className="font-display text-[clamp(32px,4vw,52px)] font-black text-white leading-[1.1] mb-4">
            Join the ODIPA<br />Board of Directors
          </h1>
          <p className="text-[16px] text-white/60 leading-[1.8] max-w-[540px]">
            ODIPA is seeking qualified individuals to fill five open board seats. Board members shape the organization&apos;s strategic direction and serve as stewards of our mission to protect digital privacy for everyone.
          </p>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-6 py-16 space-y-12">

        {/* Step progress */}
        <div className="flex items-center gap-2">
          {([1, 2, 3, 4] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[12px] font-bold transition-all ${
                  step === s ? 'bg-gold text-navy ring-4 ring-gold/20' :
                  step > s  ? 'bg-green-500 text-white' :
                               'bg-slate-200 text-slate-400'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-[12px] font-medium hidden sm:block transition-colors ${step === s ? 'text-navy' : 'text-slate-400'}`}>
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < 3 && <div className={`flex-1 h-px transition-colors ${step > s ? 'bg-green-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── STEP 1: Choose position ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-[24px] font-bold text-navy mb-1">Select a Position</h2>
                <p className="text-[14px] text-slate-500">Choose the board seat you&apos;re applying for. You may submit separate applications for multiple positions.</p>
              </div>
              <div className="space-y-4">
                {OPEN_SEATS.map(seat => (
                  <button key={seat.id} type="button" onClick={() => set('seat')(seat.id)}
                    className={`w-full text-left rounded-2xl border-2 p-6 transition-all ${
                      form.seat === seat.id
                        ? 'border-gold bg-gold/5 shadow-[0_0_0_1px_#C8920A]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        form.seat === seat.id ? 'bg-gold/15 text-navy' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {seat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="font-display text-[18px] font-bold text-navy">{seat.title}</h3>
                          <div className="flex gap-2">
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{seat.commitment}</span>
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{seat.term} term</span>
                          </div>
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed mb-3">{seat.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                          <div>
                            <div className="font-mono text-[9px] text-blue-brand uppercase tracking-[2px] mb-1.5">Key Qualifications</div>
                            {seat.qualifications.slice(0, 2).map(q => (
                              <div key={q} className="flex items-start gap-1.5 text-[12px] text-slate-500 mb-1">
                                <span className="text-gold flex-shrink-0 mt-0.5">✓</span>{q}
                              </div>
                            ))}
                          </div>
                          <div>
                            <div className="font-mono text-[9px] text-blue-brand uppercase tracking-[2px] mb-1.5">Primary Responsibilities</div>
                            {seat.responsibilities.slice(0, 2).map(r => (
                              <div key={r} className="flex items-start gap-1.5 text-[12px] text-slate-500 mb-1">
                                <span className="text-blue-brand flex-shrink-0 mt-0.5">→</span>{r}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all ${
                        form.seat === seat.id ? 'border-gold bg-gold' : 'border-slate-300'
                      }`}>
                        {form.seat === seat.id && (
                          <svg className="w-3 h-3 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Err msg={errors.seat} />
              <div className="flex justify-end">
                <button type="button" onClick={next}
                  className="bg-navy hover:opacity-90 text-white font-bold text-[15px] px-8 py-3.5 rounded-xl transition-opacity">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Background ── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
              <div>
                <h2 className="font-display text-[24px] font-bold text-navy mb-1">Your Background</h2>
                <p className="text-[14px] text-slate-500">Applying for: <span className="font-semibold text-navy">{selectedSeat?.title}</span></p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label required>First Name</Label>
                  <input type="text" placeholder="Jane" value={form.firstName} onChange={e => set('firstName')(e.target.value)} className={inputCls} />
                  <Err msg={errors.firstName} />
                </div>
                <div>
                  <Label required>Last Name</Label>
                  <input type="text" placeholder="Smith" value={form.lastName} onChange={e => set('lastName')(e.target.value)} className={inputCls} />
                  <Err msg={errors.lastName} />
                </div>
                <div>
                  <Label required>Email Address</Label>
                  <input type="email" placeholder="jane@example.com" value={form.email} onChange={e => set('email')(fmtEmail(e.target.value))} onBlur={e => set('email')(fmtEmail(e.target.value).trim())} className={inputCls} />
                  <Err msg={errors.email} />
                </div>
                <div>
                  <Label hint="optional">Phone</Label>
                  <input type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={e => set('phone')(fmtPhone(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <Label required>Current Title / Role</Label>
                  <input type="text" placeholder="Chief Privacy Officer" value={form.currentRole} onChange={e => set('currentRole')(e.target.value)} className={inputCls} />
                  <Err msg={errors.currentRole} />
                </div>
                <div>
                  <Label required>Organization</Label>
                  <input type="text" placeholder="Company or nonprofit name" value={form.currentOrg} onChange={e => set('currentOrg')(e.target.value)} className={inputCls} />
                  <Err msg={errors.currentOrg} />
                </div>
                <div>
                  <Label required>City / Location</Label>
                  <input type="text" placeholder="Los Angeles, CA" value={form.city} onChange={e => set('city')(e.target.value)} className={inputCls} />
                  <Err msg={errors.city} />
                </div>
                <div>
                  <Label hint="optional">LinkedIn Profile</Label>
                  <input type="url" placeholder="https://linkedin.com/in/yourname" value={form.linkedin} onChange={e => set('linkedin')(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <Label required>Areas of Expertise <span className="font-normal text-slate-400 text-[12px] ml-1">select all that apply</span></Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EXPERTISE.map(e => (
                    <button key={e} type="button" onClick={() => toggleExpertise(e)}
                      className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                        form.expertise.includes(e)
                          ? 'bg-gold/10 border-gold text-navy shadow-[0_0_0_1px_#C8920A]'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                      }`}>
                      {e}
                    </button>
                  ))}
                </div>
                <Err msg={errors.expertise} />
              </div>

              <div className="flex justify-between pt-2">
                <button type="button" onClick={back} className="border border-slate-200 text-slate-500 font-medium text-[14px] px-6 py-3 rounded-xl hover:border-slate-300 transition-colors">← Back</button>
                <button type="button" onClick={next} className="bg-navy hover:opacity-90 text-white font-bold text-[14px] px-8 py-3 rounded-xl transition-opacity">Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Vision & experience ── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
              <div>
                <h2 className="font-display text-[24px] font-bold text-navy mb-1">Your Vision</h2>
                <p className="text-[14px] text-slate-500">Three short-answer questions. Quality over length.</p>
              </div>

              <div>
                <Label required>Why are you interested in this role?</Label>
                <p className="text-[12px] text-slate-400 mb-2">What draws you to ODIPA specifically? What do you hope to contribute? <span className="font-mono">min 100 chars</span></p>
                <textarea rows={5} placeholder="Share your motivation for joining the ODIPA board and what you'd bring to this specific seat…" value={form.whyInterested} onChange={e => set('whyInterested')(e.target.value)} className={textareaCls} />
                <div className="flex justify-between mt-1.5">
                  <Err msg={errors.whyInterested} />
                  <span className={`font-mono text-[11px] ml-auto ${form.whyInterested.length < 100 ? 'text-slate-300' : 'text-green-500'}`}>
                    {form.whyInterested.length} / 1500
                  </span>
                </div>
              </div>

              <div>
                <Label required>Relevant experience</Label>
                <p className="text-[12px] text-slate-400 mb-2">Describe specific experience that qualifies you for this position. Include board/governance experience if any. <span className="font-mono">min 100 chars</span></p>
                <textarea rows={5} placeholder="Describe your relevant background, accomplishments, and any prior board or governance experience…" value={form.relevantExperience} onChange={e => set('relevantExperience')(e.target.value)} className={textareaCls} />
                <div className="flex justify-between mt-1.5">
                  <Err msg={errors.relevantExperience} />
                  <span className={`font-mono text-[11px] ml-auto ${form.relevantExperience.length < 100 ? 'text-slate-300' : 'text-green-500'}`}>
                    {form.relevantExperience.length} / 1500
                  </span>
                </div>
              </div>

              <div>
                <Label required>Your privacy vision</Label>
                <p className="text-[12px] text-slate-400 mb-2">What do you see as the most important privacy challenge of the next 3 years, and how should ODIPA respond? <span className="font-mono">min 80 chars</span></p>
                <textarea rows={4} placeholder="Share your perspective on digital privacy challenges and how you see ODIPA's role…" value={form.privacyVision} onChange={e => set('privacyVision')(e.target.value)} className={textareaCls} />
                <div className="flex justify-between mt-1.5">
                  <Err msg={errors.privacyVision} />
                  <span className={`font-mono text-[11px] ml-auto ${form.privacyVision.length < 80 ? 'text-slate-300' : 'text-green-500'}`}>
                    {form.privacyVision.length} / 1000
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button type="button" onClick={back} className="border border-slate-200 text-slate-500 font-medium text-[14px] px-6 py-3 rounded-xl hover:border-slate-300 transition-colors">← Back</button>
                <button type="button" onClick={next} className="bg-navy hover:opacity-90 text-white font-bold text-[14px] px-8 py-3 rounded-xl transition-opacity">Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Final details ── */}
          {step === 4 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
              <div>
                <h2 className="font-display text-[24px] font-bold text-navy mb-1">Final Details</h2>
                <p className="text-[14px] text-slate-500">Almost done — a few governance-required disclosures.</p>
              </div>

              <div>
                <Label required>Time commitment confirmation</Label>
                <p className="text-[12px] text-slate-400 mb-2">This role requires <strong className="text-slate-600">{selectedSeat?.commitment}</strong>. Confirm you can meet this.</p>
                <textarea rows={2} placeholder="e.g. Yes — I have reviewed the time commitment and can dedicate the required hours. My schedule allows for board meetings and committee work." value={form.commitment} onChange={e => set('commitment')(e.target.value)} className={textareaCls} />
                <Err msg={errors.commitment} />
              </div>

              <div>
                <Label required>Conflict of interest disclosure</Label>
                <p className="text-[12px] text-slate-400 mb-2">Disclose any existing relationships with data brokers, ad-tech companies, or organizations with interests that may conflict with ODIPA&apos;s mission. If none, state that.</p>
                <textarea rows={3} placeholder="e.g. I have no conflicts to disclose. — OR — I currently advise XYZ Company which provides analytics services. I would recuse from any related decisions." value={form.conflict} onChange={e => set('conflict')(e.target.value)} className={textareaCls} />
                <Err msg={errors.conflict} />
              </div>

              <div>
                <Label required>Professional references</Label>
                <p className="text-[12px] text-slate-400 mb-2">Provide at least one professional reference (name, title, email). We contact references only for finalists.</p>
                <textarea rows={3} placeholder="John Doe, Executive Director, Privacy Foundation — jdoe@example.org&#10;Jane Roe, Partner, Smith & Associates — jroe@smithlaw.com" value={form.references} onChange={e => set('references')(e.target.value)} className={textareaCls} />
                <Err msg={errors.references} />
              </div>

              {/* Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-3">Application Summary</div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {[
                    ['Position', selectedSeat?.title],
                    ['Name', `${form.firstName} ${form.lastName}`],
                    ['Role', form.currentRole],
                    ['Org', form.currentOrg],
                    ['Expertise', form.expertise.slice(0, 3).join(', ') + (form.expertise.length > 3 ? ` +${form.expertise.length - 3}` : '')],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex gap-2">
                      <span className="text-slate-400 flex-shrink-0">{k}:</span>
                      <span className="font-medium text-navy truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.consent} onChange={e => set('consent')(e.target.checked)}
                  className="accent-gold w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-slate-600 leading-relaxed">
                  I confirm that the information provided is accurate and complete, and I agree to ODIPA&apos;s{' '}
                  <Link href="/privacy-policy" className="text-blue-brand underline hover:text-navy transition-colors">Privacy Policy</Link>.
                  I understand ODIPA will contact me regarding my application.
                </span>
              </label>
              <Err msg={errors.consent} />

              {formState === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">
                  Something went wrong. Please try again or email{' '}
                  <a href="mailto:board@odipa.org" className="underline font-semibold">board@odipa.org</a>.
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button type="button" onClick={back} className="border border-slate-200 text-slate-500 font-medium text-[14px] px-6 py-3 rounded-xl hover:border-slate-300 transition-colors">← Back</button>
                <button type="submit" disabled={formState === 'submitting'}
                  className="bg-gold hover:bg-gold-light disabled:opacity-60 text-navy font-bold text-[15px] px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2.5">
                  {formState === 'submitting' ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Submitting…</>
                  ) : 'Submit Application'}
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
    </div>
  )
}
