import type { Field } from 'payload'

/**
 * Fields every video section shares: a summary of what the video says, plus
 * optional attribution.
 *
 * The site's videos are testimonials/project walkthroughs with burned-in
 * subtitles, and some carry a name lower-third (e.g. "Noah — Co-Owner").
 * `speakerName` / `speakerRole` are only meant to be filled in when the video
 * (or the source page) actually names the speaker — leave them empty rather
 * than guessing.
 *
 * `prefix` avoids clashes where the record already has a `summary` field
 * (the Projects collection) — it produces `videoSummary` etc.
 */
export const videoStoryFields = ({ prefix = '' }: { prefix?: string } = {}): Field[] => {
  const named = (name: string) =>
    prefix ? `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}` : name

  return [
    {
      name: named('summary'),
      type: 'richText',
      label: 'What this video says',
      admin: {
        description:
          'Short summary or quote from the video. Renders under the player, like a testimonial.',
      },
    },
    {
      name: named('speakerName'),
      type: 'text',
      label: 'Speaker name',
      admin: {
        description:
          'Only when the video names the speaker (on-screen lower-third or the source page). Leave empty if unknown.',
      },
    },
    {
      name: named('speakerRole'),
      type: 'text',
      label: 'Speaker role',
      admin: { description: 'e.g. "Homeowner", "Co-Owner", "Project Manager".' },
    },
  ]
}
