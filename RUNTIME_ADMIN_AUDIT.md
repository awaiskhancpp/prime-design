# WordPress Runtime / Admin Audit — Prime Design & Build

**Audit phase:** second phase after the XML source audit  
**Scope:** determine where service/location page output comes from without creating Payload schemas, migration code, or frontend changes.  
**Source files inspected:** `C:\Users\HP\Downloads\primedesignampbuild.WordPress.2026-08-26.xml`, the current Next.js repository, and publicly rendered pages at `https://primedesignandbuild.com/`.  

## Access boundary

- **SOURCE FACT:** The current workspace contains the Next.js/Payload redesign and the XML export, but no WordPress installation, `wp-content` directory, active theme source, plugin source, WPCode export, ACF admin export, or WordPress database connection.
- **SOURCE FACT:** Direct browser inspection of the live site was blocked by Cloudflare in the in-app browser. The public text-rendered page snapshots were still available for read-only comparison, but raw DOM, CSS selectors, browser devtools, and page-source inspection were not available.
- **UNKNOWN / REQUIRES VERIFICATION:** WordPress admin screens, ACF field groups, Bricks templates/conditions, WPCode snippets, active theme files, and installed plugins cannot be inspected from the current environment.

## 1. LOCATION PAGE RENDERING MECHANISM

**Finding: likely shared service + city runtime rendering; exact mechanism not proven.**

