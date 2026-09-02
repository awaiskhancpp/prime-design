import type { Metadata } from 'next'

import { SearchResultsPage } from '@/components/search/SearchResultPage'

export const metadata: Metadata = {
  title: 'Search | Prime Design & Build',
  robots: { index: false, follow: false },
}

export default async function SearchRoute({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return <SearchResultsPage query={(q || '').trim()} />
}
