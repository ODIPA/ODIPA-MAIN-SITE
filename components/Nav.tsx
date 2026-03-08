'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const links = [
  { href: '#about', label: 'About' },
  { href: '#programs', label: 'Programs' },
  { href: '#impact', label: 'Impact' },
  { href: '#sponsor', label: 'Partner' },
  { href: '#involved', label: 'Get Involved' },
]

export default function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 transition-all duration-300 ${
        scrolled
          ? 'h-14 bg-[rgba(6,15,29,0.98)] backdrop-blur-md'
          : 'h-[68px] bg-[rgba(11,31,58,0.95)] backdrop-blur-md'
      } border-b border-white/[0.08]`}
    >
      {/* Brand — logo image on dark nav */}
      <a href={isHome ? '#hero' : '/'} className="flex items-center gap-3 no-underline group">
        <Image
          src="/logo-dark.png"
          alt="ODIPA — Organization for Digital Information Privacy & Awareness"
          width={160}
          height={40}
          className="h-12 w-auto object-contain transition-opacity duration-200 group-hover:opacity-80"
          priority
        />
        <span className="font-mono text-[9px] text-gold-light uppercase tracking-[2px] hidden sm:block">
          501(c)(3) Nonprofit
        </span>
      </a>

      {/* Desktop links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={isHome ? l.href : '/' + l.href}
              className="text-white/75 text-[13px] font-medium tracking-[0.5px] hover:text-gold-light transition-colors no-underline"
            >
              {l.label}
            </a>
          </li>
        ))}
        <li>
          <a
            href="https://github.com/odipa/ODIPA-MAIN-SITE"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors no-underline"
            aria-label="View source on GitHub"
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span className="text-[13px] font-medium">Source</span>
          </a>
        </li>
        <li>
          <a
            href="/donate"
            className="bg-gold text-navy px-5 py-2 rounded text-[13px] font-semibold hover:bg-gold-light transition-colors no-underline"
          >
            Donate
          </a>
        </li>
      </ul>
    </nav>
  )
}
