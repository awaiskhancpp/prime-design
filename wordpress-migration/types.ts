export type XmlMeta = {
  key: string
  value: string
}

export type WordPressAttachment = {
  id: number
  slug: string
  title: string
  filename?: string
  url?: string
  mimeType?: string
  meta: XmlMeta[]
  happyfilesCategorySlugs?: string[]
}

export type WordPressPage = {
  id: number
  slug: string
  title: string
  status?: string
  parentId?: number
  content: string
  excerpt: string
  thumbnailId?: number
  meta: XmlMeta[]
  bricksSerialized?: string
}

export type WordPressFaq = {
  id: number
  title: string
  content: string
  category?: string
  categorySlug?: string
  status?: string
  meta: XmlMeta[]
}

export type WordPressProject = {
  id: number
  slug: string
  title: string
  thumbnailId?: number
  meta: XmlMeta[]
}

export type WordPressTestimonial = {
  id: number
  title: string
  content: string
  status?: string
  meta: XmlMeta[]
}

export type WordPressSource = {
  pages: WordPressPage[]
  attachments: WordPressAttachment[]
  faqs: WordPressFaq[]
  projects: WordPressProject[]
  testimonials: WordPressTestimonial[]
  allItems: number
  // Maps a HappyFiles folder's numeric term_id (as referenced by a gallery
  // widget's `settings.ids`) to that folder's term slug, so attachments
  // tagged with the slug can be resolved back to a specific gallery widget.
  happyfilesFolders: Record<string, string>
}

export type BricksSettings = Record<string, unknown>

export type BricksElement = {
  id: string
  name: string
  parent: string | number
  children: string[]
  settings: BricksSettings
  raw: Record<string, unknown>
}

export type BricksTreeNode = Omit<BricksElement, 'children'> & {
  children: BricksTreeNode[]
}

export type BricksDocument = {
  elements: BricksElement[]
  roots: BricksTreeNode[]
  sourceElementCount: number
  parserWarnings: string[]
}

export type NormalizedImage = {
  sourceId?: number
  filename?: string
  url?: string
  payloadMediaId?: string
  status: 'resolved' | 'missing' | 'duplicate' | 'unresolved'
}

export type NormalizedVideo = {
  sourceUrl?: string
  attachmentId?: number
  poster?: NormalizedImage
  status: 'resolved' | 'missing' | 'unresolved'
}

export type NormalizedFaqQuestion = {
  sourceId: string
  questionTemplate?: string
  answerTemplate?: string
}

export type NormalizedFaqCategory = {
  sourceId: string
  title: string
  query?: Record<string, unknown>
  questions: NormalizedFaqQuestion[]
}

export type NormalizedTestimonial = {
  sourceId: string
  provider: string
  title?: string
  shortcode?: string
  collectionId?: string
}

export type NormalizedGalleryItem = {
  sourceId: string
  mediaId?: number
  mediaType?: 'image' | 'video' | 'dynamic-gallery'
  sourceUrl?: string
  dynamicSource?: string
  galleryId?: string
  settings: Record<string, unknown>
}

export type NormalizedIntegration = {
  sourceId: string
  provider: string
  shortcode?: string
  id?: string
  metadata: Record<string, unknown>
}

export type NormalizedSection = {
  type:
    | 'hero'
    | 'content'
    | 'image-text'
    | 'gallery'
    | 'video'
    | 'faq'
    | 'testimonial'
    | 'cta'
    | 'form'
    | 'before-after'
    | 'carousel'
    | 'sub-services'
    | 'prime-difference'
    | 'experience-difference'
    | 'service-areas'
    | 'testimonials'
    | 'booking'
    | 'contact-form'
    | 'find-us'
    | 'luxury-cta'
    | 'repair-services'
    | 'utility'
    | 'unsupported'
  order: number
  sourceId: string
  sourceElement: string
  data: Record<string, unknown>
  images: NormalizedImage[]
  videos: NormalizedVideo[]
  classification:
    | 'supported'
    | 'partial'
    | 'utility'
    | 'global'
    | 'missing-schema'
    | 'missing-renderer'
    | 'parser-error'
  reason?: string
  required?: string
  unsupportedElements: Array<{
    sourceElement: string
    actualElement: string
    classification: 'parser-error' | 'utility' | 'global' | 'missing-schema' | 'missing-renderer'
    reason: string
    required?: string
  }>
}

export type MediaDiagnostic = {
  reference: number | string
  attachment?: WordPressAttachment
  localPath?: string
  status: 'resolved' | 'missing-file' | 'unresolved-reference' | 'duplicate'
  warning?: string
}

export type PageMigrationResult = {
  page: WordPressPage
  bricks?: BricksDocument
  sections: NormalizedSection[]
  media: MediaDiagnostic[]
  warnings: string[]
  errors: string[]
}
