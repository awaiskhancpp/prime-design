import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Container } from '@/components/ui/Container'
import { SiteSearchForm } from '@/components/search/SiteSearchForm'
import { searchSite, type SearchResult } from '@/lib/search'

export async function SearchResultsPage({ query }: { query: string }) {
  const results = query ? await searchSite(query) : []

  return (
    // `data-light-chrome`: plain white page, no dark hero — recolours the
    // overlaid header, including `SiteHeader`'s mobile bar, which ignores the
    // `tone` prop `FrontendTemplate` otherwise gets right for `/search`. See
    // the CSS rule in `styles.css`.
    <div data-light-chrome className="min-h-screen bg-white">
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
    </div>
  )
}

/**
 * One result.
 *
 * Services, projects and blog posts all carry a photo; the static pages
 * (Contact, Privacy Policy, …) do not. The row is therefore built as a flex
 * pair where the thumbnail is simply absent when there is no image, rather
 * than a grid with a hole in it or a grey placeholder box — a page result
 * stays a clean line of text, and a project result gets its picture.
 */
function ResultRow({ result }: { result: SearchResult }) {
  return (
    <li>
      <Link
        href={result.url}
        className="group flex items-start gap-5 py-6 transition-colors focus-visible:outline-2 focus-visible:outline-brass"
      >
        {result.image ? (
          <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden bg-paper-2 sm:w-36">
            <Image
              src={result.image}
              alt=""
              aria-hidden
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(min-width: 640px) 144px, 112px"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-deep">
            {result.section}
          </p>

          <h2 className="mt-1 font-display text-xl font-medium text-ink-2 transition-colors group-hover:text-brass-deep md:text-2xl">
            {result.title}
          </h2>

          {result.excerpt ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-2/70">{result.excerpt}</p>
          ) : null}

          <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            View
            <ArrowRight
              className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </Link>
    </li>
  )
}
