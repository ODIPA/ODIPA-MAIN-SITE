import type { Metadata } from 'next'
import { Monitor, Radio, MapPin, Users, GraduationCap, Building2 } from 'lucide-react'
import ProgramLayout from '@/components/ProgramLayout'

export const metadata: Metadata = {
  title: 'Educational Outreach',
  description: 'ODIPA offers free public courses, webinars, and workshops to educate consumers about their digital privacy rights.',
  alternates: { canonical: 'https://odipa.org/programs/educational-outreach' },
}

export default function Page() {
  return (
    <ProgramLayout data={{
      num: '01',
      pct: '37%',
      pctFree: '29%',
      pctFee: '8%',
      title: 'Educational Outreach',
      tag: 'Free to public',
      tagColor: 'text-green-300 border-green-300/30 bg-green-300/10',
      image: '/images/photo-1503676260728-1c00da094a0b_1200.jpg',
      imageAlt: 'Instructor leading a workshop with engaged participants',
      hero: `Digital privacy affects every person, yet most people don't know their rights or how to exercise them. ODIPA closes that gap with free, practical education that meets people where they are.`,
      overview: `ODIPA's Educational Outreach program is our largest and most direct consumer service. We offer free online courses, live webinars, and in-person workshops that explain privacy rights and practical protective measures in plain language — no legal or technical background required. Our content targets the populations most at risk: seniors, students, low-income communities, and anyone who hasn't had access to quality privacy education. We measure success not by clicks but by behavior change: participants who understand how to opt out, how to read a privacy policy, and how to protect themselves.`,
      whatWeDo: [
        { icon: <Monitor className="w-5 h-5" />, title: 'Public Courses', desc: 'Structured multi-session courses covering core privacy concepts: data brokers, social media privacy settings, identity theft prevention, and more.' },
        { icon: <Radio className="w-5 h-5" />, title: 'Live Webinars', desc: 'Live online sessions on timely topics — from new state privacy laws to the latest data breach trends — open to anyone.' },
        { icon: <MapPin className="w-5 h-5" />, title: 'Community Workshops', desc: 'In-person workshops at libraries, community centers, and schools in Los Angeles and beyond.' },
        { icon: <Users className="w-5 h-5" />, title: 'Senior Privacy Program', desc: 'Specialized curriculum for older adults covering phone scams, Medicare fraud, social media safety, and protecting personal information.' },
        { icon: <GraduationCap className="w-5 h-5" />, title: 'Student Curriculum', desc: 'Privacy education materials tailored for high school and college students covering digital footprints and data rights.' },
        { icon: <Building2 className="w-5 h-5" />, title: 'Corporate Training', desc: 'Fee-based privacy awareness training helping employees understand CCPA/CPRA, GLBA, BSA, PCI DSS, HIPAA, HITECH, BIPA, GDPR, NIST, and internal data handling best practices.' },
      ],
      whoWeServe: [
        { group: 'General Public', desc: 'Anyone who wants to understand and protect their digital privacy — no prior knowledge required.' },
        { group: 'Seniors', desc: 'Older adults navigating scams, digital services, and social media with customized, accessible curriculum.' },
        { group: 'Students', desc: 'High school and college students learning to manage their digital footprint and understand their data rights.' },
        { group: 'Employers & HR Teams', desc: 'Organizations seeking fee-based staff training on CCPA/CPRA, GLBA, BSA, PCI DSS, HIPAA, HITECH, NERC CIP, BIPA, GDPR, NIST, and industry-specific data governance requirements.' },
      ],
      outcomes: [
        { metric: '500+', label: 'Year 1 participant target' },
        { metric: '12', label: 'Planned courses & webinars' },
        { metric: '4', label: 'Planned community workshops' },
        { metric: '29%', label: 'Free public services (of total activity)' },
        /*{ metric: '8%', label: 'Fee-based corporate services (of total activity)' },*/
      ],
      faqs: [
        { q: 'Are ODIPA courses really free?', a: 'Yes. All consumer-facing courses, webinars, and community workshops are completely free with no registration fees or upsells. Corporate training is the exception — it is fee-based to sustain our free programs.' },
        { q: 'How do I register for a course or webinar?', a: 'Visit our Events page or join our mailing list to receive invitations when new sessions are announced. All free events are open to the public.' },
        { q: 'Do you offer materials in other languages?', a: 'We are working to translate our core curriculum into Spanish, Tagalog, and Mandarin. Contact us if you are interested in helping with translation or hosting a multilingual workshop.' },
      ],
      cta: { label: 'Join a Free Course', href: '/contact?topic=general', secondary: { label: 'Volunteer as an Instructor', href: '/get-involved/volunteer' } },
    }} />
  )
}
