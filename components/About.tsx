'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import SectionHeader from './SectionHeader'

const pillars = [
  {
    title: 'Consumer Education',
    pct: '28%',
    desc: 'Free courses, webinars, and workshops for the general public',
    image: '/images/photo-1522202176988-66273c2fd55f_800.jpg',
    imageAlt: 'Group of people collaborating in an educational workshop',
  },
  {
    title: 'Policy Advocacy',
    pct: '18%',
    desc: 'Federal and state-level legislative engagement',
    image: '/images/photo-1589829545856-d10d557cf95f_800.jpg',
    imageAlt: 'Law books and gavel representing policy and legal advocacy',
  },
  {
    title: 'Research & Publications',
    pct: '13%',
    desc: 'Annual reports and briefs, free to the public',
    image: '/images/photo-1481627834876-b7833e8f5570_800.jpg',
    imageAlt: 'Library with tall bookshelves filled with research volumes',
  },
  {
    title: 'Open-Source Tools',
    pct: '7%',
    desc: 'Free privacy technology for developers and consumers',
    image: '/images/photo-1461749280684-dccba630e2f6_800.jpg',
    imageAlt: 'Monitor displaying programming code in a development environment',
  },
]

export default function About() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    els?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" ref={ref} className="bg-white py-24 px-6 overflow-hidden">
      <div className="max-w-content mx-auto">
        <SectionHeader
          eyebrow="Our Mission"
          title={<>Protecting Privacy<br />at Every Level</>}
          body="ODIPA operates at the intersection of consumer awareness, business responsibility, research, and public policy — equipping all stakeholders with the knowledge to navigate today's complex data privacy landscape."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-16">
          {/* Text */}
          <div className="reveal space-y-5">
            {[
              'Founded as a 501(c)(3) tax-exempt nonprofit organization, ODIPA was created to fill a critical gap: no single organization was addressing data privacy comprehensively — from the individual consumer to the enterprise to the policymaker.',
              'Our approach is grounded in the belief that privacy is a fundamental right, and that education and awareness are the most powerful tools for protecting it. We make data privacy knowledge accessible, actionable, and relevant for all Americans.',
              'With 77% of our services delivered completely free to the public, ODIPA\'s model ensures that privacy protection is not a privilege of the few — but a resource available to everyone.',
            ].map((p, i) => (
              <p key={i} className="text-[16px] text-slate-500 leading-[1.85]">{p}</p>
            ))}
          </div>

          {/* Pillars — 2×2 image card grid */}
          <div className="reveal reveal-delay-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-blue-brand/30 hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="relative h-[130px] w-full overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-navy/40 group-hover:bg-navy/30 transition-colors duration-300" />
                </div>

                {/* Text */}
                <div className="p-4 bg-white">
                  <div className="font-semibold text-[13px] text-navy mb-1 leading-snug">{p.title}</div>
                  <div className="text-[12px] text-slate-500 leading-relaxed">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