- **SOURCE FACT:** The live Kitchen Remodeling in San Jose page renders a complete page despite the XML record having empty `post_content` and no Bricks payload. The rendered page includes a hero, city-specific heading/copy, bullets, multiple images, contact form, video, service/style sections, testimonials, and footer content. [San Jose page](https://primedesignandbuild.com/kitchen-remodeling/kitchen-remodeling-in-san-jose/)
- **SOURCE FACT:** The live Kitchen Remodeling in Palo Alto page presents the same section sequence and nearly the same copy, with Palo Alto substituted into headings, descriptions, calls to action, links, and review heading. [Palo Alto page](https://primedesignandbuild.com/kitchen-remodeling/kitchen-remodeling-in-palo-alto/)
- **SOURCE FACT:** The live Kitchen Remodeling in Campbell page presents the same section sequence as San Jose and Palo Alto, again substituting Campbell in the city-specific text and links. [Campbell page](https://primedesignandbuild.com/kitchen-remodeling/kitchen-remodeling-in-campbell/)
- **INFERENCE:** These are not 45 independent pages whose full visible layout is stored in each page record. They behave like instances of a shared service/location presentation with city-specific data.
- **UNKNOWN / REQUIRES VERIFICATION:** The exact implementation could be theme code, a plugin, WPCode, a custom page hook, an external data source, or a combination. XML plus public rendering cannot identify the responsible code path.

## 2. ACF STRUCTURE

- **SOURCE FACT:** The XML contains `city` on 45 non-empty location pages and `_city=field_64728a16a87d5` on those pages. It also contains `header_overlay_style` / `_header_overlay_style` and `header_text_color` / `_header_text_color` metadata.
- **SOURCE FACT:** The XML does not contain ACF field-group definitions, field types, location rules, conditional logic, defaults, or instructions describing how the fields are consumed.
- **INFERENCE:** `city` is an ACF-backed field or field with ACF-style reference metadata and is a primary input to location-page output, because its value tracks the rendered city text on the live pages.
- **UNKNOWN / REQUIRES VERIFICATION:** The ACF field-group name, field key for the visible field itself, field type, location rules, conditional logic, and whether `city` drives other fields cannot be established from the export.

### Required WordPress admin evidence

Provide a screenshot or export of **ACF → Field Groups → the group containing City** showing the group name, field names/keys/types, location rules, defaults, and conditional-logic panels. Also provide the field-group screen for the header fields.

## 3. BRICKS TEMPLATE STRUCTURE

- **SOURCE FACT:** Main service pages and kitchen style pages contain `_bricks_page_content_2`, `_bricks_editor_mode=bricks`, and `_bricks_template_type=content` in the XML.
- **SOURCE FACT:** The 45 location pages contain none of those Bricks fields.
- **SOURCE FACT:** The public Kitchen Remodeling root page has its own authored content sequence including a process, kitchen style cards, location links, testimonials, FAQs, and gallery content. [Kitchen Remodeling root](https://primedesignandbuild.com/kitchen-remodeling/)
- **INFERENCE:** The location-page layout is not stored as page-level Bricks content in the export. The root service page and location pages are therefore not equivalent storage models.
- **UNKNOWN / REQUIRES VERIFICATION:** No Bricks template assignment, condition, reusable-element ID, global element, theme style, or template ID can be proven from the XML. The exact Bricks contribution to location pages remains unknown.

### Required Bricks admin evidence

Provide screenshots or an export of:

1. **Bricks → Templates** list, including template IDs, types, conditions, and status.
2. Each candidate template’s **Conditions** panel.
3. **Bricks → Settings** and **Bricks → Theme Styles** relevant to page rendering.
4. The template assignment/conditions that would match page ID `1374`, parent ID `327`, or the `city` field.

## 4. WPCODE RELEVANT CODE

- **SOURCE FACT:** WPCode snippets are not present in the current workspace or XML export.
- **UNKNOWN / REQUIRES VERIFICATION:** No conclusion can be made about WPCode.

Search the WPCode admin for `city`, `post_parent`, `get_post_meta`, `get_field`, `the_content`, `template_redirect`, `kitchen`, `bathroom`, `home`, `location`, `shortcode`, and `bricks`. Export or screenshot any active snippet, including its insertion location, priority, device rules, and code.

## 5. ACTIVE THEME RELEVANT CODE

- **SOURCE FACT:** No WordPress theme files are present in the current workspace.
- **SOURCE FACT:** The XML shows only two `_wp_page_template` values and both are `default`; it does not provide theme PHP source.
- **UNKNOWN / REQUIRES VERIFICATION:** Whether `page.php`, `functions.php`, a custom page template, a hook, or a theme service/location helper renders the pages cannot be determined.

Required files or repository access: active theme name and version, `functions.php`, `page.php`, `single.php`, `header.php`, `footer.php`, all custom template files, and any files containing `city`, `get_field`, `get_post_meta`, `post_parent`, `the_content`, or the service slugs.

## 6. RELEVANT PLUGINS

- **SOURCE FACT:** The XML indicates Rank Math metadata, Bricks metadata, and ACF-style field references, but it does not provide a reliable installed-plugin inventory or plugin behavior.
- **INFERENCE:** Bricks, Advanced Custom Fields, Rank Math, and WPCode are the first plugins/systems that could reasonably affect rendering based on the export and the supplied task context.
- **UNKNOWN / REQUIRES VERIFICATION:** Whether another custom plugin, page-generator plugin, review plugin, form plugin, caching layer, or external API contributes to the page is not determinable.

Required evidence: **Plugins → Installed Plugins** screenshot/export with plugin names, versions, active status, and any must-use plugins; also inspect **Tools → Site Health → Info** for active theme and plugin details.

## 7. FRONTEND COMPARISON

### Kitchen Remodeling in San Jose

- **SOURCE FACT:** Hero: `Kitchen Remodeling in San Jose`.
- **SOURCE FACT:** Hero subtitle: `The recipe for a Dream Kitchen, Your Masterpiece.`
- **SOURCE FACT:** City-specific lead: `Serving San Jose with tailored kitchen remodeling solutions...`.
- **SOURCE FACT:** Three benefit bullets, several hero/section images, a contact form, a telephone CTA, a video, a `#1 Kitchen Remodeling Company in San Jose` section, a dream-kitchen section, Custom/European/Shaker cards, a shared promise section, testimonials, and footer/service-area content are rendered.
- **SOURCE FACT:** The review heading includes San Jose and the review/link labels are city-specific.

### Kitchen Remodeling in Palo Alto

- **SOURCE FACT:** The page has the same observable sequence as San Jose: hero, three bullets, contact form, video, service copy, three kitchen style cards, shared promise, reviews, and footer.
- **SOURCE FACT:** Palo Alto replaces San Jose in the hero lead, section headings, CTA text, style-card links, review heading, and related links.
- **SOURCE FACT:** Thumbnail/media references and review counts/images may differ in the rendered output.

### Kitchen Remodeling in Campbell

- **SOURCE FACT:** The same observable sequence is present, with Campbell substituted in city-specific content and links.
- **INFERENCE:** The identical sequence across three cities is strong frontend evidence of a shared renderer.

### Bathroom Remodeling in Palo Alto

- **SOURCE FACT:** The public page could not be independently opened through the current browser/web access path during this audit.
- **SOURCE FACT:** The XML confirms it is a child of Bathroom Remodeling, has city `Palo Alto`, a thumbnail, empty content, no Bricks payload, and a unique Rank Math description.
- **UNKNOWN / REQUIRES VERIFICATION:** Its exact rendered section sequence, FAQs, testimonials, process, and image behavior require direct browser/admin access.

### Home Remodeling in Palo Alto

- **SOURCE FACT:** The live page renders a Home Remodeling hero, city-specific copy, a contact form, a video, a `#1 Home Remodeling Company in Palo Alto` section, service/benefit content, Prime Difference cards, testimonials, and shared footer/service-area content. [Home Remodeling in Palo Alto](https://primedesignandbuild.com/home-remodeling/home-remodeling-in-palo-alto/)
- **SOURCE FACT:** Its content is service-specific rather than a literal copy of the Kitchen page, but it follows the same broad page-generation pattern: city data appears throughout the page while shared company/review/footer blocks remain.
- **INFERENCE:** The renderer likely has service-level variants plus a city input, rather than one completely identical template for all three services.

## 8. ACTUAL DATA FLOW

The strongest evidence-supported flow is:

```text
Request URL
  ↓
WordPress page record, e.g. ID 1374
  ↓
Parent = Kitchen Remodeling (ID 327)
  ↓
city = San Jose
  ↓
thumbnail ID = 1544
  ↓
Rank Math description + shared header metadata
  ↓
UNKNOWN: theme / plugin / WPCode / external renderer
  ↓
Rendered service + city page HTML
```

- **SOURCE FACT:** Every step above through the page metadata is present in the XML for ID 1374.
- **SOURCE FACT:** The final rendered HTML exists publicly even though page-level content and Bricks data are empty.
- **UNKNOWN / REQUIRES VERIFICATION:** The missing runtime step cannot be replaced with a definitive mechanism without WordPress admin, theme, plugin, or WPCode evidence.

## 9. WHAT IS SHARED

- **SOURCE FACT:** Kitchen location pages share the same visible section order and recurring content blocks across San Jose, Palo Alto, and Campbell.
- **SOURCE FACT:** Company-level content appears repeated: contact form, phone CTA, Prime Difference/promise content, testimonials/review widgets, service-area content, navigation, and footer.
- **SOURCE FACT:** The matching service parent is shared within each family.
- **INFERENCE:** Shared service-level template/presentation is likely, with a city variable and page-specific media/SEO metadata.
- **UNKNOWN / REQUIRES VERIFICATION:** Whether shared content comes from a parent page, a Bricks global element, a PHP template, WPCode, a plugin, or an external API.

## 10. WHAT IS CITY-SPECIFIC

- **SOURCE FACT:** City-specific page title, slug, `city` field, thumbnail ID, Rank Math description, and Rank Math analytic object ID vary in the XML.
- **SOURCE FACT:** Live Kitchen pages substitute the city in hero copy, headings, CTA text, related links, review heading, and location labels.
- **SOURCE FACT:** The three sampled Kitchen pages show city-specific media references in the rendered page snapshot.
- **INFERENCE:** City is a runtime content input, not merely an SEO-only field.
- **UNKNOWN / REQUIRES VERIFICATION:** Whether every image, FAQ, testimonial, process step, and paragraph is city-specific or only the text/link substitutions.

## 11. WHAT IS SERVICE-SPECIFIC

- **SOURCE FACT:** Kitchen, Bathroom, and Home location records use different parent IDs, thumbnail ranges, and SEO descriptions.
- **SOURCE FACT:** The public Home page uses Home Remodeling-specific hero and content language; the public Kitchen pages use kitchen-specific style cards, kitchen process, and kitchen FAQs.
- **INFERENCE:** The runtime likely selects a service-specific content variant based on the parent service, then applies city-level values.
- **UNKNOWN / REQUIRES VERIFICATION:** Whether this selection is implemented by parent-page lookup, service taxonomy, slug matching, hardcoded PHP arrays, ACF fields, or plugin data.

## 12. WHAT IS STORED IN WORDPRESS

- **SOURCE FACT:** Page identity: post ID, title, slug, status, parent ID, and links.
- **SOURCE FACT:** Location identity: `city` and ACF reference metadata.
- **SOURCE FACT:** Media identity: `_thumbnail_id`.
- **SOURCE FACT:** Presentation defaults: header overlay and header text color metadata.
- **SOURCE FACT:** SEO metadata: Rank Math description, selected titles, score, analytic ID, schema, robots, and internal-link processing markers.
- **SOURCE FACT:** For the 45 location pages, the XML does not store page-level body content or Bricks element trees.

## 13. WHAT IS GENERATED AT RUNTIME

- **SOURCE FACT:** A complete page is rendered for location records whose exported page body and Bricks payload are empty.
- **INFERENCE:** Hero, service sections, city substitutions, process/FAQ/review/CTA blocks, and much of the page layout are generated or assembled at runtime from data outside the location page’s XML record.
- **UNKNOWN / REQUIRES VERIFICATION:** The exact source and precedence of each runtime block.

## 14. WHAT CANNOT BE DETERMINED

- The exact theme/plugin/WPCode function responsible for rendering.
- Whether a Bricks template is assigned by condition and omitted from the export.
- Whether the parent page supplies content at runtime.
- Whether ACF `city` triggers conditional logic or is simply read directly.
- Whether content is stored in options, global Bricks elements, plugin tables, a custom post type, an API, or hardcoded PHP arrays.
- Whether Bathroom location pages use the same exact section sequence as Kitchen and Home.
- Whether the live rendered HTML changes after cache invalidation or differs by device/user state.

## 15. EXACTLY WHAT WE NEED TO MIGRATE TO PAYLOAD

This is a content inventory, not a schema recommendation.

- Preserve the service identity and actual WordPress parent relationship.
- Preserve city values and canonical slugs/URLs.
- Preserve page title and all city-specific hero/lead copy visible on the live page.
- Preserve thumbnail/hero and all page-specific image relationships after mapping attachment IDs to files.
- Preserve service-specific content: process steps, style/service cards, FAQs, testimonials/review selections, CTA labels, service areas, and any video references, but first verify their source in WordPress runtime/admin.
- Preserve Rank Math title when present, Rank Math description, robots directives, schema values, and any canonical/redirect metadata found in admin.
- Preserve global company content separately from location-specific content: contact details, navigation, footer, review summaries, service-area list, and shared CTA copy.
- Preserve the 45 live URL paths unless a URL migration decision is made later; do not infer replacement URLs from the redesign.
- Do not migrate Bricks spacing, typography, layout settings, element IDs, or visual effects as content.

## Critical answer

**INFERENCE — strongest current answer:** The 45 location pages behave as **SERVICE + CITY + SHARED RUNTIME TEMPLATE**, with service-level variants. They do not behave like 45 independent pages containing their own full layout/content records.

**Confidence boundary:** This conclusion is supported by XML storage signatures plus live frontend comparison of Kitchen San Jose, Kitchen Palo Alto, Kitchen Campbell, and Home Palo Alto. It is not yet a definitive implementation-level answer because the WordPress admin, active theme, plugin code, WPCode, ACF configuration, and Bricks conditions were not accessible.

## Exact evidence still required from WordPress

Please provide one of the following:

1. Temporary WordPress admin access or a screen recording of the requested admin paths.
2. A full WordPress backup containing `wp-content`, the active theme, plugins, and database.
3. Screenshots/exports of the ACF field group, Bricks templates and conditions, WPCode snippets, active theme details, and installed plugins.
4. Raw HTML/page source for the San Jose, Palo Alto, and Bathroom Palo Alto pages if admin/code access cannot be provided.

No Payload schema or frontend design changes were made during this phase.
