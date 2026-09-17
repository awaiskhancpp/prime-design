/**
 * Emits a JSON-LD `<script>`.
 *
 * The payload is already a JSON string built by `@/lib/structuredData`, so it
 * contains no user-controlled markup; `<` is escaped anyway so a stray value
 * can never close the script element early.
 */
export function JsonLd({ data }: { data: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: data.replace(/</g, '\u003c') }}
    />
  )
}
