import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Move the last hardcoded page copy into the CMS: the /team headings, the
 * whole privacy policy, and the /thank-you confirmation.
 *
 * Each of these was a string literal in a `.tsx` file, so no editor could
 * change a word of it. Nothing here is new wording — it is the copy those
 * files were already rendering, with two corrections noted below — so the
 * three pages look the same before and after; what changes is where the words
 * come from.
 *
 *   npx tsx scripts/seed-utility-page-content.ts [--dry]
 */

const dryRun = process.argv.slice(2).includes('--dry')

/**
 * The privacy policy, lifted verbatim out of the `sections` array that was in
 * `src/components/legal/PrivacyPolicyPage.tsx`. That array was itself migrated
 * from the WordPress page, whose eight headings and twelve paragraphs these
 * match one for one (checked against the live
 * primedesignandbuild.com/privacy-policy/). Section numbers are not stored:
 * `PolicySections` numbers them by their order here.
 */
const POLICY_SECTIONS = [
  {
    title: "Information We Collect",
    paragraphs: [
      {
        lead: "1.1 Personal Information:",
        body: "We may collect personal information such as your name, email address, phone number, and other contact details when you voluntarily provide them to us. This may occur when you fill out a contact form, subscribe to our newsletter, or place an order.",
      },
      {
        lead: "1.2 Usage Data:",
        body: "We automatically collect certain information about how you interact with our website. This may include your IP address, browser type, device information, pages visited, and other usage data. We may use cookies and similar technologies to collect this information.",
      },
    ],
  },
  {
    title: "Use of Information",
    paragraphs: [
      {
        lead: "2.1 Provide and Improve Services:",
        body: "We may use the collected information to provide and improve our services, respond to inquiries, process orders, send administrative notifications, and personalize your experience with us.",
      },
      {
        lead: "2.2 Communication:",
        body: "We may use your contact information to communicate with you about our products, services, promotions, and updates. You can opt-out of receiving these communications at any time.",
      },
      {
        lead: "2.3 Analytics and Marketing:",
        body: "We may use the collected information for analytics purposes to understand how our website is used, evaluate marketing campaigns, and improve our services. We may also use your information for targeted advertising, including retargeting through third-party platforms.",
      },
    ],
  },
  {
    title: "Data Sharing and Disclosure",
    paragraphs: [
      {
        lead: "3.1 Third-Party Service Providers:",
        body: "We may share your information with trusted third-party service providers who assist us in operating our website, conducting business activities, or providing services on our behalf. These service providers have access to your personal information only to perform specific tasks and are obligated to keep it confidential.",
      },
      {
        lead: "3.2 Legal Compliance:",
        body: "We may disclose your personal information as required by law or if we believe that such disclosure is necessary to protect our rights, comply with a judicial proceeding, court order, or legal process served on us, or investigate potential violations.",
      },
    ],
  },
  {
    title: "Data Security",
    paragraphs: [
      {
        body: "We take reasonable measures to protect the personal information we collect and maintain. However, please note that no security system is impenetrable, and we cannot guarantee the security of your information transmitted over the internet.",
      },
    ],
  },
  {
    title: "Your Rights and Choices",
    paragraphs: [
      {
        body: "You have the right to access, update, correct, or delete your personal information. You may also have the right to restrict or object to certain processing activities. To exercise these rights, please contact us using the contact details provided below.",
      },
    ],
  },
  {
    title: "External Links",
    paragraphs: [
      {
        body: "Our website may contain links to third-party websites. This Privacy Policy does not apply to those websites, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of those third-party websites.",
      },
    ],
  },
  {
    title: "Changes to this Privacy Policy",
    paragraphs: [
      {
        body: "We may update this Privacy Policy from time to time. The updated version will be posted on our website with the \"Last updated\" date. We encourage you to review this Privacy Policy periodically for any changes.",
      },
    ],
  },
  {
    title: "Contact Us",
    paragraphs: [
      {
        body: "If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:",
      },
    ],
  },]

/**
 * CORRECTED, deliberately. The WordPress source — and the migrated component —
 * open with "This Privacy Policy describes how Prime Kitchens ...", and close
 * with an address at 1729 N First St, San Jose and office@primekitchens.net.
 * The live WordPress page still says all three. Prime Kitchens is the former
 * trading name and the company is no longer at that address, so a visitor
 * exercising a right under this policy would be writing to a dead mailbox.
 * The closing block is no longer copy at all: `PolicySections` prints the name,
 * address and email from Site Settings.
 */
const POLICY_INTRO =
  'This Privacy Policy describes how Prime Design & Build (\u201cwe,\u201d \u201cus,\u201d or \u201cour\u201d) collects, uses, and discloses personal information when you visit our website or use our services.'

/** Media 94 — the image `PrivacyPolicyPage` already used, via `/public`. */
const HERO_IMAGE_ID = 94

const payload = await getPayload({ config: configPromise })

const findPage = async (slug: string) => {
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const doc = result.docs[0]
  if (!doc) throw new Error(`No pages record for "${slug}" — run seed-page-records.ts first.`)
  return doc as unknown as { id: number; layout?: unknown[] }
}

const write = async (slug: string, data: Record<string, unknown>) => {
  const page = await findPage(slug)
  if (dryRun) {
    console.log(`would update  ${slug} (id ${page.id})`)
    return
  }
  await payload.update({ collection: 'pages', id: page.id, data: data as never })
  console.log(`updated  ${slug} (id ${page.id})`)
}

/**
 * /team — the same Team section the About page already carries.
 *
 * Copied from the `about` record rather than retyped, so the two cannot drift:
 * the eyebrow, heading, highlight, rich-text body, CTA and intro are one set of
 * words that WordPress shows on both pages. Payload rejects a reused block
 * `id`, so it is dropped and a new one is generated.
 */
const about = await findPage('about')
const teamBlock = (about.layout ?? []).find(
  (block) => (block as { blockType?: string }).blockType === 'team',
)
if (!teamBlock) throw new Error('The about record has no `team` block to copy.')
const { id: _discardedBlockId, ...teamBlockFields } = teamBlock as Record<string, unknown>

await write('team', { layout: [teamBlockFields] })

await write('privacy-policy', {
  hero: {
    eyebrow: 'Legal',
    heading: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    image: HERO_IMAGE_ID,
  },
  layout: [
    {
      blockType: 'policy',
      intro: POLICY_INTRO,
      sections: POLICY_SECTIONS,
      showContactDetails: true,
    },
  ],
})

await write('thank-you', {
  hero: {
    eyebrow: 'Message received',
    heading: 'Thank you \u2014 we\u2019ll be in touch shortly',
    description:
      'Your enquiry is with our team. We answer every message personally, usually within one business day.',
    cta: { label: 'Book a free consultation', href: '/contact' },
  },
  layout: [
    {
      blockType: 'next-steps',
      heading: 'What happens next',
      steps: [
        {
          title: 'We read your message',
          detail: 'A member of the team reviews what you sent and the work you have in mind.',
        },
        {
          title: 'We get in touch',
          detail: 'Usually within one business day, by phone or email \u2014 whichever you gave us.',
        },
        {
          title: 'We book your consultation',
          detail: 'A free, no-obligation walkthrough of the space, your budget and your timeline.',
        },
      ],
    },
    {
      blockType: 'link-list',
      heading: 'In the meantime',
      links: [
        { label: 'Browse our projects', href: '/our-projects' },
        { label: 'See the gallery', href: '/gallery' },
        { label: 'Read the FAQs', href: '/faq' },
        { label: 'Financing options', href: '/finance' },
      ],
    },
  ],
})

process.exit(0)
