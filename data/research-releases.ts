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
    slug: 'privacy-digest-2026-11-breaches-enforcement',
    title: 'Privacy Digest, November 2026 Edition: Breaches, Enforcement and New Laws',
    type: 'Privacy Digest',
    date: '2026-11-24',
    author: 'Iram Jafry',
    summary:
      'Four of nine security incidents reviewed in this edition began at a third-party service provider, and some customers waited more than four months to be notified. Regulators in the United States and Europe also penalized companies over consent and access to personal data.',
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'This edition examines the security incidents, enforcement actions, and new privacy laws reported in the autumn of 2026. Four of the nine incidents began at a third-party service provider, and some customers waited more than four months to be notified. In the same period, regulators in the United States and Europe penalized companies for using personal data without consent and for failing to give people a copy of their own data.',
          'The period covered runs from September 30 to November 23, 2026, and the analysis draws on nine security incidents, four major outages, and more than 20 laws, rules, court decisions, and enforcement actions in the United States, the European Union, the United Kingdom, Canada, and India.',
          "The figures in this edition come mainly from company notices and regulators' announcements, and some may change while investigations remain open.",
        ],
      },
      {
        heading: 'Finding 1. Incidents that began at a service provider',
        paragraphs: [
          "SEGA disclosed on November 9 that 2,196,044 email addresses were exposed through ARARA, the service provider that delivers its newsletters. ARARA's own breach reached about 380 client companies and roughly 77 million email addresses. A week after SEGA's disclosure, an attacker used a flaw in Optimizely's website testing tool to place malicious code on its customers' websites, and third-party analysis counted 178 organizations whose pages carried that code on November 16.",
          "Uber is notifying 149,346 people that images of their driver's licenses, with names and license numbers, were taken after attackers stole credentials from one of its service providers and used them to reach Uber data. Cleverbridge, a billing platform that processes payments for online sellers, began telling customers on November 20 that stored payment card data had been copied. Uber and SEGA each learned of the intrusion from the service provider.",
          "The other two incidents described here began in the companies' own systems. At DigiCert, a server migration in February 2025 left an internal system reachable from the internet, and an unauthorized account used that opening in the summer of 2026. The system held archived records from customer identity checks, and in some cases those records included passports, driver's licenses, and utility bills. At Fandango, card details entered at checkout between October 8 and 11 were exposed, and BleepingComputer reports that skimming code on the checkout page captured them.",
        ],
        links: [
          { label: 'SEGA notice (in Japanese)', href: 'https://www.sega.co.jp/release/261109_1.html' },
          { label: 'BleepingComputer on SEGA and ARARA', href: 'https://www.bleepingcomputer.com/news/security/sega-newsletter-data-breach-exposes-22-million-email-addresses/' },
          { label: 'Optimizely advisory', href: 'https://support.optimizely.com/hc/en-us/articles/50521849710605-Security-Advisory-Web-Experimentation-Security-Incident-Updated-November-19-2026' },
          { label: 'The Hacker News on the Optimizely scripts', href: 'https://thehackernews.com/2026/11/hijacked-optimizely-scripts-served-card.html' },
          { label: 'The Record on Uber', href: 'https://therecord.media/uber-says-150000-impacted-third-party-breach' },
          { label: 'Infosecurity Magazine on Cleverbridge', href: 'https://www.infosecurity-magazine.com/news/cleverbridge-payment-card-breached/' },
          { label: 'BleepingComputer on DigiCert', href: 'https://www.bleepingcomputer.com/news/security/digicert-data-breach-exposes-customer-information-identity-documents/' },
          { label: 'BleepingComputer on Fandango', href: 'https://www.bleepingcomputer.com/news/security/fandango-says-hackers-stole-payment-card-details-from-checkout-pages/' },
        ],
      },
      {
        heading: 'Finding 2. Notification took between three days and four months',
        paragraphs: [
          'Capcom detected unauthorized access to its CAPCOM ID service on October 19 and published a notice three days later covering 11,774,247 records. Nitori Holdings detected an intrusion on November 6 and announced on November 9, also three days later, that up to 37.62 million customer records may have been exposed.',
          "DigiCert took the longest, after an unauthorized account read archived customer information between June 25 and July 2, 2026. According to the company's incident report, a review in June concluded that the unauthorized accounts had no access to customer information, and the access was confirmed on October 19. Customers began to be notified in early November, more than four months after the access took place.",
          "StubHub International, Uber, and Fandango each took between a few weeks and about a month to notify the people affected. StubHub detected unauthorized access between late October and early November and was telling customers by November 18 that names, email addresses, and phone numbers may have been accessed. At Uber, the provider reported the intrusion on October 9 and notices to the people affected began on November 10, and at Fandango the cards were taken in early October and the breach was reported to state regulators on November 13, with two years of credit monitoring offered to the customers affected. Uber's letter to the Iowa Attorney General and Fandango's notice to the California Attorney General state the dates of each incident, and neither explains why notification took about a month.",
        ],
        links: [
          { label: 'Capcom notice', href: 'https://www.capcom.co.jp/ir/english/news/pdf/e261022.pdf' },
          { label: 'Nitori notice (in Japanese)', href: 'https://www.nitorihd.co.jp/news/items/2b702dbe4d438f7fef74945d68e5bd27_1.pdf' },
          { label: 'DigiCert incident report', href: 'https://bugzilla.mozilla.org/show_bug.cgi?id=2084460' },
          { label: 'Uber filing in Iowa', href: 'https://www.iowaattorneygeneral.gov/media/cms/11102026_Uber_Technologies_Inc_089721E61CBAB.pdf' },
          { label: 'Fandango filing in California', href: 'https://oag.ca.gov/ecrime/databreach/reports/sb24-632866' },
          { label: 'The Register on StubHub International', href: 'https://www.theregister.com/cyber-crime/2026/11/18/stubhub-international-warns-customer-data-may-have-left-the-venue/5310775' },
        ],
      },
      {
        heading: 'Finding 3. Regulators focused on access to personal data and on consent',
        paragraphs: [
          'Regulators in the United States, the European Union, and the United Kingdom acted on the right of individuals to obtain a copy of their own data. In the United States, the Department of Health and Human Services issued a final rule on November 16 that cuts the time providers and health plans have to answer a request for medical records from 30 days to 15. The rule was published in the Federal Register on November 19, takes effect on January 19, 2027, and requires compliance by July 19, 2027.',
          "In Europe, Ireland's Data Protection Commission fined the operator of Tinder EUR 11 million on November 13 for giving users an incomplete copy of their data. The Court of Justice of the European Union ruled on November 5 that a data protection authority handling a complaint is itself a controller, the legal term for an organization responsible for personal data, and must in principle give the complainant access to the personal data it holds. The United Kingdom's Information Commissioner's Office confirmed on November 11 that an access request remains valid when an AI tool helped to write it.",
          "Italy's data protection authority announced a EUR 805 million fine against Meta on November 14 after finding that the Facebook app for Android accessed photos and videos without specific consent, affecting about 20 million users there. Lyft agreed on October 29 to pay USD 1.8 million in California for offering no in-app way to opt out of the sale of personal information. The California privacy agency announced four actions between November 10 and 19 against FedEx, Hertz, Filson, and Polaris over opt-out failures, with penalties ranging from about USD 218,000 to USD 2.975 million. The Polaris case was investigated jointly with the Minnesota Attorney General and produced the first enforcement action under Minnesota's comprehensive privacy law.",
          "Two regulators also advanced rules on how consent is given. The California privacy agency voted on November 6 to advance proposed amendments on browser opt-out signals (a browser setting that tells websites not to sell or share a person's data), which have yet to be adopted. India opened registration on November 13 for consent managers, registered intermediaries that help people manage their permissions.",
        ],
        links: [
          { label: 'HIPAA Privacy Rule in the Federal Register', href: 'https://www.federalregister.gov/documents/2026/11/19/2026-23429/hipaa-privacy-rule-changes-to-support-coordinated-care-and-individual-engagement-and-reduce' },
          { label: 'Data Protection Commission', href: 'https://www.dataprotection.ie/en/news-media/latest-news/data-protection-commission-fines-mtch-eu11-million-following-inquiry-tinder-users-personal-data' },
          { label: 'MTR Legal on Case C-205/25', href: 'https://www.mtrlegal.com/magazin/en/cjeu-strengthens-access-rights-against-data-protection-authorities/' },
          { label: 'Garante decision (in Italian)', href: 'https://www.gpdp.it/home/docweb/-/docweb-display/docweb/10321080' },
          { label: 'California privacy agency decisions', href: 'https://privacy.ca.gov/about-us/board-decisions/' },
          { label: 'Hunton on the opt-out signal amendments', href: 'https://www.hunton.com/privacy-and-cybersecurity-law-blog/calprivacy-proposes-amendments-to-strengthen-opt-out-preference-signal-compliance' },
        ],
      },
      {
        heading: "Finding 4. New laws and lawsuits addressed children's safety online",
        paragraphs: [
          "Appeals court rulings on October 14 and October 15 cleared the way for Florida and Georgia to enforce their social media age laws. New York's law on AI chatbots for minors, signed on October 28, takes effect on January 1, 2027, and requires more than one way to verify age. The Privacy Commissioner of Canada opened consultation on a Children's Privacy Code on October 20, with comments due by January 20, 2027. Eight state attorneys general filed suits on October 14 alleging that ChatGPT lacks safeguards for children and other vulnerable users, and Texas followed on October 23.",
        ],
        links: [
          { label: 'Florida Trend on the Florida ruling', href: 'https://www.floridatrend.com/articles/2026/10/15/federal-appeals-court-upholds-floridas-social-media-law/' },
          { label: 'Georgia Attorney General on the Georgia ruling', href: 'https://law.georgia.gov/press-releases/2026-10-15/carr-secures-major-victory-defense-georgias-social-media-law' },
          { label: 'News4Jax on the New York law', href: 'https://www.news4jax.com/business/2026/10/28/new-york-enacts-ban-on-unsafe-chatbot-behavior-with-kids-as-states-push-ai-regulation-boundaries/' },
          { label: "Canada's Children's Privacy Code", href: 'https://www.priv.gc.ca/en/opc-news/news-and-announcements/2026/nr-c_261020/' },
        ],
      },
      {
        heading: 'Finding 5. Lawmakers and regulators turned to automated decisions about workers',
        paragraphs: [
          "California's SB 947, signed on September 30, bars employers from relying solely on automated systems to discipline or dismiss workers from July 1, 2027. The European Data Protection Board chose automated decision-making in recruitment as its coordinated enforcement topic for 2027 (a subject that participating national regulators investigate together). The Federal Trade Commission opened an inquiry on October 28 into the use of personal data to set prices and worker pay.",
        ],
        links: [
          { label: 'California SB 947', href: 'https://sd05.senate.ca.gov/news/newsom-signs-mcnerneys-no-robo-bosses-act-2026-requiring-human-oversight-ai-workplace' },
          { label: 'Proskauer on the SB 947 effective date', href: 'https://www.proskauer.com/blog/the-robots-are-here-california-enacts-ai-restrictions-for-the-workplace' },
          { label: 'Hunton on the FTC inquiry', href: 'https://www.hunton.com/insights/legal/ftc-launches-personalized-pricing-and-compensation-6-b-study' },
        ],
      },
      {
        heading: 'Service outages in November',
        paragraphs: [
          "Between November 12 and 17, service failures hit Microsoft 365, JPMorgan Chase, the National Security Agency, and the Federal Aviation Administration, whose ground stop was followed by about 12,462 flight cancellations that day. Each gave a technical explanation. Microsoft's security team documented a high-volume phishing campaign that was observed within a day and used fake service health notices to target organizations in many sectors.",
        ],
        links: [
          { label: 'FAA questions and answers', href: 'https://www.faa.gov/newsroom/nationwide-ground-stop-questions-and-answers' },
          { label: 'Microsoft security blog', href: 'https://www.microsoft.com/en-us/security/blog/2026/11/16/high-volume-phishing-campaign-uses-microsoft-365-outage-lures-target-multiple-industry-sectors-2/' },
          { label: "Report on Microsoft's preliminary findings", href: 'https://www.bleepingcomputer.com/news/microsoft/microsoft-says-months-old-bug-caused-global-microsoft-365-outage/' },
        ],
      },
      {
        heading: 'Breach notification rules in the United States',
        paragraphs: [
          'Each state in the United States has its own breach notification law, and the deadlines vary from state to state. In the incidents reviewed here, notification took between three days and four months.',
        ],
        links: [
          { label: 'NCSL, security breach notification laws', href: 'https://www.ncsl.org/technology-and-communication/security-breach-notification-laws' },
        ],
      },
      {
        heading: 'Questions for organizations',
        paragraphs: [
          'Five questions follow from these findings for any organization that holds personal data.',
          "Which service providers, website scripts, and app components hold our customers' data, and how quickly is each one required to tell us if that data is taken?",
          'Which identity documents do we still hold from past verification checks, and is there a reason to keep them?',
          'If our service failed tomorrow, is the message to customers already drafted, and how would they know it is really from us?',
          "Does our process for access requests return a complete copy of a person's data within the time the law allows?",
          'When an alert is first logged, who decides whether it is a technical fault or a possible data incident, and does that person ask what data was reachable?',
        ],
      },
      {
        heading: 'What this means for individuals',
        paragraphs: [
          'Phishing emails can follow a publicized breach or outage, and they may refer to the incident in order to appear genuine.',
        ],
        links: [
          { label: 'Microsoft security blog on outage-themed phishing', href: 'https://www.microsoft.com/en-us/security/blog/2026/11/16/high-volume-phishing-campaign-uses-microsoft-365-outage-lures-target-multiple-industry-sectors-2/' },
        ],
      },
    ],
    sources: [
      { label: 'STAT, HHS issues the HIPAA Privacy Rule update', href: 'https://www.statnews.com/2026/11/17/hipaa-privacy-rule-update-aims-to-improve-patient-access-to-records/' },
      { label: 'Federal Register, HIPAA Privacy Rule final rule, 91 FR 74848', href: 'https://www.federalregister.gov/documents/2026/11/19/2026-23429/hipaa-privacy-rule-changes-to-support-coordinated-care-and-individual-engagement-and-reduce' },
      { label: 'Federal Aviation Administration, Nationwide Ground Stop questions and answers', href: 'https://www.faa.gov/newsroom/nationwide-ground-stop-questions-and-answers' },
      { label: 'Hunton, FTC personalized pricing and compensation study', href: 'https://www.hunton.com/insights/legal/ftc-launches-personalized-pricing-and-compensation-6-b-study' },
      { label: 'News4Jax, New York chatbot law for minors', href: 'https://www.news4jax.com/business/2026/10/28/new-york-enacts-ban-on-unsafe-chatbot-behavior-with-kids-as-states-push-ai-regulation-boundaries/' },
      { label: 'National Law Review, New York law effective date', href: 'https://natlawreview.com/article/br-privacy-security-ai-download-november-2026' },
      { label: 'California Senate District 5, SB 947 signing', href: 'https://sd05.senate.ca.gov/news/newsom-signs-mcnerneys-no-robo-bosses-act-2026-requiring-human-oversight-ai-workplace' },
      { label: 'Proskauer, California AI restrictions for the workplace', href: 'https://www.proskauer.com/blog/the-robots-are-here-california-enacts-ai-restrictions-for-the-workplace' },
      { label: 'Hunton, CalPrivacy proposed opt-out signal amendments', href: 'https://www.hunton.com/privacy-and-cybersecurity-law-blog/calprivacy-proposes-amendments-to-strengthen-opt-out-preference-signal-compliance' },
      { label: 'Georgia Attorney General, Eleventh Circuit ruling', href: 'https://law.georgia.gov/press-releases/2026-10-15/carr-secures-major-victory-defense-georgias-social-media-law' },
      { label: 'Florida Trend, Eleventh Circuit ruling on the Florida law', href: 'https://www.floridatrend.com/articles/2026/10/15/federal-appeals-court-upholds-floridas-social-media-law/' },
      { label: 'Bloomberg Law, state suits against OpenAI', href: 'https://news.bloomberglaw.com/antitrust/half-dozen-states-hit-openai-with-kids-online-safety-lawsuits' },
      { label: 'KBTX and The Texas Tribune, Texas suit against OpenAI', href: 'https://www.kbtx.com/2026/10/23/texas-attorney-general-ken-paxton-sues-chatgpt-maker-openai/' },
      { label: 'California Attorney General, Lyft settlement', href: 'https://oag.ca.gov/news/press-releases/privacy-rights-can%E2%80%99t-be-left-rearview-attorney-general-bonta-secures-18-million' },
      { label: 'Press Information Bureau of India, consent manager registration', href: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2336151' },
      { label: 'National Conference of State Legislatures, security breach notification laws', href: 'https://www.ncsl.org/technology-and-communication/security-breach-notification-laws' },
      { label: 'MTR Legal, Court of Justice ruling in Case C-205/25', href: 'https://www.mtrlegal.com/magazin/en/cjeu-strengthens-access-rights-against-data-protection-authorities/' },
      { label: 'Data Protection Commission of Ireland, Tinder decision', href: 'https://www.dataprotection.ie/en/news-media/latest-news/data-protection-commission-fines-mtch-eu11-million-following-inquiry-tinder-users-personal-data' },
      { label: 'Garante per la protezione dei dati personali, Meta decision (in Italian)', href: 'https://www.gpdp.it/home/docweb/-/docweb-display/docweb/10321080' },
      { label: 'European Data Protection Board, coordinated enforcement topic for 2027', href: 'https://www.edpb.europa.eu/news/edpb-adopts-statement-on-review-of-the-republic-of-korea-adequacy-processor-bcr_en' },
      { label: "Information Commissioner's Office, AI-generated subject access requests", href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/subject-access-requests/subject-access-requests-generated-by-artificial-intelligence/' },
      { label: "Office of the Privacy Commissioner of Canada, Children's Privacy Code", href: 'https://www.priv.gc.ca/en/opc-news/news-and-announcements/2026/nr-c_261020/' },
      { label: 'California Privacy Protection Agency, Board enforcement decisions', href: 'https://privacy.ca.gov/about-us/board-decisions/' },
      { label: 'Minnesota Attorney General, Polaris settlement', href: 'https://ag.state.mn.us/Office/Communications/2026/11/19_Polaris.asp' },
      { label: 'Legal 500, summary of the four California opt-out actions', href: 'https://www.legal500.com/intelligence/united-states/privacy/takeaways-from-calprivacys-four-november-opt-out-actions-and-minnesotas-first' },
      { label: 'The Register, StubHub International', href: 'https://www.theregister.com/cyber-crime/2026/11/18/stubhub-international-warns-customer-data-may-have-left-the-venue/5310775' },
      { label: 'The Record, Uber third-party breach', href: 'https://therecord.media/uber-says-150000-impacted-third-party-breach' },
      { label: 'Infosecurity Magazine, Cleverbridge data breach', href: 'https://www.infosecurity-magazine.com/news/cleverbridge-payment-card-breached/' },
      { label: 'Microsoft Security Blog, phishing campaign using outage lures', href: 'https://www.microsoft.com/en-us/security/blog/2026/11/16/high-volume-phishing-campaign-uses-microsoft-365-outage-lures-target-multiple-industry-sectors-2/' },
      { label: 'BleepingComputer, Microsoft 365 preliminary post-incident report', href: 'https://www.bleepingcomputer.com/news/microsoft/microsoft-says-months-old-bug-caused-global-microsoft-365-outage/' },
      { label: 'Capcom, notice of October 22, 2026', href: 'https://www.capcom.co.jp/ir/english/news/pdf/e261022.pdf' },
      { label: 'Nitori Holdings, notice of November 9, 2026 (in Japanese)', href: 'https://www.nitorihd.co.jp/news/items/2b702dbe4d438f7fef74945d68e5bd27_1.pdf' },
      { label: 'SEGA, notice of November 9, 2026 (in Japanese)', href: 'https://www.sega.co.jp/release/261109_1.html' },
      { label: 'DigiCert, incident report filed with Mozilla', href: 'https://bugzilla.mozilla.org/show_bug.cgi?id=2084460' },
      { label: 'California Attorney General, Fandango breach notice', href: 'https://oag.ca.gov/ecrime/databreach/reports/sb24-632866' },
      { label: 'Iowa Attorney General, Uber breach notification', href: 'https://www.iowaattorneygeneral.gov/media/cms/11102026_Uber_Technologies_Inc_089721E61CBAB.pdf' },
      { label: 'Optimizely, security advisory on the Web Experimentation incident', href: 'https://support.optimizely.com/hc/en-us/articles/50521849710605-Security-Advisory-Web-Experimentation-Security-Incident-Updated-November-19-2026' },
      { label: 'BleepingComputer, DigiCert data breach', href: 'https://www.bleepingcomputer.com/news/security/digicert-data-breach-exposes-customer-information-identity-documents/' },
      { label: 'BleepingComputer, Fandango card skimming', href: 'https://www.bleepingcomputer.com/news/security/fandango-says-hackers-stole-payment-card-details-from-checkout-pages/' },
      { label: 'BleepingComputer, SEGA newsletter data breach', href: 'https://www.bleepingcomputer.com/news/security/sega-newsletter-data-breach-exposes-22-million-email-addresses/' },
      { label: 'The Hacker News, hijacked Optimizely scripts', href: 'https://thehackernews.com/2026/11/hijacked-optimizely-scripts-served-card.html' },
      { label: 'ABC7 News, bank outage coverage', href: 'https://abc7news.com/live-updates/bank-outages-today-live-updates-chase-wells-fargo-america-others-are-reported-down/20045306/' },
      { label: 'Yahoo Finance, November outages overview', href: 'https://finance.yahoo.com/technology/article/cyberattacks-and-outages-here-are-all-of-the-major-national-disruptions-in-november-181143019.html' },
    ],
  },
  {
    slug: 'privacy-digest-2026-11',
    title: 'Privacy Digest, November 2026 Edition',
    type: 'Privacy Digest',
    date: '2026-11-23',
    author: 'Nicholas Davis',
    summary:
      'Delaware signed HB 380 on September 2, 2026. Starting January 1, 2027 it covers more businesses, adds rules for sharing data with third parties, and expands protections for sensitive data and automated decisions.',
    sections: [
      {
        heading: "Delaware's Expansion of Consumer Privacy Coverage",
        paragraphs: [
          "On September 2, 2026, Delaware Governor Matt Meyer signed House Bill 380 (HB 380) into law. The bill substantially amends the state's existing data privacy law, the Delaware Personal Data Privacy Act (DPDPA). The DPDPA was enacted on September 11, 2023, and took effect on January 1, 2025. It gave Delaware residents the right to access, correct, and delete their personal information, and the ability to opt out of certain data sales and targeted advertising. However, the DPDPA applied only to organizations that process the personal information of at least 35,000 Delaware consumers each year. Smaller organizations stayed outside the law, even when they collected, processed, or sold consumers' personal information. That left a gap in coverage and limited residents' ability to use the protections the law gave them.",
          "HB 380 addresses this gap by expanding the DPDPA's scope beginning January 1, 2027. It lowers the threshold from 35,000 consumers to 10,000, a decrease of approximately 71%. It also lowers the threshold for organizations that earn more than 20% of their gross revenue from selling personal data, from 10,000 consumers to 5,000.",
          "These changes matter because of Delaware's relatively small population. Lowering the number of consumers an organization must process before the DPDPA applies extends the privacy framework to smaller businesses that may not have qualified before. This is especially true for online businesses, which can collect and process the personal information of Delaware residents without a physical presence in the state. Businesses outside Delaware may now be covered by the DPDPA. For Delaware residents, the lower threshold means more organizations are subject to the rights to request access, request deletion, and opt out of certain data processing.",
        ],
        links: [
          { label: 'Delaware Governor, signed legislation listing for HB 380', href: 'https://governor.delaware.gov/?p=25979' },
          { label: 'IAPP, Delaware enacts HB 380', href: 'https://iapp.org/news/a/delaware-enacts-hb-380-key-updates-to-the-delaware-personal-data-privacy-act' },
        ],
      },
      {
        heading: 'Strengthening Third-Party Accountability and Data Sharing Protections',
        paragraphs: [
          'HB 380 also adds new requirements for how covered organizations share consumers\' personal information with third parties. Under the original DPDPA, a data controller (an organization that decides how and why personal information is processed) had to set up contractual safeguards with data processors (organizations that handle information on another organization\'s behalf). The original law had no matching contract or due diligence requirements for disclosures to independent third parties. That meant personal information collected by one organization could be passed to a third party for a wide range of commercial or analytical purposes.',
          'To close this gap, HB 380 requires data controllers to have binding contracts with third parties that receive consumers\' personal information. These contracts must state the purposes for which the information may be used, require the recipient to follow applicable privacy protections, and give the controller a way to address unauthorized uses. HB 380 also adds mandatory due diligence. Controllers must evaluate a third party\'s privacy policies and its technical and organizational safeguards. At a minimum, this review must include questionnaires and a review of relevant documents, with scrutiny that matches the sensitivity of the information being shared.',
          'The bill also places direct obligations on third parties. Under the new section 12D-107A of the Delaware Code, a third party may not process personal information without a contract that meets the DPDPA\'s requirements. HB 380 also builds on the DPDPA\'s existing liability protection for organizations that disclose personal information, by requiring reasonable due diligence and oversight of whether recipients keep their contract obligations.',
          'For Delaware residents, these provisions mean their personal information stays subject to privacy protections after it moves from the original organization to an outside party. The bill extends accountability beyond the point of collection and across later data-sharing relationships.',
        ],
        links: [
          { label: 'WilmerHale, new requirements for sensitive data and third-party contracts', href: 'https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20261006-delaware-adds-new-requirements-for-sensitive-data-third-party-contracts' },
          { label: 'ZwillGen, new third-party due diligence requirements', href: 'https://www.zwillgen.com/privacy/delaware-expands-privacy-law-new-third-party-due-diligence-requirements/' },
        ],
      },
      {
        heading: 'Expanding Sensitive Data Protections and Automated Decision-Making Safeguards',
        paragraphs: [
          'HB 380 also adds protections for sensitive information. Under the original DPDPA, sensitive information included racial or ethnic origin, health conditions, biometric information, and precise geolocation data. HB 380 broadens the definition to include neural data, government-issued identification numbers, certain financial account credentials, and inferences that reveal sensitive personal characteristics.',
          'The bill also tightens the rules for processing and selling sensitive information. The original DPDPA required consent before processing sensitive personal information. HB 380 adds that the processing must be reasonably necessary and proportionate to its disclosed purposes. Organizations may not sell sensitive personal information unless the disclosure is strictly necessary to provide or maintain a product the consumer asked for. Even then, the organization must give the consumer advance notice that names the specific sensitive information being sold and its recipients. It must also get the consumer\'s express consent before the transfer and keep a record of that consent for at least five years.',
          'HB 380 also strengthens safeguards around automated decision-making and profiling. The original DPDPA let consumers opt out of profiling used in solely automated decisions that produce legal or similarly significant effects. HB 380 broadens this to profiling used in automated decisions more generally, including decisions about employment, housing, insurance, and financial services. It also lowers the threshold for certain mandatory data protection assessments from 100,000 consumers to 50,000, so more organizations must assess the risks of certain profiling and automated decisions.',
          'These changes come as automated technologies play a larger role in decisions that affect everyday life. By widening residents\' ability to opt out of certain profiling and requiring more organizations to assess the risks of consequential automated decisions, HB 380 adds safeguards against the misuse of personal information.',
        ],
        links: [
          { label: 'Future of Privacy Forum, updating the Delaware Personal Data Privacy Act', href: 'https://fpf.org/blog/updating-the-delaware-personal-data-privacy-act-the-first-state-becomes-the-latest-to-get-a-privacy-refresh/' },
          { label: 'OneTrust, what changes under the DPDPA in 2027', href: 'https://www.onetrust.com/blog/delaware-hb-380-amendments-what-changes-under-the-dpdpa-in-2027/' },
        ],
      },
    ],
    sources: [
      { label: 'Delaware Governor, signed legislation listing for HB 380', href: 'https://governor.delaware.gov/?p=25979' },
      { label: 'IAPP, Delaware enacts HB 380', href: 'https://iapp.org/news/a/delaware-enacts-hb-380-key-updates-to-the-delaware-personal-data-privacy-act' },
      { label: 'Future of Privacy Forum, updating the Delaware Personal Data Privacy Act', href: 'https://fpf.org/blog/updating-the-delaware-personal-data-privacy-act-the-first-state-becomes-the-latest-to-get-a-privacy-refresh/' },
      { label: 'WilmerHale, Delaware adds new requirements for sensitive data and third-party contracts', href: 'https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20261006-delaware-adds-new-requirements-for-sensitive-data-third-party-contracts' },
      { label: 'ZwillGen, Delaware expands privacy law with new third-party due diligence requirements', href: 'https://www.zwillgen.com/privacy/delaware-expands-privacy-law-new-third-party-due-diligence-requirements/' },
      { label: 'OneTrust, Delaware HB 380 amendments', href: 'https://www.onetrust.com/blog/delaware-hb-380-amendments-what-changes-under-the-dpdpa-in-2027/' },
    ],
  },
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
