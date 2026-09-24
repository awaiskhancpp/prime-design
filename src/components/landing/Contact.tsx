import { HomeContact } from '@/components/blocks/HomeContact'

// Ads landing pages use their own contact entry point. It intentionally
// reuses the shared form fields without importing the gallery contact layout.
//
// The copy is passed through from the page's `contact-form` block rather than
// left to the homepage defaults — the WordPress sections carry their own
// eyebrow, heading and response-time line (e.g. "Contact Info" / "Receive a
// Free Estimate"), and without this the page rendered the homepage's
// "Contact our team today!" instead.
export function LandingContact({
  eyebrow,
  heading,
  description,
  id,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  /**
   * The Bricks `_cssId` of the source section — `contact_form` on pages
   * whose "Schedule a Free Consultation" buttons link to `#contact_form`.
   * Without it those buttons have nothing to scroll to.
   */
  id?: string
}) {
  const contact = (
    <HomeContact
      intro={{ eyebrow, heading, description }}
      id={id || 'contact'}
      linkAddresses={false}
      // Ads traffic is worth separating from the rest in the admin list.
      formName="Landing page estimate form"
    />
  )

  // Keep the WordPress section's source anchor (for its existing in-page
  // links) while also giving the landing header's #contact CTA a stable target.
  return id && id !== 'contact' ? (
    <>
      <span id="contact" className="block" aria-hidden="true" />
      {contact}
    </>
  ) : (
    contact
  )
}
