import Image from '@/components/ui/Image'

import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Section } from '@/components/ui/Section'
import { richTextHasContent } from '@/lib/richText'
import { resolveSiteSettings } from '@/lib/siteSettings'
import type { TeamMemberDetail } from '@/lib/team'

import { Contact } from '../gallery/Contact'

/**
 * One team member's page, `/team/<slug>`.
 *
 * Everything on it is the member's Team record: photo, name, position and
 * bio. The layout is the Team section's member dialog laid out as a page —
 * the same portrait, eyebrow, name, role and bio, in the same type scale — so
 * the dialog on /team and this page read as one design. The eyebrow is the
 * company name from Site Settings (the dialog types it out).
 *
 * WordPress's page for a member is the bio alone between header and footer;
 * this page adds nothing to it that is not already in the record.
 * `data-light-chrome`: plain white page, dark header text (see `TeamPage`).
 */
export async function TeamMemberPage({ member }: { member: TeamMemberDetail }) {
  const settings = await resolveSiteSettings()
  const initials = member.name
    .split(' ')
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)

  return (
    <main data-light-chrome className="min-h-screen bg-white">
      <Section className="bg-white pt-32 md:pt-36 lg:pt-40">
        <div className="grid items-start bg-paper md:grid-cols-[0.95fr_1.05fr] md:items-stretch">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-2 md:aspect-auto md:h-full md:min-h-[32rem]">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                fill
                priority
                className="object-cover object-top"
                sizes="(min-width: 768px) 45vw, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,#c19a5b_0%,#1f3358_46%,#14213d_100%)]">
                <span className="font-display text-7xl font-medium text-white/85">{initials}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-start p-6 sm:p-8 md:justify-center md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {settings.name}
            </p>
            <h1 className="mt-4 font-display text-3xl font-medium leading-tight text-ink-2 sm:text-4xl md:mt-5 md:text-5xl md:leading-none">
              {member.name}
            </h1>
            {member.role ? (
              <p className="mt-3 text-lg text-ink-2/75 md:mt-4 md:text-xl">{member.role}</p>
            ) : null}
            {richTextHasContent(member.bio) ? (
              <div className="mt-5 md:mt-7 [&>p:first-child]:mt-0">
                <RichTextContent data={member.bio} />
              </div>
            ) : null}
          </div>
        </div>
      </Section>
      <Contact />
      <LandscapingServiceAreas />
    </main>
  )
}
