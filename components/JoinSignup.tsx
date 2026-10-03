'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { TERMS_PATH, TERMS_VERSION } from '@/data/membership'

const API_ENDPOINT = '/api/membership'
const REQUEST_TIMEOUT_MS = 20000
const HELP_EMAIL = 'info@odipa.org'

type State = 'idle' | 'submitting' | 'success' | 'joined' | 'error'

interface Props {
  /** Source label sent to API for attribution */
  source?: string
}

/**
 * Free community membership sign-up. Follows the same flow as NewsletterSignup
 * (optional first name, email, honeypot, double opt-in by email) and adds a
 * required checkbox to accept the Community Member Terms.
 */
export default function JoinSignup({ source = 'Join page' }: Props) {
  const [email, setEmail]       = useState('')
  const [name, setName]         = useState('')
  const [accepted, setAccepted] = useState(false)
  const [state, setState]       = useState<State>('idle')
  const [error, setError]       = useState('')
  const [honeypot, setHoneypot] = useState('')
  const errorRef = useRef<HTMLDivElement>(null)

  const fmtEmail = (v: string) => v.toLowerCase().replace(/\s/g, '')

  // Whenever a message appears, bring it into view so the button never seems to do nothing.
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
      errorRef.current.focus({ preventScroll: true })
    }
  }, [error])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'submitting') return
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!accepted) {
      setError('Please tick the box to accept the Community Member Terms, then press Join Free again.')
      return
    }
    setError('')
    setState('submitting')

    // A request that never answers must not leave the button spinning forever.
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(API_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  controller.signal,
        body:    JSON.stringify({
          email: trimmed,
          name: name.trim(),
          source,
          acceptedTerms: true,
          termsVersion: TERMS_VERSION,
          // If anything fills the hidden trap field, the server discards the sign up quietly.
          // The visitor still sees a normal confirmation instead of a button that does nothing.
          _hp: honeypot,
        }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        // Already-confirmed subscribers get no confirmation email, so say so.
        setState(data.alreadyConfirmed ? 'joined' : 'success')
        setEmail('')
        setName('')
        setAccepted(false)
      } else {
        const data = await res.json().catch(() => ({}))
        const why = data.error || 'Sign up failed.'
        setError(`${why} (error ${res.status}) If this keeps happening, email ${HELP_EMAIL}.`)
        setState('error')
      }
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === 'AbortError'
      setError(timedOut
        ? `This is taking longer than expected, so we stopped waiting. Please try again, or email ${HELP_EMAIL}.`
        : `We could not reach the server. Check your connection and try again, or email ${HELP_EMAIL}.`)
      setState('error')
    } finally {
      clearTimeout(timer)
    }
  }

  if (state === 'joined') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display text-[22px] font-bold text-navy">You are in!</p>
            <p className="text-[14px] text-slate-500 mt-1 leading-relaxed">
              You were already on our list, so your community membership is active. No confirmation is needed.
            </p>
            <button
              type="button"
              onClick={() => setState('idle')}
              className="text-[13px] text-gold underline mt-3 bg-transparent border-0 p-0 cursor-pointer"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display text-[22px] font-bold text-navy">Almost there, check your inbox!</p>
            <p className="text-[14px] text-slate-500 mt-1 leading-relaxed">
              Click the confirmation link we just sent to finish joining. If it does not arrive within a few minutes, check your spam folder.
            </p>
            <button
              type="button"
              onClick={() => setState('idle')}
              className="text-[13px] text-gold underline mt-3 bg-transparent border-0 p-0 cursor-pointer"
            >
              Wrong email? Sign up again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const showError = Boolean(error) || state === 'error'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div>
          <label htmlFor="join-name" className="block text-[13px] font-semibold text-navy mb-1.5">
            First name <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="join-name"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-[14px] text-navy placeholder-slate-400
              focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
          />
        </div>

        <div>
          <label htmlFor="join-email" className="block text-[13px] font-semibold text-navy mb-1.5">
            Email address
          </label>
          <input
            id="join-email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => { setEmail(fmtEmail(e.target.value)); setError('') }}
            onBlur={e => setEmail(fmtEmail(e.target.value).trim())}
            required
            className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-[14px] text-navy placeholder-slate-400
              focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
          />
        </div>

        <div className="flex items-start gap-3 pt-1">
          <input
            id="join-terms"
            type="checkbox"
            checked={accepted}
            onChange={e => { setAccepted(e.target.checked); setError('') }}
            aria-describedby={showError ? 'join-error' : undefined}
            className="mt-1 h-4 w-4 flex-shrink-0 rounded border-slate-300 accent-[#0B1F3A]"
          />
          <label htmlFor="join-terms" className="text-[13px] text-slate-600 leading-relaxed cursor-pointer">
            I agree to the{' '}
            <a href={TERMS_PATH} target="_blank" rel="noopener noreferrer" className="text-blue-brand underline hover:text-navy transition-colors">
              Community Member Terms
            </a>{' '}
            and the{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-brand underline hover:text-navy transition-colors">
              Privacy Policy
            </a>.
          </label>
        </div>

        {showError && (
          <div
            ref={errorRef}
            id="join-error"
            role="alert"
            tabIndex={-1}
            className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3.5 py-3 text-[13px] leading-snug text-red-700 outline-none"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error || 'Sign up failed. Please try again.'}</span>
          </div>
        )}

        {/* Honeypot, hidden from real users, bots fill it in */}
        <input
          type="text"
          name="hp_contact_pref"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
        />

        <button
          type="submit"
          disabled={state === 'submitting'}
          className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50
            text-navy font-bold text-[14px] px-5 py-3.5 rounded-lg transition-colors"
        >
          {state === 'submitting'
            ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Joining</span></>
            : <><span>Join Free</span><ArrowRight className="w-4 h-4" /></>
          }
        </button>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Free, no spam, unsubscribe anytime. We never sell your data.
        </p>
      </form>
    </div>
  )
}
