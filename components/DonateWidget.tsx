'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Lock, Receipt, RefreshCw, CreditCard, Clock } from 'lucide-react'

const GIVE_LIVELY_SLUG = 'REPLACE_WITH_YOUR_SLUG'
const PAYPAL_BUTTON_ID  = '4JEJNVYCA27M6'

const IMPACT_ITEMS = [
  { amount: '$25',  impact: 'Contributes toward a free consumer webinar — open to the public at no charge' },
  { amount: '$50',  impact: 'Helps fund the research and production of a privacy research brief' },
  { amount: '$100', impact: 'Contributes toward hosting a local community privacy meetup' },
  { amount: '$250', impact: 'Supports a month of open-source platform infrastructure and hosting' },
  { amount: '$500', impact: 'Helps underwrite the research and drafting of a policy position paper' },
  { amount: '$1K+', impact: 'Becomes a named supporter of an annual Privacy Awareness campaign' },
]

type Method = 'paypal' | 'givelively'

export default function DonateWidget() {
  const [method, setMethod] = useState<Method>('paypal')

  // Load PayPal donate SDK
  useEffect(() => {
    if (method !== 'paypal') return

    const containerId = 'donate-button'
    const existing = document.getElementById(containerId)
    if (existing) existing.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://www.paypalobjects.com/donate/sdk/donate-sdk.js'
    script.charset = 'UTF-8'
    script.async = true
    script.onload = () => {
      if ((window as any).PayPal?.Donation?.Button) {
        ;(window as any).PayPal.Donation.Button({
          env: 'production',
          hosted_button_id: PAYPAL_BUTTON_ID,
          onComplete: () => {
            window.location.href = '/donate/thank-you'
          },
          image: {
            src: 'https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif',
            alt: 'Donate with PayPal button',
            title: 'PayPal - The safer, easier way to pay online!',
          },
        }).render(`#${containerId}`)
      }
    }
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [method])

  // Load Give Lively SDK
  useEffect(() => {
    if (method !== 'givelively') return
    const script = document.createElement('script')
    script.src = `https://secure.givelively.org/widgets/nonprofit/${GIVE_LIVELY_SLUG}/donate.js`
    script.async = true
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [method])

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
          <a href="/" className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline">
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
                  <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">Platforms</div>
                  <div className="text-[14px] text-white font-semibold">PayPal · Give Lively</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">EIN</div>
                  <div className="text-[14px] text-white font-semibold">33-2725122</div>
                </div>
              </div>
            </div>

            {/* Logo watermark */}
            <div className="hidden lg:flex justify-center items-center opacity-10">
              <Image src="/logo-dark.png" alt="" width={300} height={100} className="w-[280px] h-auto object-contain" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[960px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

        <div>
          {/* Payment method tabs — PayPal first as it's live */}
          <div className="flex gap-3 mb-5">
            {([
              { id: 'paypal',     label: 'PayPal',      sub: 'Live — donate now', live: true  },
              { id: 'givelively', label: 'Give Lively', sub: '0% fees — coming soon', live: false },
            ] as { id: Method; label: string; sub: string; live: boolean }[]).map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex-1 rounded-xl border px-4 py-3 text-left transition-all ${
                  method === m.id ? 'border-blue-brand bg-blue-brand/5' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-[13px] ${method === m.id ? 'text-navy' : 'text-slate-600'}`}>{m.label}</span>
                  {m.live
                    ? <span className="font-mono text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Live</span>
                    : <span className="font-mono text-[9px] bg-gold/15 text-gold px-1.5 py-0.5 rounded-full">Soon</span>
                  }
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{m.sub}</div>
              </button>
            ))}
          </div>

          {/* PayPal — LIVE */}
          {method === 'paypal' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-navy px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-display text-[18px] font-bold text-white">Donate via PayPal</div>
                  <div className="font-mono text-[10px] sm:text-[11px] text-gold-light tracking-[1px] mt-0.5">
                    Secure · Tax-Deductible · Direct to ODIPA
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] text-green-300 font-mono font-semibold">Live</span>
                </div>
              </div>

              <div className="p-8 flex flex-col items-center gap-6">
                <p className="text-[14px] text-slate-500 text-center max-w-[400px] leading-relaxed">
                  Click the button below to donate securely through PayPal. A tax receipt will be emailed to you immediately after your donation is processed.
                </p>
                {/* PayPal button renders here */}
                <div id="donate-button" className="flex justify-center" />
                <p className="text-[12px] text-slate-400 text-center">
                  PayPal balance, credit card, debit card, or bank transfer accepted.
                </p>
              </div>

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
          )}

          {/* Give Lively — Coming Soon */}
          {method === 'givelively' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm opacity-50 pointer-events-none select-none">
              <div className="bg-navy px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-display text-[18px] font-bold text-white">Donate via Give Lively</div>
                  <div className="font-mono text-[10px] sm:text-[11px] text-gold-light tracking-[1px] mt-0.5">
                    Secure · Tax-Deductible · 0% Platform Fees
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gold/20 border border-gold/30 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[11px] text-gold font-mono font-semibold">Coming Soon</span>
                </div>
              </div>
              <div className="p-8 text-center min-h-[200px] flex flex-col items-center justify-center gap-4">
                <Clock className="w-10 h-10 text-slate-300" />
                <div>
                  <div className="font-semibold text-navy text-[15px] mb-1">Give Lively integration coming soon</div>
                  <div className="text-[13px] text-slate-400">Give Lively account setup is in progress. Check back shortly.</div>
                </div>
              </div>
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
          )}

          {/* Legal note */}
          <div className="mt-4 px-5 py-4 bg-white rounded-xl border border-slate-200">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-600">Member communications:</span>{' '}
              By completing your donation, you will be asked during checkout whether you consent
              to receive ODIPA member communications — including newsletters, research updates,
              privacy alerts, and program announcements. Your donation makes you an ODIPA member.
              Consent is recorded at the time of donation and you may unsubscribe at any time.{' '}
              <a href="/privacy-policy" className="text-blue-brand hover:text-navy underline">Privacy Policy</a>.
            </p>
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
                  <span className="text-[13px] text-slate-600 leading-relaxed pt-0.5">{item.impact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment platforms */}
          <div className="bg-navy rounded-2xl p-6">
            <h3 className="font-display text-[18px] font-bold text-white mb-4">Payment Platforms</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-gold-light text-[13px]">PayPal</span>
                  <span className="font-mono text-[9px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full">Live</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Donate directly to ODIPA's verified account",
                    'PayPal balance, card, or bank transfer',
                    'Familiar checkout experience',
                    'Instant tax receipt by email',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[12px] text-white/65">
                      <span className="text-gold font-bold mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-gold-light text-[13px]">Give Lively</span>
                  <span className="font-mono text-[9px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">Coming Soon</span>
                </div>
                <ul className="space-y-2">
                  {[
                    '0% platform fee — 100% reaches ODIPA',
                    'Powered by Stripe infrastructure',
                    'One-time or monthly recurring giving',
                    'Registered nonprofit itself',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[12px] text-white/65">
                      <span className="text-gold font-bold mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
              <div>EIN: 33-2725122</div>
              <div>Organization: ODIPA</div>
              <div>Status: 501(c)(3) Tax-Exempt</div>
            </div>
          </div>

          {/* Other ways */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-display text-[18px] font-bold text-navy mb-3">Other Ways to Give</h3>
            <ul className="space-y-2.5 text-[13px] text-slate-600">
              <li><span className="font-semibold text-navy">Check: </span>Payable to &quot;ODIPA&quot; — contact us for mailing address</li>
              <li><span className="font-semibold text-navy">Wire transfer: </span>Contact <a href="mailto:donate@odipa.org" className="text-blue-brand underline hover:text-navy">donate@odipa.org</a></li>
              <li><span className="font-semibold text-navy">Corporate matching: </span>Many employers match donations — check with your HR department</li>
              <li><span className="font-semibold text-navy">Planned giving: </span>Contact us to discuss legacy gifts</li>
            </ul>
          </div>

        </aside>
      </div>
    </div>
  )
}
