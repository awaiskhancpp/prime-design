import { HomeContact } from '@/components/blocks/HomeContact'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Section } from '@/components/ui/Section'
import { resolveConsultations } from '@/lib/consultations'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { ConsultationGrid } from './ConsultationGrid'

export async function ContactPage() {
  const consultations = await resolveConsultations()
  const settings = await resolveSiteSettings()
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Contact Prime Design & Build"
        title="Schedule Your Free Consultation"
        description="Choose the type of project you are considering and take the first step toward a thoughtful, well-built transformation."
        image="/services/home-remodeling.jpeg"
        imageAlt="Prime Design & Build remodeling project"
      />
      <main>
        <Section className="bg-white">
          <ConsultationGrid
            consultations={consultations}
            phone={settings.phone}
            phoneClean={settings.phoneClean}
          />
        </Section>
        <HomeContact />
      </main>
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
