import type { LandingPage } from '@/lib/landingPages'
import { LandingBlockRenderer } from './LandingBlockRenderer'

export function LandingPageRenderer({ page }: { page: LandingPage }) {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <LandingBlockRenderer sections={page.sections} />
      </main>
    </div>
  )
}
