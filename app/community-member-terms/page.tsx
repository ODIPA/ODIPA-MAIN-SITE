import type { Metadata } from 'next'
import {
  GENERAL_CONTACT,
  PRIVACY_CONTACT,
  TERMS_EFFECTIVE_DATE,
  TERMS_VERSION,
} from '@/data/membership'

export const metadata: Metadata = {
  title: 'Community Member Terms',
  description:
    'The terms for ODIPA\'s free community membership. Membership is free and non-voting, and explains what you receive, how your information is handled, and how to leave.',
  alternates: { canonical: 'https://www.odipa.org/community-member-terms' },
  openGraph: {
    title: 'Community Member Terms | ODIPA',
    description: 'Terms for ODIPA\'s free, non-voting community membership.',
    url: 'https://www.odipa.org/community-member-terms',
    type: 'website',
  },
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-12">
      <h2 className="font-display text-[26px] font-bold text-navy mb-5 pb-3 border-b border-slate-200">
        {title}
      </h2>
      <div className="space-y-4 text-[15px] text-slate-600 leading-[1.85]">{children}</div>
    </section>
  )
}

export default function CommunityMemberTerms() {
  const toc = [
    { id: 'what-this-is', label: 'What this is' },
    { id: 'no-governance', label: 'No governance rights' },
    { id: 'what-you-receive', label: 'What you receive' },
    { id: 'your-information', label: 'Your information' },
    { id: 'leaving', label: 'Leaving' },
    { id: 'independence', label: 'Independence' },
    { id: 'changes', label: 'Changes' },
    { id: 'contact', label: 'Contact' },
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
            Community Member Terms
          </h1>
          <p className="text-[16px] text-white/60 leading-[1.75] max-w-[580px] mb-8">
            These terms apply to ODIPA&apos;s free community membership. They are short on purpose.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">Effective</div>
              <div className="text-[14px] text-white font-medium">{TERMS_EFFECTIVE_DATE}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <div className="font-mono text-[10px] text-gold-light uppercase tracking-[1px] mb-1">Version</div>
              <div className="text-[14px] text-white font-medium font-mono">{TERMS_VERSION}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[900px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="font-mono text-[11px] text-slate-400 uppercase tracking-[2px] mb-4">Contents</div>
            <nav aria-label="Terms contents">
              <ul className="space-y-1 list-none p-0">
                {toc.map(item => (
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
          </div>
        </aside>

        <main>
          <Section id="what-this-is" title="What this is">
            <p>
              Joining ODIPA as a community member is free. It is a way to stay connected to ODIPA&apos;s
              work and to show support for its mission of digital privacy education, advocacy,
              and research.
            </p>
          </Section>

          <Section id="no-governance" title="No governance rights">
            <p>
              ODIPA has no members within the meaning of Section 5056 of the California Corporations
              Code. ODIPA may refer to people who join as community members, but they are not
              statutory members. Community members have no right to vote, no ownership interest,
              and no role in governance. ODIPA&apos;s Board of Directors governs the organization
              under its bylaws.
            </p>
          </Section>

          <Section id="what-you-receive" title="What you receive">
            <p>
              Community members receive ODIPA&apos;s Privacy Monthly Digest, invitations to free
              sessions and events, and research and program updates. ODIPA may add to, change, or
              end any of these at any time.
            </p>
          </Section>

          <Section id="your-information" title="Your information">
            <p>
              We collect your first and last name and your email address. We also record the date
              you joined and the version of these terms you accepted. We use your name to keep an
              accurate record of who our members are. We use your email address to confirm that you
              chose to join and to send the digest, event invitations, research updates, and program
              news.
            </p>
            <p>
              ODIPA stores your information itself. We do not sell it and we do not share it for
              anyone else&apos;s use. We use Microsoft Azure to store sign ups and to send email on
              ODIPA&apos;s behalf, and those services handle your information only to provide that
              support.
            </p>
            <p>
              We keep your information for as long as you remain a community member. If you
              unsubscribe, we keep only your email address so we can honor your opt-out. If you ask
              us to delete your information, we will do so within 30 days. See our{' '}
              <a href="/privacy-policy" className="text-blue-brand underline hover:text-navy transition-colors">
                Privacy Policy
              </a>{' '}
              for more detail.
            </p>
          </Section>

          <Section id="leaving" title="Leaving">
            <p>
              You can leave at any time. Use the unsubscribe link in any ODIPA email, or write to{' '}
              <a href={`mailto:${PRIVACY_CONTACT}`} className="text-blue-brand underline hover:text-navy transition-colors">
                {PRIVACY_CONTACT}
              </a>{' '}
              to leave and to ask for your information to be deleted. Unsubscribing from our emails
              ends your community membership.
            </p>
          </Section>

          <Section id="independence" title="Independence">
            <p>
              Joining gives you no influence over certification, assessments, sponsor recognition,
              or ODIPA&apos;s public positions. Membership is separate from any commercial product
              or company, and ODIPA does not offer anything to members on behalf of a company.
            </p>
          </Section>

          <Section id="changes" title="Changes">
            <p>
              ODIPA&apos;s Board of Directors may change or end the community membership program.
              We will post any change to these terms on this page and update the version and
              effective date above. If a change is significant, we will tell members by email.
            </p>
          </Section>

          <Section id="contact" title="Contact">
            <p>
              Questions about these terms can go to{' '}
              <a href={`mailto:${GENERAL_CONTACT}`} className="text-blue-brand underline hover:text-navy transition-colors">
                {GENERAL_CONTACT}
              </a>
              . Questions or requests about your information can go to{' '}
              <a href={`mailto:${PRIVACY_CONTACT}`} className="text-blue-brand underline hover:text-navy transition-colors">
                {PRIVACY_CONTACT}
              </a>
              .
            </p>
          </Section>
        </main>
      </div>
    </div>
  )
}
