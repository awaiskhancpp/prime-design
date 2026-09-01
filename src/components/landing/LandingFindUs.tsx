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
      <h2 className="font-display text-3xl text-ink">{heading}</h2>
      <div className="mt-6 grid grid-rows-1 gap-4">
        {items.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="flex items-center gap-4 bg-white px-5 py-4">
            <Icon className="h-6 w-6 shrink-0 text-brass" aria-hidden />
            {href ? (
              <a href={href} className="text-sm text-ink">
                <strong className="block">{label}</strong>
                {value}
              </a>
            ) : (
              <p className="whitespace-pre-line text-sm text-ink">
                <strong className="block">{label}</strong>
                {value}
              </p>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}
