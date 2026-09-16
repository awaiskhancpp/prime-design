/**
 * Guard: `payload migrate:create` is blocked.
 *
 * Wired up as the `migrate:create` package script so the command fails loudly
 * instead of running the Payload binary. See the "Migrations" section of
 * CLAUDE.md for the full explanation and the conditions for lifting this.
 */
const RED = '\u001b[31m'
const BOLD = '\u001b[1m'
const DIM = '\u001b[2m'
const OFF = '\u001b[0m'

console.error(`
${RED}${BOLD}migrate:create is blocked on this project.${OFF}

There are 39 migrations but only 25 schema snapshots, and the newest snapshot
(20260914_180701_video_story_fields.json) predates all 16 hand-written
migrations. \`migrate:create\` diffs the Payload config against that stale
snapshot, so it would emit SQL that DROPS the tables and columns those 16
migrations added — against live data.

${BOLD}Do not work around this by running the binary directly.${OFF}
${DIM}Restoring the baseline snapshot is the fix; the procedure and the list of the
16 snapshot-less migrations are in CLAUDE.md -> Migrations.${OFF}
`)

process.exit(1)
