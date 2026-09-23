import { Mail, MapPin, Phone } from 'lucide-react'
import { Section } from '@/components/ui/Section'

/**
 * LandingFindUs
 *
 * The contact-details band. Every value is a prop with no default: the
 * previous defaults hardcoded a phone number, so a page with broken CMS wiring
 * showed a wrong number rather than nothing.
 *
 * `phone`, `email` and `address` are the bare values. The "Call Us" /
 * "Email Now" / "Address" captions are this design's own labels, so the
 * stored values must not repeat them, or the page renders "Call Us Call Us
 * (650) 235-4863" and a `mailto:` that includes the caption.
 *
 * The section is called "Find us" and used to be the one place on the page
 * that could not help you do that: the phone dialled and the email opened a
 * client, but the two office addresses were plain text beside a map pin icon
 * that was purely decorative. They are now links, and a map sits under the
 * cards.
 *
 * The map is Google's own embed, addressed by the `q` query rather than by
 * coordinates. That matters: the CMS stores the offices as postal addresses
 * and nothing else, so anything drawn from a latitude and longitude would
 * have meant inventing them. Letting Google resolve the address it was given
 * keeps the pin honest — and if an address is edited in Payload, the map
 * follows it with no second field to keep in step.
 */

/** Each line of the stored address is its own office. */
const addressLines = (address?: string) =>
  (address || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

const mapsSearch = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

const mapsEmbed = (address: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
export function LandingFindUs({
  eyebrow,
  heading,
  phone,
  email,
  address,
}: {
  eyebrow?: string
  heading?: string
  phone?: string
  email?: string
  address?: string
}) {
  const items = [
    phone
      ? {
          icon: Phone,
          label: 'Call Us',
          value: phone,
          href: `tel:${phone.replace(/[^0-9+]/g, '')}`,
        }
      : undefined,
    email ? { icon: Mail, label: 'Email Now', value: email, href: `mailto:${email}` } : undefined,
    address ? { icon: MapPin, label: 'Address', value: address, href: undefined } : undefined,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))

  const offices = addressLines(address)

  if (!items.length && !heading) return null

  return (
    <Section className="">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
          {eyebrow}
        </p>
      ) : null}
      {heading ? (
        <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-4xl">{heading}</h2>
      ) : null}

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
              /* Each office is its own link. One `<a>` around both would send
                 someone asking about the San Mateo office to Campbell. */
              <span className="mt-2 block space-y-1">
                {addressLines(value).map((line) => (
                  <a
                    key={line}
                    href={mapsSearch(line)}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm leading-6 text-ink underline-offset-4 transition-colors hover:text-brass-deep hover:underline"
                  >
                    {line}
                  </a>
                ))}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* The first stored address is the one the map opens on — it is the
          office the company lists first, and a map has to centre somewhere.
          Every address remains reachable as its own link above. */}
      {offices.length ? (
        <div className="mt-6 overflow-hidden border border-line bg-paper-2">
          <iframe
            src={mapsEmbed(offices[0])}
            title={`Map showing ${offices[0]}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[320px] w-full border-0 md:h-[380px]"
          />
        </div>
      ) : null}
    </Section>
  )
}
