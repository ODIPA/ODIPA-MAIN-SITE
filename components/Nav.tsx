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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-8 transition-all duration-300 ${
        scrolled
          ? 'h-14 bg-[rgba(6,15,29,0.98)] backdrop-blur-md'
          : 'h-[68px] bg-[rgba(11,31,58,0.95)] backdrop-blur-md'
      } border-b border-white/[0.08]`}
    >
      {/* Brand — logo image on dark nav */}
      <a href={isHome ? '#hero' : '/'} className="flex items-center gap-3 no-underline group">
        <Image
          src="/logo-dark-sm.png"
          alt="ODIPA — Organization for Digital Information Privacy & Awareness"
          width={280}
          height={112}
          className={`${scrolled ? 'h-11' : 'h-14'} w-auto object-contain transition-all duration-300 group-hover:opacity-80`}
          priority
        />
        <span className="font-mono text-[9px] text-gold-light uppercase tracking-[2px] hidden xl:block">
          501(c)(3) Nonprofit
        </span>
      </a>

      {/* Desktop links */}
      <ul className="hidden md:flex items-center gap-4 lg:gap-8 list-none">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={isHome ? l.href : '/' + l.href}
              className="text-white/75 text-[13px] font-medium tracking-[0.5px] hover:text-gold-light transition-colors no-underline whitespace-nowrap"
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
            href="/join"
            className="border border-gold text-gold-light px-4 lg:px-5 py-2 rounded text-[13px] font-semibold hover:bg-gold hover:text-navy transition-colors no-underline whitespace-nowrap"
          >
            Join Free
          </a>
        </li>
        <li>
          <a
            href="/donate"
            className="bg-gold text-navy px-4 lg:px-5 py-2 rounded text-[13px] font-semibold hover:bg-gold-light transition-colors no-underline whitespace-nowrap"
          >
            Donate
          </a>
        </li>
      </ul>

      {/* Mobile: Join Free stays reachable, hamburger opens the full menu */}
      <div className="md:hidden flex items-center gap-3">
        <a
          href="/join"
          className="border border-gold text-gold-light px-4 py-1.5 rounded text-[12px] font-semibold hover:bg-gold hover:text-navy transition-colors no-underline whitespace-nowrap"
        >
          Join Free
        </a>
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="flex flex-col justify-center items-center w-10 h-10 gap-[5px] bg-transparent border-0 cursor-pointer"
        >
          <span className={`block w-5 h-[2px] bg-white transition-transform duration-200 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block w-5 h-[2px] bg-white transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-[2px] bg-white transition-transform duration-200 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute top-full left-0 right-0 bg-[rgba(6,15,29,0.98)] backdrop-blur-md border-b border-white/[0.08] px-6 py-4"
        >
          <ul className="list-none m-0 p-0 flex flex-col">
            {links.map((l) => (
              <li key={l.href} className="border-b border-white/[0.06] last:border-0">
                <a
                  href={isHome ? l.href : '/' + l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-white/85 text-[15px] font-medium no-underline hover:text-gold-light transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="border-b border-white/[0.06]">
              <a
                href="https://github.com/odipa/ODIPA-MAIN-SITE"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-white/60 text-[15px] font-medium no-underline hover:text-white transition-colors"
              >
                Source
              </a>
            </li>
            <li className="pt-4 pb-1">
              <a
                href="/donate"
                onClick={() => setMenuOpen(false)}
                className="block text-center bg-gold text-navy px-5 py-2.5 rounded text-[14px] font-semibold no-underline hover:bg-gold-light transition-colors"
              >
                Donate
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
