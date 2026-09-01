# Project Continuation Guide: WordPress to Payload CMS Migration

## Project Context

This project is a migration of an existing WordPress website into a
modern Next.js + Payload CMS architecture.

The goal is not to simply recreate pages. The goal is to create a
reusable, scalable website system where: - Content is managed through
Payload CMS. - Services, locations, projects, SEO, and reusable sections
are dynamic. - The frontend uses reusable components instead of
hardcoded page-specific logic. - The final system can support future
websites/templates with minimal code changes.

------------------------------------------------------------------------

# Current Migration Goals

Continue migrating remaining WordPress pages, sections, and content into
Payload CMS while maintaining: - Existing URL structures where
required. - SEO consistency. - Visual accuracy compared to the original
website. - Reusable component architecture.

------------------------------------------------------------------------

# Important Existing Decisions

## Service Detail URLs

Originally, service detail pages did NOT use `/services`.

Example original structure:

    /kitchen-remodeling
    /bathroom-remodeling
    /home-remodeling

A requirement was later introduced to add `/services` behind service
detail pages.

The new expected structure is:

    /services/kitchen-remodeling
    /services/bathroom-remodeling
    /services/home-remodeling

Do not revert this decision.

Required actions: - Ensure all service detail pages use
`/services/[serviceSlug]`. - Add redirects from old URLs if required for
SEO. - Ensure internal links point to the new structure. - Update
breadcrumbs, metadata, sitemap, and navigation references.

------------------------------------------------------------------------

# Critical Issues To Fix

## 1. Duplicate Service Routing

Current architecture contains multiple service routing approaches.

Review and remove confusion between:

    /[serviceSlug]

and

    /services/[serviceSlug]

There should be one canonical service detail route.

The preferred route is:

    /services/[serviceSlug]

All service pages should render through the same reusable system.

------------------------------------------------------------------------

# 2. Hardcoded Service Pages

Avoid creating individual React pages for every service.

Do not create:

    KitchenRemodelingPage.tsx
    BathroomRemodelingPage.tsx
    AdditionPage.tsx

Instead:

Create a dynamic service renderer.

Example:

    Service
     |
     |-- Hero
     |-- About
     |-- Benefits
     |-- Process
     |-- Gallery
     |-- FAQ
     |-- Testimonials
     |-- CTA

The content should come from Payload CMS.

Adding a new service should require CMS changes, not frontend
development.

------------------------------------------------------------------------

# 3. Missing Pages

The following pages currently need implementation or review:

    /team
    /finance
    /book-online
    /remodeling-information
    /customer-cabinet
    /thank-you

For each page:

-   Compare against WordPress source.
-   Identify missing sections.
-   Build reusable components where possible.
-   Add proper SEO metadata.

------------------------------------------------------------------------

# 4. Missing or Incorrect Sections

Some pages do not match their WordPress versions.

Before marking any page complete:

Check:

-   Missing sections
-   Incorrect section order
-   Wrong images
-   Missing CTA blocks
-   Missing testimonials
-   Missing FAQs
-   Incorrect headings
-   Missing forms
-   Incorrect content

Do not assume a page is complete just because the route exists.

------------------------------------------------------------------------

# 5. Projects URL Issue

Current issue:

On the original website:

    /our-projects

Clicking a project goes to:

    /project/project-name

Current implementation incorrectly generates:

    /project-name

Fix:

Project links must follow:

    /project/[slug]

Update:

-   Project cards
-   Project detail routing
-   Internal links
-   Breadcrumbs
-   SEO metadata

------------------------------------------------------------------------

# 6. Payload CMS Architecture

Continue using Payload collections:

## Services

Should contain:

-   Title
-   Slug
-   Description
-   Hero content
-   Images
-   Sections/blocks
-   SEO

## Locations

Should contain:

-   City
-   SEO information
-   Related services

## Service Locations

Relationship:

    Service
    +
    Location

Example:

    Kitchen Remodeling
    +
    San Jose

creates:

    /services/kitchen-remodeling/san-jose

------------------------------------------------------------------------

# 7. Page Builder Improvements

The page builder should support reusable blocks.

Required blocks:

-   Hero
-   Rich Text
-   Image/Text Split
-   Gallery
-   Before/After
-   Testimonials
-   FAQ
-   Process Steps
-   Cards
-   CTA
-   Contact Form

Avoid creating one-off components for every page.

------------------------------------------------------------------------

# 8. SEO Requirements

Every page must have:

-   Title
-   Description
-   Canonical URL
-   Open Graph data
-   Proper indexing settings
-   Correct sitemap entries

SEO logic should be centralized.

Avoid repeating metadata logic in every page.

------------------------------------------------------------------------

# Development Workflow

For every remaining page:

1.  Compare WordPress page with current Payload version.
2.  Create a section checklist.
3.  Identify reusable components.
4.  Add missing Payload fields/blocks.
5.  Connect frontend renderer.
6.  Verify desktop/mobile layouts.
7.  Verify SEO.
8.  Test internal links.

------------------------------------------------------------------------

# Quality Checklist Before Completion

A page is complete only when:

## Content

-   All WordPress sections migrated.
-   Correct text/images used.

## Design

-   Matches original design.
-   Correct spacing.
-   Correct typography.
-   Correct responsive behavior.

## Functionality

-   Forms work.
-   Buttons work.
-   Links work.
-   Images load correctly.

## SEO

-   Metadata exists.
-   URLs are correct.
-   No duplicate routes.

## Architecture

-   No unnecessary hardcoding.
-   Uses Payload data.
-   Uses reusable components.

------------------------------------------------------------------------

# Final Objective

The final application should behave like a professional website template
system:

Adding a new service, location, or project should mostly happen inside
Payload CMS without requiring new frontend code.

The migration is considered complete only when the website is: -
Visually accurate. - CMS-driven. - SEO-safe. - Reusable. - Maintainable.
