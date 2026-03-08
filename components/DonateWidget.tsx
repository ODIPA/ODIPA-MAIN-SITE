'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Lock, Receipt, RefreshCw, CreditCard } from 'lucide-react'

// -------------------------------------------------------------------------
// Replace this with your Give Lively organization slug after registering at
// https://givelively.org — found in your dashboard under "Embed Widget"
// Example: 'odipa' → https://secure.givelively.org/donate/odipa
// -------------------------------------------------------------------------
const GIVE_LIVELY_SLUG = 'REPLACE_WITH_YOUR_SLUG'

const IMPACT_ITEMS = [
  { amount: '$25',  impact: 'Contributes toward a free consumer webinar' },
  { amount: '$50',  impact: 'Helps fund the research and production of a brief' },
  { amount: '$100', impact: 'Contributes toward hosting a local meetup' },
  { amount: '$250', impact: 'Supports a month of open-source platform infrastructure' },
  { amount: '$500', impact: 'Helps underwrite the research and drafting of a policy position paper' },
  { amount: '$1K+', impact: 'Becomes a named supporter of a campaign' },
]

export default function DonateWidget() {
  useEffect(() => {
    // Load Give Lively widget script
    const script = document.createElement('script')
    script.src = `https://secure.givelively.org/widgets/nonprofit/${GIVE_LIVELY_SLUG}/donate.js`
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy pt-28 pb-16 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 50%, rgba(200,146,10,0.4) 0%, transparent 60%),
                              radial-gradient(circle at 20% 80%, rgba(26,95,168,0.4) 0%, transparent 50%)`,
          }}
        />
        <div className="max-w-[960px] mx-auto relative">
          <a
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline"
          >
            ← Back to ODIPA.org
          </a>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
                <span className="block w-6 h-px bg-gold-light" />
                Tax-Deductible Donation
              </div>
              <h1 className="font-display text-[clamp(34px,5vw,52px)] font-black text-white leading-[1.1] mb-5">
                Privacy Protection<br />
                <span className="text-gold-light">Starts With You.</span>
              </h1>
              <p className="text-[16px] text-white/60 leading-[1.75] mb-6">
                Your donation makes free privacy education, advocacy, research, and open-source tools possible for everyone.
              </p>

              {/* 77/19/4 breakdown bar */}
              <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="font-mono text-[10px] text-gold-light uppercase tracking-[2px] mb-3">Where every dollar goes</div>
                <div className="flex rounded-full overflow-hidden h-2.5 mb-4">
                  <div className="bg-white" style={{ width: '77%' }} />
                  <div className="bg-gold" style={{ width: '19%' }} />
                  <div className="bg-white/25" style={{ width: '4%' }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { pct: '77%', label: 'Free public programs', color: 'text-white' },
                    { pct: '19%', label: 'Fee-based operations', color: 'text-gold-light' },
                    { pct: '4%',  label: 'Governance & overhead', color: 'text-white/40' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className={`font-display text-[20px] font-black ${s.color} leading-none`}>{s.pct}</div>
                      <div className="font-mono text-[9px] text-white/40 mt-1 leading-snug">{s.label}</div>
                    </div>
                  ))}
                </div>
                <p className="font-mono text-[9px] text-white/25 mt-3 leading-snug">
                  These percentages describe how ODIPA delivers services — not how we spend money. A separate financial breakdown is available upon request.
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">Status</div>
                  <div className="text-[14px] text-white font-semibold">501(c)(3) Nonprofit</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">Platform</div>
                  <div className="text-[14px] text-white font-semibold">Give Lively — 0% fees</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">EIN</div>
                  <div className="text-[14px] text-white font-semibold">33-2725121</div>
                </div>
              </div>
            </div>

            {/* Logo watermark */}
            <div className="hidden lg:flex justify-center items-center opacity-10">
              <Image
                src="/logo-dark.png"
                alt=""
                width={300}
                height={100}
                className="w-[280px] h-auto object-contain"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

        {/* Give Lively Widget */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-navy px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-display text-[18px] font-bold text-white">Make a Donation</div>
                <div className="font-mono text-[10px] sm:text-[11px] text-gold-light tracking-[1px] mt-0.5">
                  Secure · Tax-Deductible · 0% Platform Fees
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-400" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <span className="text-[11px] text-white/60 font-mono">SSL Secured</span>
              </div>
            </div>

            {/* Give Lively embed target */}
            <div className="p-2">
              <div
                id="give-lively-widget"
                className="gl-branded-button"
                data-campaign-id={GIVE_LIVELY_SLUG}
              />
              {/* Fallback if widget hasn't loaded yet */}
              <noscript>
                <div className="p-8 text-center">
                  <p className="text-slate-600 mb-4">JavaScript is required to load the donation form.</p>
                  <a
                    href={`https://secure.givelively.org/donate/${GIVE_LIVELY_SLUG}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gold text-navy px-8 py-3 rounded-lg font-bold no-underline"
                  >
                    Donate on Give Lively →
                  </a>
                </div>
              </noscript>
            </div>

            {/* Legal note */}
            <div className="px-6 pt-4 pb-3 border-t border-slate-100 bg-slate-50/60">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-600">Member communications:</span>{' '}
                By completing your donation, you will be asked during checkout whether you consent
                to receive ODIPA member communications — including newsletters, research updates,
                privacy alerts, and program announcements. Your donation makes you an ODIPA member.
                Consent is recorded at the time of donation and you may unsubscribe at any time.{' '}
                <a href="/privacy-policy" className="text-blue-brand hover:text-navy underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            {/* Trust badges */}
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 items-center">
              {[
                { icon: <Lock className="w-3.5 h-3.5" />, label: 'Secure checkout' },
                { icon: <Receipt className="w-3.5 h-3.5" />, label: 'Receipt emailed instantly' },
                { icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'One-time or monthly recurring' },
                { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Card, Apple Pay, Google Pay' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="text-slate-400">{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative */}
          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <span className="text-[13px] text-slate-500">Prefer to donate via the Give Lively website?</span>
            <a
              href={`https://secure.givelively.org/donate/${GIVE_LIVELY_SLUG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-semibold text-blue-brand hover:text-navy no-underline transition-colors inline-flex items-center gap-1.5"
            >
              Donate on Give Lively →
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">

          {/* Your impact */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-display text-[18px] font-bold text-navy mb-5">Your Impact</h3>
            <ul className="space-y-4">
              {IMPACT_ITEMS.map((item) => (
                <li key={item.amount} className="flex items-start gap-3">
                  <span className="font-mono text-[12px] font-bold text-gold bg-gold/10 px-2 py-1 rounded flex-shrink-0 min-w-[44px] text-center">
                    {item.amount}
                  </span>
                  <span className="text-[13px] text-slate-600 leading-relaxed pt-0.5">
                    {item.impact}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why Give Lively */}
          <div className="bg-navy rounded-2xl p-6">
            <h3 className="font-display text-[18px] font-bold text-white mb-3">
              Why Give Lively?
            </h3>
            <ul className="space-y-2.5">
              {[
                '0% platform fee — 100% reaches ODIPA',
                'Powered by Stripe infrastructure',
                'Instant tax receipt by email',
                'One-time or monthly recurring giving',
                'Registered nonprofit itself',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-white/65">
                  <span className="text-gold font-bold mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Tax info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-display text-[18px] font-bold text-navy mb-3">Tax Information</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
              ODIPA is a 501(c)(3) tax-exempt nonprofit organization. Contributions are
              tax-deductible to the extent permitted by law. You will receive an official
              receipt for your records immediately after donating.
            </p>
            <div className="font-mono text-[11px] text-slate-400 space-y-1">
              <div>EIN: 33-2725121</div>
              <div>Organization: ODIPA</div>
              <div>Status: 501(c)(3) Tax-Exempt</div>
            </div>
          </div>

          {/* Other ways */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-display text-[18px] font-bold text-navy mb-3">Other Ways to Give</h3>
            <ul className="space-y-2.5 text-[13px] text-slate-600">
              <li>
                <span className="font-semibold text-navy">Check: </span>
                Payable to &quot;ODIPA&quot; — contact us for mailing address
              </li>
              <li>
                <span className="font-semibold text-navy">Wire transfer: </span>
                Contact <a href="mailto:donate@odipa.org" className="text-blue-brand underline hover:text-navy">donate@odipa.org</a>
              </li>
              <li>
                <span className="font-semibold text-navy">Corporate matching: </span>
                Many employers match donations — check with your HR department
              </li>
              <li>
                <span className="font-semibold text-navy">Planned giving: </span>
                Contact us to discuss legacy gifts
              </li>
            </ul>
          </div>

        </aside>
      </div>
    </div>
  )
}
