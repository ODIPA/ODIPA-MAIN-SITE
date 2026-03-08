import type { Metadata } from 'next'
import { FileText, PenLine, Landmark, Scale, Microscope, Megaphone } from 'lucide-react'
import ProgramLayout from '@/components/ProgramLayout'

export const metadata: Metadata = {
  title: 'Advocacy & Policy',
  description: 'ODIPA advocates for stronger consumer privacy protections through legislative monitoring, regulatory submissions, and direct policy engagement.',
  alternates: { canonical: 'https://odipa.org/programs/advocacy-policy' },
}

export default function Page() {
  return (
    <ProgramLayout data={{
      num: '02',
      pct: '9%',
      pctFree: '9%',
      title: 'Advocacy & Policy',
      tag: '100% Free',
      tagColor: 'text-blue-300 border-blue-300/30 bg-blue-300/10',
      image: '/images/photo-1477959858617-67f85cf4f1df_1200.jpg',
      imageAlt: 'US Capitol building representing legislative advocacy',
      hero: `Privacy law is made by legislators who rarely hear from consumers. ODIPA gives consumers a seat at the table — tracking every relevant bill, filing formal comments, and meeting directly with lawmakers to advocate for stronger protections.`,
      overview: `ODIPA's Advocacy & Policy program is our most direct lever for systemic change. While education helps individuals protect themselves today, policy change protects everyone tomorrow. We monitor federal and state privacy legislation continuously, submit formal regulatory comments during public rulemaking periods, publish independent policy analysis, and meet directly with legislators and their staff. All of our advocacy work is fully funded by donations and conducted entirely in the public interest — we do not accept funding from any industry with privacy interests at stake.`,
      whatWeDo: [
        { icon: <FileText className="w-5 h-5" />, title: 'Legislative Monitoring', desc: 'Continuous tracking of federal and state privacy legislation across all 50 states, with analysis of implications for consumers.' },
        { icon: <PenLine className="w-5 h-5" />, title: 'Position Papers', desc: '8–12 formal position papers submitted to regulatory agencies, congressional committees, and standards bodies.' },
        { icon: <Landmark className="w-5 h-5" />, title: 'Direct Legislative Engagement', desc: 'Meetings with legislators and their staff to present consumer-centered privacy analysis and advocate for stronger protections.' },
        { icon: <Scale className="w-5 h-5" />, title: 'Regulatory Comment Submissions', desc: 'Formal comments submitted during public rulemaking periods for FTC, state AGs, and data protection authorities.' },
        { icon: <Microscope className="w-5 h-5" />, title: 'Policy Research', desc: 'Independent analysis of proposed legislation, comparing provisions to GDPR, CCPA/CPRA, VCDPA, CPA, CTDPA, GLBA, BSA, PCI DSS, HIPAA, HITECH, NERC CIP, BIPA, NIST Privacy Framework, LGPD, PIPEDA, and other applicable domestic and international standards.' },
        { icon: <Megaphone className="w-5 h-5" />, title: 'Coalition Building', desc: 'Coordinating with aligned nonprofit organizations to amplify consumer voices in legislative processes.' },
      ],
      whoWeServe: [
        { group: 'All Consumers', desc: 'Every American benefits when privacy laws are stronger. Our advocacy is conducted entirely in the public interest.' },
        { group: 'Legislators & Staff', desc: 'Policymakers who need independent, technically grounded analysis to inform privacy legislation.' },
        { group: 'Regulatory Agencies', desc: 'The FTC, state attorneys general, and data protection authorities that receive our formal regulatory comments.' },
        { group: 'Allied Nonprofits', desc: 'Organizations in our coalition who amplify consumer voices across the legislative process.' },
      ],
      outcomes: [
        { metric: '8–12', label: 'Year 1 position paper target' },
        { metric: '50', label: 'States monitored' },
        { metric: '100%', label: 'Independent funding' },
        { metric: 'Annual', label: 'Planned legislative engagement' },
      ],
      faqs: [
        { q: 'Who funds ODIPA\'s advocacy work?', a: 'Entirely through individual donations, grants, and corporate sponsorships. We do not accept funding from any company with a material interest in the outcome of privacy legislation.' },
        { q: 'Can I get involved in advocacy?', a: 'Yes — ODIPA accepts volunteers with backgrounds in law, policy, and research. We also issue Action Alerts when consumers can submit public comments directly to agencies.' },
        { q: 'How can I stay updated on privacy legislation?', a: 'Subscribe to our newsletter for legislative updates, or follow our Research & Publications program for in-depth policy analysis.' },
      ],
      cta: { label: 'Support Our Advocacy', href: '/donate', secondary: { label: 'Volunteer as a Policy Researcher', href: '/get-involved/volunteer' } },
    }} />
  )
}
