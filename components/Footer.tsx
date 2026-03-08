import Image from 'next/image'
import NewsletterSignup from './NewsletterSignup'
const columns = [
  {
    title: 'Programs',
    links: [
      { label: 'Educational Outreach', href: '/programs/educational-outreach' },
      { label: 'Advocacy & Policy', href: '/programs/advocacy-policy' },
      { label: 'Research & Publications', href: '/programs/research-publications' },
      { label: 'Community Building', href: '/programs/community-building' },
      { label: 'Corporate Certification', href: '/programs/corporate-certification' },
      { label: 'Awareness Campaigns', href: '/programs/awareness-campaigns' },
      { label: 'Open-Source Platform', href: '/programs/open-source-development' },
      { label: 'International Cooperation', href: '/programs/international-cooperation' },
    ],
  },
  {
    title: 'Organization',
    links: [
      { label: 'About ODIPA', href: '/about' },
      { label: 'Board of Directors', href: '/about#board' },
      { label: 'Annual Report', href: '/annual-report' },
      { label: 'Transparency', href: '/transparency' },
      { label: 'Press & Media', href: '/press' },
      { label: 'Our Impact', href: '/#impact' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
  {
    title: 'Get Involved',
    links: [
      { label: 'Donate', href: '/donate' },
      { label: 'Volunteer', href: '/get-involved/volunteer' },
      { label: 'Corporate Partner', href: '/get-involved/corporate-partner' },
      { label: 'Contribute Code', href: '/get-involved/contribute-code' },
      { label: 'Get Certified', href: '/get-involved/get-certified' },
      { label: 'Become a Sponsor', href: '/become-a-sponsor' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-navy text-white/50 pt-16 pb-8 px-6">
      <div className="max-w-content mx-auto">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-white/[0.06] mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Image src="/logo-dark.png" alt="ODIPA" width={180} height={46} className="h-14 w-auto object-contain mb-2" />
            <div className="font-mono text-[12px] text-gold-light tracking-[1px] mb-4">
              Organization for Digital Information Privacy &amp; Awareness
            </div>
            <p className="text-[13px] leading-[1.8] max-w-[280px] mb-6">
              Educating consumers and organizations about digital information privacy —
              advocating for practices and policies that protect people in an increasingly
              data-driven world.
            </p>
            <p className="text-[13px] leading-[1.7] mb-6 text-white/40 italic">
              ODIPA is funded through individual donations, corporate sponsorships, and foundation grants.
            </p>

            {/* Newsletter signup */}
            <div className="mb-6">
              <div className="font-mono text-[10px] text-white/30 uppercase tracking-[2px] mb-3">Privacy Newsletter</div>
              <p className="text-[12px] text-white/40 leading-relaxed mb-3">
                Privacy digest: breach alerts, new laws, research releases.
              </p>
              <NewsletterSignup variant="footer" source="Footer" />
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-block border border-white/[0.12] px-3.5 py-1.5 rounded font-mono text-[10px] tracking-[1px] text-white/40">
                501(c)(3) TAX-EXEMPT ORGANIZATION
              </span>
              <a
                href="https://github.com/odipa/odipa-website"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-white/[0.12] px-3.5 py-1.5 rounded font-mono text-[10px] tracking-[1px] text-white/40 hover:text-white/70 hover:border-white/30 transition-all no-underline"
              >
                <svg height="12" width="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                OPEN SOURCE
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[12px] font-semibold text-white uppercase tracking-[1px] mb-5">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] text-white/45 hover:text-gold-light no-underline transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


        {/* Social media + divider */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-8 border-t border-b border-white/[0.06] mb-8">
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[10px] text-white/30 uppercase tracking-[2px] mb-2">Follow ODIPA</div>
            <div className="flex items-center gap-4">
              {/* LinkedIn */}
              <a href="https://linkedin.com/company/odipa" target="_blank" rel="noopener noreferrer"
                aria-label="ODIPA on LinkedIn"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="https://twitter.com/odipa_org" target="_blank" rel="noopener noreferrer"
                aria-label="ODIPA on X (Twitter)"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://facebook.com/odipa.org" target="_blank" rel="noopener noreferrer"
                aria-label="ODIPA on Facebook"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com/odipa_org" target="_blank" rel="noopener noreferrer"
                aria-label="ODIPA on Instagram"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com/@odipa_org" target="_blank" rel="noopener noreferrer"
                aria-label="ODIPA on YouTube"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <svg width="18" height="13" viewBox="0 0 24 17" fill="currentColor">
                  <path d="M23.495 2.205a3.02 3.02 0 00-2.122-2.136C19.505 0 12 0 12 0S4.495 0 2.627.07a3.02 3.02 0 00-2.122 2.135C0 4.073 0 8.383 0 8.383s0 4.31.505 6.178a3.02 3.02 0 002.122 2.136C4.495 17 12 17 12 17s7.505 0 9.373-.303a3.02 3.02 0 002.122-2.136C24 12.692 24 8.383 24 8.383s0-4.31-.505-6.178zM9.545 11.97V4.797l6.273 3.587-6.273 3.586z"/>
                </svg>
              </a>
              {/* GitHub */}
              <a href="https://github.com/odipa/odipa-website" target="_blank" rel="noopener noreferrer"
                aria-label="ODIPA on GitHub"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="font-mono text-[11px] text-white/25 text-right hidden sm:block">
            Follow us for privacy news,<br />policy updates &amp; program announcements
          </div>
        </div>
        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-[11px] tracking-[0.5px]">
          <span>© 2026 ODIPA — Organization for Digital Information Privacy &amp; Awareness. All rights reserved.</span>
          <span>Contributions may be tax-deductible to the extent permitted by law.</span>
        </div>
      </div>
    </footer>
  )
}
