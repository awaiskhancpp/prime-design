import { Mail, MapPin, Phone } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { LocationMap, type MapPlace } from '@/components/ui/LocationMap'

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
 * That map used to be a Google Maps embed addressed by the first line of
 * `address`, which meant Google re-geocoded a postal address on every load and
 * the block stored no position of its own. It is now `LocationMap` on
 * OpenFreeMap's keyless tiles, drawn from the block's own `mapPins` — one pin
 * per office, both offices at once instead of only the first. A block with no
 * pins renders the cards and no map: there is no address to guess a position
 * from, and guessing one is what this field exists to stop.
 */

/** Each line of the stored address is its own office. */
const addressLines = (address?: string) =>
  (address || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

/** A stored pin, as Payload hands it over — both numbers optional. */
export type FindUsMapPin = {
  latitude?: number | null
  longitude?: number | null
}

export function LandingFindUs({
  eyebrow,
  heading,
  phone,
  email,
  address,
  mapPins,
}: {
  eyebrow?: string
  heading?: string
  phone?: string
  email?: string
  address?: string
  mapPins?: FindUsMapPin[]
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

  // The pins carry their own position; the city a pin sits in is named on the
  // basemap itself, so nothing here has to label them.
  const places: MapPlace[] = (mapPins ?? []).flatMap((pin, index) =>
    typeof pin.latitude === 'number' && typeof pin.longitude === 'number'
      ? [{ name: offices[index] ?? `Office ${index + 1}`, lat: pin.latitude, lng: pin.longitude }]
      : [],
  )

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
              <span className="mt-2 block whitespace-pre-line text-sm leading-6 text-ink">
                {value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Every office the block has a pin for, fitted so both are visible.
          Every address stays reachable as its own link above.

          The box is taller than a typical banner on purpose: the two offices
          are 30km apart north to south, so a shallow band fits them on
          latitude alone and spends the rest of its width on ocean. The height
          lets the fit zoom in and puts the valley between them on screen. */}
      {places.length ? (
        <div className="mt-6 h-[380px] overflow-hidden border border-line bg-paper-2 md:h-[460px]">
          <LocationMap
            places={places}
            ariaLabel={
              offices.length
                ? `Map showing ${offices.join(' and ')}`
                : 'Map showing the Prime Design & Build offices'
            }
          />
        </div>
      ) : null}
    </Section>
  )
}
