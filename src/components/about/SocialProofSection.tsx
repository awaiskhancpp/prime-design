import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { Container } from '@/components/ui/Container'
import type { PageSocialProofContent } from '@/lib/pageSections'
import type { SiteSettingsValue } from '@/lib/siteSettings'

/**
 * The review-platform row — Yelp, Google, Houzz.
 *
 * The homepage already shows these three (plus the BBB seal) as a flat strip
 * of logos between hairlines. This is the same three platforms but built as a
 * section in its own right rather than a divider: each one is a card the
 * whole surface of which is the link, with the logo held in a fixed-height
 * box so three files of different proportions still sit on one optical line.
 *
 * Only the copy is CMS-authored. The profile URLs come from Site Settings →
 * Social Links, the same source the homepage strip reads, so there is one
 * place to change a link. A platform whose link is missing is dropped rather
 * than rendered as a dead card — and if none of the three resolve, the whole
 * section returns null instead of leaving an empty band on the page.
 */

const PLATFORMS = [
  {
    key: 'yelp' as const,
    name: 'Yelp',
    logo: '/social/Yelp.png',
    detail: 'Read our reviews',
  },
  {
    key: 'googleBusiness' as const,
    name: 'Google',
    logo: '/social/Google.png',
    detail: 'See our Business Profile',
  },
  {
    key: 'houzz' as const,
    name: 'Houzz',
    logo: '/social/houzz.png',
    detail: 'View our portfolio',
  },
]

export function SocialProofSection({
  content,
  socialLinks,
}: {
  content?: PageSocialProofContent
  socialLinks?: SiteSettingsValue['socialLinks']
}) {
  const shown = PLATFORMS.map((platform) => ({
    ...platform,
    href: socialLinks?.[platform.key],
  })).filter((platform): platform is typeof platform & { href: string } => Boolean(platform.href))

  if (!shown.length) return null

  return (
    <section className=" py-14 md:py-20">
      <Container>
        {/* A strip of review-platform links, so its header is the `sm` size:
            it introduces the cards without competing with the page's own
            section headings. */}
        {content?.heading ? (
          <SectionHeader
            align="center"
            size="sm"
            eyebrow={content.eyebrow}
            title={content.heading}
            description={content.description}
          />
        ) : null}

        {/* One column per platform actually shown, so a missing link leaves
            two even halves rather than a gap where the third card was. */}
        <div
          className={[
            'mt-10 grid gap-px overflow-hidden border border-line bg-line',
            shown.length === 3 ? 'sm:grid-cols-3' : shown.length === 2 ? 'sm:grid-cols-2' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {shown.map((platform) => (
            <a
              key={platform.key}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${platform.name} — ${platform.detail} (opens in a new tab)`}
              className="group flex flex-col items-center gap-4 bg-white px-6 py-9 text-center transition-colors duration-300 hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-brass md:py-11"
            >
              {/* Fixed height, width auto: the three logo files have
                  different aspect ratios, and sizing by height is what keeps
                  them on one optical baseline. */}
              <span className="flex h-11 items-center md:h-12">
                <Image
                  src={platform.logo}
                  alt=""
                  aria-hidden
                  width={300}
                  height={158}
                  className="h-full w-auto object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                />
              </span>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-2/55 transition-colors duration-300 group-hover:text-brass-deep">
                {platform.detail}
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}
