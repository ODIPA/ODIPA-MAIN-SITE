'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SectionHeader from './SectionHeader'

const cards = [
  {
    title: 'Donate',
    desc: 'Your tax-deductible donation directly funds free consumer education, policy advocacy, and open-source privacy tools for the public.',
    link: '/donate',
    external: false,
    linkText: 'Make a donation',
    image: '/images/photo-1532629345422-7515f3d16bb6_800.jpg',
    imageAlt: 'Person making a charitable donation',
  },
  {
    title: 'Volunteer',
    desc: 'ODIPA is powered by volunteer privacy experts, researchers, developers, advocates, and educators. Share your expertise.',
    link: '/get-involved/volunteer',
    external: false,
    linkText: 'Apply to volunteer',
    image: '/images/photo-1559027615-cd4628902d4a_800.jpg',
    imageAlt: 'Volunteers working together in community',
  },
  {
    title: 'Corporate Partner',
    desc: "Sponsor ODIPA's work and align your brand with digital privacy leadership. Custom partnership arrangements available.",
    link: '/get-involved/corporate-partner',
    external: false,
    linkText: 'Explore partnerships',
    image: '/images/photo-1521791136064-7986c2920216_800.jpg',
    imageAlt: 'Business professionals shaking hands in partnership',
  },
  {
    title: 'Attend Programs',
    desc: "Access our free educational courses, webinars, and community meetups. Whether you're a consumer, student, or professional.",
    link: '/#programs',
    external: false,
    linkText: 'View programs',
    image: '/images/photo-1540575467063-178a50c2df87_800.jpg',
    imageAlt: 'People attending a professional conference or seminar',
  },
  {
    title: 'Contribute Code',
    desc: 'Join our open-source developer community. Help build privacy-protective tools and libraries that people depend on.',
    link: '/get-involved/contribute-code',
    external: false,
    linkText: 'Join the community',
    image: '/images/photo-1555066931-4365d14bab8c_800.jpg',
    imageAlt: 'Developer writing code on computer',
  },
  {
    title: 'Get Certified',
    desc: "Earn ODIPA certification and demonstrate your business's compliance with state and federal privacy laws to your customers.",
    link: '/get-involved/get-certified',
    external: false,
    linkText: 'Start certification',
    image: '/images/photo-1568992687947-868a62a9f521_800.jpg',
    imageAlt: 'Professional reviewing compliance certification documents',
  },
]

// Single card inner content — shared between <a> and <Link> wrappers
function CardInner({ card }: { card: typeof cards[0] }) {
  return (
    <>
      <Image
        src={card.image}
        alt={card.imageAlt}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/20 transition-opacity duration-300 group-hover:opacity-90" />
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 z-10" />
      <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
        <h3 className="font-display text-[24px] font-bold text-white mb-3 leading-tight">
          {card.title}
        </h3>
        <p className="text-[14px] text-white/70 leading-[1.7] mb-5 max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-500 ease-out">
          {card.desc}
        </p>
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-gold-light opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {card.linkText} →
        </span>
      </div>
    </>
  )
}

const baseCardClass = (i: number) =>
  `reveal ${i % 3 === 1 ? 'reveal-delay-1' : i % 3 === 2 ? 'reveal-delay-2' : ''} group relative rounded-xl overflow-hidden cursor-pointer block no-underline`

export default function GetInvolved() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer.unobserve(e.target)
          }
        }),
      { threshold: 0.08 }
    )
    els?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="involved" ref={ref} className="bg-navy py-24 px-6 overflow-hidden">
      <div className="max-w-content mx-auto">
        <div className="text-center mb-16">
          <SectionHeader
            eyebrow="Join ODIPA"
            title={
              <>
                Get Involved in
                <br />
                <span className="text-gold-light">the Privacy Movement</span>
              </>
            }
            body="There are many ways to support ODIPA's mission — whether you're a consumer, a privacy professional, a business, or a foundation."
            center
            light
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) =>
            card.external ? (
              <a
                key={card.title}
                href={card.link}
                className={baseCardClass(i)}
                style={{ height: '360px' }}
              >
                <CardInner card={card} />
              </a>
            ) : (
              <Link
                key={card.title}
                href={card.link}
                className={baseCardClass(i)}
                style={{ height: '360px' }}
              >
                <CardInner card={card} />
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  )
}
