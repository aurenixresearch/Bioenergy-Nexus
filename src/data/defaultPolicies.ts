export interface PolicySection {
  id: string;
  title: string;
  content: string;
  subsections?: { title: string; content: string }[];
}

export interface PolicyDocumentData {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  summary: string;
  iconName: string;
  sections: PolicySection[];
}

export const DEFAULT_POLICIES: Record<string, PolicyDocumentData> = {
  terms: {
    id: 'terms',
    title: 'Terms and Conditions',
    version: '2.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Master legal and governance agreement establishing binding terms of service, user eligibility, account security standards, academic research submission protocols, intellectual property rights, AI model usage, liability exclusions, and international platform compliance for Aurenix Research.',
    iconName: 'FileText',
    sections: [
      {
        id: 'acceptance',
        title: '1. Acceptance of Terms & Binding Legal Agreement',
        content: 'By registering for an account, accessing, browsing, downloading scientific literature, interacting with computational models, or utilizing any portion of the Aurenix Research platform ("Aurenix", "Platform", "we", "us", or "our"), you ("User", "Scholar", "Researcher", "Institution") explicitly acknowledge that you have read, understood, and agreed to be legally bound by all terms, conditions, notices, and policies contained herein. These Terms and Conditions constitute a legally binding agreement between you and Aurenix Research Foundation.\n\nIf you do not agree to all provisions of these Terms and Conditions without modification, you must immediately cease all access, navigation, and use of the Platform. Continued use of the Platform after any revisions or updates signifies your full acceptance of such modified terms.',
        subsections: [
          {
            title: '1.1 Electronic Contracting & Binding Intent',
            content: 'Under applicable international electronic signatures and cybersecurity regulations (including the UNCITRAL Model Law on Electronic Commerce), your electronic click, registration, or navigation constitutes a legal signature with the full force and effect of a physically executed written agreement.'
          },
          {
            title: '1.2 Institutional Binding Authority',
            content: 'If you are entering into these Terms on behalf of an academic university, research institution, government agency, or corporate enterprise, you represent and warrant that you possess full legal power and authority to bind such entity to these Terms. References to "you" shall apply to both the individual user and the affiliated institution.'
          },
          {
            title: '1.3 Territory & International Compliance',
            content: 'Aurenix operates across global jurisdictions connecting African clean energy research centers with global collaborators. You agree to comply with all local, national, and international laws regarding online conduct, academic research dissemination, intellectual property, and cross-border data transmission.'
          }
        ]
      },
      {
        id: 'eligibility',
        title: '2. User Eligibility & Verified Scholar Onboarding',
        content: 'Access to the Aurenix Platform and its specialized features is granted strictly to individuals and verified legal entities who meet our eligibility criteria. We reserve the right to audit user credentials and deny or revoke access to any account that fails to fulfill verification requirements.',
        subsections: [
          {
            title: '2.1 Age & Legal Capacity Limits',
            content: 'You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to create an account, submit bioenergy research, or participate in research alliances. Accounts registered by individuals under 18 years of age are strictly prohibited.'
          },
          {
            title: '2.2 Scholar Verification & ORCID Integration',
            content: 'To unlock verified scholar badges, publication upload privileges, and private workspace invitations, users must complete credential verification. This includes linking a valid ORCID iD, providing an institutional email domain (.edu, .ac.ng, .org, or equivalent), and verifying academic publication history.'
          },
          {
            title: '2.3 Multi-Tenant Institutional Accounts',
            content: 'Academic departments and research consortiums operating under enterprise licenses must assign designated primary administrative officers responsible for managing user seats, data access privileges, and workspace permissions.'
          }
        ]
      },
      {
        id: 'account-security',
        title: '3. User Account Security, Credentials, & Authentication',
        content: 'Maintaining the confidentiality and integrity of your account credentials is vital to protecting proprietary research, private blueprints, and institutional communications housed within the Platform.',
        subsections: [
          {
            title: '3.1 Password Complexity & Authentication Standards',
            content: 'You are required to utilize strong, unique passwords adhering to modern security standards (minimum 12 characters including uppercase, lowercase, numerical, and special characters). Multi-Factor Authentication (MFA) is strongly recommended and may be enforced for institutional administrators.'
          },
          {
            title: '3.2 Account Compromise Reporting SLA',
            content: 'You agree to immediately notify Aurenix Security via security@aurenix-research.org within twelve (12) hours of discovering or suspecting any unauthorized access, stolen credentials, security breach, or compromise of your account.'
          },
          {
            title: '3.3 Non-Transferability of Accounts',
            content: 'Scholar accounts, API keys, and workspace tokens are strictly non-transferable. You may not sell, trade, license, lease, or share your access credentials with any third party. Aurenix is not liable for losses resulting from shared or compromised credentials.'
          }
        ]
      },
      {
        id: 'permitted-uses',
        title: '4. Permitted Uses & Operational Scope',
        content: 'Aurenix is engineered specifically to advance scientific discovery, academic collaboration, and industrial implementation in bioenergy, renewable fuels, gasification engineering, and environmental sustainability across Africa and global markets.',
        subsections: [
          {
            title: '4.1 Academic & Scientific Exploration',
            content: 'Users are granted a limited, revocable, non-exclusive, non-transferable license to search, view, read, bookmark, cite, and reference open-access research papers, technical reports, and public biomass feedstocks strictly for academic, educational, and legitimate R&D purposes.'
          },
          {
            title: '4.2 Computational Feedstock Modeling',
            content: 'Utilization of built-in bioenergy calculators, thermochemical conversion modelers, and carbon credit calculators is permitted for preliminary feasibility studies, provided inputs and outputs are verified by licensed engineers before industrial plant construction.'
          },
          {
            title: '4.3 Public Repository Download Fair Use',
            content: 'Scholars may download individual scientific PDFs for personal research archives. Automated bulk harvesting, systemic downloading of entire journal collections, or mirroring the repository on external servers is strictly prohibited under Fair Use guidelines.'
          }
        ]
      },
      {
        id: 'prohibited-conduct',
        title: '5. Strict Prohibited Conduct & Misconduct Policies',
        content: 'To preserve platform integrity, academic trust, and infrastructure security, Aurenix enforces a zero-tolerance policy against malicious behaviors, technical abuse, and research misconduct.',
        subsections: [
          {
            title: '5.1 Automated Data Mining & Scraping Ban',
            content: 'You are strictly prohibited from utilizing web crawlers, bots, spiders, automated data extraction tools, AI training scrapers, or scripts to harvest text, data, user profiles, email addresses, or repository content without express written authorization.'
          },
          {
            title: '5.2 System Integrity & Cyber Security Assaults',
            content: 'Users shall not: (a) Attempt to gain unauthorized access to server infrastructure, cloud databases, or other accounts; (b) Introduce malware, ransomware, viruses, Trojan horses, or corrupted files; (c) Perform Denial of Service (DoS/DDoS) attacks or bypass rate limits; (d) Reverse engineer, decompile, or disassemble platform software.'
          },
          {
            title: '5.3 Predatory Publishing & Fraudulent Network Activity',
            content: 'Submitting papers reproduced from predatory journals, creating fake scholar profiles, fabricating citation metrics, or spamming platform messaging systems with commercial solicitations will result in immediate permanent expulsion.'
          }
        ]
      },
      {
        id: 'submissions-quality',
        title: '6. Scientific Submission Rules & Quality Standards',
        content: 'Scholars uploading research papers, technical datasets, biomass audit reports, or engineering blueprints to Aurenix must uphold the highest standards of academic excellence and verifiable scientific methodology.',
        subsections: [
          {
            title: '6.1 Copyright Ownership Affirmation',
            content: 'By submitting any manuscript or document, you represent and warrant that you are the sole author and copyright owner, or possess express written authorization from all co-authors and copyright holders to publish the work on Aurenix.'
          },
          {
            title: '6.2 Empirical Data Integrity & Verification',
            content: 'All submitted laboratory measurements, gasification yields, feedstock moisture analyses, and calorific calculations must reflect authentic, reproducible empirical data. Falsification, alteration, or selective omission of negative results is forbidden.'
          },
          {
            title: '6.3 Mandatory Feedstock Origin Disclosure',
            content: 'Submissions detailing biomass conversion must disclose biomass feedstock origins, harvest methodology, testing apparatus specifications, and compliance with local environmental protection regulations.'
          }
        ]
      },
      {
        id: 'ip-rights',
        title: '7. Intellectual Property Rights & Licensing Framework',
        content: 'Aurenix respects author intellectual property. We provide a clear licensing framework that protects scholar ownership while enabling global scientific dissemination.',
        subsections: [
          {
            title: '7.1 Retention of Primary Copyright',
            content: 'Authors, research labs, and academic institutions retain 100% of their underlying copyright, patent rights, and intellectual property in all research papers, datasets, and technical blueprints submitted to the Platform.'
          },
          {
            title: '7.2 Non-Exclusive Open-Access Publishing Grant',
            content: 'By uploading content to public or open-access sections of Aurenix, you grant Aurenix a worldwide, non-exclusive, perpetual, royalty-free, transferable license to index, host, reformat, display, translate metadata, and distribute the work for scientific discovery.'
          },
          {
            title: '7.3 Confidential Workspace Isolation',
            content: 'Research documents, unfiled patent blueprints, and alliance drafts stored in private or restricted project workspaces remain strictly confidential. Aurenix employs cryptographic access controls to prevent unauthorized access or public indexing.'
          }
        ]
      },
      {
        id: 'collaboration-alliances',
        title: '8. Research Alliances, Collaboration, & Consortium Governance',
        content: 'Aurenix facilitates inter-university research alliances, multi-institutional clean energy consortia, and public-private innovation partnerships.',
        subsections: [
          {
            title: '8.1 Multilateral Institutional Alliances',
            content: 'Research alliances created within the Platform enable shared document repositories, collaborative drafting, and joint grant applications between participating university departments and industrial partners.'
          },
          {
            title: '8.2 Independent Legal Contracting',
            content: 'Aurenix serves solely as an enabling technological platform. Formal joint venture agreements, commercial IP licensing splits, equity shares, and institutional non-disclosure agreements (NDAs) must be executed directly between participating entities.'
          },
          {
            title: '8.3 Workspace Non-Disclosure Obligations',
            content: 'Members joining private project workspaces agree to treat all pre-publication data, preliminary lab results, and shared technical specifications as strictly confidential under workspace NDA rules.'
          }
        ]
      },
      {
        id: 'grants-funding',
        title: '9. Pilot Grants, Funding Matchmaking, & Financial Disclaimers',
        content: 'The Platform syndicates grant opportunities, innovation awards, and industrial pilot funding listings from international development agencies, university funds, and clean energy investors.',
        subsections: [
          {
            title: '9.1 Syndicated Opportunity Listings',
            content: 'Grant listings displayed on Aurenix represent syndicated partner announcements. Aurenix conducts due diligence on grant providers but does not guarantee the availability, accuracy, or award outcome of any listed funding opportunity.'
          },
          {
            title: '9.2 Direct Grantor-Grantee Relationship',
            content: 'Grant applications, financial disbursements, compliance reporting, and legal grant contracts are handled directly between the funder and the awarded research scholar or institution.'
          },
          {
            title: '9.3 Financial Brokerage Disclaimer',
            content: 'Aurenix is not a licensed financial broker, investment advisor, or escrow agent. We collect no commission or finder fees on grant disbursements unless under explicit contractual pilot management agreements.'
          }
        ]
      },
      {
        id: 'research-ethics',
        title: '10. Bioenergy Research Ethics & Environmental Safety',
        content: 'All energy research, biomass harvesting studies, and bioenergy pilot projects conducted or published through Aurenix must comply with strict ethical, environmental, and socio-economic standards.',
        subsections: [
          {
            title: '10.1 Feedstock Sourcing & Nagoya Protocol',
            content: 'Research involving biological samples, genetic resources, or indigenous plant species must comply with the Nagoya Protocol on Access and Benefit-sharing, ensuring fair and equitable sharing of benefits.'
          },
          {
            title: '10.2 Food Security Protection Clause',
            content: 'Bioenergy feedstock research promoting the conversion of primary food crops (e.g. maize, cassava) to bioethanol must include socio-economic food security impact evaluations to ensure local agricultural stability.'
          },
          {
            title: '10.3 Environmental Protection & Emissions',
            content: 'Pilot plant blueprints and thermochemical testing must verify compliance with local air quality standards, wastewater treatment regulations, and hazardous material containment protocols.'
          }
        ]
      },
      {
        id: 'ai-features',
        title: '11. Artificial Intelligence Features & Predictive Engine Terms',
        content: 'Aurenix incorporates advanced Artificial Intelligence (AI) models for research summarization, feedstock compatibility modeling, semantic paper searching, and automated insight generation.',
        subsections: [
          {
            title: '11.1 Analytical Nature of AI Outputs',
            content: 'AI-generated summaries, automated key takeaways, and biomass conversion estimates are computational analytical aids. They do not constitute certified engineering calculations or formal peer-reviewed conclusions.'
          },
          {
            title: '11.2 Mandatory Engineering Validation',
            content: 'Before implementing any bioenergy plant design, gasifier dimension, or feedstock mixture derived from AI recommendations, users must perform independent physical laboratory testing and obtain certified engineering validation.'
          },
          {
            title: '11.3 AI Model Training Safeguards',
            content: 'Aurenix explicitly commits that private scholar research documents, unsubmitted manuscripts, and private alliance discussions will never be used to train public foundation models without explicit written consent.'
          }
        ]
      },
      {
        id: 'telemetry-storage',
        title: '12. Telemetry, Audit Logging, & Cloud Infrastructure',
        content: 'We maintain cloud infrastructure to deliver high-performance document indexing, secure access control, and platform reliability.',
        subsections: [
          {
            title: '12.1 Security Audit Logging',
            content: 'To prevent unauthorized repository access, system activities (including authentication attempts, document downloads, and administrative changes) are logged with timestamp and IP address metadata.'
          },
          {
            title: '12.2 Performance Optimization Telemetry',
            content: 'Anonymized technical telemetry is processed to monitor server load, optimize database search indexing, and ensure 99.9% platform availability across low-bandwidth African mobile networks.'
          }
        ]
      },
      {
        id: 'third-party-integrations',
        title: '13. Third-Party Integrations & External Repositories',
        content: 'The Platform integrates third-party APIs and scientific infrastructure including ORCID iD, DOI resolvers (CrossRef, DataCite), Google Scholar, and university repository mirrors.',
        subsections: [
          {
            title: '13.1 Academic Identifier Sync',
            content: 'Your interaction with third-party identifier systems is subject to their respective terms of service and privacy policies. Aurenix is not responsible for data sync failures originating from third-party APIs.'
          },
          {
            title: '13.2 External Repository Links',
            content: 'Links to external university websites, journal portals, or partner servers are provided for scholar convenience. Aurenix does not endorse or accept responsibility for external content accuracy.'
          }
        ]
      },
      {
        id: 'service-availability',
        title: '14. Service Availability, Maintenance, & SLAs',
        content: 'We strive to maintain continuous availability of the Aurenix platform for scholars worldwide.',
        subsections: [
          {
            title: '14.1 Scheduled Maintenance Windows',
            content: 'Routine server updates, security patching, and database optimizations are performed during announced low-traffic maintenance windows. Advance notification will be posted on the dashboard.'
          },
          {
            title: '14.2 Force Majeure & Infrastructure Outages',
            content: 'Aurenix disclaims liability for service interruptions, data synchronization delays, or access failures resulting from internet backbone disruptions, cloud provider outages, severe weather, or acts of state.'
          }
        ]
      },
      {
        id: 'termination-suspension',
        title: '15. Account Suspension, Content Deletion, & Termination',
        content: 'Aurenix reserves the right to restrict, suspend, or permanently terminate user accounts under specific circumstances to protect the community.',
        subsections: [
          {
            title: '15.1 Grounds for Immediate Account Termination',
            content: 'Accounts will be terminated immediately upon confirmation of: (a) Plagiarism or data fabrication; (b) Malicious hacking or reverse engineering attempts; (c) Persistent harassment of researchers; (d) Violation of international sanctions laws.'
          },
          {
            title: '15.2 Post-Termination Data Offboarding',
            content: 'Upon account termination, access privileges cease immediately. Scholars may request a 30-day window to export their original self-authored research uploads, after which private data will be permanently purged from active servers.'
          }
        ]
      },
      {
        id: 'limitation-liability',
        title: '16. Limitation of Liability & Exclusion of Consequential Damages',
        content: 'To the maximum extent permitted under applicable law, Aurenix Research Foundation, its directors, officers, employees, partners, and licensors shall not be held liable for any damages arising from platform usage.',
        subsections: [
          {
            title: '16.1 Monetary Liability Cap',
            content: 'In no event shall the aggregate cumulative liability of Aurenix exceeding the total amount paid by you to Aurenix in the twelve (12) months preceding the claim, or one hundred US dollars ($100.00 USD), whichever is lesser.'
          },
          {
            title: '16.2 Exclusion of Consequential & Indirect Damages',
            content: 'Aurenix shall not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of research data, lost pilot revenue, plant construction failures, or academic reputation damage.'
          }
        ]
      },
      {
        id: 'indemnification',
        title: '17. Indemnification & Defense Obligations',
        content: 'You agree to defend, indemnify, and hold harmless Aurenix Research Foundation, its affiliates, university partners, officers, and staff from and against any third-party claims, liabilities, losses, damages, costs, or legal fees.',
        subsections: [
          {
            title: '17.1 Indemnification Triggers',
            content: 'Indemnification obligations apply to claims arising from: (a) Your breach of these Terms; (b) Your submitted research violating third-party copyright or patent rights; (c) Your unauthorized deployment of bioenergy blueprints.'
          },
          {
            title: '17.2 Legal Defense Rights',
            content: 'Aurenix reserves the right to assume the exclusive defense and control of any matter subject to indemnification by you, at your sole expense, and you agree to cooperate fully with our legal counsel.'
          }
        ]
      },
      {
        id: 'dispute-resolution',
        title: '18. Dispute Resolution, Binding Arbitration, & Class Action Waiver',
        content: 'We encourage informal resolution of any legal concerns before resorting to formal legal proceedings.',
        subsections: [
          {
            title: '18.1 Mandatory Pre-Arbitration Informal Conciliation',
            content: 'Prior to initiating arbitration or legal proceedings, you and Aurenix agree to attempt to resolve any dispute informally by submitting a detailed written notice of dispute to legal@aurenix-research.org and engaging in good-faith negotiation for at least sixty (60) days.'
          },
          {
            title: '18.2 Binding International Arbitration',
            content: 'Any unresolved dispute shall be settled by binding individual arbitration conducted in accordance with the UNCITRAL Arbitration Rules by a single neutral arbitrator appointed in accordance with said rules.'
          },
          {
            title: '18.3 Class Action Waiver',
            content: 'YOU AND AURENIX AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.'
          }
        ]
      },
      {
        id: 'governing-law',
        title: '19. Governing Law & Judicial Jurisdiction',
        content: 'These Terms and any non-contractual obligations arising out of or in connection with them shall be governed by and construed in accordance with international commercial legal principles and clean energy consortium framework guidelines.',
        subsections: [
          {
            title: '19.1 Choice of Forum',
            content: 'For any judicial proceedings permitted outside arbitration, the parties submit to the exclusive jurisdiction of international commercial arbitration centers in Lagos, Nigeria or Nairobi, Kenya.'
          },
          {
            title: '19.2 Injunctions & Emergency Legal Relief',
            content: 'Nothing in these Terms prevents Aurenix from seeking emergency injunctive relief in any court of competent jurisdiction to protect its intellectual property, trade secrets, or server security.'
          }
        ]
      },
      {
        id: 'amendments-versioning',
        title: '20. Policy Amendments, Version Control, & Re-Acceptance',
        content: 'We reserve the right to amend, update, or modify these Terms and Conditions at any time to reflect changes in law, technology, or platform features.',
        subsections: [
          {
            title: '20.1 Advance Modification Notification',
            content: 'When material revisions are made, we will update the version number (e.g. from 1.0 to 2.0), post an announcement banner on the dashboard, and send an email notification to registered scholars at least thirty (30) days prior to the effective date.'
          },
          {
            title: '20.2 Mandatory Re-Consent Requirement',
            content: 'Following a major version update, users will be prompted to review and re-accept the updated Terms upon their next login. Continued platform access requires explicit confirmation.'
          }
        ]
      },
      {
        id: 'severability-contacts',
        title: '21. Severability, Entire Agreement, & Official Contacts',
        content: 'Final structural legal provisions governing the interpretation and execution of this Agreement.',
        subsections: [
          {
            title: '21.1 Severability of Provisions',
            content: 'If any provision of these Terms is found to be invalid, illegal, or unenforceable by an arbitrator or court of competent jurisdiction, such provision shall be enforced to the maximum extent permissible, and the remaining provisions shall remain in full force and effect.'
          },
          {
            title: '21.2 Entire Legal Agreement',
            content: 'These Terms, together with our Privacy Policy, Cookie Policy, and Community Guidelines, constitute the entire agreement between you and Aurenix regarding platform usage, superseding any prior agreements or understandings.'
          },
          {
            title: '21.3 Official Legal Governance Contact',
            content: 'Formal legal notices, copyright claims, and regulatory inquiries must be directed to: Aurenix Legal Governance Board | Email: legal@aurenix-research.org | Bioenergy Innovation Hub, Victoria Island, Lagos, Nigeria.'
          }
        ]
      }
    ]
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    version: '2.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Comprehensive legal policy governing how Aurenix Research collects, processes, stores, encrypts, transfers, and protects scholar personal data, academic credentials, research interaction telemetry, and institutional profile metadata under GDPR, CCPA, NDPR, and international data protection standards.',
    iconName: 'ShieldCheck',
    sections: [
      {
        id: 'privacy-commitment',
        title: '1. Introduction & Data Protection Principles',
        content: 'Aurenix Research Foundation ("Aurenix", "we", "us", or "our") is committed to safeguarding the privacy, confidentiality, and security of researchers, scholars, students, and institutional partners who utilize our bioenergy research repository and collaboration platform. We operate under strict principles of data minimization, transparency, purpose limitation, and robust cryptographic protection.\n\nThis Privacy Policy explains in detail how we collect, process, store, share, and protect your personal data when you interact with our web applications, APIs, research databases, and user communities. It also details your statutory rights under global data protection laws.',
        subsections: [
          {
            title: '1.1 Fundamental Zero Data Sale Guarantee',
            content: 'We explicitly pledge that Aurenix NEVER sells, rents, leases, or monetizes scholar personal data, browsing histories, research interests, or email addresses to commercial advertisers, data brokers, or third-party marketing firms.'
          },
          {
            title: '1.2 Regulatory Compliance Framework Alignment',
            content: 'Our data protection architecture is engineered to comply with leading global privacy regulations, including the European Union General Data Protection Regulation (EU GDPR), the UK GDPR, the California Consumer Privacy Act (CCPA/CPRA), the Nigeria Data Protection Act (NDPA/NDPR), Kenya Data Protection Act, and African Union Data Protection Frameworks.'
          },
          {
            title: '1.3 Scope of This Policy',
            content: 'This policy applies to all personal data processed through our website, web app, mobile interfaces, API endpoints, email communications, and institutional alliance portals.'
          }
        ]
      },
      {
        id: 'data-collected',
        title: '2. Categories of Personal Data Collected',
        content: 'We collect several distinct categories of information to provide seamless scientific discovery, scholar verification, security enforcement, and collaborative matchmaking.',
        subsections: [
          {
            title: '2.1 Profile & Identity Data',
            content: 'Directly provided information including full legal name, academic title (e.g., Dr., Prof.), ORCID iD, primary email address, institutional affiliation (university, research institute, corporation), department, country of residence, academic bio, and research focus tags.'
          },
          {
            title: '2.2 Technical Telemetry & Identifiers',
            content: 'Automatically collected data including IP address, device hardware model, operating system version, browser type and language, unique session tokens, referrer URLs, screen resolution, and time zone settings.'
          },
          {
            title: '2.3 Research Activity & Content Logs',
            content: 'Interaction data including saved papers, bookmarked feedstock studies, search query history, PDF download logs, computational model inputs, project alliance applications, direct messaging metadata, and consultation request histories.'
          },
          {
            title: '2.4 Security & Audit Logs',
            content: 'Authentication timestamps, multi-factor authentication verifications, password change records, API access tokens, rate-limit enforcement counters, and administrative authorization logs.'
          }
        ]
      },
      {
        id: 'collection-methods',
        title: '3. Methods & Mechanics of Data Collection',
        content: 'Personal data is acquired through three primary channels: direct submission by users, automated system logging, and federated academic single-sign-on (SSO) integrations.',
        subsections: [
          {
            title: '3.1 Direct Submissions & Form Registration',
            content: 'Data you input voluntarily when creating an account, editing your scholar profile, submitting a research paper, filling out consultation forms, or contacting customer support.'
          },
          {
            title: '3.2 Automated Real-Time System Telemetry',
            content: 'Information captured automatically by our web servers and performance monitoring tools when you navigate the platform, view research dashboards, or execute biomass calculation algorithms.'
          },
          {
            title: '3.3 Federated OAuth & Academic Identifier Sync',
            content: 'Metadata synchronized when you authenticate using third-party academic identity providers such as ORCID, Google Scholar, or university Shibboleth/SAML single-sign-on systems.'
          }
        ]
      },
      {
        id: 'lawful-bases',
        title: '4. Lawful Bases for Data Processing Under Global Laws',
        content: 'Under Article 6 of the GDPR and equivalent data protection statutes, we rely on specific lawful bases to collect and process your personal information.',
        subsections: [
          {
            title: '4.1 Express Consent (Art. 6(1)(a) GDPR)',
            content: 'We process data based on your explicit consent when you register an account, subscribe to research newsletters, opt into AI recommendation profiling, or accept optional cookies.'
          },
          {
            title: '4.2 Performance of a Contract (Art. 6(1)(b) GDPR)',
            content: 'Processing required to fulfill our legal obligations under our Terms and Conditions, including delivering paper downloads, facilitating workspace collaboration, and maintaining account access.'
          },
          {
            title: '4.3 Legitimate Scientific Interest (Art. 6(1)(f) GDPR)',
            content: 'Processing necessary for our legitimate interests in advancing scientific research, protecting platform security against cyber threats, auditing research integrity, and optimizing repository performance.'
          },
          {
            title: '4.4 Legal Obligation (Art. 6(1)(c) GDPR)',
            content: 'Processing required to comply with statutory tax obligations, legal subpoenas, fraud investigations, or regulatory compliance mandates.'
          }
        ]
      },
      {
        id: 'purposes-of-use',
        title: '5. Specific Purposes of Personal Data Processing',
        content: 'Every data point collected serves a defined, legitimate operational or scientific purpose within the Aurenix ecosystem.',
        subsections: [
          {
            title: '5.1 Scholar Identity Verification & Citation Trust',
            content: 'Validating scholar credentials and ORCID links to ensure repository papers originate from legitimate researchers and maintaining accurate scientific citation records.'
          },
          {
            title: '5.2 Personalized Research Recommendation Engine',
            content: 'Analyzing research tags and reading history to recommend relevant bioenergy papers, feedstock datasets, upcoming pilot grants, and potential co-author matches.'
          },
          {
            title: '5.3 Collaboration Matchmaking & Alliances',
            content: 'Connecting university researchers with compatible industrial off-takers and consortium grants based on geographic focus and technical specialization.'
          },
          {
            title: '5.4 Security Auditing & Anomaly Detection',
            content: 'Monitoring telemetry to detect brute-force login attempts, unauthorized API web scraping, credential stuffing, or malware injection.'
          }
        ]
      },
      {
        id: 'security-measures',
        title: '6. Data Security Standards & Cryptographic Architecture',
        content: 'We deploy defense-in-depth cybersecurity controls to protect scholar data against unauthorized access, disclosure, alteration, or destruction.',
        subsections: [
          {
            title: '6.1 Encryption Protocols (In-Transit & At-Rest)',
            content: 'All data transmitted between your browser and our servers is encrypted using Transport Layer Security (TLS 1.3). Data at rest within our cloud databases is encrypted using AES-256 military-grade encryption.'
          },
          {
            title: '6.2 Zero-Trust Access Control & Role-Based Security',
            content: 'Database access is restricted strictly to authorized engineering personnel using zero-trust access architecture, hardware security keys, and least-privilege role-based access controls (RBAC).'
          },
          {
            title: '6.3 Vulnerability Management & Penetration Testing',
            content: 'Our codebase undergoes continuous automated vulnerability scanning, static code security analysis (SAST), and annual independent third-party penetration testing.'
          }
        ]
      },
      {
        id: 'cross-border-transfers',
        title: '7. International Cross-Border Data Transfers',
        content: 'Aurenix connects African research centers with global universities. Consequently, your data may be processed on servers located outside your home country.',
        subsections: [
          {
            title: '7.1 Standard Contractual Clauses (SCCs)',
            content: 'For data transfers from the European Economic Area (EEA), UK, or African jurisdictions to third countries, we utilize European Commission Standard Contractual Clauses (SCCs) and binding corporate rules to guarantee equivalent data protection.'
          },
          {
            title: '7.2 Sovereign Regional Cloud Storage Nodes',
            content: 'We maintain primary cloud hosting nodes in Europe and Africa, ensuring data residency compliance for institutional partners subject to localized data localization statutes.'
          }
        ]
      },
      {
        id: 'third-party-sharing',
        title: '8. Data Sharing, Sub-processors, & Third Parties',
        content: 'We maintain strict oversight of all third-party service providers who assist in operating our scientific infrastructure.',
        subsections: [
          {
            title: '8.1 Authorized Sub-processors',
            content: 'We share limited data with vetted infrastructure vendors, including: (a) Encrypted cloud database hosts; (b) Email dispatch servers for transactional alerts; (c) DOI registration agencies (CrossRef/DataCite); (d) ORCID API resolvers.'
          },
          {
            title: '8.2 Institutional Alliance Partners',
            content: 'When you explicitly apply to join an institutional alliance or grant program, your submitted profile and proposal materials are shared with the designated university selection committee.'
          },
          {
            title: '8.3 Mandatory Statutory Disclosures',
            content: 'We may disclose personal data to legal or law enforcement authorities only when compelled by a valid, binding subpoena, court order, or search warrant issued by a court of competent jurisdiction.'
          }
        ]
      },
      {
        id: 'retention-schedules',
        title: '9. Data Retention Schedules & Archival Policies',
        content: 'We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy or as mandated by law.',
        subsections: [
          {
            title: '9.1 Active Profile Retention',
            content: 'Personal profile data is retained while your account remains active. Following account deletion, profile data is permanently erased from production databases within thirty (30) days.'
          },
          {
            title: '9.2 Permanent Citation Archival',
            content: 'Published scientific research papers, author names, and citation metadata are preserved permanently in open scientific archives under international academic repository standards.'
          },
          {
            title: '9.3 Technical Log Purging',
            content: 'Security audit logs, IP telemetry, and transient API connection records are automatically rotated and permanently purged after ninety (90) days.'
          }
        ]
      },
      {
        id: 'user-rights-detail',
        title: '10. Comprehensive Data Subject Rights (GDPR, CCPA, NDPR)',
        content: 'Regardless of your geographical location, Aurenix guarantees fundamental privacy rights over your personal information.',
        subsections: [
          {
            title: '10.1 Right of Access & Data Portability',
            content: 'You have the right to request a complete copy of your personal data held by Aurenix in a structured, commonly used, and machine-readable format (JSON or CSV).'
          },
          {
            title: '10.2 Right to Rectification & Correction',
            content: 'You can update, correct, or complete inaccurate or incomplete profile metadata at any time via your account Settings page or by contacting support.'
          },
          {
            title: '10.3 Right to Erasure ("Right to be Forgotten")',
            content: 'You have the right to request permanent deletion of your account and associated personal data, subject to legal citation archival exceptions.'
          },
          {
            title: '10.4 Right to Restrict & Object to Processing',
            content: 'You may object to the processing of your data for research analytics, withdraw consent for promotional communications, or restrict specific automated matching algorithms.'
          }
        ]
      },
      {
        id: 'dar-procedure',
        title: '11. Data Access Request (DAR) Procedure & SLAs',
        content: 'We provide streamlined channels for scholars to exercise their legal privacy rights without friction.',
        subsections: [
          {
            title: '11.1 Submitting a Formal Request',
            content: 'To submit a Data Access Request, Data Deletion Request, or Privacy Complaint, email our Data Protection Officer at privacy@aurenix-research.org or submit a request via our Contact Section.'
          },
          {
            title: '11.2 Identity Verification Protocol',
            content: 'To protect scholar privacy, we must verify your identity before fulfilling data requests. This may require logging into your authenticated account or providing institutional email verification.'
          },
          {
            title: '11.3 Statutory Response SLA',
            content: 'We acknowledge privacy requests within forty-eight (48) hours and complete fulfillment within thirty (30) calendar days, free of charge.'
          }
        ]
      },
      {
        id: 'cookie-mechanics',
        title: '12. Cookies, Tracking Technologies, & Preference Controls',
        content: 'We utilize cookies and local browser storage technologies to maintain secure user sessions and remember your visual display preferences.',
        subsections: [
          {
            title: '12.1 Categorization of Platform Cookies',
            content: 'We deploy: (a) Essential Authentication Cookies (strictly required for login); (b) Security Cookies (csrf protection); (c) Preference Cookies (remembering theme settings); (d) Performance Telemetry Cookies.'
          },
          {
            title: '12.2 Granular Cookie Management',
            content: 'You can modify your cookie settings at any time using our Cookie Preference Manager accessible from the footer, or by adjusting your browser cookie settings.'
          }
        ]
      },
      {
        id: 'ai-privacy',
        title: '13. Artificial Intelligence & Data Privacy Safeguards',
        content: 'AI technology integrated into Aurenix is governed by strict privacy controls to prevent proprietary research leaks.',
        subsections: [
          {
            title: '13.1 Non-Training Guarantee for Private Data',
            content: 'Unpublished draft manuscripts, private workspace documents, direct messages, and private alliance proposals are explicitly excluded from AI model training pipelines.'
          },
          {
            title: '13.2 Automated Matchmaking Opt-Out',
            content: 'Scholars can disable automated AI project matching in their profile settings to prevent their profile from being indexed by predictive recommendation algorithms.'
          }
        ]
      },
      {
        id: 'childrens-privacy',
        title: '14. Children\'s & Minor Data Protection Safeguards',
        content: 'Aurenix is an institutional scientific research network not directed at children or minors.',
        subsections: [
          {
            title: '14.1 Age Threshold Enforcement',
            content: 'We do not knowingly collect or solicit personal information from anyone under eighteen (18) years of age. Accounts registered by minors will be terminated.'
          },
          {
            title: '14.2 Discovery & Immediate Erasure Procedure',
            content: 'If we learn that we have inadvertently collected personal data from a minor under 18 without verified parental/institutional consent, we will delete that data immediately.'
          }
        ]
      },
      {
        id: 'breach-notification',
        title: '15. Security Incident & Data Breach Protocols',
        content: 'We maintain incident response procedures to address potential security events swiftly and transparently.',
        subsections: [
          {
            title: '15.1 72-Hour Supervisory Authority Notification',
            content: 'In the event of a confirmed security incident impacting scholar personal data, we will notify relevant Data Protection Authorities (DPAs) within seventy-two (72) hours of confirmation.'
          },
          {
            title: '15.2 Direct Affected Scholar Notification',
            content: 'If a data breach presents a high risk to scholar rights, we will notify affected users directly via email and platform notification with details of the event and protective measures.'
          }
        ]
      },
      {
        id: 'institutional-privacy',
        title: '16. Institutional & Enterprise Data Protection Agreements',
        content: 'For university departments, research labs, and enterprise partners, we offer specialized privacy arrangements.',
        subsections: [
          {
            title: '16.1 Joint Controller & Processor Agreements',
            content: 'We execute formal Data Processing Agreements (DPAs) with university research divisions detailing specific data handling workflows, audit rights, and co-controller duties.'
          },
          {
            title: '16.2 Cryptographic Workspace Isolation',
            content: 'Enterprise university workspaces feature isolated tenant databases and customer-managed encryption keys for enhanced confidential research security.'
          }
        ]
      },
      {
        id: 'policy-updates',
        title: '17. Policy Revisions, Version Control, & Notifications',
        content: 'We periodically review and update this Privacy Policy to ensure alignment with evolving data protection laws and technological advancements.',
        subsections: [
          {
            title: '17.1 Notice of Material Revisions',
            content: 'When material updates are implemented, we will update the version number (e.g. from 1.0 to 2.0), display a prominent banner on the platform, and notify scholars by email at least thirty (30) days in advance.'
          },
          {
            title: '17.2 Historical Archive Accessibility',
            content: 'Prior versions of this Privacy Policy are archived and accessible upon request for audit transparency and historical compliance verification.'
          }
        ]
      },
      {
        id: 'dpo-contact',
        title: '18. Data Protection Officer (DPO) & Regulatory Contacts',
        content: 'For questions, data requests, or regulatory inquiries regarding our privacy practices, please contact our dedicated Privacy Office.',
        subsections: [
          {
            title: '18.1 Contact Details for Privacy Office',
            content: 'Data Protection Officer | Aurenix Research Foundation | Email: privacy@aurenix-research.org | Location: Bioenergy Innovation Hub, Victoria Island, Lagos, Nigeria & Science Offices in Nairobi, Kenya.'
          },
          {
            title: '18.2 Right to Lodge a Regulatory Complaint',
            content: 'You have the statutory right to lodge a complaint with your local Data Protection Authority (e.g., European Data Protection Supervisor, NDPC Nigeria, ODPC Kenya) if you believe your privacy rights have been infringed.'
          }
        ]
      }
    ]
  },
  cookies: {
    id: 'cookies',
    title: 'Cookie Policy',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Detailed overview of cookie technologies employed on Aurenix, cookie categories, and controls for managing preferences.',
    iconName: 'Cookie',
    sections: [
      {
        id: 'what-are-cookies',
        title: '1. What Cookies Are',
        content: 'Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, remember your session authentication, preserve theme settings, and provide usage insights.'
      },
      {
        id: 'types-used',
        title: '2. Types of Cookies Used',
        content: 'Aurenix utilizes six specific categories of cookies: (1) Essential Cookies (required for site navigation); (2) Authentication Cookies (maintains secure login state); (3) Analytics Cookies (measures page views and paper downloads); (4) Performance Cookies (optimizes asset loading speed); (5) Preference Cookies (remembers dark/light mode and layout settings); (6) Third-Party Cookies (used for embedded maps, videos, and academic indexing).'
      },
      {
        id: 'duration',
        title: '3. Cookie Duration',
        content: 'Session cookies expire automatically when you close your browser. Persistent cookies remain stored on your device for up to 14 days or until manually cleared or adjusted in cookie settings.'
      },
      {
        id: 'management',
        title: '4. How to Manage & Disable Cookies',
        content: 'You can adjust your cookie preferences at any time using our built-in Cookie Preference Manager accessible from the website footer or Settings page. Alternatively, browser settings allow you to block or delete cookies universally.'
      }
    ]
  },
  community: {
    id: 'community',
    title: 'Community Guidelines',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Standards of conduct, academic integrity expectations, and anti-harassment rules for all Aurenix platform members.',
    iconName: 'Users',
    sections: [
      {
        id: 'academic-integrity',
        title: '1. Academic Integrity & Research Standards',
        content: 'Members of the Aurenix Research Network pledge to maintain absolute integrity in scientific reporting. All claims, datasets, biomass test results, and conversion efficiencies must represent honest, reproducible scientific work.'
      },
      {
        id: 'respectful-comm',
        title: '2. Respectful Communication & Anti-Harassment',
        content: 'We foster an inclusive, collaborative environment for scholars, students, industry leaders, and policymakers. Harassment, discrimination, hate speech, ad hominem attacks, or abusive messaging in direct chats or project forums will result in immediate ban.'
      },
      {
        id: 'prohibited-content',
        title: '3. Prohibited Content & Behavior',
        content: 'Prohibited actions include: (a) Plagiarism or submitting uncredited work of others; (b) Uploading fraudulent or fabricated laboratory measurements; (c) Spamming members with commercial solicitation unrelated to bioenergy; (d) Attempting to bypass workspace security.'
      },
      {
        id: 'reporting-moderation',
        title: '4. Reporting & Moderation Mechanisms',
        content: 'Aurenix maintains active peer moderation and user reporting systems. If you observe research misconduct or abusive behavior, use the built-in "Report" button on profiles or papers. Our moderation board reviews reports within 24 hours.'
      }
    ]
  },
  copyright: {
    id: 'copyright',
    title: 'Copyright and Intellectual Property Policy',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Intellectual property ownership rules, fair use guidelines, platform licensing, and DMCA takedown procedures.',
    iconName: 'Scale',
    sections: [
      {
        id: 'ownership',
        title: '1. Ownership of Submitted Research & Content',
        content: 'Scholars, institutional authors, and research entities retain full copyright and intellectual property rights over papers, patents, blueprints, and analytical models contributed to Aurenix Research.'
      },
      {
        id: 'dmca-takedown',
        title: '2. DMCA & Takedown Request Process',
        content: 'If you believe your copyrighted work has been improperly uploaded without authorization, submit a written DMCA Takedown Notice to our Designated IP Agent at copyright@aurenix-research.org including: (a) Identification of the copyrighted work; (b) Exact URL or document ID on Aurenix; (c) Your contact info; (d) Statement of good-faith belief.'
      },
      {
        id: 'fair-use',
        title: '3. Fair Use Guidelines for Scientific Material',
        content: 'Scholars may excerpt brief passages, charts, or summaries from open papers for academic commentary, peer review, teaching, or non-commercial research, provided proper attribution and citation are explicitly included.'
      },
      {
        id: 'license-grant',
        title: '4. License Grants to Aurenix Platform',
        content: 'By uploading public papers, authors grant Aurenix a non-exclusive, worldwide, royalty-free license to archive, index in search, display metadata, and generate AI research summaries to foster scientific discovery.'
      }
    ]
  },
  ethics: {
    id: 'ethics',
    title: 'Research Ethics Policy',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Ethical research standards, bioenergy environmental impact guidelines, conflict of interest disclosures, and anti-plagiarism rules.',
    iconName: 'FlaskConical',
    sections: [
      {
        id: 'ethical-conduct',
        title: '1. Ethical Conduct in Energy & Environmental Research',
        content: 'Research published or conducted through Aurenix must adhere to fundamental ethical tenets regarding environmental protection, biodiversity conservation, human safety, and community consultation in energy projects.'
      },
      {
        id: 'impact-standards',
        title: '2. Human & Environmental Impact Assessment Standards',
        content: 'Studies evaluating agricultural waste, municipal solid waste, or biomass feedstocks must verify that feedstock sourcing does not compromise local food security, cause deforestation, or violate indigenous community rights.'
      },
      {
        id: 'conflict-disclosure',
        title: '3. Conflict of Interest Disclosure Requirements',
        content: 'Authors and grant candidates must explicitly disclose financial interests, commercial affiliations, or corporate funding sources that could influence research findings or pilot study outcomes.'
      },
      {
        id: 'plagiarism-rules',
        title: '4. Falsification, Fabrication & Plagiarism Rules',
        content: 'Data fabrication, selective reporting to obscure negative environmental impacts, and plagiarism are grounds for permanent expulsion from the Aurenix Research Network and notification of affiliated academic institutions.'
      }
    ]
  },
  disclaimer: {
    id: 'disclaimer',
    title: 'Disclaimer Notice',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Important legal notices regarding scientific information accuracy, engineering advisory limitations, and platform liability.',
    iconName: 'AlertTriangle',
    sections: [
      {
        id: 'scientific-accuracy',
        title: '1. Research Information Accuracy Disclaimer',
        content: 'Scientific papers, blueprints, datasets, and AI summaries published on Aurenix are provided "as is" for educational, academic, and research exploration. Authors and Aurenix do not guarantee commercial viability or error-free calculations.'
      },
      {
        id: 'funding-disclaimer',
        title: '2. Grant & Funding Disclaimer',
        content: 'Grant opportunities, matchings, and alliance listings displayed on Aurenix represent informational syndications and partner announcements. Aurenix is not a direct financial guarantor unless explicitly stated under formal pilot contract.'
      },
      {
        id: 'advisory-disclaimer',
        title: '3. Investment, Financial & Energy Advisory Disclaimer',
        content: 'Information on Aurenix does NOT constitute formal financial advice, investment brokerage, or certified engineering endorsement for commercial power plant construction until formal advisory contracts are executed.'
      },
      {
        id: 'third-party-disclaimer',
        title: '4. Third-Party Links & Services Disclaimer',
        content: 'The Platform contains links to external journal databases, university repositories, and government energy registries. Aurenix is not responsible for external content accuracy or privacy practices.'
      },
      {
        id: 'platform-availability',
        title: '5. Platform Availability & Liability Limits',
        content: 'Aurenix strives for 99.9% service uptime. However, we disclaim liability for temporary server outages, data sync delays, or third-party API interruptions.'
      }
    ]
  },
  'community-guidelines': {
    id: 'community-guidelines',
    title: 'Community Guidelines',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Standards of conduct, academic integrity expectations, and anti-harassment rules for all Aurenix platform members.',
    iconName: 'Users',
    sections: [
      {
        id: 'academic-integrity',
        title: '1. Academic Integrity & Research Standards',
        content: 'Members of the Aurenix Research Network pledge to maintain absolute integrity in scientific reporting. All claims, datasets, biomass test results, and conversion efficiencies must represent honest, reproducible scientific work.'
      },
      {
        id: 'respectful-comm',
        title: '2. Respectful Communication & Anti-Harassment',
        content: 'We foster an inclusive, collaborative environment for scholars, students, industry leaders, and policymakers. Harassment, discrimination, hate speech, ad hominem attacks, or abusive messaging in direct chats or project forums will result in immediate ban.'
      },
      {
        id: 'plagiarism-policy',
        title: '3. Plagiarism & Misconduct Rules',
        content: 'Prohibited actions include: (a) Plagiarism or submitting uncredited work of others; (b) Uploading fraudulent or fabricated laboratory measurements; (c) Spamming members with commercial solicitation unrelated to bioenergy; (d) Attempting to bypass workspace security.'
      },
      {
        id: 'reporting-moderation',
        title: '4. Misconduct Reporting & Moderation',
        content: 'Aurenix maintains active peer moderation and user reporting systems. If you observe research misconduct or abusive behavior, use the built-in "Report" button on profiles or papers. Our moderation board reviews reports within 24 hours.'
      }
    ]
  },
  'research-ethics': {
    id: 'research-ethics',
    title: 'Research Ethics Policy',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Ethical research standards, bioenergy environmental impact guidelines, conflict of interest disclosures, and AI usage requirements.',
    iconName: 'FlaskConical',
    sections: [
      {
        id: 'transparency',
        title: '1. Transparency Requirements',
        content: 'All research methodologies, biomass feedstock origins, laboratory conditions, and statistical processing steps must be disclosed transparently to ensure peer reproducibility across African and global research institutions.'
      },
      {
        id: 'ethical-practices',
        title: '2. Ethical Research Practices & Environmental Responsibility',
        content: 'Research published or conducted through Aurenix must adhere to fundamental ethical tenets regarding environmental protection, biodiversity conservation, human safety, and community consultation in energy projects.'
      },
      {
        id: 'ai-disclosure',
        title: '3. AI Usage & Disclosure Requirements',
        content: 'Authors utilizing AI tools for research synthesis, statistical modeling, or draft writing must explicitly state the extent of AI involvement in their manuscript methodology section.'
      },
      {
        id: 'conflict-disclosure',
        title: '4. Conflicts of Interest & Citation Standards',
        content: 'Authors and grant candidates must explicitly disclose financial interests, commercial affiliations, or corporate funding sources. Citations must accurately credit original scholars.'
      }
    ]
  },
  'intellectual-property': {
    id: 'intellectual-property',
    title: 'Intellectual Property Policy',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Intellectual property ownership rules, fair use guidelines, platform licensing, and content removal procedures.',
    iconName: 'Scale',
    sections: [
      {
        id: 'ownership-rights',
        title: '1. Ownership Rights & Copyright Policy',
        content: 'Scholars, institutional authors, and research entities retain full copyright and intellectual property rights over papers, patents, blueprints, and analytical models contributed to Aurenix Research.'
      },
      {
        id: 'licensing-policy',
        title: '2. Licensing Policy & Platform Grant',
        content: 'By uploading public papers, authors grant Aurenix a non-exclusive, worldwide, royalty-free license to archive, index in search, display metadata, and generate AI research summaries to foster scientific discovery.'
      },
      {
        id: 'trademark-policy',
        title: '3. Trademark Policy',
        content: 'The Aurenix name, logo, seal, and branding assets are registered trademarks. Unauthorized commercial use of Aurenix marks without written authorization is strictly prohibited.'
      },
      {
        id: 'content-removal',
        title: '4. DMCA & Content Removal Requests',
        content: 'If you believe your copyrighted work has been improperly uploaded without authorization, submit a written DMCA Takedown Notice to copyright@aurenix-research.org.'
      }
    ]
  },
  help: {
    id: 'help',
    title: 'Help Center & Knowledge Base',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Frequently asked questions, scholar onboarding guides, research submission workflows, and platform support resources.',
    iconName: 'HelpCircle',
    sections: [
      {
        id: 'faqs',
        title: '1. Frequently Asked Questions',
        content: 'Q: How do I submit my bioenergy paper? A: Click "Upload Research" on your dashboard to initiate DOI verification. Q: Are private blueprints secure? A: Yes, private workspace files use encrypted access controls. Q: How do alliances work? A: Institutions post grants, and scholars submit joint proposals directly.'
      },
      {
        id: 'user-guides',
        title: '2. User & Scholar Onboarding Guides',
        content: 'Comprehensive walk-throughs covering account setup, ORCID verification, research tagging, bookmarking publications, and joining thematic research alliances.'
      },
      {
        id: 'research-guides',
        title: '3. Bioenergy Research & Blueprint Guides',
        content: 'Standardized formatting guidelines for biomass feedstocks, gasification calculations, carbon offset metrics, and pilot plant feasibility documentation.'
      },
      {
        id: 'support-channels',
        title: '4. Direct Support & Assistance',
        content: 'Need help? Contact support@aurenix-research.org or submit a ticket through our Contact Page. Our academic support team responds within 12 business hours.'
      }
    ]
  },
  contact: {
    id: 'contact',
    title: 'Legal & Compliance Contact',
    version: '1.0',
    lastUpdated: 'August 1, 2026',
    summary: 'Direct communication channels for legal inquiries, compliance reports, copyright notices, and institutional support.',
    iconName: 'Mail',
    sections: [
      {
        id: 'contact-info',
        title: '1. Official Contact Addresses',
        content: 'Legal & Governance: legal@aurenix-research.org | Privacy Officer: privacy@aurenix-research.org | Copyright Agent: copyright@aurenix-research.org | General Inquiries: contact@aurenix-research.org'
      },
      {
        id: 'headquarters',
        title: '2. Physical Office Location',
        content: 'Aurenix Research Foundation, Bioenergy Innovation Hub, Victoria Island, Lagos, Nigeria & Regional Science Offices in Nairobi, Kenya.'
      },
      {
        id: 'response-time',
        title: '3. Official Response Timelines',
        content: 'Legal inquiries, DMCA notices, and privacy deletion requests are acknowledged within 24 hours and resolved within 5 business days.'
      }
    ]
  }
};

DEFAULT_POLICIES['community-guidelines'] = DEFAULT_POLICIES.community;
DEFAULT_POLICIES['research-ethics'] = DEFAULT_POLICIES.ethics;
DEFAULT_POLICIES['intellectual-property'] = DEFAULT_POLICIES.copyright;

