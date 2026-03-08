import type { Metadata } from 'next'
import { Globe, Share2, Building2, Handshake, Satellite, Calendar } from 'lucide-react'
import ProgramLayout from '@/components/ProgramLayout'

export const metadata: Metadata = {
  title: 'International Cooperation',
  description: 'ODIPA partners with global privacy advocacy organizations to coordinate advocacy, share best practices, and assist emerging privacy nonprofits worldwide.',
  alternates: { canonical: 'https://odipa.org/programs/international-cooperation' },
}

export default function Page() {
  return (
    <ProgramLayout data={{
      num: '08',
      pct: '4%',
      pctFree: '4%',
      title: 'International Cooperation',
      tag: '100% Free',
      tagColor: 'text-blue-300 border-blue-300/30 bg-blue-300/10',
      image: '/images/photo-1529107386315-e1a2ed48a620_1200.jpg',
      imageAlt: 'Globe and digital network connections representing global cooperation',
      hero: `Privacy knows no borders. ODIPA connects with advocacy organizations worldwide to coordinate strategy, share intelligence, and build a stronger global movement for digital rights.`,
      overview: `Data flows across borders in milliseconds, but privacy protections remain fragmented by jurisdiction. ODIPA's International Cooperation program addresses this gap by building relationships with privacy advocacy organizations around the world — sharing research, coordinating advocacy positions, and providing capacity-building support to emerging nonprofits in regions where privacy infrastructure is still developing. Our international work is entirely charitable, reinforcing our core mission with a global perspective.`,
      whatWeDo: [
        { icon: <Globe className="w-5 h-5" />, title: 'Global Advocacy Network', desc: 'Formal and informal partnerships with privacy organizations in the EU, UK, Canada, Australia, and Southeast Asia to coordinate positions on cross-border privacy issues.' },
        { icon: <Share2 className="w-5 h-5" />, title: 'Knowledge Sharing', desc: 'Freely sharing ODIPA\'s research, curriculum, and policy analysis with international partners for adaptation in their local contexts.' },
        { icon: <Building2 className="w-5 h-5" />, title: 'Capacity Building', desc: 'Supporting emerging privacy advocacy organizations in developing regions with mentorship, tools, and organizational guidance.' },
        { icon: <Handshake className="w-5 h-5" />, title: 'Joint Advocacy', desc: 'Coordinating joint submissions to international bodies including the UN, OECD, and regional data protection authorities.' },
        { icon: <Satellite className="w-5 h-5" />, title: 'Cross-Border Intelligence', desc: 'Sharing breach alerts, regulatory updates, and enforcement news with international partners to enable faster consumer response globally.' },
        { icon: <Calendar className="w-5 h-5" />, title: 'International Forums', desc: 'Participation in global privacy conferences and standards-setting bodies to represent the American consumer perspective.' },
      ],
      whoWeServe: [
        { group: 'International Partners', desc: 'Privacy advocacy organizations in other countries that benefit from ODIPA\'s research, curriculum, and strategic coordination.' },
        { group: 'US Consumers', desc: 'American consumers whose data is processed by international companies — we advocate for their rights in global forums.' },
        { group: 'Emerging Organizations', desc: 'New privacy nonprofits in developing regions that benefit from ODIPA\'s capacity-building support and institutional knowledge.' },
        { group: 'Global Policymakers', desc: 'International regulatory bodies and standards organizations that engage with ODIPA on cross-border privacy issues.' },
      ],
      outcomes: [
        { metric: '5+', label: 'Year 1 partner org target' },
        { metric: '100%', label: 'Free charitable service' },
        { metric: 'Global', label: 'Geographic reach' },
        { metric: 'Annual', label: 'Planned forum participation' },
      ],
      faqs: [
        { q: 'Which organizations does ODIPA partner with internationally?', a: 'We are building partnerships with privacy advocacy organizations in the EU, UK, Canada, and Southeast Asia. Contact international@odipa.org for current partnership details.' },
        { q: 'How does ODIPA fund international work?', a: 'Our international program is funded through general donations and grants. It represents approximately 4% of our budget and is entirely free — we never charge our international partners.' },
        { q: 'Can international organizations partner with ODIPA?', a: 'Yes. We welcome partnerships with established privacy advocacy organizations outside the US. Contact international@odipa.org to explore a formal partnership.' },
      ],
      cta: { label: 'Explore International Partnership', href: '/contact?topic=general', secondary: { label: 'Support Our Global Work', href: '/donate' } },
    }} />
  )
}
