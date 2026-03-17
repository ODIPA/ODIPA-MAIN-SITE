'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, Search, BookOpen, Microscope, ChevronDown, ChevronUp } from 'lucide-react'

const API_ENDPOINT = '/api/sponsor-research'

// ─── Research complexity tiers ────────────────────────────────────────────────
const TIERS = [
  {
    value: 'brief',
    label: 'Research Brief',
    price: '$2,500+',
    badge: 'Most Accessible',
    badgeColor: 'bg-green-100 text-green-700',
    icon: <FileText className="w-5 h-5" />,
    deliverable: '10–15 page focused brief',
    timeline: '6–8 weeks',
    desc: 'A focused 10–15 page research brief on a specific privacy topic of your choosing. Includes executive summary, findings, and recommendations. Ideal for regulatory updates, industry benchmarks, or specific compliance questions.',
    includes: [
      'Scoped research on one defined topic',
      'Executive summary + full findings',
      'Publicly released under ODIPA brand',
      'Your organization listed as research sponsor',
      'One round of scope feedback before research begins',
    ],
  },
  {
    value: 'investigation',
    label: 'Special Investigation',
    price: '$7,500+',
    badge: 'Most Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: <Search className="w-5 h-5" />,
    deliverable: '30–50 page deep-dive report',
    timeline: '10–14 weeks',
    desc: 'A comprehensive investigation into a significant privacy issue — platform practices, data broker analysis, industry sector review, or emerging threat assessment. Includes original data collection, interviews, and policy recommendations.',
    includes: [
      'Comprehensive deep-dive on complex topic',
      'Original data collection and analysis',
      'Expert interviews where applicable',
      'Detailed policy recommendations',
      'Embargo period before public release',
      'Media briefing support at release',
      'Sponsor acknowledgment in report and press materials',
    ],
  },
  {
    value: 'annual-section',
    label: 'Annual Report Section',
    price: '$12,500+',
    badge: 'High Visibility',
    badgeColor: 'bg-purple-100 text-purple-700',
    icon: <BookOpen className="w-5 h-5" />,
    deliverable: 'Featured section in Annual State of Privacy Report',
    timeline: 'Annual cycle (Q4)',
    desc: 'Sponsor a dedicated section within ODIPA\'s flagship Annual State of Privacy Report — the most widely read and cited publication in our portfolio. Your topic receives a full chapter with original research, data visualizations, and expert commentary.',
    includes: [
      'Dedicated chapter in ODIPA\'s Annual Report',
      'Original research, data, and visualizations',
      'Distributed to all ODIPA partners and media contacts',
      'Cited by journalists, legislators, and policymakers',
      'Sponsor credit on report cover and section header',
      'Co-branded press release at launch',
      'ODIPA speaking slot at Annual Privacy Summit',
    ],
  },
  {
    value: 'custom',
    label: 'Custom Research Partnership',
    price: '$25,000+',
    badge: 'Full Partnership',
    badgeColor: 'bg-gold/20 text-amber-700',
    icon: <Microscope className="w-5 h-5" />,
    deliverable: 'Multi-deliverable custom research program',
    timeline: 'Scoped to project',
    desc: 'A fully scoped, multi-deliverable research partnership built around your organization\'s specific privacy intelligence needs. May include multiple briefs, investigation, survey research, or a longitudinal study. Scope, methodology, and deliverables defined collaboratively.',
    includes: [
      'Custom scope and methodology definition',
      'Multiple deliverables across 12-month engagement',
      'Priority access to ODIPA research team',
      'Dedicated partnership manager',
      'Private briefings before public release',
      'Board-level research advisory access',
      'All lower-tier benefits included',
    ],
  },
]

const TIMELINE_OPTIONS = [
  'As soon as possible',
  'Within 3 months',
  'Within 6 months',
  'This calendar year',
  'Planning for next year',
  'Flexible / exploring options',
]

const AUDIENCE_OPTIONS = [
  'Internal executive team',
  'Board of directors',
  'Regulatory / compliance team',
  'External clients or partners',
  'General public / media',
  'Industry peers',
  'Multiple audiences',
]

