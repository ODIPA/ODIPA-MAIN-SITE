import type { Metadata } from 'next'
import { BarChart2, FileText, Search, Handshake, Library, Newspaper } from 'lucide-react'
import ProgramLayout from '@/components/ProgramLayout'

export const metadata: Metadata = {
  title: 'Research & Publications',
  description: 'ODIPA publishes independent privacy research, research briefs and special investigations — all freely available to the public.',
  alternates: { canonical: 'https://odipa.org/programs/research-publications' },
}

export default function Page() {
  return (
    <ProgramLayout data={{
      num: '03',
      pct: '13%',
      pctFree: '11%',
      pctFee: '2%',
      title: 'Research & Publications',
      tag: 'Free to public',
      tagColor: 'text-green-300 border-green-300/30 bg-green-300/10',
      image: '/images/photo-1456513080510-7bf3a84b82f8_1200.jpg',
      imageAlt: 'Data analysis charts and research dashboards',
      hero: `Good policy and informed consumers both depend on credible research. ODIPA publishes rigorous, independent privacy research that anyone can access, cite, and act on.`,
      overview: `ODIPA's Research & Publications program produces independent analysis of the privacy landscape — breaches, enforcement actions, legislative trends, and industry practices. Our flagship Annual State of Privacy Report provides a comprehensive year-in-review, and our research briefs drill into specific emerging issues. All publications are freely available, designed to be cited by journalists, legislators, and other nonprofits. Sponsored research partnerships allow businesses to fund independent research while preserving ODIPA's editorial independence through a strict separation-of-funding policy.`,
      whatWeDo: [
        { icon: <BarChart2 className="w-5 h-5" />, title: 'Annual Privacy Report', desc: 'A comprehensive year-in-review of consumer privacy: breach statistics, legislative developments, enforcement actions, and emerging threats.' },
        { icon: <FileText className="w-5 h-5" />, title: 'Research Briefs', desc: 'Focused 10–15 page briefings on specific emerging threats, regulatory changes, or industry trends.' },
        { icon: <Search className="w-5 h-5" />, title: 'Special Investigations', desc: 'Deep-dive reports on significant privacy incidents, platform practices, or data broker activities that demand public attention.' },
        { icon: <Handshake className="w-5 h-5" />, title: 'Sponsored Research', desc: 'Fee-based custom research partnerships with businesses seeking independent, credible privacy analysis — structured to preserve editorial independence.' },
        { icon: <Library className="w-5 h-5" />, title: 'Resource Library', desc: 'A publicly accessible library of all ODIPA publications, organized by topic, date, and industry sector.' },
        { icon: <Newspaper className="w-5 h-5" />, title: 'Media Briefings', desc: 'Research summaries and expert commentary provided to journalists covering privacy and data protection topics.' },
      ],
      whoWeServe: [
        { group: 'General Public', desc: 'Anyone wanting to understand what is actually happening with their data — plain-language summaries accompany every technical report.' },
        { group: 'Journalists & Media', desc: 'Reporters covering data privacy who need reliable statistics, expert quotes, and backgrounders for their stories.' },
        { group: 'Legislators & Policy Staff', desc: 'Policymakers who rely on independent research to inform legislation and regulatory guidance.' },
        { group: 'Businesses', desc: 'Organizations that commission sponsored research to understand their privacy posture, with full editorial independence guaranteed.' },
      ],
      outcomes: [
        { metric: '1', label: 'Annual report' },
        { metric: '4+', label: 'Year 1 research brief target' },
        { metric: '100%', label: 'Freely available' },
        { metric: '3+', label: 'Year 1 investigation target' },
      ],
      faqs: [
        { q: 'How can I access ODIPA research?', a: 'All publications are freely available in our Resource Library at no charge. No account or registration is required.' },
        { q: 'How does sponsored research preserve independence?', a: 'Sponsors fund a research topic but have no influence over methodology, findings, or conclusions. ODIPA\'s editorial team controls all research outputs, and any sponsor relationship is disclosed prominently in the publication.' },
        { q: 'How do I sponsor a research project?', a: 'Visit our Research Sponsorship page or contact partnerships@odipa.org to discuss scope and pricing. Our research team follows up within 3 business days to discuss topic, timeline, and methodology.' },
        { q: 'Can journalists interview ODIPA researchers?', a: 'Yes. Contact press@odipa.org with your publication, deadline, and topic. We aim to respond within one business day for media requests.' },
      ],
      cta: { label: 'Sponsor Research', href: '/sponsor-research', secondary: { label: 'Volunteer as a Researcher', href: '/get-involved/volunteer' } },
    }} />
  )
}
