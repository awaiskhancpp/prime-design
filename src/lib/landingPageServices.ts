/**
 * Which real service a Google Ads landing page is about, guessed from its
 * own URL — the only place both `AppointmentScheduler` (the booking form)
 * and `LeadForm` (the contact forms) need it, so it lives here rather than
 * in either.
 *
 * There is no Payload field for this association: WordPress kept it in
 * LatePoint's own tables, and LatePoint was not part of the WXR export, so
 * it was never migrated (see the `booking` block's own note in
 * LandingPageBlocks.ts). Every caller that already knows the service some
 * other way — the contact page's consultation cards, a service page's own
 * `service.slug` — passes that directly instead; this is only the fallback
 * for the seven landing pages, which never do.
 *
 * `consultationLabel` here is not invented — it's the real, already-live
 * label the same service's card shows on the /contact page (checked against
 * the actual rendered cards, not guessed): the services collection has no
 * "Home Remodeling" card at all — `home-remodeling`'s own `consultationLabel`
 * is "New Construction Consultation", so that's what that landing page
 * shows too. `remodeling-information` (the general, fifteen-section
 * catch-all covering kitchen, bathroom and whole-home remodeling together)
 * is mapped to `complete-renovation` / "Complete Renovation Consultation"
 * per the project owner directly, not guessed from the page's own content.
 *
 * Five of the seven landing pages are unambiguously about one service and
 * are listed here. The other two are deliberately left out:
 * `outdoor-hardscape-outdoor-kitchen-information` and
 * `siding-installation-replacement-information` have no matching row in the
 * services collection at all (there is no outdoor or siding service) — a
 * booking from either still submits with no service, since guessing one
 * would misclassify the lead.
 */
export const LANDING_PAGE_SERVICES: Record<string, { slug: string; consultationLabel: string }> = {
  'kitchen-remodeling-information': {
    slug: 'kitchen-remodeling',
    consultationLabel: 'Kitchen Remodeling Consultation',
  },
  'bathroom-remodeling-information': {
    slug: 'bathroom-remodeling',
    consultationLabel: 'Bathroom Remodeling Consultation',
  },
  'additions-remodeling-information': {
    slug: 'additions',
    consultationLabel: 'Additions Consultation',
  },
  'home-remodeling-information': {
    slug: 'home-remodeling',
    consultationLabel: 'New Construction Consultation',
  },
  'remodeling-information': {
    slug: 'complete-renovation',
    consultationLabel: 'Complete Renovation Consultation',
  },
}

export function landingPageServiceFromPathname(pathname: string | null) {
  const segment = pathname?.split('/').filter(Boolean).pop()
  return segment ? LANDING_PAGE_SERVICES[segment] : undefined
}
