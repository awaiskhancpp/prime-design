import { LandscapingHero } from '@/components/blocks/LandscapingHero'
import { LandscapingIntro } from '@/components/blocks/LandscapingIntro'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { HomeServices } from './blocks/HomeServices'
import { HomeFeatureBlocks } from './blocks/HomeFeatureBlocks'
import { HomeContact } from './blocks/HomeContact'
import { HomeProjects } from './blocks/HomeProjects'
import { LandscapingDifference } from './blocks/LandscapingDifference'
import { resolveHomepage } from '@/lib/homepage'
import { resolveServices } from '@/lib/services'

// WordPress homepage card order (the six main services; kitchen style
// sub-pages, finance and comprehensive are not homepage cards).
const HOMEPAGE_SERVICE_SLUGS = [
  'home-remodeling',
  'kitchen-remodeling',
  'adu',
  'additions',
  'complete-renovation',
  'bathroom-remodeling',
]

export async function LandscapingPage() {
  const homepage = await resolveHomepage()
  const services = (await resolveServices()).filter((service) =>
    HOMEPAGE_SERVICE_SLUGS.includes(service.slug),
  )
  services.sort(
    (a, b) => HOMEPAGE_SERVICE_SLUGS.indexOf(a.slug) - HOMEPAGE_SERVICE_SLUGS.indexOf(b.slug),
  )

  return (
    <div className="min-h-screen bg-white">
      <LandscapingHero hero={homepage.hero} />
      <LandscapingIntro
        intro={homepage.intro}
        bodyContent={<RichTextContent data={homepage.intro.body} />}
      />
      <LandscapingDifference difference={homepage.difference} />
      <HomeProjects heading={homepage.projectsIntro.heading} />
      {/* <LandscapingServices /> */}
      <HomeServices heading={homepage.servicesIntro.heading} services={services} />

      <HomeFeatureBlocks featureBlocks={homepage.featureBlocks} />
      <HomeContact contactIntro={homepage.contactIntro} />

      <LandscapingServiceAreas heading={homepage.serviceAreas.heading} />
    </div>
  )
}
