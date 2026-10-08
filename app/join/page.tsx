import type { Metadata } from 'next'
import JoinSignup from '@/components/JoinSignup'
import { TERMS_PATH } from '@/data/membership'

export const metadata: Metadata = {
  title: 'Join Free',
  description:
    'Join the ODIPA community for free. Get the Privacy Monthly Digest, invitations to free sessions and meetups, and research releases. No cost, no vote, no spam.',
  alternates: { canonical: 'https://www.odipa.org/join' },
  openGraph: {
    title: 'Join ODIPA Free',
    description:
      'Become part of a community that believes privacy is a right. Free to join, one minute to sign up.',
    url: 'https://www.odipa.org/join',
    type: 'website',
    images: ['https://www.odipa.org/og-image.png'],
  },
}

const benefits = [
  {
    title: 'The Privacy Monthly Digest',
    body: 'Breach alerts, new privacy laws, and practical tips written for normal people, delivered once a month.',
  },
  {
    title: 'Invitations to free sessions',
    body: 'Courses, webinars, workshops, and meetups for consumers, students, seniors, and community groups.',
  },
  {
    title: 'Research and program updates',
    body: 'Be first to hear when ODIPA releases a new report, brief, or open-source privacy tool.',
  },
]

export default function JoinPage() {
  return (
    <div className="bg-cream min-h-screen">
      {/* Hero */}
      <div className="bg-navy pt-28 pb-16 px-6 overflow-hidden">
        <div className="max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-6">
            <span className="block w-6 h-px bg-gold-light" />
            Community
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.08] mb-5">
            Join ODIPA, free
          </h1>
          <p className="text-[16px] text-white/60 leading-[1.75] max-w-[580px]">
            Become part of a community that believes privacy is a right. Joining takes about
            a minute, costs nothing, and asks for as little information as possible.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[900px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
        <div>
          <h2 className="font-display text-[26px] font-bold text-navy mb-5 pb-3 border-b border-slate-200">
            What you get
          </h2>
          <ul className="space-y-5 mb-10 list-none p-0">
            {benefits.map(b => (
              <li key={b.title} className="flex items-start gap-3">
                <span className="text-gold font-bold mt-0.5 flex-shrink-0" aria-hidden="true">+</span>
                <div>
                  <div className="font-semibold text-[15px] text-navy">{b.title}</div>
                  <p className="text-[14px] text-slate-600 leading-[1.75] mt-0.5">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="font-display text-[26px] font-bold text-navy mb-5 pb-3 border-b border-slate-200">
            What joining means
          </h2>
          <div className="space-y-4 text-[14px] text-slate-600 leading-[1.85]">
            <p>
              Community members are supporters of ODIPA&apos;s mission. Membership is free and
              does not carry a vote or any role in governance. ODIPA&apos;s Board of Directors
              governs the organization under its bylaws.
            </p>
            <p>
              Membership has no effect on certification, assessments, or sponsor recognition.
              You can leave at any time with the unsubscribe link in any email.
            </p>
            <p>
              We ask for your first and last name and your email address. Your name lets ODIPA
              keep an accurate record of who its members are, and your email address is how we
              confirm your sign up and send you the digest. ODIPA stores this information itself,
              never sells it, and never shares it for anyone else&apos;s use. Read the full{' '}
              <a href={TERMS_PATH} className="text-blue-brand underline hover:text-navy transition-colors">
                Community Member Terms
              </a>{' '}
              and our{' '}
              <a href="/privacy-policy" className="text-blue-brand underline hover:text-navy transition-colors">
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <JoinSignup source="Join page" />
        </aside>
      </div>
    </div>
  )
}
