import { HomeContact } from '@/components/blocks/HomeContact'

// Ads landing pages use their own contact entry point. It intentionally
// reuses the shared form fields without importing the gallery contact layout.
export function LandingContact() {
  return <HomeContact />
}
