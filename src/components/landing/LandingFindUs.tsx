import { Mail, MapPin, Phone } from 'lucide-react'
import { Section } from '@/components/ui/Section'

export function LandingFindUs({
  heading = 'Find us',
  phone = '(650) 235-4863',
  email = 'office@primedesignandbuild.com',
  address = '416 East Campbell Ave, Campbell CA 95008\n3 E 3rd Ave Suite 200, San Mateo, CA 94401',
}: {
  heading?: string
  phone?: string
  email?: string
  address?: string
}) {
  const items = [
    { icon: Phone, label: 'Call Us', value: phone, href: `tel:${phone.replace(/[^0-9+]/g, '')}` },
    { icon: Mail, label: 'Email Now', value: email, href: `mailto:${email}` },
    { icon: MapPin, label: 'Address', value: address },
  ]

  return (
    <Section className="">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
        Get in touch
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-4xl">{heading}</h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {items.map(({ icon: Icon, label, value, href }) => (
          <div
            key={label}
            className="group relative border border-line bg-paper p-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-ink/5"
          >
            <span
              className="absolute left-0 top-0 h-0.5 w-0 bg-brass transition-all duration-300 ease-out group-hover:w-full"
              aria-hidden
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brass/30 bg-paper-2">
              <Icon className="h-5 w-5 text-brass" aria-hidden />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-brass-deep">
              {label}
            </p>
            {href ? (
              <a
                href={href}
                className="mt-2 block whitespace-pre-line text-sm leading-6 text-ink transition-colors hover:text-brass-deep"
              >
                {value}
              </a>
            ) : (
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink">{value}</p>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}
