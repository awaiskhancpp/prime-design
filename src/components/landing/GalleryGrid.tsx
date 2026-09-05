'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const PAGE_SIZE = 24
// How many numbered page buttons to show around the current page before
// collapsing the rest into an ellipsis (plus first/last are always shown).
const WINDOW = 1

function pageList(current: number, total: number): Array<number | 'ellipsis'> {
  const pages = new Set<number>([1, total, current])
  for (let offset = 1; offset <= WINDOW; offset += 1) {
    if (current - offset >= 1) pages.add(current - offset)
    if (current + offset <= total) pages.add(current + offset)
  }
  const sorted = Array.from(pages).sort((a, b) => a - b)
  const result: Array<number | 'ellipsis'> = []
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('ellipsis')
    result.push(page)
  })
  return result
}

export function GalleryGrid({
  images,
  captions,
  altPrefix,
  hoverZoom = false,
}: {
  images: string[]
  captions?: Array<string | undefined>
  altPrefix: string
  hoverZoom?: boolean
}) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(images.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  // Memoized so the visible slice is only recomputed when the image list or
  // the current page actually changes, not on every render.
  const pageImages = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return images.slice(start, start + PAGE_SIZE)
  }, [images, currentPage])

  if (!images.length) return null

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {pageImages.map((image, index) => {
          const globalIndex = (currentPage - 1) * PAGE_SIZE + index
          return (
            <div
              key={`${image}-${globalIndex}`}
              className="relative aspect-[4/3] overflow-hidden bg-paper-2"
            >
              <Image
                src={image}
                alt={`${altPrefix} photo ${globalIndex + 1}`}
                fill
                loading="lazy"
                className={cn(
                  'object-cover',
                  hoverZoom && 'transition-transform duration-500 ease-out hover:scale-105',
                )}
                unoptimized={image.includes('/api/media/file/') || image.startsWith('http')}
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
              {captions?.[globalIndex] ? (
                <div className="absolute left-2 top-2 max-w-[calc(100%-1rem)] bg-white px-2 py-1 text-[10px] font-semibold leading-tight text-ink shadow-sm sm:text-xs">
                  {captions[globalIndex]}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {totalPages > 1 ? (
        <div
          className="mt-8 flex items-center justify-center gap-1.5"
          aria-label="Gallery pagination"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="flex h-9 w-9 items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>

          {pageList(currentPage, totalPages).map((entry, index) =>
            entry === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-ink-2/50">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => setPage(entry)}
                aria-current={entry === currentPage ? 'page' : undefined}
                className={cn(
                  'flex h-9 w-9 items-center justify-center border text-sm font-medium transition-colors',
                  entry === currentPage
                    ? 'border-brass bg-brass text-white'
                    : 'border-line text-ink-2 hover:border-brass hover:text-brass-deep',
                )}
              >
                {entry}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="flex h-9 w-9 items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  )
}
