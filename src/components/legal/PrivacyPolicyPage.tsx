import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { LandscapingServiceAreas } from '../blocks/LandscapingServiceAreas'

// Content migrated from the WordPress export (wp:post_name "privacy-policy").
// That source still refers to the company as "Prime Kitchens" with an old
// address (1729 N First St, San Jose, CA 95112) and an old email
// (office@primekitchens.net) — left as-is below rather than silently
// guessed-and-replaced. Confirm the correct current legal entity name,
// address, and contact email before this goes live; update the
// `closingContact` block at the bottom of this file once confirmed.

type PolicySection = {
  number: number
  title: string
  paragraphs: Array<{ lead?: string; body: string }>
}

const sections: PolicySection[] = [
  {
    number: 1,
    title: 'Information We Collect',
    paragraphs: [
      {
        lead: '1.1 Personal Information:',
        body: 'We may collect personal information such as your name, email address, phone number, and other contact details when you voluntarily provide them to us. This may occur when you fill out a contact form, subscribe to our newsletter, or place an order.',
      },
      {
        lead: '1.2 Usage Data:',
        body: 'We automatically collect certain information about how you interact with our website. This may include your IP address, browser type, device information, pages visited, and other usage data. We may use cookies and similar technologies to collect this information.',
      },
    ],
  },
  {
    number: 2,
    title: 'Use of Information',
    paragraphs: [
      {
        lead: '2.1 Provide and Improve Services:',
        body: 'We may use the collected information to provide and improve our services, respond to inquiries, process orders, send administrative notifications, and personalize your experience with us.',
      },
      {
        lead: '2.2 Communication:',
        body: 'We may use your contact information to communicate with you about our products, services, promotions, and updates. You can opt-out of receiving these communications at any time.',
      },
      {
        lead: '2.3 Analytics and Marketing:',
        body: 'We may use the collected information for analytics purposes to understand how our website is used, evaluate marketing campaigns, and improve our services. We may also use your information for targeted advertising, including retargeting through third-party platforms.',
      },
    ],
  },
  {
    number: 3,
    title: 'Data Sharing and Disclosure',
    paragraphs: [
      {
        lead: '3.1 Third-Party Service Providers:',
        body: 'We may share your information with trusted third-party service providers who assist us in operating our website, conducting business activities, or providing services on our behalf. These service providers have access to your personal information only to perform specific tasks and are obligated to keep it confidential.',
      },
      {
        lead: '3.2 Legal Compliance:',
        body: 'We may disclose your personal information as required by law or if we believe that such disclosure is necessary to protect our rights, comply with a judicial proceeding, court order, or legal process served on us, or investigate potential violations.',
      },
    ],
  },
  {
    number: 4,
    title: 'Data Security',
    paragraphs: [
      {
        body: 'We take reasonable measures to protect the personal information we collect and maintain. However, please note that no security system is impenetrable, and we cannot guarantee the security of your information transmitted over the internet.',
      },
    ],
  },
  {
    number: 5,
    title: 'Your Rights and Choices',
    paragraphs: [
      {
        body: 'You have the right to access, update, correct, or delete your personal information. You may also have the right to restrict or object to certain processing activities. To exercise these rights, please contact us using the contact details provided below.',
      },
    ],
  },
  {
    number: 6,
    title: 'External Links',
    paragraphs: [
      {
        body: 'Our website may contain links to third-party websites. This Privacy Policy does not apply to those websites, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of those third-party websites.',
      },
    ],
  },
  {
    number: 7,
    title: 'Changes to this Privacy Policy',
    paragraphs: [
      {
        body: 'We may update this Privacy Policy from time to time. The updated version will be posted on our website with the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.',
      },
    ],
  },
  {
    number: 8,
    title: 'Contact Us',
    paragraphs: [
      {
        body: 'If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:',
      },
    ],
  },
]

// TODO: confirm and replace with the current legal entity name, address,
// and email — this is copied verbatim from the WordPress export and is
// very likely out of date.
const closingContact = {
  name: 'Prime Kitchens',
  address: '1729 N First St, San Jose, CA 95112, USA',
  email: 'office@primekitchens.net',
}

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information."
        image="/services/home-remodeling.jpeg"
        imageAlt="Prime Design & Build project"
        align="center"
      />

      <main>
        <Section className="bg-white">
          <div className="mx-auto max-w-4xl">
            <p className="text-base leading-7 text-ink-2/75">
              This Privacy Policy describes how {closingContact.name} (&ldquo;we,&rdquo;
              &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and discloses personal
              information when you visit our website or use our services.
            </p>

            <ol className="mt-12 grid gap-12">
              {sections.map((section) => (
                <li key={section.number} id={`section-${section.number}`}>
                  <h2 className="font-display text-2xl font-medium text-ink md:text-3xl">
                    <span className="text-brass">{section.number}.</span> {section.title}
                  </h2>
                  <div className="mt-4 grid gap-4">
                    {section.paragraphs.map((paragraph, index) => (
                      <p key={index} className="text-base leading-7 text-ink-2/75">
                        {paragraph.lead ? (
                          <span className="font-semibold text-ink-2">{paragraph.lead} </span>
                        ) : null}
                        {paragraph.body}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 border-t border-line pt-8">
              <p className="text-base leading-7 text-ink-2/75">
                {closingContact.name}
                <br />
                Address: {closingContact.address}
                <br />
                Email: {closingContact.email}
              </p>
            </div>
          </div>
        </Section>
      </main>
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
