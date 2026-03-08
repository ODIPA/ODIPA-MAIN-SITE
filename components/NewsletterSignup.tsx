'use client'

import { useState } from 'react'
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const API_ENDPOINT = '/api/newsletter'

type Variant = 'footer' | 'banner' | 'inline'
type State   = 'idle' | 'submitting' | 'success' | 'error'

interface Props {
  /** Visual variant — footer (dark), banner (gold accent), inline (light card) */
  variant?: Variant
  /** Source label sent to API for attribution */
  source?: string
}

export default function NewsletterSignup({ variant = 'footer', source = 'Website' }: Props) {
  const [email, setEmail]     = useState('')
  const [name,  setName]      = useState('')
  const [state, setState]     = useState<State>('idle')
  const [error, setError]     = useState('')

  const fmtEmail = (v: string) => v.toLowerCase().replace(/\s/g, '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setState('submitting')
    try {
      const res = await fetch(API_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: trimmed, name: name.trim(), source }),
      })
      if (res.ok) {
        setState('success')
        setEmail('')
        setName('')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Signup failed. Please try again.')
        setState('error')
      }
    } catch {
      setError('Network error. Please try again.')
      setState('error')
    }
  }

  // ─── Footer variant (dark navy bg) ────────────────────────────────────────
  if (variant === 'footer') {
    return (
      <div className="w-full">
        {state === 'success' ? (
          <div className="flex items-center gap-3 py-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-white">You&apos;re subscribed!</p>
              <p className="text-[12px] text-white/50">We&apos;ll send you privacy news and ODIPA updates.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
            <input
              type="text"
              placeholder="First name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.07] border border-white/10 text-[13px] text-white placeholder-white/30
                focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
            />
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(fmtEmail(e.target.value)); setError('') }} onBlur={e => setEmail(fmtEmail(e.target.value).trim())}
                required
                className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-white/[0.07] border border-white/10 text-[13px] text-white placeholder-white/30
                  focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
              />
              <button
                type="submit"
                disabled={state === 'submitting'}
                className="flex-shrink-0 flex items-center gap-1.5 bg-gold hover:bg-gold-light disabled:opacity-50
                  text-navy font-bold text-[12px] px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
              >
                {state === 'submitting'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span>Subscribe</span><ArrowRight className="w-3.5 h-3.5" /></>
                }
              </button>
            </div>
            {(error || state === 'error') && (
              <p className="flex items-center gap-1.5 text-[11px] text-red-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error || 'Signup failed. Please try again.'}
              </p>
            )}
            <p className="text-[10px] text-white/25 leading-relaxed">
              No spam, ever. Unsubscribe any time. We never sell your data.{' '}
              <a href="/privacy-policy" className="underline hover:text-white/50 transition-colors">Privacy Policy</a>
            </p>
          </form>
        )}
      </div>
    )
  }

  // ─── Banner variant (full-width gold-accent band) ─────────────────────────
  if (variant === 'banner') {
    return (
      <section className="bg-navy border-t border-b border-white/[0.06] py-14 px-6">
        <div className="max-w-[960px] mx-auto">
          {state === 'success' ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center text-center sm:text-left">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-display text-[20px] font-bold text-white">You&apos;re on the list!</p>
                <p className="text-[14px] text-white/55">Expect privacy news, research releases, and ODIPA updates — never spam.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 font-mono text-[10px] text-gold-light uppercase tracking-[2px] mb-3">
                  <Mail className="w-3.5 h-3.5" />
                  Privacy Newsletter
                </div>
                <h2 className="font-display text-[clamp(22px,3vw,30px)] font-black text-white leading-tight mb-2">
                  Stay ahead of privacy threats.
                </h2>
                <p className="text-[14px] text-white/55 leading-relaxed max-w-[480px]">
                  Privacy digest: breach alerts, new privacy laws, ODIPA research releases, and practical tips to protect your data. Free, always.
                </p>
              </div>
              <form onSubmit={handleSubmit} noValidate className="w-full lg:w-auto lg:min-w-[360px] space-y-2.5">
                <input
                  type="text"
                  placeholder="First name (optional)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-[14px] text-white placeholder-white/30
                    focus:outline-none focus:border-gold/40 focus:bg-white/10 transition-all"
                />
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(fmtEmail(e.target.value)); setError('') }} onBlur={e => setEmail(fmtEmail(e.target.value).trim())}
                    required
                    className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-[14px] text-white placeholder-white/30
                      focus:outline-none focus:border-gold/40 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={state === 'submitting'}
                    className="flex-shrink-0 flex items-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50
                      text-navy font-bold text-[13px] px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
                  >
                    {state === 'submitting'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><span>Subscribe</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </div>
                {(error || state === 'error') && (
                  <p className="flex items-center gap-1.5 text-[12px] text-red-400">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error || 'Signup failed. Please try again.'}
                  </p>
                )}
                <p className="text-[11px] text-white/25 leading-relaxed">
                  No spam. Unsubscribe anytime. We never sell your data.{' '}
                  <a href="/privacy-policy" className="underline hover:text-white/45 transition-colors">Privacy Policy</a>
                </p>
              </form>
            </div>
          )}
        </div>
      </section>
    )
  }

  // ─── Inline variant (light card, used inside page bodies) ─────────────────
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2.5 font-mono text-[10px] text-blue-brand uppercase tracking-[2px] mb-3">
        <Mail className="w-3.5 h-3.5" />
        Newsletter
      </div>
      {state === 'success' ? (
        <div className="flex items-start gap-3 py-2">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[14px] text-navy">Subscribed!</p>
            <p className="text-[12px] text-slate-500 mt-0.5">We&apos;ll keep you updated on privacy news and ODIPA releases.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
          <p className="text-[13px] text-slate-500 leading-relaxed mb-3">
            Get privacy news, research releases, and breach alerts. Free, no spam.
          </p>
          <input
            type="text"
            placeholder="First name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-navy placeholder-slate-400
              focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
          />
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(fmtEmail(e.target.value)); setError('') }} onBlur={e => setEmail(fmtEmail(e.target.value).trim())}
              required
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-navy placeholder-slate-400
                focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
            />
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="flex-shrink-0 flex items-center gap-1.5 bg-navy hover:bg-navy-mid disabled:opacity-50
                text-white font-semibold text-[12px] px-4 py-2.5 rounded-lg transition-colors"
            >
              {state === 'submitting'
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <ArrowRight className="w-3.5 h-3.5" />
              }
            </button>
          </div>
          {(error || state === 'error') && (
            <p className="flex items-center gap-1.5 text-[11px] text-red-500">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error || 'Signup failed. Please try again.'}
            </p>
          )}
          <p className="text-[10px] text-slate-400">
            No spam. Unsubscribe anytime.{' '}
            <a href="/privacy-policy" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>
          </p>
        </form>
      )}
    </div>
  )
}
