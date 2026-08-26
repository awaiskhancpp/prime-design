import Image from 'next/image'
import Link from 'next/link'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import { services } from '@/lib/services'

export function ServicesPage() {
  return <div className="min-h-screen bg-white"><SiteHeader tone="light" /><main className="pt-20 md:pt-28">
    <Section className="pb-10 text-center md:pb-14"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">Our services</p><h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-6xl">Take <span className="text-blue-600">charge</span> of your Remodeling Experience</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-ink-2/70">Now is the perfect time to choose the area in your home that deserves a remarkable transformation.</p></Section>
    <Section className="pt-0"><div className="mx-auto max-w-5xl space-y-6 md:space-y-8">{services.map((service) => { const hrefs: Record<string, string> = { 'european-kitchen': '/kitchen-remodeling/european-kitchen-silicon-valley', 'shaker-kitchens': '/kitchen-remodeling/shaker-kitchen-silicon-valley', 'custom-kitchens': '/kitchen-remodeling/custom-kitchen-silicon-valley' }; const href = hrefs[service.slug] || `/${service.slug}`; return <article key={service.slug} id={service.slug} className="grid gap-6 md:grid-cols-[1fr_1.15fr] md:items-center md:gap-10"><Link href={href} className="group relative aspect-[4/3] overflow-hidden bg-paper-2"><Image src={service.image} alt={service.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 768px) 45vw, 100vw" /></Link><div><h2 className="font-display text-2xl font-semibold leading-tight text-ink md:text-3xl">{service.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-ink-2/75">{service.description}</p><Link href={href} className="mt-5 inline-flex bg-brass px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brass-deep">Discover <span className="ml-2">→</span></Link></div></article> })}</div></Section>
  </main><ProjectsReviews /><LandscapingServiceAreas /><LandscapingCta /><SiteFooter /></div>
}
