'use client'

import { useEffect, useRef } from 'react'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="min-h-screen bg-navy flex items-center relative overflow-hidden"
    >
      {/* Grid background */}
      <div className="hero-grid" />

      {/* Orbs */}
      <div className="absolute w-[600px] h-[600px] rounded-full blur-[80px] pointer-events-none top-[-200px] right-[-100px] animate-float-1"
        style={{ background: 'radial-gradient(circle, rgba(26,95,168,0.4) 0%, transparent 70%)' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none bottom-[-100px] left-[10%] animate-float-2"
        style={{ background: 'radial-gradient(circle, rgba(200,146,10,0.2) 0%, transparent 70%)' }} />

      <div className="relative max-w-content mx-auto px-6 pt-[120px] pb-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">

        {/* Left — copy */}
        <div>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-6">
            <span className="block w-8 h-px bg-gold-light" />
            501(c)(3) Nonprofit Organization
          </div>

          <h1 className="font-display text-[clamp(42px,5vw,64px)] font-black text-white leading-[1.08] tracking-[-1px] mb-7">
            Privacy Is a<br />
            <em className="not-italic text-gold-light relative">
              Fundamental
              <span className="absolute bottom-[-4px] left-0 right-0 h-[3px] bg-gold rounded-sm" />
            </em>
            <br />
            Right.
          </h1>

          <p className="text-[17px] text-white/65 leading-[1.75] max-w-[480px] mb-10">
            ODIPA educates consumers and organizations about digital information
            privacy — advocating for practices and policies that protect people
            in an increasingly data-driven world.
          </p>

          <div className="flex gap-4 flex-wrap">
            <a
              href="#involved"
              className="inline-block bg-gold text-navy px-8 py-3.5 rounded font-bold text-[14px] tracking-[0.5px] hover:bg-gold-light hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,146,10,0.3)] transition-all no-underline"
            >
              Get Involved
            </a>
            <a
              href="#programs"
              className="inline-block border border-white/30 text-white/85 px-8 py-3.5 rounded font-medium text-[14px] hover:border-white/70 hover:text-white hover:bg-white/5 transition-all no-underline"
            >
              Our Programs
            </a>
          </div>
        </div>

        {/* Right — stats */}
        <div className="hidden lg:grid gap-5">
          {[
            { num: '16B+', label: 'Credentials exposed in a single 2025 data compilation' },
            { num: '99%', label: 'Of organizations have data exposed to AI tools' },
            { num: '$10.22M', label: 'Average cost of a U.S. data breach in 2025 (IBM)' },
          ].map((s, i) => (
            <div
              key={s.num}
              className={`bg-white/5 border border-white/[0.08] rounded-xl px-8 py-7 flex items-center gap-6 hover:bg-white/[0.08] hover:border-blue-light/30 hover:-translate-x-1 transition-all animate-fade-slide-in ${
                i === 0 ? 'animation-delay-200' : i === 1 ? 'animation-delay-350' : 'animation-delay-500'
              }`}
            >
              <span className="font-display text-[38px] font-bold text-gold-light leading-none whitespace-nowrap">
                {s.num}
              </span>
              <span className="text-[13px] text-white/55 leading-relaxed">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
