'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// -------------------------------------------------------------------
// Replace this with your Formspree endpoint after creating a free
// -------------------------------------------------------------------
const API_ENDPOINT = '/api/sponsor'

const TIERS = [
  { value: 'community',  label: 'Community Sponsor',  price: '$2,500/yr',  color: '#1E3A5F' },
  { value: 'supporting', label: 'Advocate Sponsor', price: '$5,000/yr',  color: '#152E52' },
  { value: 'premier',    label: 'Champion Sponsor',    price: '$10,000/yr', color: '#0B1F3A' },
  { value: 'founding',   label: 'Founding Sponsor',   price: '$25,000+/yr',color: '#0A1628' },
]

const HEAR_OPTIONS = [
  'Web search',
  'Social media',
  'Colleague or referral',
  'Conference or event',
  'News or press coverage',
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
  hearAbout: string
  message: string
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
  hearAbout: '',
  message: '',
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
  id, type = 'text', placeholder, value, onChange, onBlur,required,
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

export default function SponsorForm() {
  const [form, setForm] = useState<AppFormData>(INITIAL)
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
    if (!form.orgName.trim())    e.orgName    = 'Organization name is required'
    if (!form.contactName.trim())e.contactName= 'Contact name is required'
    if (!form.email.trim())      e.email      = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.tier)              e.tier       = 'Please select a sponsorship tier'
    if (!form.consent)           e.consent    = 'You must agree to be contacted'
    setErrors(e)
    return Object.keys(e).length === 0
  }

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
          'Organization Name': form.orgName,
          'Contact Name':      form.contactName,
          'Job Title':         form.title,
          'Email':             form.email,
          'Phone':             form.phone,
          _hp: honeypot,
          'Website':           form.website,
          'Sponsorship Tier':  TIERS.find(t => t.value === form.tier)?.label ?? form.tier,
          'How They Heard':    form.hearAbout,
          'Message':           form.message,
          'Consented':         form.consent ? 'Yes' : 'No',
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
          <Link href="/#sponsor" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← Back to Sponsorship
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
                <span className="block w-6 h-px bg-gold-light" />
                Sponsorship — IRC §513(i)
              </div>
              <h1 className="font-display text-[clamp(34px,5vw,52px)] font-black text-white leading-[1.1] mb-5">
                Become an<br />ODIPA Sponsor
              </h1>
              <p className="text-[16px] text-white/60 leading-[1.75] mb-5">
                Sponsorship is a public acknowledgment relationship — your organization
                supports ODIPA&apos;s mission and we recognize you by name and logo across our
                platforms. Sponsors do not receive services, deliverables, or program access.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-[13px] text-white/50 leading-relaxed">
                <span className="text-gold-light font-semibold">Looking for services?</span>{' '}
                Training, certification, research, and technical support are{' '}
                <a href="/get-involved/corporate-partner" className="text-gold-light underline hover:text-white transition-colors">
                  Corporate Partnership engagements
                </a>{' '}
                — not sponsorships. Different agreement, different tax treatment.
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIERS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => set('tier')(tier.value)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    form.tier === tier.value
                      ? 'border-gold bg-gold/10 shadow-[0_0_0_1px_#C8920A]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="font-display text-[13px] sm:text-[16px] font-bold text-white mb-1 leading-tight">{tier.label}</div>
                  <div className="font-mono text-[11px] sm:text-[12px] text-gold-light">{tier.price}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form + sidebar */}
      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

        {/* Form */}
        <div>
          {state === 'success' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="text-[64px] mb-6">🎉</div>
              <h2 className="font-display text-[32px] font-bold text-navy mb-4">
                Thank You!
              </h2>
              <p className="text-[16px] text-slate-500 leading-[1.8] mb-8 max-w-[440px] mx-auto">
                We&apos;ve received your sponsorship inquiry and a member of the ODIPA partnerships
                team will be in touch within 2 business days.
              </p>
              <a
                href="/"
                className="inline-block bg-navy text-white px-8 py-3.5 rounded-lg font-semibold text-[14px] hover:bg-navy-mid transition-colors no-underline"
              >
                Return to ODIPA.org
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-8">

              {/* Organization */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <h2 className="font-display text-[22px] font-bold text-navy mb-6 pb-4 border-b border-slate-100">
                  Organization Details
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
                </div>
              </div>

              {/* Sponsorship */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <h2 className="font-display text-[22px] font-bold text-navy mb-6 pb-4 border-b border-slate-100">
                  Sponsorship Interest
                </h2>
                <div className="space-y-5">
                  <div>
                    <FieldLabel required>Preferred Sponsorship Tier</FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {TIERS.map((tier) => (
                        <label
                          key={tier.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                            form.tier === tier.value
                              ? 'border-gold bg-gold/5 shadow-[0_0_0_1px_#C8920A]'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio" name="tier" value={tier.value}
                            checked={form.tier === tier.value}
                            onChange={() => set('tier')(tier.value)}
                            className="accent-gold w-4 h-4 flex-shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-[13px] text-navy">{tier.label}</div>
                            <div className="font-mono text-[11px] text-gold">{tier.price}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.tier && <p className="text-red-500 text-[12px] mt-1">{errors.tier}</p>}
                  </div>

                  <div>
                    <FieldLabel>How did you hear about ODIPA?</FieldLabel>
                    <Select id="hearAbout" value={form.hearAbout} onChange={set('hearAbout')}>
                      <option value="">Select an option</option>
                      {HEAR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </Select>
                  </div>

                  <div>
                    <FieldLabel>Tell us about your organization and partnership goals</FieldLabel>
                    <Textarea
                      id="message"
                      placeholder="What draws your organization to ODIPA's mission? Are there specific programs or activities you'd like to support? Any questions about our sponsorship tiers?"
                      value={form.message}
                      onChange={set('message')}
                      rows={5}
                    />
                  </div>
                </div>
              </div>

              {/* Consent + Submit */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => set('consent')(e.target.checked)}
                    className="accent-gold w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-[13px] text-slate-600 leading-relaxed">
                    I agree to be contacted by ODIPA regarding sponsorship opportunities. I understand
                    that my information will be used solely for this purpose and will not be shared
                    with third parties. See our{' '}
                    <Link href="/privacy-policy" className="text-blue-brand underline hover:text-navy transition-colors">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
                {errors.consent && <p className="text-red-500 text-[12px] mt-2">{errors.consent}</p>}

                {state === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
                    Something went wrong. Please try again or email us directly at{' '}
                    <a href="mailto:partnerships@odipa.org" className="underline font-semibold">
                      partnerships@odipa.org
                    </a>.
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
                      Submitting...
                    </>
                  ) : (
                    'Submit Sponsorship Inquiry'
                  )}
                </button>
                <p className="text-center text-[12px] text-slate-400 mt-3 font-mono">
                  We respond to all inquiries within 2 business days
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

          {/* Logo */}
          <div className="bg-navy rounded-2xl p-6 flex flex-col items-start gap-4">
            <Image src="/logo-dark.png" alt="ODIPA" width={120} height={40} className="h-10 w-auto" />
            <p className="text-[13px] text-white/60 leading-relaxed">
              ODIPA is a 501(c)(3) tax-exempt nonprofit. Sponsorship contributions may be
              tax-deductible to the extent permitted by law.
            </p>
            <span className="font-mono text-[10px] text-gold-light bg-white/5 border border-white/10 px-3 py-1.5 rounded">
              EIN: 33-2725121
            </span>
          </div>

          {/* What sponsorship includes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-display text-[18px] font-bold text-navy mb-1">What Sponsorship Includes</h3>
            <p className="text-[12px] text-slate-400 font-mono mb-4">Recognition only — no services or deliverables</p>
            <ul className="space-y-3">
              {[
                'Name & logo on ODIPA website',
                'Acknowledgment in annual report',
                'Social media recognition post',
                'Logo in email newsletter footer',
                'Recognition on event materials',
                'IRC §513(i) qualified payment receipt',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                  <span className="text-gold font-bold mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Agreement request */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-display text-[18px] font-bold text-navy mb-2">Review the Agreement</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
              All sponsors sign ODIPA&apos;s Sponsorship Agreement before activation.
              Request a copy to review with your legal team before submitting this form.
            </p>
            <a
              href="/contact?topic=sponsorship-agreement"
              className="block w-full text-center bg-navy text-white font-semibold text-[13px] py-2.5 rounded-lg hover:bg-navy/90 transition-all no-underline mb-3"
            >
              Request Sponsorship Agreement
            </a>
            <a
              href="mailto:partnerships@odipa.org"
              className="block w-full text-center border border-slate-200 text-slate-500 font-semibold text-[13px] py-2.5 rounded-lg hover:border-navy hover:text-navy transition-all no-underline"
            >
              partnerships@odipa.org
            </a>
          </div>

          {/* Not what you need? */}
          <div className="bg-blue-brand/5 border border-blue-brand/15 rounded-2xl p-6">
            <h3 className="font-display text-[15px] font-bold text-navy mb-2">Need Services Instead?</h3>
            <p className="text-[12px] text-slate-500 leading-relaxed mb-3">
              Training, certification, research sponsorship, and technical support are Corporate Partnership engagements — governed by a separate agreement.
            </p>
            <a
              href="/get-involved/corporate-partner"
              className="block w-full text-center border border-blue-brand text-blue-brand font-semibold text-[13px] py-2.5 rounded-lg hover:bg-blue-brand hover:text-white transition-all no-underline"
            >
              View Corporate Partnership →
            </a>
          </div>

        </aside>
      </div>
    </div>
  )
}
