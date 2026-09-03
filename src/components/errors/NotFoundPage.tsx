import { PageHero } from '@/components/layout/PageHero'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { SiteSearchForm } from '@/components/search/SiteSearchForm'

const helpfulLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Our Projects', href: '/our-projects' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export function NotFoundPage() {
  return (
    <>
      <PageHero
        eyebrow="Error 404"
        title="This page took a wrong turn"
        description="The page you’re looking for doesn’t exist or may have moved. Search below, or head back to the homepage."
        image="/services/home-remodeling.jpeg"
        imageAlt="A recently completed Prime Design & Build remodel"
        align="center"
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button href="/" variant="primary" size="lg">
            Back to homepage
          </Button>
          <Button href="/contact" variant="outline-light" size="lg">
            Talk to an expert
          </Button>
        </div>
      </PageHero>

      <Section className="">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl font-medium text-ink-2 md:text-3xl">
            Search the site
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-2/70">
            Find services, projects, and pages across the site.
          </p>
          <SiteSearchForm className="mt-6" />
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-3">
          {helpfulLinks.map((link) => (
            <Button key={link.href} href={link.href} variant="outline" size="sm">
              {link.label}
            </Button>
          ))}
        </div>
      </Section>

      <SiteFooter />
    </>
  )
}
