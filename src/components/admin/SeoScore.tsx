'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

/**
 * Live SEO strength panel for the `seo` field group — the same idea as the
 * Rank Math score the WordPress editors had: it scores the title and
 * description lengths, whether they are filled, the canonical and the
 * social image, and lists what to fix. Values are read straight from the
 * form, so it updates as you type.
 */

type Status = 'good' | 'warn' | 'bad'

const COLORS: Record<Status, string> = {
  good: '#1f9d55',
  warn: '#c98a00',
  bad: '#c0392b',
}

const ICONS: Record<Status, string> = { good: '✓', warn: '!', bad: '✕' }

function lengthCheck(value: string, min: number, max: number): Status {
  if (!value) return 'bad'
  const len = value.length
  if (len >= min && len <= max) return 'good'
  // Slightly outside the ideal window is still usable.
  if (len >= min - 15 && len <= max + 25) return 'warn'
  return 'bad'
}

export function SeoScore() {
  // Services/pages/projects use camelCase SEO fields; the blog collection
  // keeps its own snake_case group — read whichever exists.
  const pick = (fields: Record<string, { value?: unknown }> | undefined, ...paths: string[]) => {
    for (const path of paths) {
      const value = fields?.[path]?.value
      if (value !== undefined && value !== null && value !== '') return value
    }
    return undefined
  }

  const title = useFormFields(([fields]) =>
    String(pick(fields as never, 'seo.metaTitle', 'seo.meta_title') ?? ''),
  )
  const description = useFormFields(([fields]) =>
    String(pick(fields as never, 'seo.metaDescription', 'seo.meta_description') ?? ''),
  )
  const canonical = useFormFields(([fields]) =>
    String(pick(fields as never, 'seo.canonicalUrl', 'seo.canonical_url') ?? ''),
  )
  const noIndex = useFormFields(([fields]) =>
    Boolean(pick(fields as never, 'seo.noIndex', 'seo.no_index')),
  )
  const ogImage = useFormFields(
    ([fields]) => pick(fields as never, 'seo.ogImage', 'seo.meta_image') ?? null,
  )

  const titleStatus = lengthCheck(title, 50, 60)
  const descStatus = lengthCheck(description, 120, 160)

  const checks: Array<{ label: string; status: Status; hint: string }> = [
    {
      label: `SEO title — ${title.length} characters`,
      status: titleStatus,
      hint:
        titleStatus === 'good'
          ? 'Ideal length (50–60 characters).'
          : title.length === 0
            ? 'Add a title; without one the page title plus the site name is used.'
            : title.length < 50
              ? 'A bit short — aim for 50–60 characters so the result reads well.'
              : 'A bit long — Google truncates around 60 characters.',
    },
    {
      label: `Meta description — ${description.length} characters`,
      status: descStatus,
      hint:
        descStatus === 'good'
          ? 'Ideal length (120–160 characters).'
          : description.length === 0
            ? 'Add a description; it is the snippet under the title in search results.'
            : description.length < 120
              ? 'A bit short — aim for 120–160 characters.'
              : 'A bit long — aim for 120–160 characters; the rest is cut off.',
    },
    {
      label: 'Canonical URL',
      status: canonical ? 'good' : 'warn',
      hint: canonical ? canonical : 'Empty — set the preferred URL for this page.',
    },
    {
      label: 'Social share image',
      status: ogImage ? 'good' : 'warn',
      hint: ogImage ? 'Set.' : 'No OG image — social previews will use a fallback.',
    },
    {
      label: 'Indexing',
      status: noIndex ? 'warn' : 'good',
      hint: noIndex ? 'This page is hidden from search engines (no-index).' : 'Indexable.',
    },
  ]

  const score = Math.round(
    (titleStatus === 'good' ? 30 : titleStatus === 'warn' ? 18 : 0) +
      (descStatus === 'good' ? 30 : descStatus === 'warn' ? 18 : 0) +
      (canonical ? 15 : 0) +
      (ogImage ? 15 : 0) +
      (noIndex ? 0 : 10),
  )
  const verdict = score >= 80 ? 'Strong' : score >= 55 ? 'Good' : 'Needs work'
  const verdictColor = score >= 80 ? COLORS.good : score >= 55 ? COLORS.warn : COLORS.bad

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        padding: '1rem 1.25rem',
        border: '1px solid var(--theme-elevation-100)',
        borderRadius: '4px',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <strong style={{ fontSize: '0.95rem' }}>SEO score</strong>
        <span style={{ color: verdictColor, fontWeight: 600 }}>
          {score}/100 — {verdict}
        </span>
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.4rem' }}>
        {checks.map((check) => (
          <li key={check.label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', lineHeight: 1.45 }}>
            <span style={{ color: COLORS[check.status], fontWeight: 700, width: '1rem' }}>
              {ICONS[check.status]}
            </span>
            <span>
              <strong style={{ fontWeight: 600 }}>{check.label}</strong>
              {' — '}
              <span style={{ opacity: 0.75 }}>{check.hint}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
