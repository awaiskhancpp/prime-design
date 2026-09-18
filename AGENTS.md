# Project Instructions

## Critical Rule

This is an existing production website migration/redesign.

DO NOT rewrite working components unnecessarily.

Before modifying anything:
1. Inspect the existing implementation.
2. Understand how the current component is used.
3. Check git diff.
4. Make the smallest change necessary.
5. Preserve existing behavior and visual design unless the task explicitly requests a redesign.

## Architecture

The project uses:

- Next.js
- Payload CMS
- TypeScript
- React
- Tailwind CSS

WordPress is the source of truth for migrated content.

## Migration Rules

Do not invent WordPress content.

Do not replace real migrated content with placeholder content.

Do not assume an empty Payload record means the WordPress source is empty.

When migrating WordPress/Bricks content:
- inspect the XML/source first
- preserve section order
- preserve repeated sections
- preserve media relationships
- preserve links
- preserve forms/modals
- preserve dynamic queries
- preserve SEO data

## Existing Architecture

Landing Pages use ordered sections.

Services contain reusable sections.

Service Locations inherit service content and use sparse overrides.

Do not replace this architecture with a new one unless explicitly instructed.

## Visual Design

Existing visual design is intentional.

Do not:
- arbitrarily change spacing
- change colors
- change typography
- replace components
- remove animations
- replace sliders with static galleries
- invent new UI patterns

unless explicitly requested.

## Before Editing

Always inspect:
- relevant component
- related data/types
- existing usages
- current git diff

## After Editing

Run the appropriate:
- typecheck
- lint
- build/test if relevant

Then inspect the resulting diff.

Never claim something works without verifying it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
