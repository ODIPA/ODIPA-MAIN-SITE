# ODIPA Website

Official website for **ODIPA — Organization for Digital Information Privacy & Awareness**, a 501(c)(3) nonprofit organization dedicated to consumer privacy education, policy advocacy, research, and open-source technology.

🌐 **Live site:** [odipa.org](https://odipa.org)

---

## AI-Assisted Development

This codebase was developed by ODIPA using AI-assisted development. AI authorship is increasingly standard practice across the software industry and does not affect the legal validity, functionality, or open-source status of this code. ODIPA maintains this repository, accepts contributions, and is responsible for its accuracy and ongoing maintenance.

This website is not part of any ODIPA commercial product or affiliate entity. It is the official public-facing presence of a 501(c)(3) nonprofit organization.

---

## About ODIPA

ODIPA educates consumers and organizations about digital information privacy — advocating for practices and policies that protect people in an increasingly data-driven world. Our work spans eight integrated programs:

1. Educational Outreach (free to the public)
2. Advocacy & Policy
3. Research & Publications
4. Community Building
5. Corporate Certification
6. Awareness Campaigns
7. Open-Source Development ← you are here
8. International Cooperation

77% of ODIPA's services are delivered **completely free** to the public. Staff compensation is allocated across program activities per IRS functional expense guidelines — these percentages reflect service delivery mix, not a fundraising efficiency ratio.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router, static export) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Language | TypeScript |
| Analytics | [Plausible](https://plausible.io/) (privacy-respecting, no cookies) |
| Hosting | [Azure Static Web Apps](https://azure.microsoft.com/en-us/products/app-service/static) |
| CI/CD | GitHub Actions |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Local Development

```bash
# Clone the repo
git clone https://github.com/odipa/ODIPA-MAIN-SITE.git
cd ODIPA-MAIN-SITE

# Install dependencies
npm install

# Download self-hosted images (first time only)
bash download-images.sh

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

This generates a fully static site in the `/out` directory, ready for deployment to Azure Static Web Apps or any static host.

---

## Project Structure

```
ODIPA-MAIN-SITE/
├── app/
│   ├── layout.tsx                    # Root layout — nav, footer, metadata, Plausible
│   ├── page.tsx                      # Home page
│   ├── globals.css                   # Global styles and design tokens
│   ├── about/                        # About ODIPA page
│   ├── annual-report/                # Annual report and financials
│   ├── transparency/                 # Form 990, IRS disclosures, public records
│   ├── press/                        # Press & media page
│   ├── privacy-policy/               # Privacy policy
│   ├── donate/                       # Donation page (Give Lively)
│   ├── contact/                      # Contact form
│   ├── programs/
│   │   ├── educational-outreach/
│   │   ├── advocacy-policy/
│   │   ├── research-publications/
│   │   ├── community-building/
│   │   ├── corporate-certification/
│   │   ├── awareness-campaigns/
│   │   ├── open-source-development/
│   │   └── international-cooperation/
│   └── get-involved/
│       ├── volunteer/
│       ├── corporate-partner/
│       ├── get-certified/
│       └── contribute-code/
├── components/
│   ├── Nav.tsx                       # Sticky navigation with scroll effect
│   ├── Hero.tsx                      # Hero section with animated stats
│   ├── Ticker.tsx                    # Animated gold marquee strip
│   ├── About.tsx                     # Mission and pillars
│   ├── Programs.tsx                  # All 8 ODIPA programs
│   ├── Impact.tsx                    # Animated impact statistics
│   ├── ServiceModel.tsx              # Donut chart and service breakdown
│   ├── Sponsorship.tsx               # Four-tier corporate sponsor grid
│   ├── GetInvolved.tsx               # Six engagement pathways
│   ├── DonateCTA.tsx                 # Donation call-to-action
│   ├── Footer.tsx                    # Site footer
│   ├── ProgramLayout.tsx             # Shared layout for all 8 program pages
│   ├── CommunityTools.tsx            # Open-source privacy tools directory
│   ├── NewsletterSignup.tsx          # Newsletter signup (3 variants)
│   ├── CookieConsent.tsx             # Cookie consent banner
│   ├── DonateWidget.tsx              # Full donate page component
│   ├── BoardApplicationForm.tsx      # Board member application form
│   ├── SponsorForm.tsx               # Corporate sponsor application
│   ├── ResearchSponsorForm.tsx       # Research sponsorship form
│   └── SectionHeader.tsx             # Reusable section header component
├── public/
│   ├── images/                       # Self-hosted Unsplash images (run download-images.sh)
│   ├── logo-dark.png
│   ├── og-image.png
│   └── site.webmanifest
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml
├── download-images.sh                # One-time image download script
├── staticwebapp.config.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Deployment

This site deploys automatically to **Azure Static Web Apps** via GitHub Actions on every push to `main`.

### First-Time Setup

1. Create an Azure Static Web Apps resource in the Azure Portal
2. Connect it to this GitHub repository
3. Azure will automatically configure the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret
4. The workflow in `.github/workflows/azure-static-web-apps.yml` handles all subsequent deployments

### Self-Hosted Images

All images are self-hosted in `public/images/` to eliminate dependency on Unsplash's CDN. Run the download script once after cloning:

```bash
bash download-images.sh
```

This downloads 31 images (~15MB total) from Unsplash into `public/images/`. The `public/images/` directory is excluded from version control (`.gitignore`) to keep the repository lightweight — run the script on each new clone or deployment environment.

### Environment Variables

No runtime environment variables are required for the static build. To change the Plausible domain, update `data-domain` in `app/layout.tsx`.

---

## Contributing

We welcome contributions from the community! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

Key areas where contributions are most valuable:
- **Accessibility** improvements (WCAG 2.1 AA compliance)
- **Content updates** (programs, impact statistics, team information)
- **Translations** (Spanish, Mandarin, and other languages that serve ODIPA's communities)
- **Performance** optimizations
- **Bug fixes**

---

## Analytics

This site uses [Plausible Analytics](https://plausible.io/) — a privacy-respecting, cookie-free analytics platform that does not track individual users, does not use fingerprinting, and is fully GDPR/CCPA compliant. This choice reflects ODIPA's core mission of protecting consumer privacy.

No consent banner is required.

---

## Disclaimer & Limitation of Liability

**By cloning, forking, or contributing to this repository, you acknowledge that you have read this disclaimer.**

### AI-generated content
Portions of this codebase and website content were generated with AI assistance. While ODIPA reviews all AI-generated content for accuracy and mission alignment before publication, AI-generated content may contain errors, omissions, or outdated information. ODIPA does not warrant that any AI-generated content on this site is complete, accurate, or current.

### Not legal or financial advice
Nothing on the ODIPA website constitutes legal advice, financial advice, regulatory compliance guidance, or a legal opinion. Website content is provided for general educational and informational purposes only. Do not rely on content from this site as a substitute for advice from a qualified attorney, accountant, or compliance professional. ODIPA is a nonprofit education organization, not a law firm or financial institution.

### Certification program
The ODIPA Trust Seal and certification program represent ODIPA's independent third-party assessment against documented frameworks. Certification does not constitute a legal opinion, a regulatory safe harbor, or a guarantee of legal compliance. Certified organizations should continue to work with qualified legal counsel on regulatory obligations.

### No warranty
This website is provided "as is" without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. ODIPA does not warrant that the site will be uninterrupted, error-free, or free of harmful components.

### Limitation of liability
To the fullest extent permitted by law, ODIPA, its board members, officers, employees, volunteers, and contributors are not liable for any damages — direct, indirect, incidental, consequential, or punitive — arising from your use of or inability to use this website or its content.

### External links
This site contains links to third-party websites. ODIPA does not control, endorse, or take responsibility for the content, privacy practices, or accuracy of any linked site.

### Jurisdictional variation
Laws governing nonprofit organizations, data privacy, and online content vary by jurisdiction. Nothing on this site should be construed as advice about compliance with any particular jurisdiction's laws.

---

## License

This project is open source under the [MIT License](LICENSE).

Content (text, images, ODIPA branding, program descriptions, and organizational materials) remains the property of ODIPA and is not included in the MIT license grant. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## Contact

- **General:** info@odipa.org
- **Partnerships:** partnerships@odipa.org
- **Development:** dev@odipa.org
- **Transparency / document requests:** transparency@odipa.org
- **Website issues:** Open a [GitHub Issue](https://github.com/odipa/ODIPA-MAIN-SITE/issues)
