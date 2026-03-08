import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import CookieConsent from '@/components/CookieConsent'
import Footer from '@/components/Footer'

const SITE_URL = 'https://odipa.org'
const SITE_NAME = 'ODIPA'
const TITLE = 'ODIPA — Organization for Digital Information Privacy & Awareness'
const DESCRIPTION =
  'ODIPA is a 501(c)(3) nonprofit educating consumers and organizations about digital information privacy — advocating for practices and policies that protect people in an increasingly data-driven world.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,

  keywords: [
    'data privacy',
    'digital privacy',
    'consumer privacy',
    'privacy nonprofit',
    'ODIPA',
    'information privacy',
    'privacy education',
    'privacy advocacy',
    'GDPR',
    'CCPA',
    'data protection',
    'privacy rights',
    'online privacy',
    'privacy awareness',
    'cybersecurity nonprofit',
    '501c3 nonprofit',
  ],

  authors: [{ name: 'ODIPA', url: SITE_URL }],
  creator: 'ODIPA',
  publisher: 'ODIPA',

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ODIPA — Organization for Digital Information Privacy & Awareness',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@odipa_org',
    creator: '@odipa_org',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',

  verification: {
    // Add your Google Search Console verification token here
    google: 'REPLACE_WITH_GOOGLE_VERIFICATION_TOKEN',
  },

  category: 'nonprofit',
}

// JSON-LD Structured Data
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'ODIPA — Organization for Digital Information Privacy & Awareness',
  alternateName: 'ODIPA',
  url: SITE_URL,
  logo: `${SITE_URL}/logo-dark.png`,
  description: DESCRIPTION,
  foundingDate: '2024',
  nonprofitStatus: 'Nonprofit501c3',
  taxID: '33-2725121',
  email: 'info@odipa.org',
  sameAs: [
    'https://github.com/odipa/odipa-website',
    'https://twitter.com/odipa_org',
    'https://linkedin.com/company/odipa',
  ],
  knowsAbout: [
    'Digital Privacy',
    'Data Protection',
    'Consumer Privacy Rights',
    'GDPR Compliance',
    'CCPA Compliance',
    'Privacy Advocacy',
    'Cybersecurity Awareness',
  ],
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  publisher: {
    '@type': 'NGO',
    name: 'ODIPA',
    url: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Plausible Analytics — privacy-respecting, cookieless */}
        <script
          defer
          data-domain="odipa.org"
          src="https://plausible.io/js/script.js"
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Nav />
        <CookieConsent />
        <main className="overflow-x-clip">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
