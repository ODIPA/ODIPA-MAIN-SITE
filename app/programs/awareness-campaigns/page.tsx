import type { Metadata } from 'next'
import { Calendar, Smartphone, AlertTriangle, Megaphone, Radio, Handshake } from 'lucide-react'
import ProgramLayout from '@/components/ProgramLayout'

export const metadata: Metadata = {
  title: 'Awareness Campaigns',
  description: 'ODIPA runs Privacy Awareness Week, breach alert campaigns, and year-round social media education to keep consumers informed and protected.',
  alternates: { canonical: 'https://odipa.org/programs/awareness-campaigns' },
}

export default function Page() {
  return (
    <ProgramLayout data={{
      num: '06',
      pct: '7%',
      pctFree: '6%',
      pctFee: '1%',
      title: 'Awareness Campaigns',
      tag: 'Free to public',
      tagColor: 'text-green-300 border-green-300/30 bg-green-300/10',
      image: '/images/photo-1563986768494-4dee2763ff3f_1200.jpg',
      imageAlt: 'Digital social media campaign on mobile device with dark background',
      hero: `Education only works if people are paying attention. ODIPA's Awareness Campaigns break through the noise with timely, relevant content that helps consumers take action before a problem becomes a crisis.`,
      overview: `ODIPA's Awareness Campaigns program produces high-visibility public education at scale. Our flagship Privacy Awareness Week reaches thousands of consumers each year with intensive multi-channel programming. Year-round, we publish expert-reviewed social media content daily, send rapid breach alerts when significant incidents occur, and run focused campaigns on topics like children's data, healthcare privacy, and election security. Businesses can sponsor campaigns — contact us to discuss scope and availability.`,
      whatWeDo: [
        { icon: <Calendar className="w-5 h-5" />, title: 'Privacy Awareness Week', desc: 'Our flagship annual campaign — a week of intensive public education, media outreach, events, and social media activations around a focused privacy theme.' },
        { icon: <Smartphone className="w-5 h-5" />, title: 'Daily Social Media', desc: 'Consistent, expert-reviewed content across LinkedIn, X, Instagram, Facebook, and YouTube — tips, news, explainers, and calls to action.' },
        { icon: <AlertTriangle className="w-5 h-5" />, title: 'Breach Alerts', desc: 'Rapid-response consumer alerts when significant data breaches occur, with plain-language guidance on what to do.' },
        { icon: <Megaphone className="w-5 h-5" />, title: 'Focused Campaigns', desc: 'Focused 30-day campaigns on specific topics: data broker opt-outs, children\'s privacy, healthcare data, election security, and more.' },
        { icon: <Radio className="w-5 h-5" />, title: 'Media Outreach', desc: 'Proactive pitching to journalists, podcast appearances, and expert commentary to amplify ODIPA\'s message through earned media.' },
        { icon: <Handshake className="w-5 h-5" />, title: 'Business Sponsorships', desc: 'Fee-based sponsorships allowing privacy-committed businesses to reach ODIPA\'s audience while demonstrating their values. Sponsor funding directly sustains our free public campaigns. This is the fee-based portion of this program (1% of total activity). Contact us for availability and scope.' },
      ],
      whoWeServe: [
        { group: 'General Public', desc: 'Anyone who follows ODIPA on social media or encounters our campaigns — content is designed for maximum accessibility and shareability.' },
        { group: 'At-Risk Populations', desc: 'Seniors, low-income communities, and others most vulnerable to data exploitation who may not seek out privacy education proactively.' },
        { group: 'Privacy Sponsors', desc: 'Businesses that sponsor campaigns to reach a privacy-aware audience while demonstrating genuine commitment to consumer protection.' },
        { group: 'Media', desc: 'Journalists who use ODIPA\'s campaign materials, breach alerts, and expert commentary in their coverage.' },
      ],
      outcomes: [
        { metric: '1', label: 'Annual awareness week' },
        { metric: '4+', label: 'Planned focused campaigns' },
        { metric: 'Daily', label: 'Social media content' },
        { metric: 'Rapid', label: 'Breach alert response' },
      ],
      faqs: [
        { q: 'How do I receive breach alerts?', a: 'Subscribe to ODIPA\'s newsletter or follow us on social media. Significant breach alerts are sent to email subscribers and posted across all ODIPA channels.' },
        { q: 'How can my business sponsor a campaign?', a: 'Campaign sponsorships are available to privacy-committed businesses. Contact sponsor@odipa.org with your organization name and areas of interest — we\'ll follow up with availability, scope, and pricing.' },
        { q: 'What topics does Privacy Awareness Week cover?', a: 'Each year features a different theme — past themes have included data broker rights, children\'s privacy, and healthcare data. The theme is announced in January.' },
      ],
      cta: { label: 'Follow ODIPA', href: '/contact?topic=general', secondary: { label: 'Sponsor a Campaign', href: '/become-a-sponsor' } },
    }} />
  )
}
