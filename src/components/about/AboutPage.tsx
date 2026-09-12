import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { resolveAbout, resolveTeamMembers } from '@/lib/about'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { AboutHero } from './AboutHero'
import { AboutFaq } from './AboutFaq'
import { CoreValues } from './CoreValues'
import { ExpertsSection } from './ExpertsSection'
import { GuidingPrinciple } from './GuidingPrinciple'
import { TeamSection } from './TeamSection'

export async function AboutPage() {
  const settings = await resolveSiteSettings()
  const about = await resolveAbout()
  const members = await resolveTeamMembers()
  return (
    <div className="min-h-screen ">
      <AboutHero hero={about.hero} />

      <TeamSection
        teamIntro={about.team}
        members={members}
        bodyContent={about.team.body ? <RichTextContent data={about.team.body} /> : undefined}
        introBodyContent={
          about.team.introBody ? <RichTextContent data={about.team.introBody} /> : undefined
        }
      />
      <GuidingPrinciple guidingPrinciple={about.guidingPrinciple} />
      <CoreValues coreValues={about.coreValues} />
      <ExpertsSection experts={about.experts} />
      <AboutFaq phone={settings.phone} faqIntro={about.faq} />
      <LandscapingServiceAreas />
    </div>
  )
}
