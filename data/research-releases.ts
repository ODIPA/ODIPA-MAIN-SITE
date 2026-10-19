/**
 * ODIPA Research Releases
 *
 * To publish a new release, add one entry to the top of the `releases` array
 * and redeploy. The listing page (/research-releases) and the individual
 * release page (/research-releases/<slug>) are generated from this file.
 *
 * Fields
 *   slug       Short URL piece, lowercase with hyphens.
 *   title      Headline of the release.
 *   type       'Privacy Digest' | 'Research Brief' | 'Special Investigation' | 'Annual Report'
 *   date       ISO date (YYYY-MM-DD) the release went public.
 *   author     Byline. Researchers publish under their own name.
 *   summary    One or two plain-language sentences for the listing card.
 *   sections   The release itself, in order. Each section has a heading,
 *              one or more paragraphs, and optional "read more" links to
 *              official sources.
 *   sources    Optional list of primary sources for the whole release.
 *
 * Republication note. Researchers may republish their own work elsewhere under
 * the volunteer agreement. ODIPA publishes first, so add the entry here before
 * any republication.
 */

export type ReleaseType =
  | 'Privacy Digest'
  | 'Research Brief'
  | 'Special Investigation'
  | 'Annual Report'

export interface ReleaseSection {
  heading: string
  paragraphs: string[]
  links?: { label: string; href: string }[]
}

export interface ResearchRelease {
  slug: string
  title: string
  type: ReleaseType
  date: string
  author: string
  summary: string
  sections: ReleaseSection[]
  sources?: { label: string; href: string }[]
}

