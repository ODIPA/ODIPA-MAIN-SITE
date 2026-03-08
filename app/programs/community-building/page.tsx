import type { Metadata } from 'next'
import { Trophy, MapPin, MessageSquare, Globe, Mic, Users } from 'lucide-react'
import ProgramLayout from '@/components/ProgramLayout'

export const metadata: Metadata = {
  title: 'Community Building',
  description: 'ODIPA builds a national community of privacy advocates through summits, local meetups, online forums, and a structured volunteer network.',
  alternates: { canonical: 'https://odipa.org/programs/community-building' },
}

export default function Page() {
  return (
    <ProgramLayout data={{
      num: '04',
      pct: '10%',
      pctFree: '8%',
      pctFee: '2%',
      title: 'Community Building',
      tag: 'Free meetups',
      tagColor: 'text-purple-300 border-purple-300/30 bg-purple-300/10',
      image: '/images/photo-1511632765486-a01980e01a18_1200.jpg',
      imageAlt: 'Professionals networking and collaborating at a community event',
      hero: `Privacy advocacy is stronger when advocates know each other. ODIPA builds the connective tissue — summits, meetups, forums, and a volunteer network that turns individual commitment into collective impact.`,
      overview: `ODIPA's Community Building program creates the infrastructure for a sustained privacy advocacy movement. We host an annual Privacy Summit, local meetups, online discussion groups, and regional events that bring together attorneys, technologists, policymakers, students, and engaged citizens. Our volunteer network connects skilled professionals with the programs that need their expertise. All community events are free to attend — we believe financial barriers should never limit participation in civic advocacy.`,
      whatWeDo: [
        { icon: <Trophy className="w-5 h-5" />, title: 'Annual Privacy Summit', desc: 'A full-day conference bringing together advocates, technologists, attorneys, policymakers, and citizens for talks, panels, and workshops. All attendees pay a conference fee — this is the fee-based portion of this program (2% of total activity).' },
        { icon: <MapPin className="w-5 h-5" />, title: 'Local Meetups', desc: 'In-person gatherings in Los Angeles and partner cities for privacy professionals and advocates to connect and share updates.' },
        { icon: <MessageSquare className="w-5 h-5" />, title: 'Online Discussion Forums', desc: 'Virtual discussion groups covering current events in privacy, peer questions, and collaborative advocacy coordination.' },
        { icon: <Globe className="w-5 h-5" />, title: 'Regional Events', desc: 'Networking events hosted in different cities to expand ODIPA\'s community reach beyond the Los Angeles area.' },
        { icon: <Mic className="w-5 h-5" />, title: 'Speaker Series', desc: 'Featured speakers — attorneys, regulators, researchers, and industry leaders — sharing expertise with the community.' },
        { icon: <Users className="w-5 h-5" />, title: 'Volunteer Network', desc: 'A structured volunteer program connecting skilled professionals with ODIPA programs that need their expertise.' },
      ],
      whoWeServe: [
        { group: 'Privacy Professionals', desc: 'Attorneys, compliance officers, and technologists who want to connect with peers and contribute to advocacy.' },
        { group: 'Engaged Citizens', desc: 'Anyone passionate about digital rights who wants to participate in a community of advocates.' },
        { group: 'Students & Researchers', desc: 'Academics and students exploring privacy as a field and looking for a community to learn from.' },
        { group: 'Policymakers', desc: 'Legislators and regulators who participate in ODIPA forums to hear directly from consumers and experts.' },
      ],
      outcomes: [
        { metric: '1', label: 'Annual summit' },
        { metric: '12+', label: 'Planned local meetups' },
        { metric: '24+', label: 'Planned online forums' },
        { metric: '100%', label: 'Free to attend' },
      ],
      faqs: [
        { q: 'Where are ODIPA events held?', a: 'Our primary hub is Los Angeles, where most in-person events are held. We also host virtual events accessible to anyone nationally, and regional events in partner cities.' },
        { q: 'How do I join the community?', a: 'Subscribe to our newsletter to receive event announcements. All public events are free and open to anyone — no membership required.' },
        { q: 'Can I speak or present at an ODIPA event?', a: 'Yes. We welcome proposals for the Speaker Series and Summit from qualified advocates, researchers, and practitioners. Contact us at events@odipa.org.' },
      ],
      cta: { label: 'Join the Community', href: '/contact?topic=general', secondary: { label: 'Volunteer', href: '/get-involved/volunteer' } },
    }} />
  )
}
