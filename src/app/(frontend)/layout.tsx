import React from 'react'
import { Fraunces, Outfit } from 'next/font/google'
import './styles.css'
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata = {
  description: 'Prime Design & Build — thoughtful spaces, carefully built in Silicon Valley.',
  title: 'Prime Design & Build',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  )
}
