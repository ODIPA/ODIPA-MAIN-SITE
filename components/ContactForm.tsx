'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageCircle, GraduationCap, Heart, Building2,
  ClipboardCheck, Newspaper, Microscope, Code2, Lock, CircleDollarSign
} from 'lucide-react'

// -----------------------------------------------------------------------
// Replace with your Formspree endpoint after creating a free account at
// -----------------------------------------------------------------------
const API_ENDPOINT = '/api/contact'

const TOPICS = [
  { value: 'general',       label: 'General Inquiry',         email: 'info@odipa.org',            icon: <MessageCircle className="w-4 h-4" /> },
  { value: 'programs',      label: 'Programs & Education',    email: 'education@odipa.org',        icon: <GraduationCap className="w-4 h-4" /> },
  { value: 'volunteer',     label: 'Volunteering',            email: 'volunteer@odipa.org',        icon: <Heart className="w-4 h-4" /> },
  { value: 'partnerships',  label: 'Corporate Partnership',   email: 'partnerships@odipa.org',     icon: <Building2 className="w-4 h-4" /> },
  { value: 'certification', label: 'Certification Program',   email: 'certification@odipa.org',    icon: <ClipboardCheck className="w-4 h-4" /> },
  { value: 'press',         label: 'Press & Media',           email: 'press@odipa.org',            icon: <Newspaper className="w-4 h-4" /> },
  { value: 'research',      label: 'Research & Publications', email: 'research@odipa.org',         icon: <Microscope className="w-4 h-4" /> },
  { value: 'dev',           label: 'Open-Source / Dev',       email: 'dev@odipa.org',              icon: <Code2 className="w-4 h-4" /> },
  { value: 'privacy',       label: 'Privacy Policy',          email: 'privacy@odipa.org',          icon: <Lock className="w-4 h-4" /> },
  { value: 'donate',        label: 'Donations & Giving',      email: 'donate@odipa.org',           icon: <CircleDollarSign className="w-4 h-4" /> },
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

// Keep in sync with the roles on /get-involved/volunteer and api/_shared/volunteerRoles.js
const VOLUNTEER_ROLES = [
  'Certification Assessor', 'Privacy Researcher', 'Educator / Trainer', 'Privacy Attorney',
  'Data Analyst', 'Software Developer', 'Community Advocate', 'Content Writer', 'Translator',
  'Not sure yet',
]
const VOLUNTEER_HOURS = [
  '2 to 4 hours a month', '4 to 6 hours a month', '6 to 10 hours a month',
  'More than 10 hours a month', 'Not sure yet',
]

interface VolunteerData {
  why: string
  roles: string[]
  experience: string
  profileLink: string
  credentials: string
  hours: string
  location: string
  heardFrom: string
  extra: string
}

const VOLUNTEER_INITIAL: VolunteerData = {
  why: '', roles: [], experience: '', profileLink: '', credentials: '',
  hours: '', location: '', heardFrom: '', extra: '',
}

const RESUME_MAX_BYTES = 2 * 1024 * 1024
const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx']

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const INPUT_CLASS = 'w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-[14px] text-navy placeholder-slate-400 focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all'

interface AppFormData {
  topic: string
  name: string
  email: string
  organization: string
  message: string
  consent: boolean
}

const INITIAL: AppFormData = {
  topic: '',
  name: '',
  email: '',
  organization: '',
  message: '',
  consent: false,
}

function FieldLabel({ children, required, htmlFor }: { children: React.ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block font-semibold text-[13px] text-navy mb-1.5">
      {children}{required && <span className="text-gold ml-1">*</span>}
    </label>
  )
}

export default function ContactForm() {
  const searchParams = useSearchParams()
  const [form, setForm] = useState<AppFormData>(INITIAL)
  const [state, setState] = useState<FormState>('idle')
  const [errors, setErrors] = useState<Partial<Record<keyof AppFormData, string>>>({})
  const [honeypot, setHoneypot] = useState('')
  const [vol, setVol] = useState<VolunteerData>(VOLUNTEER_INITIAL)
  const [volErrors, setVolErrors] = useState<Partial<Record<keyof VolunteerData, string>>>({})
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeError, setResumeError] = useState('')
  const [serverMessage, setServerMessage] = useState('')
  const [submittedTopic, setSubmittedTopic] = useState('')
  const isVolunteer = form.topic === 'volunteer'
 
  // Pre-select topic from ?topic= query param (e.g. /contact?topic=certification)
  useEffect(() => {
    const t = searchParams.get('topic')
    if (t && TOPICS.find(topic => topic.value === t)) {
      setForm(prev => ({ ...prev, topic: t }))
    }
  }, [searchParams])

  const selectedTopic = TOPICS.find(t => t.value === form.topic)

  function set<K extends keyof AppFormData>(field: K) {
    return (value: AppFormData[K]) => {
      setForm(prev => ({ ...prev, [field]: value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  function pickResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0]
    setResumeError('')
    if (!file) { setResumeFile(null); return }
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!RESUME_EXTENSIONS.includes(ext)) { setResumeFile(null); setResumeError('Please choose a PDF or Word file (.pdf, .doc or .docx), or add a link instead.'); e.target.value = ''; return }
    if (file.size > RESUME_MAX_BYTES) { setResumeFile(null); setResumeError('That file is larger than 2 MB. Please choose a smaller file, or add a link instead.'); e.target.value = ''; return }
    setResumeFile(file)
  }

  function setVolField<K extends keyof VolunteerData>(field: K, value: VolunteerData[K]) {
    setVol(prev => ({ ...prev, [field]: value }))
    setVolErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function toggleRole(role: string) {
    setVolField('roles', vol.roles.includes(role) ? vol.roles.filter(r => r !== role) : [...vol.roles, role])
  }

  const fmtEmail = (v: string) => v.toLowerCase().replace(/\s/g, '')

  function validate(): boolean {
    const e: Partial<Record<keyof AppFormData, string>> = {}
    if (!form.topic)         e.topic   = 'Please select a topic'
    if (!form.name.trim())   e.name    = 'Your name is required'
    if (!form.email.trim())  e.email   = 'Your email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!isVolunteer && (!form.message.trim() || form.message.trim().length < 10)) e.message = 'Please enter a message (at least 10 characters)'
    if (!form.consent)       e.consent = 'Please confirm you agree to our privacy policy'

    const ve: Partial<Record<keyof VolunteerData, string>> = {}
    if (isVolunteer) {
      if (vol.why.trim().length < 40) ve.why = 'Please tell us in a few sentences why you want to volunteer with ODIPA'
      if (!vol.roles.length) ve.roles = 'Choose at least one role, or "Not sure yet"'
      if (vol.experience.trim().length < 30) ve.experience = 'Please describe your relevant experience or skills'
      if (!vol.profileLink.trim() && !resumeFile) ve.profileLink = 'Please add a link to your resume, LinkedIn profile or personal site, or attach your resume'
      else if (vol.profileLink.trim() && !/^(https?:\/\/)?[^\s/:]+\.[^\s/]+/i.test(vol.profileLink.trim())) ve.profileLink = 'That does not look like a web link'
      if (!vol.hours) ve.hours = 'Please choose how much time you can give'
    }
    setErrors(e)
    setVolErrors(ve)
    return Object.keys(e).length === 0 && Object.keys(ve).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return
    if (!validate()) return
    setState('submitting')
    setServerMessage('')
    try {
      let volunteerPayload: object = vol
      if (isVolunteer && resumeFile) {
        try {
          volunteerPayload = { ...vol, resume: { name: resumeFile.name, data: await fileToBase64(resumeFile) } }
        } catch {
          setResumeError('We could not read that file. Please choose it again, or add a link instead.')
          setState('idle')
          return
        }
      }
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          topic:          form.topic,
          'Topic':        selectedTopic?.label ?? form.topic,
          'Name':         form.name,
          'Email':        form.email,
          'Organization': form.organization || '—',
          'Message':      isVolunteer ? vol.why : form.message,
          ...(isVolunteer ? { volunteer: volunteerPayload } : {}),
          _hp: honeypot,
          '_replyto':     form.email,
          '_subject':     `ODIPA Contact: ${selectedTopic?.label ?? form.topic}`,
          'Consented':    form.consent ? 'Yes' : 'No',
        }),
      })
      if (res.ok) { setSubmittedTopic(form.topic); setState('success'); setForm(INITIAL); setVol(VOLUNTEER_INITIAL); setResumeFile(null); setResumeError('') }
      else {
        // The server words resume problems clearly (too large, wrong type, could not save).
        const data = await res.json().catch(() => null)
        if (isVolunteer && data && typeof data.error === 'string' && /resume/i.test(data.error)) setServerMessage(data.error)
        setState('error')
      }
    } catch { setState('error') }
  }

  if (state === 'success') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6 py-24">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-[480px] w-full">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-[28px] font-bold text-navy mb-3">{submittedTopic === 'volunteer' ? 'Application Received' : 'Message Sent'}</h2>
          <p className="text-[15px] text-slate-500 leading-[1.8] mb-2">
            {submittedTopic === 'volunteer'
              ? <>Thank you for offering your time. We review volunteer applications within <strong className="text-navy">5 business days</strong> and will invite you to a short intro call.</>
              : <>Thank you for reaching out. We&apos;ve received your message and will respond within <strong className="text-navy">2 business days</strong>.</>}
          </p>
          {selectedTopic && (
            <p className="font-mono text-[12px] text-slate-500 mb-8">
              Routed to: {selectedTopic.email}
            </p>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/"
              className="inline-block bg-navy text-white font-semibold text-[13px] px-6 py-2.5 rounded-lg hover:bg-navy-mid transition-colors no-underline">
              Back to ODIPA.org
            </Link>
            <button
              onClick={() => setState('idle')}
              className="inline-block border border-slate-200 text-slate-500 font-medium text-[13px] px-6 py-2.5 rounded-lg hover:border-slate-300 transition-colors"
            >
              Send Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 75% 50%, rgba(200,146,10,0.5) 0%, transparent 55%)' }} />
        <div className="relative max-w-[960px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
            ← ODIPA.org
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
                <span className="block w-6 h-px bg-gold-light" />Get in Touch
              </div>
              <h1 className="font-display text-[clamp(34px,5vw,52px)] font-black text-white leading-[1.1] mb-4">
                Contact ODIPA
              </h1>
              <p className="text-[16px] text-white/60 leading-[1.8]">
                Questions about our programs, partnerships, volunteering, press, or anything else, we&apos;re here. Select a topic and we&apos;ll route your message to the right team.
              </p>
            </div>
            <div className="hidden lg:flex justify-center opacity-[0.08]">
              <Image src="/logo-dark-md.png" alt="" width={559} height={224} className="w-[260px] h-auto" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      {/* Form + sidebar */}
      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Topic selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h2 className="font-display text-[20px] font-bold text-navy mb-5 pb-4 border-b border-slate-100">
              What can we help you with?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {TOPICS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('topic')(t.value)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left transition-all text-[13px] font-medium ${
                    form.topic === t.value
                      ? 'border-gold bg-gold/8 text-navy shadow-[0_0_0_1px_#C8920A]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex-shrink-0 text-current">{t.icon}</span>
                  <span className="leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
            {errors.topic && <p className="text-red-500 text-[12px] mt-3">{errors.topic}</p>}

            {/* Routing hint */}
            {selectedTopic && (
              <div className="mt-4 flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                <svg className="w-4 h-4 text-blue-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-mono text-[11px] text-slate-500">
                  Will be routed to <span className="text-navy font-semibold">{selectedTopic.email}</span>
                </span>
              </div>
            )}
          </div>

          {/* Contact details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h2 className="font-display text-[20px] font-bold text-navy mb-5 pb-4 border-b border-slate-100">
              Your Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Full Name</FieldLabel>
                <input
                  type="text" placeholder="Jane Smith" value={form.name}
                  onChange={e => set('name')(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-[14px] text-navy placeholder-slate-400 focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
                />
                {errors.name && <p className="text-red-500 text-[12px] mt-1">{errors.name}</p>}
              </div>
              <div>
                <FieldLabel required>Email Address</FieldLabel>
                <input
                  type="email" placeholder="jane@example.com" value={form.email}
                  onChange={e => set('email')(fmtEmail(e.target.value))}
                  onBlur={e => set('email')(fmtEmail(e.target.value).trim())}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-[14px] text-navy placeholder-slate-400 focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
                />
                {errors.email && <p className="text-red-500 text-[12px] mt-1">{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Organization <span className="font-normal text-slate-500">(optional)</span></FieldLabel>
                <input
                  type="text" placeholder="Company, school, or nonprofit" value={form.organization}
                  onChange={e => set('organization')(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-[14px] text-navy placeholder-slate-400 focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Volunteer application questions */}
          {isVolunteer && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
              <div>
                <h2 className="font-display text-[20px] font-bold text-navy mb-2 pb-4 border-b border-slate-100">
                  About You and ODIPA
                </h2>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Your answers are your volunteer application. The more you tell us, the faster we can match you with the right role and book your intro call.
                </p>
              </div>

              <div>
                <FieldLabel required htmlFor="vol-why">Why do you want to volunteer with ODIPA?</FieldLabel>
                <textarea id="vol-why" rows={4} value={vol.why} maxLength={1000}
                  onChange={e => setVolField('why', e.target.value)}
                  placeholder="What draws you to digital privacy, and what would you like to get out of volunteering?"
                  className={`${INPUT_CLASS} resize-none`} />
                {volErrors.why && <p className="text-red-500 text-[12px] mt-1">{volErrors.why}</p>}
              </div>

              <fieldset>
                <legend className="block font-semibold text-[13px] text-navy mb-1.5">
                  Which roles interest you?<span className="text-gold ml-1">*</span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VOLUNTEER_ROLES.map(role => (
                    <label key={role}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-[13px] cursor-pointer transition-all ${
                        vol.roles.includes(role) ? 'border-gold bg-gold/8 text-navy' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}>
                      <input type="checkbox" checked={vol.roles.includes(role)} onChange={() => toggleRole(role)}
                        className="accent-gold w-4 h-4 flex-shrink-0" />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[12px] text-slate-500 mt-2">
                  See what each role involves on the <Link href="/get-involved/volunteer" className="text-blue-brand underline">volunteer page</Link>.
                </p>
                {volErrors.roles && <p className="text-red-500 text-[12px] mt-1">{volErrors.roles}</p>}
              </fieldset>

              <div>
                <FieldLabel required htmlFor="vol-experience">Relevant experience and skills</FieldLabel>
                <textarea id="vol-experience" rows={4} value={vol.experience} maxLength={1000}
                  onChange={e => setVolField('experience', e.target.value)}
                  placeholder="Your work, studies or projects that relate to privacy, research, law, security, writing, teaching or the roles above."
                  className={`${INPUT_CLASS} resize-none`} />
                {volErrors.experience && <p className="text-red-500 text-[12px] mt-1">{volErrors.experience}</p>}
              </div>

              <div>
                <FieldLabel htmlFor="vol-profileLink">Link to your resume, LinkedIn or personal site</FieldLabel>
                <p id="vol-resume-either" className="text-[12px] text-slate-500 mb-1.5">Add a link, attach your resume below, or both. One of the two is needed.</p>
                <input id="vol-profileLink" type="text" inputMode="url" value={vol.profileLink} maxLength={300}
                  aria-describedby="vol-resume-either"
                  onChange={e => setVolField('profileLink', e.target.value)}
                  placeholder="https://www.linkedin.com/in/your-name"
                  className={INPUT_CLASS} />
                <p className="text-[12px] text-slate-500 mt-1">
                  A shared resume link from Google Drive, Dropbox or OneDrive works too.
                </p>
                {volErrors.profileLink && <p className="text-red-500 text-[12px] mt-1">{volErrors.profileLink}</p>}

                <div className="mt-4">
                  <FieldLabel htmlFor="vol-resume">Attach your resume <span className="font-normal text-slate-500">(optional)</span></FieldLabel>
                  <input id="vol-resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={pickResume} aria-describedby="vol-resume-either vol-resume-help"
                    className="block w-full text-[13px] text-navy file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-white file:px-4 file:py-2 file:text-[13px] file:font-medium file:text-navy hover:file:border-blue-brand" />
                  <p id="vol-resume-help" className="text-[12px] text-slate-500 mt-1">
                    PDF or Word, up to 2 MB. Your file is stored privately by ODIPA, used only to review your application, and deleted after 90 days.
                  </p>
                  {resumeFile && <p className="text-[12px] text-navy mt-1">Selected: {resumeFile.name}</p>}
                  {resumeError && <p role="alert" className="text-red-500 text-[12px] mt-1">{resumeError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required htmlFor="vol-hours">How much time can you give?</FieldLabel>
                  <select id="vol-hours" value={vol.hours} onChange={e => setVolField('hours', e.target.value)} className={INPUT_CLASS}>
                    <option value="">Choose one</option>
                    {VOLUNTEER_HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {volErrors.hours && <p className="text-red-500 text-[12px] mt-1">{volErrors.hours}</p>}
                </div>
                <div>
                  <FieldLabel htmlFor="vol-credentials">Credentials <span className="font-normal text-slate-500">(optional)</span></FieldLabel>
                  <input id="vol-credentials" type="text" value={vol.credentials} maxLength={300}
                    onChange={e => setVolField('credentials', e.target.value)}
                    placeholder="For example CIPP, CIPM, CISA, CISSP, bar admission"
                    className={INPUT_CLASS} />
                </div>
                <div>
                  <FieldLabel htmlFor="vol-location">Where are you based? <span className="font-normal text-slate-500">(optional)</span></FieldLabel>
                  <input id="vol-location" type="text" value={vol.location} maxLength={120}
                    onChange={e => setVolField('location', e.target.value)}
                    placeholder="City or country, so we can schedule your call"
                    className={INPUT_CLASS} />
                </div>
                <div>
                  <FieldLabel htmlFor="vol-heardFrom">How did you hear about ODIPA? <span className="font-normal text-slate-500">(optional)</span></FieldLabel>
                  <input id="vol-heardFrom" type="text" value={vol.heardFrom} maxLength={200}
                    onChange={e => setVolField('heardFrom', e.target.value)}
                    className={INPUT_CLASS} />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="vol-extra">Anything else we should know? <span className="font-normal text-slate-500">(optional)</span></FieldLabel>
                <textarea id="vol-extra" rows={3} value={vol.extra} maxLength={800}
                  onChange={e => setVolField('extra', e.target.value)}
                  className={`${INPUT_CLASS} resize-none`} />
              </div>
              <p className="text-[12px] text-slate-500">
                Volunteer roles are unpaid and remote. We do not ask for your age, citizenship or immigration status here.
              </p>
            </div>
          )}

          {/* Message (volunteers answer the questions above instead) */}
          {!isVolunteer && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h2 className="font-display text-[20px] font-bold text-navy mb-5 pb-4 border-b border-slate-100">
              Your Message
            </h2>
            <textarea
              placeholder="Tell us what's on your mind..."
              value={form.message}
              rows={6}
              onChange={e => set('message')(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-[14px] text-navy placeholder-slate-400 focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.message
                ? <p className="text-red-500 text-[12px]">{errors.message}</p>
                : <span className="text-slate-300 text-[12px]">Minimum 10 characters</span>
              }
              <span className={`font-mono text-[11px] ${form.message.length > 1000 ? 'text-amber-500' : 'text-slate-300'}`}>
                {form.message.length}/2000
              </span>
            </div>
          </div>
          )}

          {/* Consent + submit */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input
                type="checkbox" checked={form.consent}
                onChange={e => set('consent')(e.target.checked)}
                className="accent-gold w-4 h-4 mt-0.5 flex-shrink-0"
              />
              <span className="text-[13px] text-slate-600 leading-relaxed">
                I agree that ODIPA may use the information I&apos;ve provided to respond to my inquiry{isVolunteer ? ' and to review my volunteer application' : ''}. 
                My data will not be shared with third parties or used for marketing without my consent. 
                See our{' '}
                <Link href="/privacy-policy" className="text-blue-brand underline hover:text-navy transition-colors">
                  Privacy Policy
                </Link>.
              </span>
            </label>
            {errors.consent && <p className="text-red-500 text-[12px] mb-4">{errors.consent}</p>}

            {state === 'error' && (
              <div role="alert" className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
                {serverMessage
                  ? `${serverMessage} You can also email us directly at`
                  : 'Something went wrong submitting the form. Please try again, or email us directly at'}{' '}
                <a href="mailto:info@odipa.org" className="underline font-semibold">info@odipa.org</a>.
              </div>
            )}

            <button
              type="submit"
              disabled={state === 'submitting'}
              className="w-full bg-gold hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed text-navy font-bold text-[15px] py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              {state === 'submitting' ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {isVolunteer ? 'Submit Application' : 'Send Message'}
                </>
              )}
            </button>
            <p className="text-center text-[12px] text-slate-500 mt-3 font-mono">
              {isVolunteer ? 'We review volunteer applications within 5 business days' : 'We respond to all messages within 2 business days'}
            </p>
          </div>

          {/* Honeypot: hidden from real users, bots fill it in */}
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

        {/* Sidebar */}
        <aside className="space-y-5">

          {/* Response time */}
          <div className="bg-navy rounded-2xl p-6">
            <div className="font-mono text-[10px] text-gold-light uppercase tracking-[2px] mb-4">Response Times</div>
            <div className="space-y-3">
              {[
                { label: 'General inquiries',  time: '2 business days' },
                { label: 'Press & media',       time: 'Same business day' },
                { label: 'Partnerships',        time: '2 business days' },
                { label: 'Certification',       time: '3 business days' },
                { label: 'Volunteer',           time: '5 business days' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center gap-3 text-[12px]">
                  <span className="text-white/50">{item.label}</span>
                  <span className="text-white font-mono font-semibold whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct emails */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-4">Direct Emails</div>
            <div className="space-y-2">
              {TOPICS.slice(0, 6).map(t => (
                <a key={t.value} href={`mailto:${t.email}`}
                  className="flex items-center gap-2.5 text-[12px] py-1.5 text-slate-500 hover:text-navy transition-colors no-underline group">
                  <span className="flex-shrink-0 text-current">{t.icon}</span>
                  <span className="group-hover:underline">{t.email}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Other ways */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-4">Other Ways to Reach Us</div>
            <div className="space-y-3 text-[13px]">
              <div>
                <div className="font-semibold text-navy mb-0.5">Volunteer</div>
                <Link href="/get-involved/volunteer" className="text-blue-brand hover:text-navy no-underline transition-colors text-[12px]">
                  See volunteer roles →
                </Link>
              </div>
              <div>
                <div className="font-semibold text-navy mb-0.5">Partner with us</div>
                <Link href="/become-a-sponsor" className="text-blue-brand hover:text-navy no-underline transition-colors text-[12px]">
                  Sponsorship inquiry →
                </Link>
              </div>
              <div>
                <div className="font-semibold text-navy mb-0.5">Press inquiries</div>
                <Link href="/press" className="text-blue-brand hover:text-navy no-underline transition-colors text-[12px]">
                  Press & media page →
                </Link>
              </div>
              <div>
                <div className="font-semibold text-navy mb-0.5">Get certified</div>
                <Link href="/get-involved/get-certified" className="text-blue-brand hover:text-navy no-underline transition-colors text-[12px]">
                  Certification info →
                </Link>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}
