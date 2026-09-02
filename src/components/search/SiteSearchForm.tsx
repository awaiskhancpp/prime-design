import { Search } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export function SiteSearchForm({
  defaultValue = '',
  className,
}: {
  defaultValue?: string
  className?: string
}) {
  return (
    <form action="/search" method="get" role="search" className={cn('flex gap-3', className)}>
      <label htmlFor="site-search-q" className="sr-only">
        Search the site
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2/40"
          aria-hidden
        />
        <Input
          id="site-search-q"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search the site..."
          className="bg-white pl-11"
        />
      </div>
      <Button type="submit" variant="primary" size="lg">
        Search
      </Button>
    </form>
  )
}