const HEAR_OPTIONS = [
  'Web search',
  'Social media',
  'Colleague or referral',
  'Conference or event',
  'ODIPA Annual Report',
  'Press coverage',
  'GitHub',
  'Other',
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface AppFormData {
  orgName: string
  contactName: string
  title: string
  email: string
  phone: string
  website: string
  tier: string
  researchTopic: string
  timeline: string
  audience: string
  hearAbout: string
  notes: string
  consent: boolean
}

const INITIAL: AppFormData = {
  orgName: '',
  contactName: '',
  title: '',
  email: '',
  phone: '',
  website: '',
  tier: '',
  researchTopic: '',
  timeline: '',
  audience: '',
  hearAbout: '',
  notes: '',
  consent: false,
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block font-semibold text-[13px] text-navy mb-1.5">
      {children}
      {required && <span className="text-gold ml-1">*</span>}
    </label>
  )
}

function Input({
  id, type = 'text', placeholder, value, onChange, onBlur, required,
}: {
  id: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; onBlur?: (v: string) => void; required?: boolean
}) {
  return (
    <input
      id={id} type={type} placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
      required={required}
      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-[14px] text-navy placeholder-slate-400
        focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
    />
  )
}

function Textarea({
  id, placeholder, value, onChange, rows = 4, required,
}: {
  id: string; placeholder?: string; value: string;
  onChange: (v: string) => void; rows?: number; required?: boolean
}) {
  return (
    <textarea
      id={id} placeholder={placeholder} value={value} rows={rows}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-[14px] text-navy placeholder-slate-400
        focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all resize-none"
    />
  )
}

function Select({
  id, value, onChange, children, required,
}: {
  id: string; value: string; onChange: (v: string) => void;
  children: React.ReactNode; required?: boolean
}) {
  return (
    <select
      id={id} value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-[14px] text-navy
        focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all appearance-none"
    >
      {children}
    </select>
  )
}

