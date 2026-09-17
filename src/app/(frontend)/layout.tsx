import React from 'react'
import { Outfit } from 'next/font/google'

import './styles.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata = {
  description: 'Prime Design & Build — thoughtful spaces, carefully built in Silicon Valley.',
  title: 'Prime Design & Build',
}

/**
 * The document shell only. Deciding which pages get the shared site chrome is
 * path-dependent, so it lives in `template.tsx` next to this file — a layout
 * is never re-rendered on client-side navigation, which made the chrome stick
 * to city and Google Ads pages until the visitor refreshed.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>{children}</body>
    </html>
  )
}
