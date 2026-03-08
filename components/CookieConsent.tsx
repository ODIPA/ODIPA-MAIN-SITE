'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type ConsentState = 'pending' | 'accepted' | 'declined'

export default function CookieConsent() {
  const [state, setState] = useState<ConsentState>('pending')
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('odipa-cookie-consent')
    if (stored === 'accepted' || stored === 'declined') {
      setState(stored)
      setVisible(false)
    } else {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem('odipa-cookie-consent', 'accepted')
    setState('accepted')
    setVisible(false)
  }

  function handleDecline() {
    localStorage.setItem('odipa-cookie-consent', 'declined')
    setState('declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop blur on mobile */}
      <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[90] md:hidden" aria-hidden />

      {/* Banner */}
      <div
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="true"
        className={`fixed bottom-0 left-0 right-0 md:bottom-6 md:left-6 md:right-auto md:max-w-[420px] z-[100]
          bg-navy border-t md:border border-white/10 md:rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]
          transition-all duration-500 ease-out
          ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      >
        {/* Gold top bar */}
        <div className="h-[3px] bg-gold rounded-t-xl" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/logo-dark.png"
              alt="ODIPA"
              width={80}
              height={27}
              className="h-7 w-auto object-contain opacity-90"
            />
            <div className="h-5 w-px bg-white/10" />
            <span className="font-mono text-[10px] text-gold-light uppercase tracking-[2px]">
              Privacy Notice
            </span>
          </div>

          <p className="text-[13px] text-white/70 leading-[1.7] mb-1">
            We use cookies and similar technologies to improve your experience.
            As a privacy nonprofit, we practice what we preach —
            our analytics tool{' '}
            <a
              href="https://plausible.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-light underline hover:text-gold transition-colors"
            >
              Plausible
            </a>{' '}
            is <strong className="text-white font-semibold">cookieless</strong>, collects no personal data, and is fully GDPR &amp; CCPA compliant.
          </p>

          {/* Details toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[12px] text-white/40 hover:text-white/70 transition-colors mt-1 mb-4 flex items-center gap-1 font-mono"
          >
            <span
              className={`inline-block transition-transform duration-200 ${showDetails ? 'rotate-90' : ''}`}
            >
              ▶
            </span>
            {showDetails ? 'Hide details' : 'What we collect'}
          </button>

          {/* Details panel */}
          {showDetails && (
            <div className="mb-4 rounded-lg border border-white/[0.08] overflow-hidden text-[12px]">
              {[
                {
                  type: 'Analytics (Plausible)',
                  detail: 'Page views, referrers, device type — no personal data, no cookies, no cross-site tracking.',
                  required: false,
                  color: 'text-green-400',
                  status: 'Privacy-first',
                },
                {
                  type: 'Functional',
                  detail: 'Stores your cookie preference in localStorage so we don\'t ask again.',
                  required: true,
                  color: 'text-blue-300',
                  status: 'Required',
                },
              ].map((item, i) => (
                <div
                  key={item.type}
                  className={`p-3.5 ${i > 0 ? 'border-t border-white/[0.06]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white/80">{item.type}</span>
                    <span className={`font-mono text-[10px] ${item.color}`}>{item.status}</span>
                  </div>
                  <p className="text-white/45 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-gold hover:bg-gold-light text-navy font-bold text-[13px] py-2.5 rounded-md transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-medium text-[13px] py-2.5 rounded-md transition-all"
            >
              Decline
            </button>
          </div>

          {/* Fine print */}
          <p className="text-[11px] text-white/25 mt-3 leading-relaxed font-mono">
            See our{' '}
            <Link href="/privacy-policy" className="underline hover:text-white/50 transition-colors">
              Privacy Policy
            </Link>{' '}
            for full details. You can update your preference at any time.
          </p>
        </div>
      </div>
    </>
  )
}
