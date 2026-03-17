import type { Metadata } from 'next'
import { CheckCircle, Mail, Receipt, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Thank You — ODIPA',
  description: 'Thank you for your donation to ODIPA. Your support helps protect digital privacy for everyone.',
  alternates: { canonical: 'https://odipa.org/donate/thank-you' },
  robots: { index: false },
}

const nextSteps = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Check your email',
    desc: 'PayPal will send you a receipt and tax confirmation immediately. Check your spam folder if you do not see it within a few minutes.',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Join the community',
    desc: 'Sign up for our newsletter to receive privacy alerts, research updates, and program announcements.',
    action: { label: 'Subscribe', href: '/#newsletter' },
  },
  {
    icon: <ArrowRight className="w-5 h-5" />,
    title: 'Explore our programs',
    desc: 'See how your donation is put to work across our eight privacy programs — from free public education to open-source tools.',
    action: { label: 'View Programs', href: '/#programs' },
  },
]

export default function ThankYouPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy pt-28 pb-20 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 60% 40%, rgba(200,146,10,0.5) 0%, transparent 60%),
                              radial-gradient(circle at 20% 80%, rgba(26,95,168,0.4) 0%, transparent 50%)`,
          }}
        />
        <div className="max-w-[680px] mx-auto text-center relative">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-5">
            <span className="block w-6 h-px bg-gold-light" />
            Donation Received
            <span className="block w-6 h-px bg-gold-light" />
          </div>
          <h1 className="font-display text-[clamp(34px,5vw,52px)] font-black text-white leading-[1.1] mb-5">
            Thank You for<br />
            <span className="text-gold-light">Supporting Privacy.</span>
          </h1>
          <p className="text-[17px] text-white/60 leading-[1.75] mb-8 max-w-[520px] mx-auto">
            Your donation helps ODIPA deliver free privacy education, independent research, open-source tools, and policy advocacy to everyone — regardless of income or background.
          </p>

          {/* Tax info strip */}
          <div className="inline-flex flex-wrap justify-center gap-6 bg-white/5 border border-white/10 rounded-xl px-6 py-4">
            {[
              { label: 'Organization', value: 'ODIPA' },
              { label: 'EIN', value: '33-2725121' },
              { label: 'Status', value: '501(c)(3) Tax-Exempt' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">{item.label}</div>
                <div className="text-[13px] text-white font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Receipt reminder */}
      <div className="max-w-[680px] mx-auto px-6 -mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Receipt className="w-5 h-5 text-blue-brand" />
          </div>
          <div>
            <div className="font-semibold text-navy text-[14px] mb-1">Your receipt is on its way</div>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              PayPal has sent a donation receipt to your email address. This receipt serves as your official tax record for contributions to ODIPA (EIN: 33-2725121), a 501(c)(3) tax-exempt nonprofit. Keep it for your tax records.
            </p>
            <p className="text-[12px] text-slate-400 mt-2">
              Did not receive it? Check your spam folder or contact{' '}
              <a href="mailto:donate@odipa.org" className="text-blue-brand underline hover:text-navy">donate@odipa.org</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="max-w-[680px] mx-auto px-6 py-14">
        <div className="font-mono text-[11px] text-blue-brand uppercase tracking-[2px] mb-8 text-center">What's Next</div>
        <div className="space-y-4">
          {nextSteps.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 px-6 py-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center flex-shrink-0 mt-0.5 text-navy">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-navy text-[14px] mb-1">{step.title}</div>
                <p className="text-[13px] text-slate-500 leading-relaxed">{step.desc}</p>
                {step.action && (
                  <Link
                    href={step.action.href}
                    className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-blue-brand hover:text-navy no-underline transition-colors"
                  >
                    {step.action.label} →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Social links */}
        <div className="mt-10 text-center">
          <div className="font-mono text-[11px] text-slate-400 uppercase tracking-[2px] mb-4">Follow ODIPA</div>
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { label: 'LinkedIn',  href: 'https://linkedin.com/company/odipa' },
              { label: 'X',        href: 'https://twitter.com/odipa_org' },
              { label: 'Facebook', href: 'https://facebook.com/odipa.org' },
              { label: 'Instagram',href: 'https://instagram.com/odipa_org' },
              { label: 'YouTube',  href: 'https://youtube.com/@odipa_org' },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-slate-500 hover:text-navy border border-slate-200 hover:border-navy/30 px-3 py-1.5 rounded-lg transition-all no-underline"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Back to site */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[12px] text-slate-400 hover:text-navy transition-colors no-underline"
          >
            ← Back to ODIPA.org
          </Link>
        </div>
      </div>

    </div>
  )
}
