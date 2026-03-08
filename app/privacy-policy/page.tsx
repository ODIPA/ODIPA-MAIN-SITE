import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'ODIPA is a privacy-first organization. Read how we collect, use, and protect your information — and why we chose cookieless analytics.',
  alternates: {
    canonical: 'https://odipa.org/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy — ODIPA',
    description: 'How ODIPA collects, uses, and protects your data — including our cookieless, privacy-first analytics approach.',
    url: 'https://odipa.org/privacy-policy',
    type: 'website',
  },
}

const EFFECTIVE_DATE = 'January 1, 2026'
const CONTACT_EMAIL = 'privacy@odipa.org'

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-14">
      <h2 className="font-display text-[26px] font-bold text-navy mb-5 pb-3 border-b border-slate-200">
        {title}
      </h2>
      <div className="space-y-4 text-[15px] text-slate-600 leading-[1.85]">
        {children}
      </div>
    </section>
  )
}

function InfoBox({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex-1">
        <div className="font-semibold text-[13px] text-navy mb-0.5">{label}</div>
        <div className={`text-[13px] font-mono ${green ? 'text-green-600' : 'text-slate-500'}`}>{value}</div>
      </div>
    </div>
  )
}

export default function PrivacyPolicy() {
  const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'what-we-collect', label: 'What We Collect' },
    { id: 'analytics', label: 'Analytics (Plausible)' },
    { id: 'cookies', label: 'Cookies & Storage' },
    { id: 'third-parties', label: 'Third-Party Services' },
    { id: 'your-rights', label: 'Your Rights' },
    { id: 'data-security', label: 'Data Security' },
    { id: 'children', label: "Children's Privacy" },
    { id: 'changes', label: 'Policy Changes' },
    { id: 'contact', label: 'Contact Us' },
  ]

  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy pt-28 pb-16 px-6 overflow-hidden">
        <div className="max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-6">
            <span className="block w-6 h-px bg-gold-light" />
            Legal
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.08] mb-5">
            Privacy Policy
          </h1>
          <p className="text-[16px] text-white/60 leading-[1.75] max-w-[580px] mb-8">
            We are a privacy nonprofit. We hold ourselves to the highest standard when it
            comes to how we handle your data — which is to say, we collect as little as
            possible, and we are transparent about everything we do.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">Effective Date</div>
              <div className="text-[14px] text-white font-medium">{EFFECTIVE_DATE}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">Organization</div>
              <div className="text-[14px] text-white font-medium">ODIPA — 501(c)(3) Nonprofit</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">Analytics</div>
              <div className="text-[14px] text-green-400 font-medium font-mono">Cookieless ✓</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[900px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-16">

        {/* Sticky TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="font-mono text-[11px] text-slate-400 uppercase tracking-[2px] mb-4">Contents</div>
            <nav>
              <ul className="space-y-1">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block text-[13px] text-slate-500 hover:text-navy py-1 pl-3 border-l-2 border-transparent hover:border-gold transition-all no-underline"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-8 p-4 bg-white rounded-xl border border-slate-200">
              <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[1px] mb-2">Questions?</div>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[13px] text-navy font-semibold hover:text-blue-brand transition-colors no-underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main>

          <Section id="overview" title="Overview">
            <p>
              This Privacy Policy explains how ODIPA — Organization for Digital Information Privacy &amp;
              Awareness (&quot;ODIPA,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and protects information
              when you visit our website at odipa.org (the &quot;Site&quot;) or interact with our programs
              and services.
            </p>
            <p>
              As a nonprofit organization whose mission is consumer privacy education and advocacy,
              we are deeply committed to practicing what we preach. We have deliberately designed
              our digital infrastructure to minimize data collection, avoid tracking technologies,
              and respect your privacy by default.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-[28px] font-bold text-green-600 font-display mb-1">0</div>
                <div className="text-[12px] text-green-700 font-mono uppercase tracking-wide">Tracking cookies</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-[28px] font-bold text-green-600 font-display mb-1">0</div>
                <div className="text-[12px] text-green-700 font-mono uppercase tracking-wide">Personal data sold</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-[28px] font-bold text-green-600 font-display mb-1">0</div>
                <div className="text-[12px] text-green-700 font-mono uppercase tracking-wide">Ad networks used</div>
              </div>
            </div>
          </Section>

          <Section id="what-we-collect" title="What We Collect">
            <p>
              We collect the absolute minimum information necessary to operate our website and
              communicate with people who reach out to us. Here is a complete breakdown:
            </p>
            <div className="space-y-3 my-5">
              <InfoBox
                label="Aggregate website analytics"
                value="Page views, referrer source, device type, country — never linked to an individual"
              />
              <InfoBox
                label="Email communications"
                value="Only when you contact us directly (e.g., volunteer@odipa.org). We retain only what is needed to respond."
              />
              <InfoBox
                label="Cookie consent preference"
                value="Stored locally in your browser's localStorage — never transmitted to our servers"
              />
            </div>
            <p>
              We do <strong className="text-navy">not</strong> collect names, email addresses,
              IP addresses, location data, device identifiers, behavioral profiles, or any other
              personally identifiable information through the Site itself.
            </p>
          </Section>

          <Section id="analytics" title="Analytics — Plausible">
            <p>
              We use{' '}
              <a
                href="https://plausible.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-brand underline hover:text-navy transition-colors"
              >
                Plausible Analytics
              </a>
              , an open-source, privacy-respecting analytics platform based in the European Union.
              We chose Plausible specifically because it aligns with our mission.
            </p>
            <div className="bg-navy/[0.04] border border-navy/10 rounded-xl p-6 my-5 space-y-3">
              {[
                ['No cookies', 'Plausible does not use cookies or any persistent identifiers.'],
                ['No personal data', 'No IP addresses, device fingerprints, or user profiles are created.'],
                ['No cross-site tracking', 'Plausible does not follow you across websites.'],
                ['GDPR compliant', 'Fully compliant with GDPR, CCPA, PECR, and other privacy regulations — no consent required.'],
                ['Data stays in EU', 'All data is processed and stored on servers in the European Union.'],
                ['Open source', 'Plausible\'s code is publicly auditable on GitHub.'],
              ].map(([label, detail]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  <div>
                    <span className="font-semibold text-navy">{label}: </span>
                    <span>{detail}</span>
                  </div>
                </div>
              ))}
            </div>
            <p>
              The aggregate data Plausible provides — such as how many people visited the Site
              today and which pages are most viewed — helps us understand how to better serve
              our community. No individual is ever identified.
            </p>
          </Section>

          <Section id="cookies" title="Cookies & Local Storage">
            <p>
              This Site does <strong className="text-navy">not</strong> use tracking cookies,
              advertising cookies, or any third-party cookies.
            </p>
            <p>
              The only browser storage we use is <span className="font-mono text-[14px] bg-slate-100 px-1.5 py-0.5 rounded text-navy">localStorage</span>,
              and only for one purpose:
            </p>
            <div className="my-4">
              <InfoBox
                label="odipa-cookie-consent"
                value="Stores 'accepted' or 'declined' so we don't show the consent banner on every visit. Never transmitted anywhere."
                green
              />
            </div>
            <p>
              You can clear this at any time by opening your browser&apos;s developer tools and
              clearing localStorage for odipa.org, or by clearing your browser&apos;s site data.
            </p>
          </Section>

          <Section id="third-parties" title="Third-Party Services">
            <p>
              We use a small number of external services to operate the Site. Each is listed
              here with its privacy posture:
            </p>
            <div className="overflow-x-auto my-5">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="text-left px-4 py-3 font-semibold rounded-tl-lg">Service</th>
                    <th className="text-left px-4 py-3 font-semibold">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold">Data Shared</th>
                    <th className="text-left px-4 py-3 font-semibold rounded-tr-lg">Privacy</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Plausible Analytics', 'Website analytics', 'Aggregate only — no personal data', '✓ Excellent'],
                    ['Azure Static Web Apps', 'Website hosting', 'Standard HTTP request logs (IP, timestamp) — retained briefly per Microsoft policy', '~ Standard'],
                    ['Google Fonts', 'Typography', 'Font file requests only', '~ Standard'],
                    ['Unsplash', 'Stock photography', 'Image requests only', '~ Standard'],
                  ].map(([service, purpose, data, privacy], i) => (
                    <tr key={service} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 font-semibold text-navy border-b border-slate-100">{service}</td>
                      <td className="px-4 py-3 text-slate-600 border-b border-slate-100">{purpose}</td>
                      <td className="px-4 py-3 text-slate-600 border-b border-slate-100">{data}</td>
                      <td className={`px-4 py-3 border-b border-slate-100 font-mono text-[12px] ${privacy.startsWith('✓') ? 'text-green-600' : 'text-slate-400'}`}>{privacy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              We do not use Google Analytics, Meta Pixel, LinkedIn Insight Tag, or any other
              behavioral tracking or advertising technology.
            </p>
          </Section>

          <Section id="your-rights" title="Your Rights">
            <p>
              Depending on your location, you may have the following rights regarding your data.
              Because we collect so little, most of these are simple to exercise:
            </p>
            <div className="space-y-3 my-5">
              {[
                ['Right to access', 'You can request a copy of any personal information we hold about you. Since we collect almost none through the Site, this will typically apply only to email correspondence.'],
                ['Right to deletion', 'You can request that we delete any personal information we hold. Email us at ' + CONTACT_EMAIL + '.'],
                ['Right to opt out of analytics', 'Plausible respects the "Do Not Track" browser setting. You can also install a browser ad-blocker, which will prevent Plausible from counting your visit.'],
                ['Right to withdraw consent', 'Clear "odipa-cookie-consent" from your browser\'s localStorage at any time to reset your consent preference.'],
                ['California residents (CCPA)', 'We do not sell personal information. You have the right to know, delete, and opt out of sale — though we have nothing to opt out of.'],
                ['EU/UK residents (GDPR)', 'Our legal basis for Plausible analytics is Legitimate Interest, given its cookieless and non-personal nature. You may lodge a complaint with your supervisory authority.'],
              ].map(([right, detail]) => (
                <div key={right} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200">
                  <span className="text-gold font-bold mt-0.5 flex-shrink-0">→</span>
                  <div>
                    <div className="font-semibold text-navy mb-1">{right}</div>
                    <div className="text-[13px] text-slate-500 leading-relaxed">{detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="data-security" title="Data Security">
            <p>
              Our Site is hosted on Microsoft Azure Static Web Apps, which provides enterprise-grade
              infrastructure with TLS/HTTPS encryption in transit, DDoS protection, and global CDN
              delivery. We have configured the following security headers on all responses:
            </p>
            <div className="my-4 bg-navy rounded-xl p-5 font-mono text-[12px] space-y-1.5">
              {[
                ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
                ['X-Content-Type-Options', 'nosniff'],
                ['X-Frame-Options', 'DENY'],
                ['X-XSS-Protection', '1; mode=block'],
                ['Referrer-Policy', 'strict-origin-when-cross-origin'],
                ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
              ].map(([header, value]) => (
                <div key={header} className="flex gap-3">
                  <span className="text-gold-light flex-shrink-0">{header}:</span>
                  <span className="text-white/60">{value}</span>
                </div>
              ))}
            </div>
            <p>
              Despite these measures, no transmission over the internet is 100% secure. We
              encourage you to take steps to protect your own data, including using a strong
              password manager, enabling two-factor authentication on sensitive accounts, and
              staying informed through ODIPA&apos;s free educational programs.
            </p>
          </Section>

          <Section id="children" title="Children&apos;s Privacy">
            <p>
              Our Site is not directed to children under the age of 13, and we do not knowingly
              collect personal information from children. If you believe a child has provided us
              with personal information, please contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-brand underline hover:text-navy transition-colors">
                {CONTACT_EMAIL}
              </a>{' '}
              and we will promptly delete it.
            </p>
          </Section>

          <Section id="changes" title="Policy Changes">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update
              the effective date at the top of this page and, for material changes, provide
              prominent notice on the Site.
            </p>
            <p>
              We encourage you to review this policy periodically. Your continued use of the
              Site after any changes constitutes your acceptance of the updated policy.
            </p>
          </Section>

          <Section id="contact" title="Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy
              or our data practices, please contact us:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
              {[
                { label: 'Privacy inquiries', email: 'privacy@odipa.org' },
                { label: 'General contact', email: 'info@odipa.org' },
                { label: 'Data deletion requests', email: 'privacy@odipa.org' },
                { label: 'Media & press', email: 'press@odipa.org' },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="font-mono text-[10px] text-blue-brand uppercase tracking-[1px] mb-1">{item.label}</div>
                  <a
                    href={`mailto:${item.email}`}
                    className="text-[14px] text-navy font-semibold hover:text-blue-brand transition-colors no-underline"
                  >
                    {item.email}
                  </a>
                </div>
              ))}
            </div>
            <p>
              We are committed to responding to all privacy-related inquiries within 5 business days.
            </p>
          </Section>

          {/* Back to site */}
          <div className="pt-8 border-t border-slate-200">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-blue-brand hover:text-navy no-underline transition-colors"
            >
              ← Back to odipa.org
            </a>
          </div>

        </main>
      </div>
    </div>
  )
}
