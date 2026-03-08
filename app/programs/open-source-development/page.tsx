import type { Metadata } from 'next'
import { Wrench, Package, Code2, BookOpen, Lock, Briefcase } from 'lucide-react'
import ProgramLayout from '@/components/ProgramLayout'
import CommunityTools from '@/components/CommunityTools'

export const metadata: Metadata = {
  title: 'Open-Source Development',
  description: 'ODIPA builds and maintains free, open-source privacy tools that help developers implement privacy-by-design and give consumers practical protection.',
  alternates: { canonical: 'https://odipa.org/programs/open-source-development' },
}

export default function Page() {
  return (
    <ProgramLayout
      data={{
        num: '07',
      pct: '7%',
      pctFree: '6%',
      pctFee: '1%',
        title: 'Open-Source Development',
        tag: 'Free platform',
        tagColor: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10',
        image: '/images/photo-1542831371-29b0f74f9713_1200.jpg',
        imageAlt: 'Developer writing code on a dark terminal screen',
        hero: `Privacy tools should be free, transparent, and community-maintained. ODIPA builds open-source software that anyone can audit, fork, and improve — putting real privacy power in the hands of developers and consumers.`,
        overview: `ODIPA's Open-Source Development program produces and maintains free privacy tools under permissive open-source licenses. Our Community Privacy Tools directory lists tools contributed by the broader privacy engineering community, reviewed and vetted by ODIPA volunteers. We also publish privacy engineering guides and host the infrastructure for approved open-source privacy projects. For organizations that build on our tools professionally, we offer fee-based priority support that sustains the free tier for individuals.`,
        whatWeDo: [
          { icon: <Wrench className="w-5 h-5" />, title: 'Privacy Tool Development', desc: 'Building and maintaining open-source tools that help developers implement privacy-by-design: consent managers, data mapping utilities, and DSAR automation.' },
          { icon: <Package className="w-5 h-5" />, title: 'Open-Source Platform Hosting', desc: 'Providing free hosting and infrastructure for privacy-focused open-source projects, including CI/CD, documentation, and issue tracking.' },
          { icon: <Code2 className="w-5 h-5" />, title: 'Developer Community', desc: 'A collaborative community of privacy-focused engineers, including code reviews, contributor onboarding, and regular hackathons.' },
          { icon: <BookOpen className="w-5 h-5" />, title: 'Privacy Engineering Guides', desc: 'Freely published implementation guides covering privacy-by-design patterns, data minimization techniques, and secure API design.' },
          { icon: <Lock className="w-5 h-5" />, title: 'Security Audits', desc: 'Coordinated security review of ODIPA\'s open-source projects, with findings published transparently.' },
          { icon: <Briefcase className="w-5 h-5" />, title: 'Priority Business Support', desc: 'Fee-based priority support for organizations building on ODIPA\'s open-source tools — sustaining the free tier for individuals.' },
        ],
        whoWeServe: [
          { group: 'Developers', desc: 'Engineers building products who need free, auditable privacy tools and implementation guidance.' },
          { group: 'Consumers', desc: 'Anyone who downloads and uses ODIPA\'s free privacy tools directly on their own systems.' },
          { group: 'Organizations', desc: 'Businesses that use ODIPA\'s tools professionally and support the project through priority support subscriptions.' },
          { group: 'Contributors', desc: 'Open-source developers who submit tools, fix bugs, and improve documentation for the broader community.' },
        ],
        outcomes: [
          { metric: '6+', label: 'Open-source tools' },
          { metric: 'MIT', label: 'License — fully open' },
          { metric: 'GitHub', label: 'Public repositories' },
          { metric: 'Free', label: 'For individuals forever' },
        ],
        faqs: [
          { q: 'Where can I find ODIPA\'s open-source tools?', a: 'All tools are available at github.com/odipa. Each repository includes documentation, usage guides, and contribution instructions.' },
          { q: 'Can I submit a tool to ODIPA\'s directory?', a: 'Yes — use the submission form on our Community Privacy Tools page. Submissions go through a security review and board approval before listing.' },
          { q: 'Is business use of ODIPA\'s tools allowed?', a: 'Yes. All tools are MIT licensed and can be used commercially. Organizations that depend on ODIPA\'s tools are encouraged to support the project through priority support subscriptions.' },
        ],
        cta: { label: 'Browse Privacy Tools', href: '#community-tools', secondary: { label: 'Contribute Code', href: '/get-involved/contribute-code' } },
        contributorHub: { href: '/get-involved/contribute-code', label: 'Contribute Code →', desc: 'Browse open issues, submit a privacy tool, improve documentation, or propose new features on our GitHub repositories.' },
      }}
    >
      <div id="community-tools">
        <CommunityTools />
      </div>
    </ProgramLayout>
  )
}