function TierCard({
  tier, selected, onSelect,
}: {
  tier: typeof TIERS[number]; selected: boolean; onSelect: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`rounded-2xl border-2 transition-all cursor-pointer ${
        selected
          ? 'border-gold shadow-[0_0_0_1px_#C8920A] bg-gold/[0.03]'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
      onClick={onSelect}
    >
      {/* Card header */}
      <div className="p-6">
        <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              selected ? 'bg-gold/15 text-navy' : 'bg-slate-100 text-slate-500'
            }`}>
              {tier.icon}
            </div>
            <div>
              <div className="font-display text-[16px] font-bold text-navy leading-tight">{tier.label}</div>
              <div className="font-mono text-[11px] text-slate-400 mt-0.5">{tier.deliverable}</div>
            </div>
          </div>
          <div className="xs:text-right flex-shrink-0">
            <div className="font-display text-[22px] font-black text-navy leading-none">{tier.price}</div>
            <div className="font-mono text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">starting at</div>
          </div>
        </div>

        <span className={`inline-block font-mono text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 ${tier.badgeColor}`}>
          {tier.badge}
        </span>

        <p className="text-[13px] text-slate-500 leading-[1.7]">{tier.desc}</p>

        <div className="flex items-center justify-between mt-4">
          <div className="font-mono text-[10px] text-slate-400">
            Timeline: <span className="text-slate-600 font-medium">{tier.timeline}</span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="flex items-center gap-1 font-mono text-[10px] text-blue-brand hover:text-navy transition-colors"
          >
            {expanded ? 'Less' : "What's included"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded includes */}
      {expanded && (
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-3">What&apos;s Included</div>
          <ul className="space-y-2">
            {tier.includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[12px] text-slate-600">
                <span className="text-gold font-bold flex-shrink-0 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ResearchSponsorForm({ preselect }: { preselect?: string }) {
  const [form, setForm] = useState<AppFormData>({ ...INITIAL, tier: preselect ?? '' })
  const [state, setState] = useState<FormState>('idle')
  const [errors, setErrors] = useState<Partial<Record<keyof AppFormData, string>>>({})
  const [honeypot, setHoneypot] = useState('')

  function set(field: keyof AppFormData) {
    return (value: string | boolean) =>
      setForm((prev) => ({ ...prev, [field]: value }))
  }

  const fmtEmail = (v: string) => v.toLowerCase().replace(/\s/g, '')
  const fmtPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  }

  function validate(): boolean {
    const e: Partial<Record<keyof AppFormData, string>> = {}
    if (!form.orgName.trim())     e.orgName      = 'Organization name is required'
    if (!form.contactName.trim()) e.contactName  = 'Contact name is required'
    if (!form.email.trim())       e.email        = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.tier)               e.tier         = 'Please select a research tier'
    if (!form.researchTopic.trim()) e.researchTopic = 'Please describe the research topic or question'
    if (!form.consent)            e.consent      = 'You must agree to be contacted'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const selectedTier = TIERS.find(t => t.value === form.tier)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return
    if (!validate()) return
    setState('submitting')
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          orgName: form.orgName,
          contactName: form.contactName,
          title: form.title,
          email: form.email,
          phone: form.phone,
          _hp: honeypot,
          website: form.website,
          tier: selectedTier?.label ?? form.tier,
          researchTopic: form.researchTopic,
          timeline: form.timeline,
          audience: form.audience,
          hearAbout: form.hearAbout,
          notes: form.notes,
          consent: form.consent ? 'Yes' : 'No',
        }),
      })
      if (res.ok) {
        setState('success')
        setForm(INITIAL)
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy pt-28 pb-16 px-6 overflow-hidden">
        <div className="max-w-[960px] mx-auto">
          <Link href="/programs/research-publications"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← Research & Publications
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
                <span className="block w-6 h-px bg-gold-light" />
                Research Sponsorship
              </div>
              <h1 className="font-display text-[clamp(32px,5vw,52px)] font-black text-white leading-[1.1] mb-5">
                Sponsor Independent<br />
                <span className="text-gold-light">Privacy Research</span>
              </h1>
              <p className="text-[16px] text-white/60 leading-[1.75]">
                Fund credible, independent research that shapes policy, informs consumers,
                and drives your industry forward — while ODIPA maintains full editorial control.
              </p>
            </div>
            {/* Quick tier summary */}
            <div className="space-y-2">
              {TIERS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => {
                    set('tier')(tier.value)
                    document.getElementById('tier-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    form.tier === tier.value
                      ? 'border-gold bg-gold/10 shadow-[0_0_0_1px_#C8920A]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`flex-shrink-0 ${form.tier === tier.value ? 'text-gold-light' : 'text-white/50'}`}>{tier.icon}</span>
                    <span className="font-semibold text-[13px] text-white truncate">{tier.label}</span>
                  </div>
                  <span className="font-mono text-[11px] text-gold-light font-bold flex-shrink-0">{tier.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

        {/* Form */}
        <div>
          {state === 'success' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-[28px] font-bold text-navy mb-3">Inquiry Received</h2>
              <p className="text-[15px] text-slate-500 leading-[1.8] mb-2 max-w-[440px] mx-auto">
                Thank you for your interest in sponsoring ODIPA research.
                Our research team will follow up within <strong>3 business days</strong> to discuss
                scope, methodology, and next steps.
              </p>
              {selectedTier && (
                <p className="text-[13px] text-slate-400 mb-8">
                  Inquiry submitted for: <span className="font-semibold text-navy">{selectedTier.label}</span> ({selectedTier.price})
                </p>
              )}
              <Link
                href="/programs/research-publications"
                className="inline-block bg-navy text-white px-8 py-3.5 rounded-lg font-semibold text-[14px] hover:opacity-90 transition-opacity no-underline"
              >
                Back to Research & Publications
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-8">

              {/* Research Tier */}
              <div id="tier-section" className="scroll-mt-8">
                <div className="mb-6">
                  <h2 className="font-display text-[22px] font-bold text-navy mb-1">Select Research Scope</h2>
                  <p className="text-[14px] text-slate-500">Choose the tier that matches your research goals and budget. All tiers include ODIPA&apos;s independent methodology — sponsors fund the topic, not the conclusions.</p>
                </div>

                <div className="space-y-4">
                  {TIERS.map((tier) => (
                    <TierCard
                      key={tier.value}
                      tier={tier}
                      selected={form.tier === tier.value}
                      onSelect={() => set('tier')(tier.value)}
                    />
                  ))}
                </div>
                {errors.tier && <p className="text-red-500 text-[12px] mt-2">{errors.tier}</p>}
              </div>

              {/* Research Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <h2 className="font-display text-[22px] font-bold text-navy mb-1 pb-4 border-b border-slate-100">
                  Research Details
                </h2>
                <p className="text-[13px] text-slate-400 mb-6 pt-3">Help us understand your research goals. ODIPA&apos;s team will refine the scope collaboratively before work begins.</p>

                <div className="space-y-5">
                  <div>
                    <FieldLabel required>Research Topic or Question</FieldLabel>
                    <Textarea
                      id="researchTopic"
                      placeholder="Describe the privacy issue, question, or topic you'd like ODIPA to investigate. Be as specific or general as you like — we'll refine together. E.g. 'How are health data brokers monetizing consumer data in violation of HIPAA?' or 'State-by-state analysis of data broker opt-out compliance rates.'"
                      value={form.researchTopic}
                      onChange={set('researchTopic')}
                      rows={5}
                      required
                    />
                    {errors.researchTopic && <p className="text-red-500 text-[12px] mt-1">{errors.researchTopic}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel>Desired Timeline</FieldLabel>
                      <Select id="timeline" value={form.timeline} onChange={set('timeline')}>
                        <option value="">Select…</option>
                        {TIMELINE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </Select>
                    </div>
                    <div>
                      <FieldLabel>Primary Audience for Research</FieldLabel>
                      <Select id="audience" value={form.audience} onChange={set('audience')}>
                        <option value="">Select…</option>
                        {AUDIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </Select>
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Additional Notes</FieldLabel>
                    <Textarea
                      id="notes"
                      placeholder="Any other context, constraints, prior research you're building on, or specific deliverable requirements?"
                      value={form.notes}
                      onChange={set('notes')}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <h2 className="font-display text-[22px] font-bold text-navy mb-6 pb-4 border-b border-slate-100">
                  Your Organization
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <FieldLabel required>Organization Name</FieldLabel>
                    <Input id="orgName" placeholder="Acme Corporation" value={form.orgName} onChange={set('orgName')} required />
                    {errors.orgName && <p className="text-red-500 text-[12px] mt-1">{errors.orgName}</p>}
                  </div>
                  <div>
                    <FieldLabel required>Contact Name</FieldLabel>
                    <Input id="contactName" placeholder="Jane Smith" value={form.contactName} onChange={set('contactName')} required />
                    {errors.contactName && <p className="text-red-500 text-[12px] mt-1">{errors.contactName}</p>}
                  </div>
                  <div>
                    <FieldLabel>Job Title</FieldLabel>
                    <Input id="title" placeholder="Chief Privacy Officer" value={form.title} onChange={set('title')} />
                  </div>
                  <div>
                    <FieldLabel required>Email Address</FieldLabel>
                    <Input id="email" type="email" placeholder="jane@company.com" value={form.email} onChange={v => set('email')(fmtEmail(v))} onBlur={v => set('email')(fmtEmail(v).trim())} required />
                    {errors.email && <p className="text-red-500 text-[12px] mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <FieldLabel>Phone Number</FieldLabel>
                    <Input id="phone" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={v => set('phone')(fmtPhone(v))} />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Organization Website</FieldLabel>
                    <Input id="website" type="url" placeholder="https://company.com" value={form.website} onChange={set('website')} />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>How did you hear about ODIPA?</FieldLabel>
                    <Select id="hearAbout" value={form.hearAbout} onChange={set('hearAbout')}>
                      <option value="">Select an option</option>
                      {HEAR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Independence disclosure + submit */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <div className="bg-navy/5 border border-navy/10 rounded-xl p-5 mb-6">
                  <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-2">Editorial Independence Policy</div>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Research sponsors fund a topic area. ODIPA retains sole control over methodology, analysis, and conclusions.
                    Sponsor identity is disclosed in every published work. Sponsors may not review findings prior to publication
                    except during a mutually agreed embargo period. This policy is non-negotiable and protects the value of ODIPA&apos;s research.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => set('consent')(e.target.checked)}
                    className="accent-gold w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-[13px] text-slate-600 leading-relaxed">
                    I understand and agree to ODIPA&apos;s editorial independence policy. I agree to be contacted regarding
                    this research sponsorship inquiry. I understand my information will not be shared with third parties.
                    See our{' '}
                    <Link href="/privacy-policy" className="text-blue-brand underline hover:text-navy transition-colors">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
                {errors.consent && <p className="text-red-500 text-[12px] mt-2">{errors.consent}</p>}

                {state === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
                    Something went wrong. Please try again or email us at{' '}
                    <a href="mailto:research@odipa.org" className="underline font-semibold">research@odipa.org</a>.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === 'submitting'}
                  className="mt-6 w-full bg-gold hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed
                    text-navy font-bold text-[15px] py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  {state === 'submitting' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    'Submit Research Sponsorship Inquiry'
                  )}
                </button>
                <p className="text-center text-[12px] text-slate-400 mt-3 font-mono">
                  Our research team responds within 3 business days
                </p>
              </div>

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
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">

          {/* Logo + status */}
          <div className="bg-navy rounded-2xl p-6 flex flex-col items-start gap-4">
            <Image src="/logo-dark.png" alt="ODIPA" width={120} height={40} className="h-10 w-auto" />
            <p className="text-[13px] text-white/60 leading-relaxed">
              ODIPA is a 501(c)(3) tax-exempt nonprofit. Research sponsorships may be
              tax-deductible to the extent permitted by law — consult your tax advisor.
            </p>
            <span className="font-mono text-[10px] text-gold-light bg-white/5 border border-white/10 px-3 py-1.5 rounded">
              EIN: 33-2725122
            </span>
          </div>

          {/* Tier comparison */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-display text-[16px] font-bold text-navy mb-4">Tier Comparison</h3>
            <div className="space-y-3">
              {TIERS.map((tier) => (
                <div key={tier.value} className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  form.tier === tier.value ? 'bg-gold/10 border border-gold/30' : 'hover:bg-slate-50'
                }`}
                  onClick={() => set('tier')(tier.value)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[12px] text-navy truncate">{tier.label}</div>
                    <div className="font-mono text-[10px] text-slate-400">{tier.timeline}</div>
                  </div>
                  <div className="font-mono text-[12px] font-bold text-navy flex-shrink-0">{tier.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Why ODIPA research */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-display text-[16px] font-bold text-navy mb-4">Why Sponsor ODIPA Research</h3>
            <ul className="space-y-3">
              {[
                'Independent findings carry credibility no internal research can match',
                'Cited by journalists, legislators, and policymakers',
                'Full editorial independence — protecting sponsor reputation',
                'Published to ODIPA\'s full partner and media network',
                'Tax-deductible nonprofit contribution',
                'Demonstrates public privacy commitment',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[12px] text-slate-600">
                  <span className="text-gold font-bold flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Direct contact */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-display text-[16px] font-bold text-navy mb-3">Questions First?</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
              Contact our research director to discuss scope before you submit.
            </p>
            <a
              href="mailto:research@odipa.org"
              className="block w-full text-center border border-navy text-navy font-semibold text-[13px] py-2.5 rounded-lg hover:bg-navy hover:text-white transition-all no-underline"
            >
              research@odipa.org
            </a>
          </div>

        </aside>
      </div>
    </div>
  )
}
