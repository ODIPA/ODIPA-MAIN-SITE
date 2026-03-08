'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SectionHeader from './SectionHeader'

const programs = [
  {
    num: '01', pct: '37%', pctFree: '29%', pctFee: '8%', title: 'Educational Outreach', slug: '/programs/educational-outreach', tag: 'Free to public',
    desc: 'Public courses, online webinars, and specialized workshops for consumers, students, seniors, and community groups.',
    image: '/images/photo-1524178232363-1fb2b075b655_800.jpg',
    imageAlt: 'Educator presenting to an engaged audience in a dark auditorium',
  },
  {
    num: '02', pct: '9%', pctFree: '9%', pctFee: null, title: 'Advocacy & Policy', slug: '/programs/advocacy-policy', tag: '100% Free',
    desc: 'Monitoring federal and state privacy legislation, submitting position papers submitted to regulators and lawmakers to strengthen consumer protections.',
    image: '/images/photo-1529107386315-e1a2ed48a620_800.jpg',
    imageAlt: 'Government building columns representing policy and law',
  },
  {
    num: '03', pct: '13%', pctFree: '11%', pctFee: '2%', title: 'Research & Publications', slug: '/programs/research-publications', tag: 'Free to public',
    desc: 'Comprehensive annual reports, research briefs on emerging threats, and special reports on significant privacy developments — freely available.',
    image: '/images/photo-1551288049-bebda4e38f71_800.jpg',
    imageAlt: 'Data analysis and research charts on dark background',
  },
  {
    num: '04', pct: '10%', pctFree: '8%', pctFee: '2%', title: 'Community Building', slug: '/programs/community-building', tag: 'Free meetups',
    desc: 'Annual privacy conference, local meetups, online discussion groups, and regional networking events for advocates and citizens.',
    image: '/images/photo-1515187029135-18ee286d815b_800.jpg',
    imageAlt: 'Professionals networking at a conference event',
  },
  {
    num: '05', pct: '9%', pctFree: '4%', pctFee: '5%', title: 'Corporate Certification', slug: '/programs/corporate-certification', tag: 'Fee-based',
    desc: 'A rigorous certification program verifying that businesses comply with state and federal data privacy laws — creating market transparency for consumers.',
    image: '/images/corporate-certification.jpg',
    imageAlt: 'Business professionals reviewing and signing a corporate certification agreement',
  },
  {
    num: '06', pct: '7%', pctFree: '6%', pctFee: '1%', title: 'Awareness Campaigns', slug: '/programs/awareness-campaigns', tag: 'Free to public',
    desc: 'Daily social media presence, focused awareness campaigns, and annual Privacy Awareness Week — reaching consumers through digital and traditional media channels.',
    image: '/images/photo-1611162617213-7d7a39e9b1d7_800.jpg',
    imageAlt: 'Social media and digital campaign on phone screen with dark background',
  },
  {
    num: '07', pct: '7%', pctFree: '6%', pctFee: '1%', title: 'Open-Source Development', slug: '/programs/open-source-development', tag: 'Free platform',
    desc: 'Hosting and maintaining an open-source platform where developers share privacy-protective tools and libraries — free for individuals globally.',
    image: '/images/photo-1542831371-29b0f74f9713_800.jpg',
    imageAlt: 'Dark terminal with code on a developer screen',
  },
  {
    num: '08', pct: '4%', pctFree: '4%', pctFee: null, title: 'International Cooperation', slug: '/programs/international-cooperation', tag: '100% Free',
    desc: 'Partnering with global privacy advocacy organizations to coordinate advocacy, share best practices, and assist emerging organizations worldwide.',
    image: '/images/photo-1451187580459-43490279c0fa_800.jpg',
    imageAlt: 'Globe and digital network connections representing global cooperation',
  },
]

export default function Programs() {
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
      { threshold: 0.06 }
    )
    els?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="programs" ref={ref} className="bg-navy py-24 px-6 overflow-hidden">
      <div className="max-w-content mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-16 flex-wrap gap-6">
          <SectionHeader
            eyebrow="Eight Programs"
            title={
              <>
                Comprehensive
                <br />
                <span className="text-gold-light">Privacy Coverage</span>
              </>
            }
            light
          />
          <div className="bg-gold text-navy px-5 py-2 rounded font-mono text-[12px] tracking-[1px] font-semibold">
            77% FREE TO THE PUBLIC
          </div>
        </div>

        {/* 4x2 image card grid */}
        <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-xl overflow-hidden">
          {programs.map((p, i) => (
            <Link
              key={p.num}
              href={p.slug}
              className="group relative overflow-hidden cursor-pointer block no-underline"
              style={{ height: '320px' }}
            >
              {/* Full-bleed image */}
              <Image
                src={p.image}
                alt={p.imageAlt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Navy-tinted overlay — heavier than GetInvolved to match site palette */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/40 transition-opacity duration-300 group-hover:opacity-95" />

              {/* Blue tint layer to unify all images to navy scheme */}
              <div className="absolute inset-0 bg-blue-brand/20 mix-blend-multiply" />

              {/* Gold top accent */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 z-10" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-7 z-10">
                {/* Title — always visible */}
                <h3 className="font-display text-[19px] font-bold text-white leading-tight mb-0 group-hover:mb-1 transition-all duration-300">
                  {p.title}
                </h3>
                {/* Percentage — always visible */}
                {p.pctFee
                  ? <span className="font-mono text-[11px] text-gold-light/80 mb-0 group-hover:mb-2 transition-all duration-300">
                      <span className="text-green-300/80">{p.pctFree} free</span>
                      <span className="text-white/40 mx-1">·</span>
                      <span className="text-gold-light/80">{p.pctFee} fee-based</span>
                    </span>
                  : <span className="font-mono text-[11px] text-gold-light/80 mb-0 group-hover:mb-2 transition-all duration-300">{p.pct} of activity</span>
                }

                {/* Description — slides up on hover */}
                <p className="text-[13px] text-white/65 leading-[1.65] max-h-0 overflow-hidden group-hover:max-h-32 transition-all duration-500 ease-out">
                  {p.desc}
                </p>

                {/* Tag + arrow — fades in on hover */}
                <div className="flex items-center justify-between mt-0 group-hover:mt-4 overflow-hidden opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span className="font-mono text-[10px] text-gold-light bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-full">
                    {p.tag}
                  </span>
                  <span className="text-gold-light text-[13px] font-semibold">Learn more →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
