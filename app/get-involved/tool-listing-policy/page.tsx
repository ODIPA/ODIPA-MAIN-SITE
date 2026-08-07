import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Flag, Landmark, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tool Listing Policy',
  description:
    'How tools enter, appear in, and move between the statuses of ODIPA\'s Community Privacy Tools directory. Approved, Community Project (Needs Help), and ODIPA Adopted.',
  alternates: { canonical: 'https://odipa.org/get-involved/tool-listing-policy' },
}

const tiers = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    badge: 'Approved',
    badgeClass: 'text-green-700 bg-green-50 border-green-300',
    title: 'Tier 1. Approved',
    body: [
      'The green badge. This is the directory\'s core status and the only one that represents ODIPA\'s review and approval.',
      'An Approved listing means the tool passed our full review process. That process covers an initial review of code quality, documentation, and stated purpose, followed by a security review including dependency scanning, static analysis, and manual code review, followed by board confirmation of mission and community alignment. Review timelines are published on our Contribute Code page.',
      'Approval attaches to a specific version. We review a tagged release or pinned commit, and the listing identifies the version reviewed and the review date. The tool itself remains in the author\'s repository, and authors retain full ownership and control of their projects. When a project ships material changes to its security model, data handling, or core functionality, the approval applies only to the reviewed version until a re-review is completed. ODIPA may re-review on its own schedule or at the author\'s request.',
      'An Approved badge is a statement that the tool met our published criteria at the time of review. It is not a certification, a guarantee, or an endorsement for any particular use.',
    ],
  },
  {
    icon: <Flag className="w-5 h-5" />,
    badge: 'Needs Help',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-300',
    title: 'Tier 2. Community Project, the Needs Help badge',
    body: [
      'The amber badge. This status features promising open source privacy tools that are not yet ready for approval, and invites our contributor community to help finish them.',
      'A Needs Help listing is not a review outcome and does not imply any level of safety. Every Needs Help card is labeled experimental and not yet reviewed, and carries this statement or its equivalent. A project to help build, not a tool we recommend using yet. The card\'s primary action is a contribution link, not a link encouraging use.',
      'Community Projects are featured only with the author\'s consent. By default, ODIPA maintains a fork of the project in our GitHub organization as the community contribution workspace. We curate the open issues there, highlight the specific gaps standing between the project and formal review as headline challenges, and direct contributors to them. Completed work flows upstream to the author\'s repository as pull requests, and the author remains the maintainer and the final word on every merge. Where an author prefers a different working arrangement, including hosting the project\'s primary home within ODIPA\'s organization, we are open to discussing it.',
      'A Community Project graduates by closing its identified gaps and then completing the full Tier 1 review process. Graduation is never automatic.',
    ],
  },
  {
    icon: <Landmark className="w-5 h-5" />,
    badge: 'ODIPA Adopted',
    badgeClass: 'text-blue-brand bg-blue-brand/8 border-blue-brand/30',
    title: 'Tier 3. ODIPA Adopted',
    body: [
      'By mutual agreement, an author may move a project\'s primary home into ODIPA\'s GitHub organization, following the model long used by open source foundations. This is entirely opt in and is never a condition of any listing.',
      'Under adoption, ODIPA holds the repository settings and enforces branch protection, and the original author continues as lead maintainer with required review authority on every change, so nothing merges without both the author and ODIPA. GitHub\'s transfer mechanism preserves the project\'s stars, watchers, history, and inbound links.',
      'Adopted projects still follow the same review standards as everything else. Adoption does not confer Approved status, and an adopted project that has not passed review carries the Needs Help badge like any other community project.',
    ],
  },
]

export default function ToolListingPolicyPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-16">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-4">
            <span className="block w-5 h-px bg-gold-light" />
            Community Privacy Tools Directory
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Tool Listing Policy
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-2xl">
            How tools enter, appear in, and move between the statuses of our directory.
            This policy exists so that every badge on our site means the same thing to every
            visitor, and so that submitters know exactly what to expect.
          </p>
          <p className="font-mono text-[11px] text-white/40 mt-6">Version 1.0 · August 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-12">

        {/* Universal requirements */}
        <section>
          <h2 className="font-display text-2xl font-bold text-navy mb-4">What every listing requires</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-7 space-y-4 text-[14.5px] text-slate-600 leading-[1.8]">
            <p>
              All tools in the directory, at any tier, must be open source under a recognized
              open source license, with the complete source code publicly available for
              inspection. The submitter must disclose any affiliation with the tool, agree to
              our community standards, and consent to the specific status the tool will be
              listed under.
            </p>
            <p>
              A tool can be removed from the directory at any time if it no longer meets the
              requirements of its tier, if the project is abandoned, or if ODIPA determines
              that continued listing could mislead or harm users. Listing is always at
              ODIPA's discretion, is never sold, and we do not accept payment or other
              consideration for any listing decision.
            </p>
          </div>
        </section>

        {/* Tiers */}
        {tiers.map(tier => (
          <section key={tier.title}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-navy">{tier.icon}</div>
              <h2 className="font-display text-2xl font-bold text-navy">{tier.title}</h2>
              <span className={`font-mono text-[10px] border rounded-full px-2.5 py-1 ${tier.badgeClass}`}>
                {tier.badge}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-7 space-y-4 text-[14.5px] text-slate-600 leading-[1.8]">
              {tier.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>
        ))}

        {/* Badge summary */}
        <section>
          <h2 className="font-display text-2xl font-bold text-navy mb-4">How the badges appear</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-7 space-y-4 text-[14.5px] text-slate-600 leading-[1.8]">
            <p className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
              <span>
                Approved tools show a green badge reading ODIPA Built and Maintained for tools
                we author, or ODIPA Reviewed and Approved with the review date for external
                tools that passed review.
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Flag className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
              <span>
                Community Projects show an amber Needs Help badge, the experimental notice,
                and a Contribute call to action.
              </span>
            </p>
            <p>
              No other badge or status exists, and the absence of a badge means the tool has
              no standing with ODIPA.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy rounded-xl p-8 text-center">
          <h2 className="font-display text-xl font-bold text-white mb-2">Ready to submit a tool?</h2>
          <p className="text-white/60 text-[14px] mb-5">
            Submissions go through the form on our Contribute Code page, and questions about
            this policy can come through our contact form.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/get-involved/contribute-code"
              className="inline-block font-mono text-[12px] font-semibold bg-gold text-navy px-5 py-2.5 rounded-lg no-underline hover:opacity-90 transition-opacity">
              Submit a Tool
            </Link>
            <Link href="/contact"
              className="inline-block font-mono text-[12px] font-semibold border border-white/25 text-white px-5 py-2.5 rounded-lg no-underline hover:bg-white/10 transition-colors">
              Ask a Question
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
