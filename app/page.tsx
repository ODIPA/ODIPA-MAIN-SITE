import Hero from '@/components/Hero'
import Ticker from '@/components/Ticker'
import About from '@/components/About'
import Programs from '@/components/Programs'
import Impact from '@/components/Impact'
import ServiceModel from '@/components/ServiceModel'
import Sponsorship from '@/components/Sponsorship'
import GetInvolved from '@/components/GetInvolved'
import NewsletterSignup from '@/components/NewsletterSignup'
import DonateCTA from '@/components/DonateCTA'

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <About />
      <Programs />
      <Impact />
      <ServiceModel />
      <Sponsorship />
      <GetInvolved />
      <NewsletterSignup variant="banner" source="Homepage" />
      <DonateCTA />
    </>
  )
}
