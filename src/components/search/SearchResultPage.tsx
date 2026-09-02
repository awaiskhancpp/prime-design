import Link from 'next/link'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Container } from '@/components/ui/Container'
import { SiteSearchForm } from '@/components/search/SiteSearchForm'
import { searchSite, type SearchResult } from '@/lib/search'

export async function SearchResultsPage({ query }: { query: string }) {
  const results = query ? await searchSite(query) : []

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader tone="light" />

      <section className="bg-white py-16 md:py-24 lg:py-28">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass-deep">
            Site search
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-5xl">
            {query ? `Search results for “${query}”` : 'Search the site'}
          </h1>

          <SiteSearchForm defaultValue={query} className="mt-8 max-w-xl" />

          <div className="mt-12">
            {!query ? (
              <p className="text-sm text-ink-2/70">
                Enter a search term above to find services, projects, and pages.
              </p>
            ) : results.length === 0 ? (
              <p className="text-sm text-ink-2/70">
                No results for “{query}”. Try a different term, or browse services and projects
                below.
              </p>
            ) : (
              <p className="text-sm text-ink-2/60">
                {results.length} result{results.length === 1 ? '' : 's'}
              </p>
            )}

            <ul className="mt-6 divide-y divide-line border-y border-line">
              {results.map((result) => (
                <ResultRow key={result.url} result={result} />
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  )
}

function ResultRow({ result }: { result: SearchResult }) {
  return (
    <li className="py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-deep">
        {result.section}
      </p>
      <Link
        href={result.url}
        className="mt-1 inline-block font-display text-xl font-medium text-ink-2 transition-colors hover:text-brass-deep md:text-2xl"
      >
        {result.title}
      </Link>
      {result.excerpt ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-2/70">{result.excerpt}</p>
      ) : null}
    </li>
  )
}