export const releases: ResearchRelease[] = [
  // Add new releases at the top.
  {
    slug: 'privacy-digest-2026-10',
    title: 'Privacy Digest, October 2026 Edition',
    type: 'Privacy Digest',
    date: '2026-10-19',
    author: 'Nicholas Davis',
    summary:
      'Connecticut expands its privacy law as of October 1, Massachusetts lawmakers keep negotiating, and California acts on AI auditing, workplace surveillance, and AI-generated performers in ads.',
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          "This edition looks at state-level developments in consumer privacy, artificial intelligence, automated decision-making, and data governance. It covers measures that took effect or advanced in September and early October 2026. Items were chosen for their relevance to ODIPA's core values of individual privacy rights, organizational responsibility, and emerging uses of personal data.",
        ],
      },
      {
        heading: 'Most Pressing. Connecticut Expands Data Privacy Protections as of October 1',
        paragraphs: [
          "Connecticut's Public Act 26-64 took effect on October 1, 2026, and it significantly expands the Connecticut Data Privacy Act (CTDPA). Governor Ned Lamont signed the act on May 27, 2026. It builds on a separate round of CTDPA amendments that took effect on July 1, 2026. The new act focuses on high-stakes uses of personal information, including location tracking, facial recognition, automated employment decisions, consumer profiling, data brokerage, surveillance pricing, and genetic testing.",
          'The act places stronger limits on surveillance-related data. Covered businesses are generally barred from selling, sharing, transferring, or giving access to precise geolocation data, which the CTDPA defines as information that can locate a person within 1,750 feet. That data can reveal visits to health clinics, religious institutions, political demonstrations, and shelters. Businesses that use facial recognition for security or fraud prevention must now post notice at public entrances and link to a policy that includes contact information for the Connecticut Attorney General. They must also keep their facial recognition databases themselves rather than with outside vendors. Databases may still serve purposes such as preventing fraud, identity theft, and security incidents.',
          'Connecticut is also strengthening consumer rights over profiles built from personal information. The act narrows what counts as "publicly available" information, recognizing that data does not lose all privacy protection just because it appears in a public source or online. Consumers can ask a business to delete certain publicly available information when the business combines it with other data to build a consumer profile.',
          'The act gives people new rights when automated profiling is used to deny them an employment opportunity. When an organization makes such a decision, it must tell the applicant if the automated system relied on personal data supplied by a third party. The applicant can then correct inaccurate information and ask the organization to reconsider its decision using the corrected data. These protections matter more as employers lean on automated résumé screeners, candidate-ranking systems, and background-data services.',
          'The act also creates new rules for data brokers. Beginning January 1, 2027, businesses that sell or license brokered personal data in Connecticut generally must register with the Department of Consumer Protection. By July 1, 2028, the department must set up a central system where residents can send one free request asking every registered data broker to delete their personal information. Brokers must check that system at least every 45 days, and they must take part in it beginning October 1, 2028. Residents no longer have to find and contact each broker one by one.',
          'Finally, the act adds surveillance pricing rules, including disclosure duties, and new rules for companies that sell direct-to-consumer genetic tests.',
          'Together, these changes extend Connecticut\'s protections beyond basic rights to access and delete personal information. They respond to how location tracking, automated decisions, facial recognition, and profiling can affect jobs, personal safety, freedom of movement, and participation in public life.',
        ],
        links: [
          {
            label: 'Proskauer overview of Connecticut Public Act 26-64',
            href: 'https://privacylaw.proskauer.com/2026/06/articles/data-privacy-laws/from-data-brokers-to-dna-connecticut-enacts-sweeping-privacy-amendments/',
          },
        ],
      },
      {
        heading: 'Massachusetts Data Privacy Bill Remains in Conference Committee',
        paragraphs: [
          'Massachusetts lawmakers are still negotiating the final terms of a comprehensive state privacy law. The Senate passed S.2619, the Massachusetts Data Privacy Act, in September 2025. On June 4, 2026, the House unanimously passed H.5479, a substantially revised version of the Senate bill. Because the two chambers passed very different versions, a six-member conference committee must now agree on a compromise before both chambers vote again.',
          "The first major disagreement is how to treat sensitive personal data. Both versions cover information such as precise geolocation, biometric and genetic data, health information, and data that may reveal immigration status, religion, sexual orientation, gender identity, or reproductive and sexual health. The Senate version bans the sale of all sensitive data. The House version bans only the sale of precise geolocation data and allows other sensitive data to be sold with the consumer's affirmative consent.",
          'The second is enforcement. The Senate version gives enforcement authority to the Massachusetts Attorney General and includes a 60-day period to fix certain violations. The House version removes that period entirely and lets consumers bring certain civil claims against "large data holders," generally organizations that process the personal data of more than two million consumers or the sensitive data of more than 200,000 consumers. The Attorney General could still enforce the bill against all covered organizations. Both versions allow civil penalties of up to $5,000 per violation, but the House approach could add real accountability for the largest organizations.',
          "The third is who must comply. Under the Senate version, the law applies to organizations that process the data of at least 60,000 consumers, or at least 20,000 consumers while earning 20 percent of revenue from selling personal data, or that handle reproductive or sexual health information. Under the House version, it applies to organizations that process the data of at least 100,000 consumers, earn at least $100,000 from selling personal data, or collect or process any sensitive data. Neither version gives nonprofits a blanket exemption. Both exempt insurance fraud detection nonprofits, and the House version also exempts educational nonprofits. Nonprofits that keep donor records, provide health or social services, or collect immigration-related information could still be covered once the final text is set.",
          'Despite these differences, the two versions agree on many core protections. Residents would have the right to access, correct, and delete their personal information and to get a copy of certain data held about them. They could opt out of targeted advertising, the sale of personal data, and certain profiling used for consequential decisions. Covered organizations would have to offer an appeals process when a request is denied and complete data protection assessments for higher-risk processing.',
        ],
        links: [
          { label: 'S.2619, Senate version', href: 'https://malegislature.gov/bills/194/s2619' },
          { label: 'H.5479, House version', href: 'https://malegislature.gov/bills/194/h5479' },
        ],
      },
      {
        heading: 'Passed in September. Workplace Neural Data Ban, California AB 1883',
        paragraphs: [
          "On September 30, 2026, Governor Gavin Newsom signed Assembly Bill (AB) 1883, which bars California employers from using AI-powered workplace surveillance tools to recognize, infer, or predict workers' emotional states. It also bars employers from collecting neural data, meaning information generated by measuring activity in the central or peripheral nervous system. Limited exceptions apply, including workplace safety and national security and defense work. Violations carry civil penalties of up to $500 each, enforced by the state labor commissioner and public prosecutors.",
          'The privacy stakes are high. The law extends privacy protection into the workplace and sets limits on brain-monitoring technology before it becomes widely used. It takes effect January 1, 2027.',
          'Newsom signed two related workplace AI bills around the same time. SB 947 covers AI-assisted discipline and termination, and SB 951 adds disclosure duties when AI adoption triggers layoff notices under the Cal/WARN Act.',
        ],
        links: [
          {
            label: 'Paul Hastings client alert on AB 1883',
            href: 'https://www.paulhastings.com/insights/client-alerts/gov-gavin-newsom-signs-new-ai-laws-affecting-california-employers',
          },
        ],
      },
      {
        heading: 'AI Auditor Registry, California AB 1405',
        paragraphs: [
          'Governor Newsom signed Assembly Bill (AB) 1405 on September 9, 2026. The law creates a state registry for independent auditors who assess AI systems for compliance with California law. Registered auditors must disclose their qualifications, services, and audit methods, and they must meet standards for competence and independence. Audit reports must record their scope and findings, the law protects confidential information and whistleblowers, and auditors must keep audit records for at least ten years. AB 1405 does not require any AI developer to be audited. It sets rules for who may do the work.',
          'For privacy, the bill aims to make third-party AI audits more credible by reducing conflicts of interest. It also gives regulators and the public a clearer view of who is evaluating AI systems that may process personal data or influence consequential decisions.',
          'The law takes effect January 1, 2027. Its main requirements begin January 1, 2029, the date by which the Government Operations Agency must have the registry in place and auditors must register before offering, selling, or conducting covered AI audits. A same-day executive order from Governor Newsom (Executive Order N-9-26) moved some implementation deadlines up by about a year, so the registry is expected to open earlier than 2029.',
        ],
        links: [
          {
            label: "Governor's announcement",
            href: 'https://www.gov.ca.gov/2026/09/09/governor-newsom-signs-first-in-the-nation-ai-safeguards-to-protect-californians-calls-on-the-federal-government-to-do-its-part/',
          },
        ],
      },
      {
        heading: 'Independent Verification Organizations, California SB 813',
        paragraphs: [
          'Governor Newsom signed Senate Bill (SB) 813 on September 9, 2026. The law directs the Government Operations Agency to create a framework for designating independent verification organizations (IVOs), outside groups with the independence and expertise to assess the risks of AI systems and models. Organizations that apply must disclose their qualifications, proposed benchmarks, metrics, evaluation methods, and technologies, along with any information needed to judge conflicts of interest and independence. Designated IVOs must file annual reports that summarize their standards and methods and report any changes to their application information, governance policies, or funding sources.',
          "SB 813 is voluntary. No California law requires AI developers to use an IVO. It covers similar ground to AB 1405, but it focuses more on an organization's ability to carry out specialized AI safety and risk assessments, and organizations may pursue both. Together, the two laws build the base for credible third-party review, which reduces reliance on developers' own assessments of their systems.",
          'The law takes effect January 1, 2027. The statute sets January 1, 2028 as the date for the state\'s finished framework, although the same executive order that touched AB 1405 moved some deadlines up.',
        ],
        links: [
          {
            label: "Governor's announcement",
            href: 'https://www.gov.ca.gov/2026/09/09/governor-newsom-signs-first-in-the-nation-ai-safeguards-to-protect-californians-calls-on-the-federal-government-to-do-its-part/',
          },
        ],
      },
      {
        heading: 'The "Synthetic Performer Law," California SB 1050',
        paragraphs: [
          'Governor Newsom signed Senate Bill (SB) 1050 on September 16, 2026. The law requires a clear and conspicuous disclosure when an audio, video, or audiovisual advertisement prominently features a "synthetic performer." A synthetic performer is a realistic, human-like figure, voice, or representation made wholly or partly with generative AI that does not depict an identifiable real person. A performer counts as prominent when, for example, it demonstrates the product, voices the message, or reacts to it. Wording substantially similar to "this performance features a synthetic performer" or "no human performer is depicted" satisfies the rule.',
          "The law has exceptions. It does not cover AI used only for translation or accessibility, or ads for expressive works such as films, television, and games when the performer is used consistently with the work. A violation is treated as false advertising and can be enforced under California's Unfair Competition Law. If a court finds an ad violates the law, the advertising medium must remove it or stop distributing it as soon as commercially reasonable and technically feasible. California is the second state after New York to adopt a disclosure rule like this. The law takes effect January 1, 2027.",
        ],
        links: [
          {
            label: 'Skadden analysis of SB 1050',
            href: 'https://www.skadden.com/insights/publications/2026/10/california-joins-new-york-in-regulating-ai',
          },
        ],
      },
    ],
    sources: [
      { label: 'Proskauer, Connecticut SB 4 overview', href: 'https://privacylaw.proskauer.com/2026/06/articles/data-privacy-laws/from-data-brokers-to-dna-connecticut-enacts-sweeping-privacy-amendments/' },
      { label: 'Fox Rothschild, Connecticut data broker law', href: 'https://dataprivacy.foxrothschild.com/2026/06/articles/general-privacy-data-security-news-developments/connecticuts-new-data-broker-law-sb-4-what-businesses-need-to-know/' },
      { label: 'DataGrail, Connecticut expands data broker law', href: 'https://www.datagrail.io/blog/regulations/connecticut-expands-data-broker-law-what-you-need-to-know/' },
      { label: 'TrueVault, Connecticut privacy update', href: 'https://www.truevault.com/learn/connecticut-just-updated-its-privacy-law-again' },
      { label: 'Future of Privacy Forum, Connecticut annual privacy update', href: 'https://fpf.org/blog/third-times-the-charm-connecticut-enacts-annual-privacy-update/' },
      { label: 'Foley Hoag, Massachusetts House and Senate bills compared', href: 'https://foleyhoag.com/news-and-insights/blogs/state-ag-insights/2026/june/one-step-closer-to-a-massachusetts-data-privacy-law-comparing-the-current-house-and-senate-bills/' },
      { label: 'Massachusetts Legislature, S.2619', href: 'https://malegislature.gov/bills/194/s2619' },
      { label: 'Bloomberg Law, California AB 1883', href: 'https://news.bgov.com/daily-labor-report/newsom-signs-ban-on-using-ai-to-monitor-worker-brain-activity' },
      { label: 'Paul Hastings, California workplace AI laws', href: 'https://www.paulhastings.com/insights/client-alerts/gov-gavin-newsom-signs-new-ai-laws-affecting-california-employers' },
      { label: 'Morgan Lewis, California employer AI laws', href: 'https://www.morganlewis.com/pubs/2026/10/california-enacts-new-laws-governing-employer-use-of-ai' },
      { label: 'Crowell, California AI auditor framework', href: 'https://www.crowell.com/en/insights/client-alerts/california-establishes-first-in-the-nation-framework-for-verifying-independent-ai-auditors' },
      { label: 'Akin, SB 813 and AB 1405', href: 'https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/california-enacts-ai-auditor-registry-and-independent-verification-framework-sb-813-and-ab-1405' },
      { label: 'Skadden, California synthetic performer law', href: 'https://www.skadden.com/insights/publications/2026/10/california-joins-new-york-in-regulating-ai' },
    ],
  },
]

export function getRelease(slug: string): ResearchRelease | undefined {
  return releases.find((r) => r.slug === slug)
}

export function sortedReleases(): ResearchRelease[] {
  return [...releases].sort((a, b) => b.date.localeCompare(a.date))
}
