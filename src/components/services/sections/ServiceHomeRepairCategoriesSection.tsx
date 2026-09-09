import Image from 'next/image'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { RichTextValue } from '@/lib/richText'
import { Section } from '@/components/ui/Section'

export type HomeRepairCategory = {
  title: string
  label: string
  image: string
  /** Body copy — Payload rich text (Lexical JSON) or a plain string fallback. */
  body: RichTextValue | string
  items: string[]
  /** Optional paragraph(s) after the bullet list (Door, Flooring, Interior). */
  closingBody?: RichTextValue | string
}

/**
 * ServiceHomeRepairCategoriesSection
 *
 * Renders the six Home Repair categories (Cabinet, Door, Drywall, Flooring,
 * Painting, Window), each as an alternating image/text row — matching the
 * source page's layout exactly, including the fact that each category uses
 * a different bullet-list label ("Services include:" vs "Key benefits:"
 * vs "Flooring types we work with:", etc.) rather than one generic label
 * for all six.
 *
 * The body and closing paragraphs come from Payload rich text fields. The
 * section's own spacing/typography is applied on a wrapper so the rich text
 * renderer cannot drift the card design.
 */
export function ServiceHomeRepairCategoriesSection({
  categories = homeRepairCategoriesContent,
}: {
  categories?: HomeRepairCategory[]
}) {
  return (
    <Section className="grid gap-20">
      {categories.map((category, index) => {
        const [firstWord, ...rest] = category.title.split(' ')
        const imageOnRight = index % 2 === 1

        return (
          <div
            key={category.title}
            className={`grid gap-8 md:grid-cols-2 md:items-center md:gap-16 ${
              imageOnRight ? 'md:[&>div:first-child]:order-2' : ''
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div>
              <p className="bg-gradient-to-r from-ink-2 to-brass bg-clip-text font-display text-2xl font-medium text-transparent">
                {firstWord}
              </p>
              <h3 className="font-display text-3xl font-semibold text-ink">{rest.join(' ')}</h3>
              {typeof category.body === 'string' ? (
                <p className="mt-4 text-base leading-7 text-ink-2/75">{category.body}</p>
              ) : (
                <div className="mt-4 text-base leading-7 text-ink-2/75 [&_p]:mt-0 [&_p]:text-ink-2/75">
                  <RichTextContent data={category.body} />
                </div>
              )}
              <h4 className="mt-6 font-semibold text-ink-2">{category.label}</h4>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink-2/75">
                {category.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brass" />
                    {item}
                  </li>
                ))}
              </ul>
              {category.closingBody ? (
                typeof category.closingBody === 'string' ? (
                  <p className="mt-5 text-base leading-7 text-ink-2/75">{category.closingBody}</p>
                ) : (
                  <div className="mt-5 text-base leading-7 text-ink-2/75 [&_p]:mt-0 [&_p]:text-ink-2/75">
                    <RichTextContent data={category.closingBody} />
                  </div>
                )
              ) : null}
            </div>
          </div>
        )
      })}
    </Section>
  )
}
const cabinet = '/services/kitchen-remodeling.jpeg'
const door = '/services/home-remodeling.jpeg'
const drywall = '/before-after/complete_remodeling_after.jpeg'
const flooring = '/before-after/bathroom_remodeling_after.jpeg'
const painting = '/services/kitchen-remodeling.jpeg'
const window_ = '/services/home-remodeling.jpeg'

export const homeRepairCategoriesContent: HomeRepairCategory[] = [
  {
    title: 'Cabinet Repair & Installation',
    label: 'Services include:',
    image: cabinet,
    body: 'Give your kitchen, bathroom, or storage areas a fresh look with our professional cabinet repair and installation services. We specialize in fixing damaged doors, replacing hinges or drawer glides, and refinishing surfaces for a sleek, modern finish. Whether you need a new custom cabinet system or simple repairs, our team delivers high-quality craftsmanship tailored to your style and needs.',
    items: [
      'Cabinet refinishing and painting',
      'Hardware replacement and upgrades',
      'Custom cabinet design and installation',
      'Structural repairs for shelves and drawers',
    ],
  },
  {
    title: 'Door Installation & Repair',
    label: 'We service and install:',
    image: door,
    body: 'Transform your home’s entryways with expert door installation and repair services. We work with a wide range of door types to enhance both functionality and aesthetics. Whether you need a high-tech automatic door or a rustic barn door, our skilled technicians ensure a perfect fit, smooth operation, and long-lasting durability.',
    items: [
      'Automatic doors',
      'Barn doors',
      'Closet doors',
      'Dutch doors',
      'Folding doors',
      'French doors',
      'Screen doors',
      'Security doors',
    ],
    closingBody:
      'If you’re experiencing issues such as squeaking hinges, damaged frames, or drafts, our door repair specialists can quickly diagnose and fix the problem, restoring both security and style to your home.',
  },
  {
    title: 'Drywall Repair, Installation & Replacement',
    label: 'Key benefits:',
    image: drywall,
    body: 'Smooth walls and ceilings are essential to creating a polished interior. Our drywall repair, installation, and replacement services address everything from small cracks and holes to large-scale structural damage. We use top-grade materials to ensure a flawless finish, preparing your space for painting or wallpapering.',
    items: [
      'Expert patchwork and seamless blending',
      'Mold-resistant drywall options',
      'Perfectly finished surfaces for interior painting',
      'Full replacement for outdated or severely damaged drywall',
    ],
  },
  {
    title: 'Flooring Installation & Repairs',
    label: 'Flooring types we work with:',
    image: flooring,
    body: 'Upgrade your floors for improved comfort, appearance, and value. Our team is experienced in installing and repairing a variety of flooring materials to match your lifestyle and design preferences. From the warmth of hardwood to the durability of tile and vinyl, we have the expertise to handle it all.',
    items: [
      'Carpet',
      'Concrete',
      'Hardwood',
      'Laminate',
      'Natural Stone Slabs',
      'Tile Flooring',
      'Vinyl',
    ],
    closingBody:
      'Flooring repairs may include addressing water damage, refinishing hardwood, patching torn carpet, or replacing tiles. We focus on every detail to deliver a smooth, flawless surface.',
  },
  {
    title: 'Interior Painting',
    label: 'Interior painting options:',
    image: painting,
    body: 'Revitalize your living space with a fresh coat of paint. Our interior painting services cover everything from ceilings and walls to cabinets and trim. We use high-quality, low-VOC paints to ensure vibrant color, even coverage, and a healthier indoor environment.',
    items: [
      'Cabinet painting and refinishing',
      'Ceiling and wall painting',
      'Door and window frame painting',
      'Complete interior repaints',
      'Room-by-room transformations',
      'Trim or molding painting',
    ],
    closingBody:
      'Whether you’re looking to freshen up a single room or repaint your entire home, our professional painters handle preparation, color matching, and clean-up with minimal disruption.',
  },
  {
    title: 'Window Repair & Replacement',
    label: 'Window services include:',
    image: window_,
    body: 'Windows are essential for energy efficiency, natural light, and curb appeal. Our window repair and replacement services can help you resolve issues like broken glass, faulty seals, or outdated frames. We offer a variety of styles and materials to suit any home design and budget, ensuring your windows provide lasting comfort and value.',
    items: [
      'Repairing cracked or shattered glass',
      'Replacing damaged frames or sashes',
      'Upgrading to energy-efficient window solutions',
      'Installing custom-fit windows to match your décor',
    ],
  },
]
