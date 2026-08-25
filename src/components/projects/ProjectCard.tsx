'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import type { Project } from '@/lib/projects'
import { ArrowRight } from 'lucide-react'

export function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = descriptionRef.current
    if (el) setIsTruncated(el.scrollHeight > el.clientHeight + 1)
  }, [])

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/our-projects/${project.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-paper-2"
      >
        <Image
          src={project.heroImage}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
          {project.location}
        </p>
        <h2 className="mt-3 line-clamp-1 font-display text-2xl font-medium leading-tight text-ink-2 md:text-3xl">
          {project.title}
        </h2>

        <p
          ref={descriptionRef}
          className={cn(
            'mt-3 min-h-[3.5rem] text-base leading-7 text-ink-2/70 mb-1',
            !expanded && 'line-clamp-2',
          )}
        >
          {project.summary}
        </p>

        {isTruncated && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-1 self-start text-xs font-semibold uppercase tracking-[0.1em] text-brass-deep underline underline-offset-4 hover:text-brass"
          >
            See more
          </button>
        )}

        <Link
          href={`/our-projects/${project.slug}`}
          className="mt-auto inline-flex items-center gap-2 self-start border border-brass px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:bg-brass hover:text-white"
        >
          View project <ArrowRight />
        </Link>
      </div>
    </article>
  )
}
