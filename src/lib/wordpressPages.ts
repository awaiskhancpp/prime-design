export type WordPressPageDefinition = {
  slug: string
  title: string
  seoTitle?: string
  seoDescription?: string
  sourceContentLength: number
  sourceRole: 'public-page' | 'utility-page'
}

// These pages are present in the WordPress export but do not have a dedicated
// route in the current frontend. Keep the source wording here until each page
// receives its final redesigned component.
export const wordpressPages: WordPressPageDefinition[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    seoDescription:
      "Read Prime Kitchens' Privacy Policy to understand how we collect, use, and protect your personal information when you visit our website or use our services.",
    sourceContentLength: 5225,
    sourceRole: 'public-page',
  },
  {
    slug: 'team',
    title: 'Team',
    seoTitle: 'Home Remodeling Experts at Prime Design & Build - Silicon Valley',
    seoDescription:
      'Meet the talented team at Prime Design & Build, experts in home remodeling in Silicon Valley. Learn about our skilled professionals dedicated to exceptional results.',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'finance',
    title: 'Finance',
    seoTitle:
      'Flexible Financing for Home Remodeling | Prime Design & Build - Silicon Valley Experts',
    seoDescription:
      'Finance your home remodeling with Prime Design & Build in Silicon Valley. Discover flexible options to bring your vision to life. Explore our finance solutions!',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'book-online',
    title: 'Book Online',
    seoDescription:
      "Schedule a free consultation for your remodeling project. Whether it's kitchen, bathroom, home renovation, or ADU/garage conversions, book your appointment today!",
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'remodeling-information',
    title: 'Remodeling Information',
    seoDescription:
      'Building dreams through expert craftsmanship. Discover top-quality home remodeling services in Silicon Valley, including kitchen, bathroom, and whole home renovations.',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'customer-cabinet',
    title: 'Customer Cabinet',
    seoDescription:
      'Discover custom cabinets by Prime Design & Build. Tailored designs, quality materials, and expert craftsmanship to enhance your home functionality and style.',
    sourceContentLength: 156,
    sourceRole: 'public-page',
  },
  {
    slug: 'kitchen-remodeling-information',
    title: 'Kitchen Remodeling Information',
    seoDescription:
      'Prime Design & Build offers custom kitchen remodeling in Silicon Valley. Create a kitchen that matches your style and needs with expert craftsmanship.',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'bathroom-remodeling-information',
    title: 'Bathroom Remodeling Information',
    seoDescription:
      'Transform your bathroom with Prime Design & Build. Our expert team offers custom designs, quality craftsmanship, and personalized solutions for your dream space.',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'additions-remodeling-information',
    title: 'Additions Remodeling Information',
    seoDescription:
      'Discover Prime Design & Build, remodeling experts in Silicon Valley specializing in additions remodeling information, custom room additions, and quality work.',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'comprehensive-home-repair-installation-services-in-silicon-valley',
    title: 'Comprehensive Home Repair & Installation Services in Silicon Valley',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'home-remodeling-information',
    title: 'Home Remodeling Information',
    seoDescription:
      'Building dreams through expert craftsmanship. Discover top-quality home remodeling services in Silicon Valley, including kitchen, bathroom, and whole home renovations.',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'outdoor-hardscape-outdoor-kitchen-information',
    title: 'Outdoor Hardscape & Outdoor Kitchen Information',
    seoDescription:
      'Discover Prime Design & Build, remodeling experts in Silicon Valley specializing in additions remodeling information, custom room additions, and quality work.',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'siding-installation-replacement-information',
    title: 'Siding Installation & Replacement Information',
    seoDescription:
      'Discover Prime Design & Build, remodeling experts in Silicon Valley specializing in additions remodeling information, custom room additions, and quality work.',
    sourceContentLength: 0,
    sourceRole: 'public-page',
  },
  {
    slug: 'thank-you',
    title: 'Thank You',
    sourceContentLength: 0,
    sourceRole: 'utility-page',
  },
]

export function getWordPressPage(slug: string) {
  return wordpressPages.find((page) => page.slug === slug)
}
