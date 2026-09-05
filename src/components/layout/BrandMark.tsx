import Image from 'next/image'
import Link from 'next/link'

export function BrandMark({ linked = true }: { linked?: boolean }) {
  const logo = (
    <Image
      src="/Prime-Kitchens-Logo-300x176.png"
      alt="Prime Design & Build"
      width={112}
      height={82}
      priority
    />
  )

  if (!linked) {
    return (
      <span className="flex items-center gap-3" aria-label="Prime Design & Build">
        {logo}
      </span>
    )
  }

  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Prime Design & Build home">
      {logo}
    </Link>
  )
}
