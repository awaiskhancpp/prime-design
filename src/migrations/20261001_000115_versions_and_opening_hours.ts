import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Version history and structured opening hours (generated with
 * `migrate:create`; additive — 194 version tables, no existing table touched).
 *
 * - `versions` on Pages, Services, Service Locations, Landing Pages, Blog and
 *   FAQs (last 20 saves each) and on the Site Settings, Navigation, Booking and
 *   Shared Sections globals (last 20): every save is kept and can be compared
 *   and restored from the admin's Versions tab. No drafts — saving still
 *   publishes, exactly as before.
 * - Site Settings → Company → Opening hours (for Google), seeded with the hours
 *   the site states, "Open: 8am - 6pm (Mon - Fri)": Mon–Fri 08:00–18:00. The
 *   structured data used to guess this from that sentence with a pattern.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__services_v_version_section_order_section" AS ENUM('intro', 'video', 'estimate', 'offerings', 'process', 'client-approach', 'gallery', 'craftsmanship', 'real-homes', 'why-choose-us', 'prime-difference', 'prime-kitchens', 'image-checklist', 'icon-checklist-gallery', 'materials-showcase', 'testimonial-cards', 'quote', 'faq', 'silicon-valley-loves', 'reviews', 'contact', 'service-areas', 'areas-we-service', 'home-repair-categories', 'cms-body');
  CREATE TYPE "public"."enum__services_v_blocks_cta_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum__services_v_blocks_cta_layout" AS ENUM('estimate', 'finance-hub', 'finance-cta', 'standard');
  CREATE TYPE "public"."enum__services_blocks_image_text_2_v_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum__services_blocks_image_text_2_v_alignment" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__services_blocks_video_2_v_source" AS ENUM('media', 'externalUrl');
  CREATE TYPE "public"."enum__services_v_blocks_luxury_cta_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum__services_v_version_silicon_valley_loves_buttons_variant" AS ENUM('outline', 'brass');
  CREATE TYPE "public"."enum__service_locations_v_silicon_valley_loves_buttons_variant" AS ENUM('outline', 'brass');
  CREATE TYPE "public"."enum__service_locations_v_version_section_overrides_section_key" AS ENUM('intro', 'video', 'offerings', 'quote', 'prime-difference', 'reviews', 'testimonial-cards', 'silicon-valley-loves', 'contact');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_cta_style" AS ENUM('filled', 'outlined');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_align" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_custom_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__blog_v_version_sections_image_position" AS ENUM('left', 'right', 'center');
  CREATE TYPE "public"."enum__blog_v_version_status" AS ENUM('draft', 'published', 'scheduled');
  CREATE TYPE "public"."enum__blog_v_version_scheduled_publish_slot" AS ENUM('0', '6', '12', '18');
  CREATE TYPE "public"."enum__landing_pages_v_blocks_hero_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum__landing_pages_v_blocks_cta_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum__landing_pages_v_blocks_image_text_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum__landing_pages_v_blocks_image_text_alignment" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__landing_pages_v_blocks_video_source" AS ENUM('media', 'externalUrl');
  CREATE TYPE "public"."enum__landing_pages_v_blocks_luxury_cta_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum__landing_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_company_opening_hours_days" AS ENUM('Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su');
  CREATE TYPE "public"."enum__site_settings_v_version_company_opening_hours_days" AS ENUM('Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su');
  CREATE TYPE "public"."enum__site_settings_v_version_trust_intro_buttons_variant" AS ENUM('outline', 'brass');
  CREATE TYPE "public"."enum__shared_sections_v_silicon_valley_loves_buttons_variant" AS ENUM('outline', 'brass');
  CREATE TYPE "public"."enum__shared_sections_v_services_estimate_band_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum__booking_settings_v_version_closed_weekdays" AS ENUM('0', '1', '2', '3', '4', '5', '6');
  CREATE TABLE "_faqs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_question" varchar NOT NULL,
  	"version_answer" jsonb NOT NULL,
  	"version_category_id" integer NOT NULL,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_visible" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_services_v_version_section_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"section" "enum__services_v_version_section_order_section" NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__services_v_blocks_cta_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__services_v_blocks_cta_layout" DEFAULT 'standard',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_blocks_image_text_2_v_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__services_blocks_image_text_2_v_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_blocks_image_text_2_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" jsonb,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"alignment" "enum__services_blocks_image_text_2_v_alignment",
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_blocks_video_2_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source" "enum__services_blocks_video_2_v_source",
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"controls" boolean DEFAULT true,
  	"source_video_id" varchar,
  	"summary" jsonb,
  	"speaker_name" varchar,
  	"speaker_role" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_blocks_gallery_2_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric,
  	"source_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_blocks_gallery_2_v_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric,
  	"source_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_blocks_gallery_2_v_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_blocks_gallery_2_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"layout" jsonb,
  	"lightbox" boolean DEFAULT true,
  	"source_gallery_type" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_project_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_asset_id" integer,
  	"image_alt" varchar,
  	"image_caption" varchar,
  	"image_source_attachment_id" numeric,
  	"image_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_project_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"eyebrow_icon_icon_media_id" integer,
  	"eyebrow_icon_icon_library" varchar,
  	"eyebrow_icon_icon_name" varchar,
  	"eyebrow_icon_source_svg_url" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"before_media_id" integer,
  	"after_media_id" integer,
  	"before_label" varchar,
  	"after_label" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_blocks_sub_services_2_v_items_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_blocks_sub_services_2_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"body" varchar,
  	"label" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_blocks_sub_services_2_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_href" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_prime_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_icon_media_id" integer,
  	"icon_icon_library" varchar,
  	"icon_icon_name" varchar,
  	"icon_source_svg_url" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_prime_difference_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_prime_difference_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_prime_difference_comparisons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"before_media_id" integer,
  	"after_media_id" integer,
  	"before_label" varchar,
  	"after_label" varchar,
  	"caption" varchar,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_prime_difference_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"caption" varchar,
  	"source_video_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_prime_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_experience_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_icon_media_id" integer,
  	"icon_icon_library" varchar,
  	"icon_icon_name" varchar,
  	"icon_source_svg_url" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_experience_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_service_areas_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"location_id" integer,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_service_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"region_heading" varchar,
  	"map_media_asset_id" integer,
  	"map_media_alt" varchar,
  	"map_media_caption" varchar,
  	"map_media_source_attachment_id" numeric,
  	"map_media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_repair_services_categories_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_repair_services_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"eyebrow" varchar,
  	"label" varchar,
  	"description" jsonb,
  	"closing_body" jsonb,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_repair_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_luxury_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__services_v_blocks_luxury_cta_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_luxury_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_booking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"anchor_id" varchar,
  	"consultation_label" varchar,
  	"provider" varchar,
  	"shortcode" varchar,
  	"source_element_id" varchar,
  	"integration_metadata" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"anchor_id" varchar,
  	"provider" varchar,
  	"shortcode" varchar,
  	"source_element_id" varchar,
  	"integration_metadata" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_find_us_map_pins" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"latitude" numeric,
  	"longitude" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_find_us" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"address" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_landing_testimonials_providers_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"reviewer" varchar,
  	"rating" numeric,
  	"body" varchar,
  	"date" varchar,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_landing_testimonials_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"collection_id" varchar,
  	"review_url" varchar,
  	"rating" numeric,
  	"review_count" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_landing_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_faq_categories_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_faq_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"source_query" jsonb,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_video_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"caption" varchar,
  	"source_id" varchar,
  	"source_order" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_video_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"settings" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric,
  	"source_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"settings" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_version_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_location_hero_blurbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_silicon_valley_loves_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"detail" varchar,
  	"show_stars" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_silicon_valley_loves_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__services_v_version_silicon_valley_loves_buttons_variant" DEFAULT 'outline',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_why_choose_us_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_real_homes_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"attribution" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_prime_kitchens_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_icon_checklist_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_icon_checklist_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_image_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_materials_showcase_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_parent_service_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_show_in_consultation_form" boolean DEFAULT true,
  	"version_consultation_label" varchar,
  	"version_consultation_image_id" integer,
  	"version_consultation_duration" varchar,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_short_description" varchar,
  	"version_excerpt" varchar,
  	"version_intro_heading" varchar,
  	"version_featured_image_id" integer,
  	"version_description" varchar,
  	"version_overview_key_features" jsonb,
  	"version_overview_benefits" jsonb,
  	"version_overview_process" jsonb,
  	"version_craftsmanship" jsonb,
  	"version_craftsmanship_cta_label" varchar,
  	"version_craftsmanship_cta_href" varchar,
  	"version_client_approach" jsonb,
  	"version_client_approach_image_id" integer,
  	"version_process_eyebrow" varchar,
  	"version_process_title" varchar,
  	"version_process_description" varchar,
  	"version_location_hero_lede" varchar,
  	"version_location_hero_body" varchar,
  	"version_location_hero_form_subject" varchar,
  	"version_dont_settle_eyebrow" varchar,
  	"version_dont_settle_heading" varchar,
  	"version_dont_settle_heading_accent" varchar,
  	"version_dont_settle_body" varchar,
  	"version_dont_settle_cta_label" varchar,
  	"version_dont_settle_image_id" integer,
  	"version_location_video_eyebrow" varchar,
  	"version_location_video_title" varchar,
  	"version_location_video_description" varchar,
  	"version_location_video_tagline" varchar,
  	"version_location_video_video_url" varchar,
  	"version_location_video_poster_id" integer,
  	"version_quote_heading" varchar,
  	"version_quote_quote" varchar,
  	"version_quote_attribution" varchar,
  	"version_quote_image_id" integer,
  	"version_silicon_valley_loves_eyebrow" varchar,
  	"version_silicon_valley_loves_heading" varchar,
  	"version_silicon_valley_loves_body" varchar,
  	"version_silicon_valley_loves_image_id" integer,
  	"version_why_choose_us_eyebrow" varchar,
  	"version_why_choose_us_heading" varchar,
  	"version_real_homes_eyebrow" varchar,
  	"version_real_homes_heading" varchar,
  	"version_real_homes_heading_accent" varchar,
  	"version_real_homes_description" varchar,
  	"version_real_homes_cta_label" varchar,
  	"version_real_homes_cta_href" varchar,
  	"version_areas_we_service_heading" varchar,
  	"version_hero_eyebrow" varchar,
  	"version_hero_heading" varchar,
  	"version_hero_lead" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_image_secondary_id" integer,
  	"version_hero_video_id" integer,
  	"version_prime_kitchens_eyebrow" varchar,
  	"version_prime_kitchens_title" varchar,
  	"version_prime_kitchens_description" varchar,
  	"version_prime_kitchens_passion_heading" varchar,
  	"version_icon_checklist_gallery_eyebrow" varchar,
  	"version_icon_checklist_gallery_heading" varchar,
  	"version_image_checklist_eyebrow" varchar,
  	"version_image_checklist_heading" varchar,
  	"version_image_checklist_description" varchar,
  	"version_image_checklist_image_id" integer,
  	"version_materials_showcase_eyebrow" varchar,
  	"version_materials_showcase_heading" varchar,
  	"version_materials_showcase_description" varchar,
  	"version_faq_category_id" integer,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer,
  	"media_id" integer,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "_service_locations_v_version_location_hero_blurbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_service_locations_v_version_offerings_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_service_locations_v_version_prime_difference_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_service_locations_v_version_prime_difference_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"image" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_service_locations_v_version_silicon_valley_loves_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"detail" varchar,
  	"show_stars" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_service_locations_v_version_silicon_valley_loves_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__service_locations_v_silicon_valley_loves_buttons_variant" DEFAULT 'outline',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_service_locations_v_version_section_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"section_key" "enum__service_locations_v_version_section_overrides_section_key" NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_service_locations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_service_id" integer NOT NULL,
  	"version_location_id" integer NOT NULL,
  	"version_location_hero_lede" varchar,
  	"version_location_hero_body" varchar,
  	"version_location_hero_form_subject" varchar,
  	"version_location_video_eyebrow" varchar,
  	"version_location_video_title" varchar,
  	"version_location_video_description" varchar,
  	"version_location_video_tagline" varchar,
  	"version_location_video_video_url" varchar,
  	"version_location_video_poster_id" integer,
  	"version_dont_settle_eyebrow" varchar,
  	"version_dont_settle_heading" varchar,
  	"version_dont_settle_heading_accent" varchar,
  	"version_dont_settle_body" varchar,
  	"version_dont_settle_cta_label" varchar,
  	"version_dont_settle_image_id" integer,
  	"version_offerings_heading" varchar,
  	"version_offerings_description" varchar,
  	"version_offerings_primary_cta_label" varchar,
  	"version_offerings_primary_cta_href" varchar,
  	"version_offerings_secondary_cta_label" varchar,
  	"version_offerings_secondary_cta_href" varchar,
  	"version_quote_heading" varchar,
  	"version_quote_quote" varchar,
  	"version_quote_attribution" varchar,
  	"version_quote_image_id" integer,
  	"version_prime_difference_eyebrow" varchar,
  	"version_prime_difference_heading" varchar,
  	"version_prime_difference_body" jsonb,
  	"version_silicon_valley_loves_eyebrow" varchar,
  	"version_silicon_valley_loves_heading" varchar,
  	"version_silicon_valley_loves_body" varchar,
  	"version_silicon_valley_loves_image_id" integer,
  	"version_city" varchar,
  	"version_featured_image_id" integer,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_service_locations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"image_secondary_id" integer,
  	"video_id" integer,
  	"video_url" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_style" "enum__pages_v_blocks_hero_cta_style" DEFAULT 'filled',
  	"cta_show_calendar_icon" boolean DEFAULT false,
  	"align" "enum__pages_v_blocks_hero_align" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_difference_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_difference_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"poster_id" integer,
  	"summary" jsonb,
  	"speaker_name" varchar,
  	"speaker_role" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_blocks_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"before_image_id" integer,
  	"after_image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_highlight" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"intro_heading" varchar,
  	"intro_subheading" varchar,
  	"intro_body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_guiding_principle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_secondary_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_core_values_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_core_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_experts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"video_id" integer,
  	"poster_id" integer,
  	"badge_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"summary" jsonb,
  	"speaker_name" varchar,
  	"speaker_role" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_social_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_why_choose_us_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_why_choose_us" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"eyebrow_accent" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"poster_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_index" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"all_label" varchar,
  	"empty_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_consultations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"assurance_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial_videos_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"speaker" varchar,
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_review_highlights_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_path" varchar,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_review_highlights_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"rating" numeric,
  	"count" numeric,
  	"url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_review_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"review_limit" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_note" varchar,
  	"review_limit" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_custom_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_custom" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_side" "enum__pages_v_blocks_custom_image_side" DEFAULT 'right',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_policy_sections_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead" varchar,
  	"body" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_policy_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_policy" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"show_contact_details" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_next_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_link_list_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_hero_eyebrow" varchar,
  	"version_hero_heading" varchar,
  	"version_hero_description" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_cta_label" varchar,
  	"version_hero_cta_href" varchar,
  	"version_is_google_ads_page" boolean DEFAULT false,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_blog_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"image_id" integer,
  	"image_alt" varchar,
  	"image_position" "enum__blog_v_version_sections_image_position" DEFAULT 'center',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_blog_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_wordpress_id" numeric,
  	"version_source_url" varchar,
  	"version_status" "enum__blog_v_version_status" DEFAULT 'draft' NOT NULL,
  	"version_scheduled_publish_date" timestamp(3) with time zone,
  	"version_scheduled_publish_slot" "enum__blog_v_version_scheduled_publish_slot",
  	"version_scheduled_publish_at" timestamp(3) with time zone,
  	"version_published_date" timestamp(3) with time zone,
  	"version_author_id" integer,
  	"version_excerpt" varchar,
  	"version_featured_image_id" integer NOT NULL,
  	"version_intro" jsonb,
  	"version_content" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_meta_image_id" integer,
  	"version_seo_keywords" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_blog_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"blog_categories_id" integer
  );
  
  CREATE TABLE "_landing_pages_v_blocks_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__landing_pages_v_blocks_hero_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"background_media_asset_id" integer,
  	"background_media_alt" varchar,
  	"background_media_caption" varchar,
  	"background_media_source_attachment_id" numeric,
  	"background_media_source_url" varchar,
  	"background_video_asset_id" integer,
  	"background_video_alt" varchar,
  	"background_video_caption" varchar,
  	"background_video_source_attachment_id" numeric,
  	"background_video_source_url" varchar,
  	"foreground_media_asset_id" integer,
  	"foreground_media_alt" varchar,
  	"foreground_media_caption" varchar,
  	"foreground_media_source_attachment_id" numeric,
  	"foreground_media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__landing_pages_v_blocks_cta_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_image_text_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__landing_pages_v_blocks_image_text_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" jsonb,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"alignment" "enum__landing_pages_v_blocks_image_text_alignment",
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_benefit_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_benefit_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"decorative_media_asset_id" integer,
  	"decorative_media_alt" varchar,
  	"decorative_media_caption" varchar,
  	"decorative_media_source_attachment_id" numeric,
  	"decorative_media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_craftsmanship_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_craftsmanship_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_craftsmanship" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"decorative_media_asset_id" integer,
  	"decorative_media_alt" varchar,
  	"decorative_media_caption" varchar,
  	"decorative_media_source_attachment_id" numeric,
  	"decorative_media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source" "enum__landing_pages_v_blocks_video_source",
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"controls" boolean DEFAULT true,
  	"source_video_id" varchar,
  	"summary" jsonb,
  	"speaker_name" varchar,
  	"speaker_role" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric,
  	"source_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_gallery_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric,
  	"source_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_gallery_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"layout" jsonb,
  	"lightbox" boolean DEFAULT true,
  	"source_gallery_type" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_project_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_asset_id" integer,
  	"image_alt" varchar,
  	"image_caption" varchar,
  	"image_source_attachment_id" numeric,
  	"image_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_project_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"eyebrow_icon_icon_media_id" integer,
  	"eyebrow_icon_icon_library" varchar,
  	"eyebrow_icon_icon_name" varchar,
  	"eyebrow_icon_source_svg_url" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"before_media_id" integer,
  	"after_media_id" integer,
  	"before_label" varchar,
  	"after_label" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_sub_services_items_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_sub_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"body" varchar,
  	"label" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_sub_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_href" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_prime_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_icon_media_id" integer,
  	"icon_icon_library" varchar,
  	"icon_icon_name" varchar,
  	"icon_source_svg_url" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_prime_difference_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_prime_difference_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_prime_difference_comparisons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"before_media_id" integer,
  	"after_media_id" integer,
  	"before_label" varchar,
  	"after_label" varchar,
  	"caption" varchar,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_prime_difference_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"caption" varchar,
  	"source_video_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_prime_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_experience_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_icon_media_id" integer,
  	"icon_icon_library" varchar,
  	"icon_icon_name" varchar,
  	"icon_source_svg_url" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_experience_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_service_areas_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"location_id" integer,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_service_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"region_heading" varchar,
  	"map_media_asset_id" integer,
  	"map_media_alt" varchar,
  	"map_media_caption" varchar,
  	"map_media_source_attachment_id" numeric,
  	"map_media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_repair_services_categories_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_repair_services_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"eyebrow" varchar,
  	"label" varchar,
  	"description" jsonb,
  	"closing_body" jsonb,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_repair_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_luxury_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__landing_pages_v_blocks_luxury_cta_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_luxury_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_booking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"anchor_id" varchar,
  	"consultation_label" varchar,
  	"provider" varchar,
  	"shortcode" varchar,
  	"source_element_id" varchar,
  	"integration_metadata" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"anchor_id" varchar,
  	"provider" varchar,
  	"shortcode" varchar,
  	"source_element_id" varchar,
  	"integration_metadata" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_find_us_map_pins" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"latitude" numeric,
  	"longitude" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_find_us" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"address" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_landing_testimonials_providers_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"reviewer" varchar,
  	"rating" numeric,
  	"body" varchar,
  	"date" varchar,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_landing_testimonials_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"collection_id" varchar,
  	"review_url" varchar,
  	"rating" numeric,
  	"review_count" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_landing_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_faq_categories_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_faq_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"source_query" jsonb,
  	"source_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_video_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"caption" varchar,
  	"source_id" varchar,
  	"source_order" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_video_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"settings" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_gallery_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric,
  	"source_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v_blocks_gallery_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"settings" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_landing_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_status" "enum__landing_pages_v_version_status" DEFAULT 'draft',
  	"version_service_id" integer,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_source_word_press_id" numeric,
  	"version_source_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_landing_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer
  );
  
  CREATE TABLE "site_settings_company_opening_hours_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_site_settings_company_opening_hours_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_company_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_company_opening_hours_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__site_settings_v_version_company_opening_hours_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_company_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_company_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"address" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_service_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"location_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_trust_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"show_stars" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_trust_intro_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__site_settings_v_version_trust_intro_buttons_variant" DEFAULT 'outline',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_top_banner_enabled" boolean DEFAULT true,
  	"version_company_name" varchar,
  	"version_company_email" varchar,
  	"version_company_email_link" varchar,
  	"version_company_phone" varchar,
  	"version_company_phone_clean" varchar,
  	"version_company_phone_cta" varchar,
  	"version_company_license" varchar,
  	"version_company_hours" varchar,
  	"version_company_service_region" varchar,
  	"version_company_maps_url" varchar,
  	"version_social_links_google_business" varchar,
  	"version_social_links_yelp" varchar,
  	"version_social_links_houzz" varchar,
  	"version_social_links_bbb" varchar,
  	"version_reviews_google_icon_id" integer,
  	"version_reviews_yelp_icon_id" integer,
  	"version_reviews_google_rating" numeric,
  	"version_reviews_google_review_count" numeric,
  	"version_reviews_yelp_rating" numeric,
  	"version_reviews_yelp_review_count" numeric,
  	"version_trust_intro_eyebrow" varchar,
  	"version_trust_intro_heading" varchar,
  	"version_trust_intro_body" varchar,
  	"version_trust_intro_image_id" integer,
  	"version_analytics_tracking_google_tag_manager_id" varchar,
  	"version_analytics_tracking_google_tag_id" varchar,
  	"version_analytics_tracking_google_analytics_id" varchar,
  	"version_analytics_tracking_google_ads_id" varchar,
  	"version_analytics_tracking_meta_pixel_id" varchar,
  	"version_analytics_tracking_clarity_project_id" varchar,
  	"version_analytics_tracking_nimbata_tracking_number" varchar,
  	"version_analytics_tracking_nimbata_script" varchar,
  	"version_analytics_verification_google" varchar,
  	"version_analytics_verification_bing" varchar,
  	"version_analytics_verification_yandex" varchar,
  	"version_analytics_verification_pinterest" varchar,
  	"version_analytics_verification_facebook_domain_verification" varchar,
  	"version_analytics_custom_head_code" varchar,
  	"version_analytics_custom_body_start_code" varchar,
  	"version_analytics_custom_body_end_code" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_default_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_shared_sections_v_version_prime_difference_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shared_sections_v_version_prime_difference_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"image" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shared_sections_v_version_silicon_valley_loves_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"detail" varchar,
  	"show_stars" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shared_sections_v_version_silicon_valley_loves_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__shared_sections_v_silicon_valley_loves_buttons_variant" DEFAULT 'outline',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shared_sections_v_version_landing_prime_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_icon_media_id" integer,
  	"icon_icon_library" varchar,
  	"icon_icon_name" varchar,
  	"icon_source_svg_url" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shared_sections_v_landing_exp_diff_features_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_icon_media_id" integer,
  	"icon_icon_library" varchar,
  	"icon_icon_name" varchar,
  	"icon_source_svg_url" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shared_sections_v_version_landing_service_areas_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"location_id" integer,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shared_sections_v_version_services_estimate_band_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum__shared_sections_v_services_estimate_band_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_shared_sections_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_location_video_eyebrow" varchar,
  	"version_location_video_title" varchar,
  	"version_location_video_description" varchar,
  	"version_location_video_tagline" varchar,
  	"version_location_video_video_url" varchar,
  	"version_location_video_poster_id" integer,
  	"version_dont_settle_eyebrow" varchar,
  	"version_dont_settle_heading" varchar,
  	"version_dont_settle_heading_accent" varchar,
  	"version_dont_settle_body" varchar,
  	"version_dont_settle_cta_label" varchar,
  	"version_dont_settle_image_id" integer,
  	"version_quote_heading" varchar,
  	"version_quote_quote" varchar,
  	"version_quote_attribution" varchar,
  	"version_quote_image_id" integer,
  	"version_prime_difference_eyebrow" varchar,
  	"version_prime_difference_heading" varchar,
  	"version_prime_difference_body" jsonb,
  	"version_silicon_valley_loves_eyebrow" varchar,
  	"version_silicon_valley_loves_heading" varchar,
  	"version_silicon_valley_loves_body" varchar,
  	"version_silicon_valley_loves_image_id" integer,
  	"version_landing_prime_difference_eyebrow" varchar,
  	"version_landing_prime_difference_heading" varchar,
  	"version_landing_experience_difference_eyebrow" varchar,
  	"version_landing_experience_difference_heading" varchar,
  	"version_landing_service_areas_eyebrow" varchar,
  	"version_landing_service_areas_heading" varchar,
  	"version_landing_service_areas_region_heading" varchar,
  	"version_landing_service_areas_map_media_asset_id" integer,
  	"version_landing_service_areas_map_media_alt" varchar,
  	"version_landing_service_areas_map_media_caption" varchar,
  	"version_landing_service_areas_map_media_source_attachment_id" numeric,
  	"version_landing_service_areas_map_media_source_url" varchar,
  	"version_landing_luxury_cta_heading" varchar,
  	"version_landing_find_us_heading" varchar,
  	"version_services_estimate_band_heading" varchar,
  	"version_services_estimate_band_description" jsonb,
  	"version_services_areas_heading" varchar,
  	"version_services_consultation_duration" varchar,
  	"version_services_client_approach_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_shared_sections_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "_navigation_v_version_header_items_dropdown_sub_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"service_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_header_items_dropdown" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"service_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_header_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"service_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_footer_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_footer_service_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"service_id" integer NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_footer_copyright" varchar,
  	"version_footer_privacy_policy_label" varchar DEFAULT 'Privacy Policy' NOT NULL,
  	"version_footer_privacy_policy_page_id" integer NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_booking_settings_v_version_slots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"time" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_booking_settings_v_version_closed_weekdays" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__booking_settings_v_version_closed_weekdays",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_booking_settings_v_version_closed_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_booking_settings_v_version_date_capacities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"capacity" numeric NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_booking_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_appointment_minutes" numeric DEFAULT 60,
  	"version_min_notice_hours" numeric DEFAULT 24,
  	"version_daily_capacity" numeric DEFAULT 3,
  	"version_booking_window_days" numeric DEFAULT 90,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "_faqs_v" ADD CONSTRAINT "_faqs_v_parent_id_faqs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faqs_v" ADD CONSTRAINT "_faqs_v_version_category_id_faq_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."faq_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_section_order" ADD CONSTRAINT "_services_v_version_section_order_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta_buttons" ADD CONSTRAINT "_services_v_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta" ADD CONSTRAINT "_services_v_blocks_cta_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta" ADD CONSTRAINT "_services_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_image_text_2_v_buttons" ADD CONSTRAINT "_services_blocks_image_text_2_v_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_blocks_image_text_2_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_image_text_2_v" ADD CONSTRAINT "_services_blocks_image_text_2_v_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_blocks_image_text_2_v" ADD CONSTRAINT "_services_blocks_image_text_2_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_video_2_v" ADD CONSTRAINT "_services_blocks_video_2_v_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_blocks_video_2_v" ADD CONSTRAINT "_services_blocks_video_2_v_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_blocks_video_2_v" ADD CONSTRAINT "_services_blocks_video_2_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_gallery_2_v_items" ADD CONSTRAINT "_services_blocks_gallery_2_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_blocks_gallery_2_v_items" ADD CONSTRAINT "_services_blocks_gallery_2_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_blocks_gallery_2_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_gallery_2_v_groups_items" ADD CONSTRAINT "_services_blocks_gallery_2_v_groups_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_blocks_gallery_2_v_groups_items" ADD CONSTRAINT "_services_blocks_gallery_2_v_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_blocks_gallery_2_v_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_gallery_2_v_groups" ADD CONSTRAINT "_services_blocks_gallery_2_v_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_blocks_gallery_2_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_gallery_2_v" ADD CONSTRAINT "_services_blocks_gallery_2_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_project_grid_items" ADD CONSTRAINT "_services_v_blocks_project_grid_items_image_asset_id_media_id_fk" FOREIGN KEY ("image_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_project_grid_items" ADD CONSTRAINT "_services_v_blocks_project_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_project_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_project_grid" ADD CONSTRAINT "_services_v_blocks_project_grid_eyebrow_icon_icon_media_id_media_id_fk" FOREIGN KEY ("eyebrow_icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_project_grid" ADD CONSTRAINT "_services_v_blocks_project_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after" ADD CONSTRAINT "_services_v_blocks_before_after_before_media_id_media_id_fk" FOREIGN KEY ("before_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after" ADD CONSTRAINT "_services_v_blocks_before_after_after_media_id_media_id_fk" FOREIGN KEY ("after_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after" ADD CONSTRAINT "_services_v_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_sub_services_2_v_items_features" ADD CONSTRAINT "_services_blocks_sub_services_2_v_items_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_blocks_sub_services_2_v_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_sub_services_2_v_items" ADD CONSTRAINT "_services_blocks_sub_services_2_v_items_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_blocks_sub_services_2_v_items" ADD CONSTRAINT "_services_blocks_sub_services_2_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_blocks_sub_services_2_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_blocks_sub_services_2_v" ADD CONSTRAINT "_services_blocks_sub_services_2_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_features" ADD CONSTRAINT "_services_v_blocks_prime_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_features" ADD CONSTRAINT "_services_v_blocks_prime_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_features" ADD CONSTRAINT "_services_v_blocks_prime_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_checklist" ADD CONSTRAINT "_services_v_blocks_prime_difference_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_socials" ADD CONSTRAINT "_services_v_blocks_prime_difference_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_comparisons" ADD CONSTRAINT "_services_v_blocks_prime_difference_comparisons_before_media_id_media_id_fk" FOREIGN KEY ("before_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_comparisons" ADD CONSTRAINT "_services_v_blocks_prime_difference_comparisons_after_media_id_media_id_fk" FOREIGN KEY ("after_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_comparisons" ADD CONSTRAINT "_services_v_blocks_prime_difference_comparisons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_videos" ADD CONSTRAINT "_services_v_blocks_prime_difference_videos_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_videos" ADD CONSTRAINT "_services_v_blocks_prime_difference_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference_videos" ADD CONSTRAINT "_services_v_blocks_prime_difference_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference" ADD CONSTRAINT "_services_v_blocks_prime_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_prime_difference" ADD CONSTRAINT "_services_v_blocks_prime_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_experience_difference_features" ADD CONSTRAINT "_services_v_blocks_experience_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_experience_difference_features" ADD CONSTRAINT "_services_v_blocks_experience_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_experience_difference_features" ADD CONSTRAINT "_services_v_blocks_experience_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_experience_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_experience_difference" ADD CONSTRAINT "_services_v_blocks_experience_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_experience_difference" ADD CONSTRAINT "_services_v_blocks_experience_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_service_areas_areas" ADD CONSTRAINT "_services_v_blocks_service_areas_areas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_service_areas_areas" ADD CONSTRAINT "_services_v_blocks_service_areas_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_service_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_service_areas" ADD CONSTRAINT "_services_v_blocks_service_areas_map_media_asset_id_media_id_fk" FOREIGN KEY ("map_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_service_areas" ADD CONSTRAINT "_services_v_blocks_service_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_repair_services_categories_features" ADD CONSTRAINT "_services_v_blocks_repair_services_categories_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_repair_services_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_repair_services_categories" ADD CONSTRAINT "_services_v_blocks_repair_services_categories_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_repair_services_categories" ADD CONSTRAINT "_services_v_blocks_repair_services_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_repair_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_repair_services" ADD CONSTRAINT "_services_v_blocks_repair_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_luxury_cta_buttons" ADD CONSTRAINT "_services_v_blocks_luxury_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_luxury_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_luxury_cta" ADD CONSTRAINT "_services_v_blocks_luxury_cta_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_luxury_cta" ADD CONSTRAINT "_services_v_blocks_luxury_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_booking" ADD CONSTRAINT "_services_v_blocks_booking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_contact_form" ADD CONSTRAINT "_services_v_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_find_us_map_pins" ADD CONSTRAINT "_services_v_blocks_find_us_map_pins_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_find_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_find_us" ADD CONSTRAINT "_services_v_blocks_find_us_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_landing_testimonials_providers_reviews" ADD CONSTRAINT "_services_v_blocks_landing_testimonials_providers_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_landing_testimonials_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_landing_testimonials_providers" ADD CONSTRAINT "_services_v_blocks_landing_testimonials_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_landing_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_landing_testimonials" ADD CONSTRAINT "_services_v_blocks_landing_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_faq_categories_questions" ADD CONSTRAINT "_services_v_blocks_faq_categories_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_faq_categories" ADD CONSTRAINT "_services_v_blocks_faq_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_faq" ADD CONSTRAINT "_services_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_video_carousel_items" ADD CONSTRAINT "_services_v_blocks_video_carousel_items_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_video_carousel_items" ADD CONSTRAINT "_services_v_blocks_video_carousel_items_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_video_carousel_items" ADD CONSTRAINT "_services_v_blocks_video_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_video_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_video_carousel" ADD CONSTRAINT "_services_v_blocks_video_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_carousel_items" ADD CONSTRAINT "_services_v_blocks_gallery_carousel_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_carousel_items" ADD CONSTRAINT "_services_v_blocks_gallery_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_gallery_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_carousel" ADD CONSTRAINT "_services_v_blocks_gallery_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_process_steps" ADD CONSTRAINT "_services_v_version_process_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_process_steps" ADD CONSTRAINT "_services_v_version_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_location_hero_blurbs" ADD CONSTRAINT "_services_v_version_location_hero_blurbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_silicon_valley_loves_stats" ADD CONSTRAINT "_services_v_version_silicon_valley_loves_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_silicon_valley_loves_buttons" ADD CONSTRAINT "_services_v_version_silicon_valley_loves_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_why_choose_us_items" ADD CONSTRAINT "_services_v_version_why_choose_us_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_real_homes_testimonials" ADD CONSTRAINT "_services_v_version_real_homes_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_hero_buttons" ADD CONSTRAINT "_services_v_version_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_prime_kitchens_cards" ADD CONSTRAINT "_services_v_version_prime_kitchens_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_icon_checklist_gallery_items" ADD CONSTRAINT "_services_v_version_icon_checklist_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_icon_checklist_gallery_images" ADD CONSTRAINT "_services_v_version_icon_checklist_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_icon_checklist_gallery_images" ADD CONSTRAINT "_services_v_version_icon_checklist_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_image_checklist_items" ADD CONSTRAINT "_services_v_version_image_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_materials_showcase_items" ADD CONSTRAINT "_services_v_version_materials_showcase_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_materials_showcase_items" ADD CONSTRAINT "_services_v_version_materials_showcase_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_parent_service_id_services_id_fk" FOREIGN KEY ("version_parent_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_consultation_image_id_media_id_fk" FOREIGN KEY ("version_consultation_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_client_approach_image_id_media_id_fk" FOREIGN KEY ("version_client_approach_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_dont_settle_image_id_media_id_fk" FOREIGN KEY ("version_dont_settle_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_location_video_poster_id_media_id_fk" FOREIGN KEY ("version_location_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_quote_image_id_media_id_fk" FOREIGN KEY ("version_quote_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_silicon_valley_loves_image_id_media_id_fk" FOREIGN KEY ("version_silicon_valley_loves_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_hero_image_secondary_id_media_id_fk" FOREIGN KEY ("version_hero_image_secondary_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_hero_video_id_media_id_fk" FOREIGN KEY ("version_hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_image_checklist_image_id_media_id_fk" FOREIGN KEY ("version_image_checklist_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_faq_category_id_faq_categories_id_fk" FOREIGN KEY ("version_faq_category_id") REFERENCES "public"."faq_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_service_locations_v_version_location_hero_blurbs" ADD CONSTRAINT "_service_locations_v_version_location_hero_blurbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_service_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_service_locations_v_version_offerings_cards" ADD CONSTRAINT "_service_locations_v_version_offerings_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v_version_offerings_cards" ADD CONSTRAINT "_service_locations_v_version_offerings_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_service_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_service_locations_v_version_prime_difference_checklist" ADD CONSTRAINT "_service_locations_v_version_prime_difference_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_service_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_service_locations_v_version_prime_difference_reasons" ADD CONSTRAINT "_service_locations_v_version_prime_difference_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_service_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_service_locations_v_version_silicon_valley_loves_stats" ADD CONSTRAINT "_service_locations_v_version_silicon_valley_loves_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_service_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_service_locations_v_version_silicon_valley_loves_buttons" ADD CONSTRAINT "_service_locations_v_version_silicon_valley_loves_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_service_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_service_locations_v_version_section_overrides" ADD CONSTRAINT "_service_locations_v_version_section_overrides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v_version_section_overrides" ADD CONSTRAINT "_service_locations_v_version_section_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_service_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_service_locations_v" ADD CONSTRAINT "_service_locations_v_parent_id_service_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."service_locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v" ADD CONSTRAINT "_service_locations_v_version_service_id_services_id_fk" FOREIGN KEY ("version_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v" ADD CONSTRAINT "_service_locations_v_version_location_id_locations_id_fk" FOREIGN KEY ("version_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v" ADD CONSTRAINT "_service_locations_v_version_location_video_poster_id_media_id_fk" FOREIGN KEY ("version_location_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v" ADD CONSTRAINT "_service_locations_v_version_dont_settle_image_id_media_id_fk" FOREIGN KEY ("version_dont_settle_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v" ADD CONSTRAINT "_service_locations_v_version_quote_image_id_media_id_fk" FOREIGN KEY ("version_quote_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v" ADD CONSTRAINT "_service_locations_v_version_silicon_valley_loves_image_id_media_id_fk" FOREIGN KEY ("version_silicon_valley_loves_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v" ADD CONSTRAINT "_service_locations_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v" ADD CONSTRAINT "_service_locations_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_service_locations_v_rels" ADD CONSTRAINT "_service_locations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_service_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_service_locations_v_rels" ADD CONSTRAINT "_service_locations_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_secondary_id_media_id_fk" FOREIGN KEY ("image_secondary_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro" ADD CONSTRAINT "_pages_v_blocks_intro_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro" ADD CONSTRAINT "_pages_v_blocks_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_difference_checklist" ADD CONSTRAINT "_pages_v_blocks_difference_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_difference_videos" ADD CONSTRAINT "_pages_v_blocks_difference_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_difference_videos" ADD CONSTRAINT "_pages_v_blocks_difference_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_difference" ADD CONSTRAINT "_pages_v_blocks_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_projects" ADD CONSTRAINT "_pages_v_blocks_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services" ADD CONSTRAINT "_pages_v_blocks_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_blocks_items" ADD CONSTRAINT "_pages_v_blocks_feature_blocks_items_before_image_id_media_id_fk" FOREIGN KEY ("before_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_blocks_items" ADD CONSTRAINT "_pages_v_blocks_feature_blocks_items_after_image_id_media_id_fk" FOREIGN KEY ("after_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_blocks_items" ADD CONSTRAINT "_pages_v_blocks_feature_blocks_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_blocks" ADD CONSTRAINT "_pages_v_blocks_feature_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_intro" ADD CONSTRAINT "_pages_v_blocks_contact_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team" ADD CONSTRAINT "_pages_v_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_guiding_principle" ADD CONSTRAINT "_pages_v_blocks_guiding_principle_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_guiding_principle" ADD CONSTRAINT "_pages_v_blocks_guiding_principle_image_secondary_id_media_id_fk" FOREIGN KEY ("image_secondary_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_guiding_principle" ADD CONSTRAINT "_pages_v_blocks_guiding_principle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_core_values_values" ADD CONSTRAINT "_pages_v_blocks_core_values_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_core_values"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_core_values" ADD CONSTRAINT "_pages_v_blocks_core_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_experts" ADD CONSTRAINT "_pages_v_blocks_experts_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_experts" ADD CONSTRAINT "_pages_v_blocks_experts_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_experts" ADD CONSTRAINT "_pages_v_blocks_experts_badge_id_media_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_experts" ADD CONSTRAINT "_pages_v_blocks_experts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_social_proof" ADD CONSTRAINT "_pages_v_blocks_social_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_tabs" ADD CONSTRAINT "_pages_v_blocks_gallery_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_choose_us_reasons" ADD CONSTRAINT "_pages_v_blocks_why_choose_us_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_why_choose_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_choose_us" ADD CONSTRAINT "_pages_v_blocks_why_choose_us_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_index" ADD CONSTRAINT "_pages_v_blocks_faq_index_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_consultations" ADD CONSTRAINT "_pages_v_blocks_consultations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_videos_videos" ADD CONSTRAINT "_pages_v_blocks_testimonial_videos_videos_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_videos_videos" ADD CONSTRAINT "_pages_v_blocks_testimonial_videos_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_videos_videos" ADD CONSTRAINT "_pages_v_blocks_testimonial_videos_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonial_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_videos" ADD CONSTRAINT "_pages_v_blocks_testimonial_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_review_highlights_badges" ADD CONSTRAINT "_pages_v_blocks_review_highlights_badges_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_review_highlights_badges" ADD CONSTRAINT "_pages_v_blocks_review_highlights_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_review_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_review_highlights_stats" ADD CONSTRAINT "_pages_v_blocks_review_highlights_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_review_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_review_highlights" ADD CONSTRAINT "_pages_v_blocks_review_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_spotlight" ADD CONSTRAINT "_pages_v_blocks_testimonials_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_areas" ADD CONSTRAINT "_pages_v_blocks_service_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_custom_buttons" ADD CONSTRAINT "_pages_v_blocks_custom_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_custom"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_custom" ADD CONSTRAINT "_pages_v_blocks_custom_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_custom" ADD CONSTRAINT "_pages_v_blocks_custom_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_policy_sections_paragraphs" ADD CONSTRAINT "_pages_v_blocks_policy_sections_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_policy_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_policy_sections" ADD CONSTRAINT "_pages_v_blocks_policy_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_policy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_policy" ADD CONSTRAINT "_pages_v_blocks_policy_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_next_steps_steps" ADD CONSTRAINT "_pages_v_blocks_next_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_next_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_next_steps" ADD CONSTRAINT "_pages_v_blocks_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list_links" ADD CONSTRAINT "_pages_v_blocks_link_list_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list" ADD CONSTRAINT "_pages_v_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_v_version_sections" ADD CONSTRAINT "_blog_v_version_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_v_version_sections" ADD CONSTRAINT "_blog_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_v" ADD CONSTRAINT "_blog_v_parent_id_blog_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_v" ADD CONSTRAINT "_blog_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_v" ADD CONSTRAINT "_blog_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_v" ADD CONSTRAINT "_blog_v_version_seo_meta_image_id_media_id_fk" FOREIGN KEY ("version_seo_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_v" ADD CONSTRAINT "_blog_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_v" ADD CONSTRAINT "_blog_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_v_rels" ADD CONSTRAINT "_blog_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_blog_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_v_rels" ADD CONSTRAINT "_blog_v_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_hero_buttons" ADD CONSTRAINT "_landing_pages_v_blocks_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_hero" ADD CONSTRAINT "_landing_pages_v_blocks_hero_background_media_asset_id_media_id_fk" FOREIGN KEY ("background_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_hero" ADD CONSTRAINT "_landing_pages_v_blocks_hero_background_video_asset_id_media_id_fk" FOREIGN KEY ("background_video_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_hero" ADD CONSTRAINT "_landing_pages_v_blocks_hero_foreground_media_asset_id_media_id_fk" FOREIGN KEY ("foreground_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_hero" ADD CONSTRAINT "_landing_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_cta_buttons" ADD CONSTRAINT "_landing_pages_v_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_cta" ADD CONSTRAINT "_landing_pages_v_blocks_cta_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_cta" ADD CONSTRAINT "_landing_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_image_text_buttons" ADD CONSTRAINT "_landing_pages_v_blocks_image_text_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_image_text" ADD CONSTRAINT "_landing_pages_v_blocks_image_text_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_image_text" ADD CONSTRAINT "_landing_pages_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_benefit_cards_items" ADD CONSTRAINT "_landing_pages_v_blocks_benefit_cards_items_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_benefit_cards_items" ADD CONSTRAINT "_landing_pages_v_blocks_benefit_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_benefit_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_benefit_cards" ADD CONSTRAINT "_landing_pages_v_blocks_benefit_cards_decorative_media_asset_id_media_id_fk" FOREIGN KEY ("decorative_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_benefit_cards" ADD CONSTRAINT "_landing_pages_v_blocks_benefit_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_craftsmanship_items" ADD CONSTRAINT "_landing_pages_v_blocks_craftsmanship_items_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_craftsmanship_items" ADD CONSTRAINT "_landing_pages_v_blocks_craftsmanship_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_craftsmanship"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_craftsmanship_images" ADD CONSTRAINT "_landing_pages_v_blocks_craftsmanship_images_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_craftsmanship_images" ADD CONSTRAINT "_landing_pages_v_blocks_craftsmanship_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_craftsmanship"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_craftsmanship" ADD CONSTRAINT "_landing_pages_v_blocks_craftsmanship_decorative_media_asset_id_media_id_fk" FOREIGN KEY ("decorative_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_craftsmanship" ADD CONSTRAINT "_landing_pages_v_blocks_craftsmanship_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_video" ADD CONSTRAINT "_landing_pages_v_blocks_video_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_video" ADD CONSTRAINT "_landing_pages_v_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_video" ADD CONSTRAINT "_landing_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_gallery_items" ADD CONSTRAINT "_landing_pages_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_gallery_items" ADD CONSTRAINT "_landing_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_gallery_groups_items" ADD CONSTRAINT "_landing_pages_v_blocks_gallery_groups_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_gallery_groups_items" ADD CONSTRAINT "_landing_pages_v_blocks_gallery_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_gallery_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_gallery_groups" ADD CONSTRAINT "_landing_pages_v_blocks_gallery_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_gallery" ADD CONSTRAINT "_landing_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_project_grid_items" ADD CONSTRAINT "_landing_pages_v_blocks_project_grid_items_image_asset_id_media_id_fk" FOREIGN KEY ("image_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_project_grid_items" ADD CONSTRAINT "_landing_pages_v_blocks_project_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_project_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_project_grid" ADD CONSTRAINT "_landing_pages_v_blocks_project_grid_eyebrow_icon_icon_media_id_media_id_fk" FOREIGN KEY ("eyebrow_icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_project_grid" ADD CONSTRAINT "_landing_pages_v_blocks_project_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_before_after" ADD CONSTRAINT "_landing_pages_v_blocks_before_after_before_media_id_media_id_fk" FOREIGN KEY ("before_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_before_after" ADD CONSTRAINT "_landing_pages_v_blocks_before_after_after_media_id_media_id_fk" FOREIGN KEY ("after_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_before_after" ADD CONSTRAINT "_landing_pages_v_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_sub_services_items_features" ADD CONSTRAINT "_landing_pages_v_blocks_sub_services_items_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_sub_services_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_sub_services_items" ADD CONSTRAINT "_landing_pages_v_blocks_sub_services_items_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_sub_services_items" ADD CONSTRAINT "_landing_pages_v_blocks_sub_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_sub_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_sub_services" ADD CONSTRAINT "_landing_pages_v_blocks_sub_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_features" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_features" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_features" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_checklist" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_socials" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_comparisons" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_comparisons_before_media_id_media_id_fk" FOREIGN KEY ("before_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_comparisons" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_comparisons_after_media_id_media_id_fk" FOREIGN KEY ("after_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_comparisons" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_comparisons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_videos" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_videos_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_videos" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference_videos" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_prime_difference" ADD CONSTRAINT "_landing_pages_v_blocks_prime_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_experience_difference_features" ADD CONSTRAINT "_landing_pages_v_blocks_experience_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_experience_difference_features" ADD CONSTRAINT "_landing_pages_v_blocks_experience_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_experience_difference_features" ADD CONSTRAINT "_landing_pages_v_blocks_experience_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_experience_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_experience_difference" ADD CONSTRAINT "_landing_pages_v_blocks_experience_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_experience_difference" ADD CONSTRAINT "_landing_pages_v_blocks_experience_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_service_areas_areas" ADD CONSTRAINT "_landing_pages_v_blocks_service_areas_areas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_service_areas_areas" ADD CONSTRAINT "_landing_pages_v_blocks_service_areas_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_service_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_service_areas" ADD CONSTRAINT "_landing_pages_v_blocks_service_areas_map_media_asset_id_media_id_fk" FOREIGN KEY ("map_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_service_areas" ADD CONSTRAINT "_landing_pages_v_blocks_service_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_repair_services_categories_features" ADD CONSTRAINT "_landing_pages_v_blocks_repair_services_categories_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_repair_services_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_repair_services_categories" ADD CONSTRAINT "_landing_pages_v_blocks_repair_services_categories_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_repair_services_categories" ADD CONSTRAINT "_landing_pages_v_blocks_repair_services_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_repair_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_repair_services" ADD CONSTRAINT "_landing_pages_v_blocks_repair_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_luxury_cta_buttons" ADD CONSTRAINT "_landing_pages_v_blocks_luxury_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_luxury_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_luxury_cta" ADD CONSTRAINT "_landing_pages_v_blocks_luxury_cta_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_luxury_cta" ADD CONSTRAINT "_landing_pages_v_blocks_luxury_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_booking" ADD CONSTRAINT "_landing_pages_v_blocks_booking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_contact_form" ADD CONSTRAINT "_landing_pages_v_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_find_us_map_pins" ADD CONSTRAINT "_landing_pages_v_blocks_find_us_map_pins_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_find_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_find_us" ADD CONSTRAINT "_landing_pages_v_blocks_find_us_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_landing_testimonials_providers_reviews" ADD CONSTRAINT "_landing_pages_v_blocks_landing_testimonials_providers_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_landing_testimonials_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_landing_testimonials_providers" ADD CONSTRAINT "_landing_pages_v_blocks_landing_testimonials_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_landing_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_landing_testimonials" ADD CONSTRAINT "_landing_pages_v_blocks_landing_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_faq_categories_questions" ADD CONSTRAINT "_landing_pages_v_blocks_faq_categories_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_faq_categories" ADD CONSTRAINT "_landing_pages_v_blocks_faq_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_faq" ADD CONSTRAINT "_landing_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_video_carousel_items" ADD CONSTRAINT "_landing_pages_v_blocks_video_carousel_items_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_video_carousel_items" ADD CONSTRAINT "_landing_pages_v_blocks_video_carousel_items_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_video_carousel_items" ADD CONSTRAINT "_landing_pages_v_blocks_video_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_video_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_video_carousel" ADD CONSTRAINT "_landing_pages_v_blocks_video_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_gallery_carousel_items" ADD CONSTRAINT "_landing_pages_v_blocks_gallery_carousel_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_gallery_carousel_items" ADD CONSTRAINT "_landing_pages_v_blocks_gallery_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v_blocks_gallery_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_blocks_gallery_carousel" ADD CONSTRAINT "_landing_pages_v_blocks_gallery_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_parent_id_landing_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_version_service_id_services_id_fk" FOREIGN KEY ("version_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_rels" ADD CONSTRAINT "_landing_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_rels" ADD CONSTRAINT "_landing_pages_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_company_opening_hours_days" ADD CONSTRAINT "site_settings_company_opening_hours_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings_company_opening_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_company_opening_hours" ADD CONSTRAINT "site_settings_company_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_company_opening_hours_days" ADD CONSTRAINT "_site_settings_v_version_company_opening_hours_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_site_settings_v_version_company_opening_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_company_opening_hours" ADD CONSTRAINT "_site_settings_v_version_company_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_company_addresses" ADD CONSTRAINT "_site_settings_v_version_company_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_service_areas" ADD CONSTRAINT "_site_settings_v_version_service_areas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_service_areas" ADD CONSTRAINT "_site_settings_v_version_service_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_trust_intro_stats" ADD CONSTRAINT "_site_settings_v_version_trust_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_trust_intro_buttons" ADD CONSTRAINT "_site_settings_v_version_trust_intro_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_reviews_google_icon_id_media_id_fk" FOREIGN KEY ("version_reviews_google_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_reviews_yelp_icon_id_media_id_fk" FOREIGN KEY ("version_reviews_yelp_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_trust_intro_image_id_media_id_fk" FOREIGN KEY ("version_trust_intro_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_default_og_image_id_media_id_fk" FOREIGN KEY ("version_default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_prime_difference_checklist" ADD CONSTRAINT "_shared_sections_v_version_prime_difference_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shared_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_prime_difference_reasons" ADD CONSTRAINT "_shared_sections_v_version_prime_difference_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shared_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_silicon_valley_loves_stats" ADD CONSTRAINT "_shared_sections_v_version_silicon_valley_loves_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shared_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_silicon_valley_loves_buttons" ADD CONSTRAINT "_shared_sections_v_version_silicon_valley_loves_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shared_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_landing_prime_difference_features" ADD CONSTRAINT "_shared_sections_v_version_landing_prime_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_landing_prime_difference_features" ADD CONSTRAINT "_shared_sections_v_version_landing_prime_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_landing_prime_difference_features" ADD CONSTRAINT "_shared_sections_v_version_landing_prime_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shared_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_landing_exp_diff_features_v" ADD CONSTRAINT "_shared_sections_v_landing_exp_diff_features_v_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_landing_exp_diff_features_v" ADD CONSTRAINT "_shared_sections_v_landing_exp_diff_features_v_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_landing_exp_diff_features_v" ADD CONSTRAINT "_shared_sections_v_landing_exp_diff_features_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shared_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_landing_service_areas_areas" ADD CONSTRAINT "_shared_sections_v_version_landing_service_areas_areas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_landing_service_areas_areas" ADD CONSTRAINT "_shared_sections_v_version_landing_service_areas_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shared_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_version_services_estimate_band_buttons" ADD CONSTRAINT "_shared_sections_v_version_services_estimate_band_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shared_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_sections_v" ADD CONSTRAINT "_shared_sections_v_version_location_video_poster_id_media_id_fk" FOREIGN KEY ("version_location_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v" ADD CONSTRAINT "_shared_sections_v_version_dont_settle_image_id_media_id_fk" FOREIGN KEY ("version_dont_settle_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v" ADD CONSTRAINT "_shared_sections_v_version_quote_image_id_media_id_fk" FOREIGN KEY ("version_quote_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v" ADD CONSTRAINT "_shared_sections_v_version_silicon_valley_loves_image_id_media_id_fk" FOREIGN KEY ("version_silicon_valley_loves_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v" ADD CONSTRAINT "_shared_sections_v_version_landing_service_areas_map_media_asset_id_media_id_fk" FOREIGN KEY ("version_landing_service_areas_map_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v" ADD CONSTRAINT "_shared_sections_v_version_services_client_approach_image_id_media_id_fk" FOREIGN KEY ("version_services_client_approach_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_rels" ADD CONSTRAINT "_shared_sections_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_shared_sections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_sections_v_rels" ADD CONSTRAINT "_shared_sections_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items_dropdown_sub_items" ADD CONSTRAINT "_navigation_v_version_header_items_dropdown_sub_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items_dropdown_sub_items" ADD CONSTRAINT "_navigation_v_version_header_items_dropdown_sub_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_header_items_dropdown"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items_dropdown" ADD CONSTRAINT "_navigation_v_version_header_items_dropdown_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items_dropdown" ADD CONSTRAINT "_navigation_v_version_header_items_dropdown_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_header_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_footer_quick_links" ADD CONSTRAINT "_navigation_v_version_footer_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_footer_service_links" ADD CONSTRAINT "_navigation_v_version_footer_service_links_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_footer_service_links" ADD CONSTRAINT "_navigation_v_version_footer_service_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v" ADD CONSTRAINT "_navigation_v_version_footer_privacy_policy_page_id_pages_id_fk" FOREIGN KEY ("version_footer_privacy_policy_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_booking_settings_v_version_slots" ADD CONSTRAINT "_booking_settings_v_version_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_booking_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_booking_settings_v_version_closed_weekdays" ADD CONSTRAINT "_booking_settings_v_version_closed_weekdays_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_booking_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_booking_settings_v_version_closed_dates" ADD CONSTRAINT "_booking_settings_v_version_closed_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_booking_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_booking_settings_v_version_date_capacities" ADD CONSTRAINT "_booking_settings_v_version_date_capacities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_booking_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_faqs_v_parent_idx" ON "_faqs_v" USING btree ("parent_id");
  CREATE INDEX "_faqs_v_version_version_category_idx" ON "_faqs_v" USING btree ("version_category_id");
  CREATE INDEX "_faqs_v_version_version_updated_at_idx" ON "_faqs_v" USING btree ("version_updated_at");
  CREATE INDEX "_faqs_v_version_version_created_at_idx" ON "_faqs_v" USING btree ("version_created_at");
  CREATE INDEX "_faqs_v_created_at_idx" ON "_faqs_v" USING btree ("created_at");
  CREATE INDEX "_faqs_v_updated_at_idx" ON "_faqs_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_version_section_order_order_idx" ON "_services_v_version_section_order" USING btree ("_order");
  CREATE INDEX "_services_v_version_section_order_parent_id_idx" ON "_services_v_version_section_order" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_buttons_order_idx" ON "_services_v_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cta_buttons_parent_id_idx" ON "_services_v_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_order_idx" ON "_services_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cta_parent_id_idx" ON "_services_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_path_idx" ON "_services_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_cta_media_media_asset_idx" ON "_services_v_blocks_cta" USING btree ("media_asset_id");
  CREATE INDEX "_services_blocks_image_text_2_v_buttons_order_idx" ON "_services_blocks_image_text_2_v_buttons" USING btree ("_order");
  CREATE INDEX "_services_blocks_image_text_2_v_buttons_parent_id_idx" ON "_services_blocks_image_text_2_v_buttons" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_image_text_2_v_order_idx" ON "_services_blocks_image_text_2_v" USING btree ("_order");
  CREATE INDEX "_services_blocks_image_text_2_v_parent_id_idx" ON "_services_blocks_image_text_2_v" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_image_text_2_v_path_idx" ON "_services_blocks_image_text_2_v" USING btree ("_path");
  CREATE INDEX "_services_blocks_image_text_2_v_media_media_asset_idx" ON "_services_blocks_image_text_2_v" USING btree ("media_asset_id");
  CREATE INDEX "_services_blocks_video_2_v_order_idx" ON "_services_blocks_video_2_v" USING btree ("_order");
  CREATE INDEX "_services_blocks_video_2_v_parent_id_idx" ON "_services_blocks_video_2_v" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_video_2_v_path_idx" ON "_services_blocks_video_2_v" USING btree ("_path");
  CREATE INDEX "_services_blocks_video_2_v_video_idx" ON "_services_blocks_video_2_v" USING btree ("video_id");
  CREATE INDEX "_services_blocks_video_2_v_poster_idx" ON "_services_blocks_video_2_v" USING btree ("poster_id");
  CREATE INDEX "_services_blocks_gallery_2_v_items_order_idx" ON "_services_blocks_gallery_2_v_items" USING btree ("_order");
  CREATE INDEX "_services_blocks_gallery_2_v_items_parent_id_idx" ON "_services_blocks_gallery_2_v_items" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_gallery_2_v_items_media_idx" ON "_services_blocks_gallery_2_v_items" USING btree ("media_id");
  CREATE INDEX "_services_blocks_gallery_2_v_groups_items_order_idx" ON "_services_blocks_gallery_2_v_groups_items" USING btree ("_order");
  CREATE INDEX "_services_blocks_gallery_2_v_groups_items_parent_id_idx" ON "_services_blocks_gallery_2_v_groups_items" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_gallery_2_v_groups_items_media_idx" ON "_services_blocks_gallery_2_v_groups_items" USING btree ("media_id");
  CREATE INDEX "_services_blocks_gallery_2_v_groups_order_idx" ON "_services_blocks_gallery_2_v_groups" USING btree ("_order");
  CREATE INDEX "_services_blocks_gallery_2_v_groups_parent_id_idx" ON "_services_blocks_gallery_2_v_groups" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_gallery_2_v_order_idx" ON "_services_blocks_gallery_2_v" USING btree ("_order");
  CREATE INDEX "_services_blocks_gallery_2_v_parent_id_idx" ON "_services_blocks_gallery_2_v" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_gallery_2_v_path_idx" ON "_services_blocks_gallery_2_v" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_project_grid_items_order_idx" ON "_services_v_blocks_project_grid_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_project_grid_items_parent_id_idx" ON "_services_v_blocks_project_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_project_grid_items_image_image_asset_idx" ON "_services_v_blocks_project_grid_items" USING btree ("image_asset_id");
  CREATE INDEX "_services_v_blocks_project_grid_order_idx" ON "_services_v_blocks_project_grid" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_project_grid_parent_id_idx" ON "_services_v_blocks_project_grid" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_project_grid_path_idx" ON "_services_v_blocks_project_grid" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_project_grid_eyebrow_icon_eyebrow_ico_idx" ON "_services_v_blocks_project_grid" USING btree ("eyebrow_icon_icon_media_id");
  CREATE INDEX "_services_v_blocks_before_after_order_idx" ON "_services_v_blocks_before_after" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_before_after_parent_id_idx" ON "_services_v_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_before_after_path_idx" ON "_services_v_blocks_before_after" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_before_after_before_media_idx" ON "_services_v_blocks_before_after" USING btree ("before_media_id");
  CREATE INDEX "_services_v_blocks_before_after_after_media_idx" ON "_services_v_blocks_before_after" USING btree ("after_media_id");
  CREATE INDEX "_services_blocks_sub_services_2_v_items_features_order_idx" ON "_services_blocks_sub_services_2_v_items_features" USING btree ("_order");
  CREATE INDEX "_services_blocks_sub_services_2_v_items_features_parent_id_idx" ON "_services_blocks_sub_services_2_v_items_features" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_sub_services_2_v_items_order_idx" ON "_services_blocks_sub_services_2_v_items" USING btree ("_order");
  CREATE INDEX "_services_blocks_sub_services_2_v_items_parent_id_idx" ON "_services_blocks_sub_services_2_v_items" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_sub_services_2_v_items_media_media_asse_idx" ON "_services_blocks_sub_services_2_v_items" USING btree ("media_asset_id");
  CREATE INDEX "_services_blocks_sub_services_2_v_order_idx" ON "_services_blocks_sub_services_2_v" USING btree ("_order");
  CREATE INDEX "_services_blocks_sub_services_2_v_parent_id_idx" ON "_services_blocks_sub_services_2_v" USING btree ("_parent_id");
  CREATE INDEX "_services_blocks_sub_services_2_v_path_idx" ON "_services_blocks_sub_services_2_v" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_prime_difference_features_order_idx" ON "_services_v_blocks_prime_difference_features" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_prime_difference_features_parent_id_idx" ON "_services_v_blocks_prime_difference_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_prime_difference_features_icon_icon_i_idx" ON "_services_v_blocks_prime_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "_services_v_blocks_prime_difference_features_media_media_idx" ON "_services_v_blocks_prime_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "_services_v_blocks_prime_difference_checklist_order_idx" ON "_services_v_blocks_prime_difference_checklist" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_prime_difference_checklist_parent_id_idx" ON "_services_v_blocks_prime_difference_checklist" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_prime_difference_socials_order_idx" ON "_services_v_blocks_prime_difference_socials" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_prime_difference_socials_parent_id_idx" ON "_services_v_blocks_prime_difference_socials" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_prime_difference_comparisons_order_idx" ON "_services_v_blocks_prime_difference_comparisons" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_prime_difference_comparisons_parent_id_idx" ON "_services_v_blocks_prime_difference_comparisons" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_prime_difference_comparisons_before_m_idx" ON "_services_v_blocks_prime_difference_comparisons" USING btree ("before_media_id");
  CREATE INDEX "_services_v_blocks_prime_difference_comparisons_after_me_idx" ON "_services_v_blocks_prime_difference_comparisons" USING btree ("after_media_id");
  CREATE INDEX "_services_v_blocks_prime_difference_videos_order_idx" ON "_services_v_blocks_prime_difference_videos" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_prime_difference_videos_parent_id_idx" ON "_services_v_blocks_prime_difference_videos" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_prime_difference_videos_video_idx" ON "_services_v_blocks_prime_difference_videos" USING btree ("video_id");
  CREATE INDEX "_services_v_blocks_prime_difference_videos_poster_idx" ON "_services_v_blocks_prime_difference_videos" USING btree ("poster_id");
  CREATE INDEX "_services_v_blocks_prime_difference_order_idx" ON "_services_v_blocks_prime_difference" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_prime_difference_parent_id_idx" ON "_services_v_blocks_prime_difference" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_prime_difference_path_idx" ON "_services_v_blocks_prime_difference" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_prime_difference_media_media_asset_idx" ON "_services_v_blocks_prime_difference" USING btree ("media_asset_id");
  CREATE INDEX "_services_v_blocks_experience_difference_features_order_idx" ON "_services_v_blocks_experience_difference_features" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_experience_difference_features_parent_id_idx" ON "_services_v_blocks_experience_difference_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_experience_difference_features_icon_i_idx" ON "_services_v_blocks_experience_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "_services_v_blocks_experience_difference_features_media__idx" ON "_services_v_blocks_experience_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "_services_v_blocks_experience_difference_order_idx" ON "_services_v_blocks_experience_difference" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_experience_difference_parent_id_idx" ON "_services_v_blocks_experience_difference" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_experience_difference_path_idx" ON "_services_v_blocks_experience_difference" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_experience_difference_media_media_ass_idx" ON "_services_v_blocks_experience_difference" USING btree ("media_asset_id");
  CREATE INDEX "_services_v_blocks_service_areas_areas_order_idx" ON "_services_v_blocks_service_areas_areas" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_service_areas_areas_parent_id_idx" ON "_services_v_blocks_service_areas_areas" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_service_areas_areas_location_idx" ON "_services_v_blocks_service_areas_areas" USING btree ("location_id");
  CREATE INDEX "_services_v_blocks_service_areas_order_idx" ON "_services_v_blocks_service_areas" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_service_areas_parent_id_idx" ON "_services_v_blocks_service_areas" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_service_areas_path_idx" ON "_services_v_blocks_service_areas" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_service_areas_map_media_map_media_ass_idx" ON "_services_v_blocks_service_areas" USING btree ("map_media_asset_id");
  CREATE INDEX "_services_v_blocks_repair_services_categories_features_order_idx" ON "_services_v_blocks_repair_services_categories_features" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_repair_services_categories_features_parent_id_idx" ON "_services_v_blocks_repair_services_categories_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_repair_services_categories_order_idx" ON "_services_v_blocks_repair_services_categories" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_repair_services_categories_parent_id_idx" ON "_services_v_blocks_repair_services_categories" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_repair_services_categories_media_medi_idx" ON "_services_v_blocks_repair_services_categories" USING btree ("media_asset_id");
  CREATE INDEX "_services_v_blocks_repair_services_order_idx" ON "_services_v_blocks_repair_services" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_repair_services_parent_id_idx" ON "_services_v_blocks_repair_services" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_repair_services_path_idx" ON "_services_v_blocks_repair_services" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_luxury_cta_buttons_order_idx" ON "_services_v_blocks_luxury_cta_buttons" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_luxury_cta_buttons_parent_id_idx" ON "_services_v_blocks_luxury_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_luxury_cta_order_idx" ON "_services_v_blocks_luxury_cta" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_luxury_cta_parent_id_idx" ON "_services_v_blocks_luxury_cta" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_luxury_cta_path_idx" ON "_services_v_blocks_luxury_cta" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_luxury_cta_media_media_asset_idx" ON "_services_v_blocks_luxury_cta" USING btree ("media_asset_id");
  CREATE INDEX "_services_v_blocks_booking_order_idx" ON "_services_v_blocks_booking" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_booking_parent_id_idx" ON "_services_v_blocks_booking" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_booking_path_idx" ON "_services_v_blocks_booking" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_contact_form_order_idx" ON "_services_v_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_contact_form_parent_id_idx" ON "_services_v_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_contact_form_path_idx" ON "_services_v_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_find_us_map_pins_order_idx" ON "_services_v_blocks_find_us_map_pins" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_find_us_map_pins_parent_id_idx" ON "_services_v_blocks_find_us_map_pins" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_find_us_order_idx" ON "_services_v_blocks_find_us" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_find_us_parent_id_idx" ON "_services_v_blocks_find_us" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_find_us_path_idx" ON "_services_v_blocks_find_us" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_landing_testimonials_providers_reviews_order_idx" ON "_services_v_blocks_landing_testimonials_providers_reviews" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_landing_testimonials_providers_reviews_parent_id_idx" ON "_services_v_blocks_landing_testimonials_providers_reviews" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_landing_testimonials_providers_order_idx" ON "_services_v_blocks_landing_testimonials_providers" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_landing_testimonials_providers_parent_id_idx" ON "_services_v_blocks_landing_testimonials_providers" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_landing_testimonials_order_idx" ON "_services_v_blocks_landing_testimonials" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_landing_testimonials_parent_id_idx" ON "_services_v_blocks_landing_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_landing_testimonials_path_idx" ON "_services_v_blocks_landing_testimonials" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_faq_categories_questions_order_idx" ON "_services_v_blocks_faq_categories_questions" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_faq_categories_questions_parent_id_idx" ON "_services_v_blocks_faq_categories_questions" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_faq_categories_order_idx" ON "_services_v_blocks_faq_categories" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_faq_categories_parent_id_idx" ON "_services_v_blocks_faq_categories" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_faq_order_idx" ON "_services_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_faq_parent_id_idx" ON "_services_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_faq_path_idx" ON "_services_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_video_carousel_items_order_idx" ON "_services_v_blocks_video_carousel_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_video_carousel_items_parent_id_idx" ON "_services_v_blocks_video_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_video_carousel_items_video_idx" ON "_services_v_blocks_video_carousel_items" USING btree ("video_id");
  CREATE INDEX "_services_v_blocks_video_carousel_items_poster_idx" ON "_services_v_blocks_video_carousel_items" USING btree ("poster_id");
  CREATE INDEX "_services_v_blocks_video_carousel_order_idx" ON "_services_v_blocks_video_carousel" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_video_carousel_parent_id_idx" ON "_services_v_blocks_video_carousel" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_video_carousel_path_idx" ON "_services_v_blocks_video_carousel" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_gallery_carousel_items_order_idx" ON "_services_v_blocks_gallery_carousel_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_carousel_items_parent_id_idx" ON "_services_v_blocks_gallery_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_carousel_items_media_idx" ON "_services_v_blocks_gallery_carousel_items" USING btree ("media_id");
  CREATE INDEX "_services_v_blocks_gallery_carousel_order_idx" ON "_services_v_blocks_gallery_carousel" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_carousel_parent_id_idx" ON "_services_v_blocks_gallery_carousel" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_carousel_path_idx" ON "_services_v_blocks_gallery_carousel" USING btree ("_path");
  CREATE INDEX "_services_v_version_process_steps_order_idx" ON "_services_v_version_process_steps" USING btree ("_order");
  CREATE INDEX "_services_v_version_process_steps_parent_id_idx" ON "_services_v_version_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_process_steps_image_idx" ON "_services_v_version_process_steps" USING btree ("image_id");
  CREATE INDEX "_services_v_version_location_hero_blurbs_order_idx" ON "_services_v_version_location_hero_blurbs" USING btree ("_order");
  CREATE INDEX "_services_v_version_location_hero_blurbs_parent_id_idx" ON "_services_v_version_location_hero_blurbs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_silicon_valley_loves_stats_order_idx" ON "_services_v_version_silicon_valley_loves_stats" USING btree ("_order");
  CREATE INDEX "_services_v_version_silicon_valley_loves_stats_parent_id_idx" ON "_services_v_version_silicon_valley_loves_stats" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_silicon_valley_loves_buttons_order_idx" ON "_services_v_version_silicon_valley_loves_buttons" USING btree ("_order");
  CREATE INDEX "_services_v_version_silicon_valley_loves_buttons_parent_id_idx" ON "_services_v_version_silicon_valley_loves_buttons" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_why_choose_us_items_order_idx" ON "_services_v_version_why_choose_us_items" USING btree ("_order");
  CREATE INDEX "_services_v_version_why_choose_us_items_parent_id_idx" ON "_services_v_version_why_choose_us_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_real_homes_testimonials_order_idx" ON "_services_v_version_real_homes_testimonials" USING btree ("_order");
  CREATE INDEX "_services_v_version_real_homes_testimonials_parent_id_idx" ON "_services_v_version_real_homes_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_hero_buttons_order_idx" ON "_services_v_version_hero_buttons" USING btree ("_order");
  CREATE INDEX "_services_v_version_hero_buttons_parent_id_idx" ON "_services_v_version_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_prime_kitchens_cards_order_idx" ON "_services_v_version_prime_kitchens_cards" USING btree ("_order");
  CREATE INDEX "_services_v_version_prime_kitchens_cards_parent_id_idx" ON "_services_v_version_prime_kitchens_cards" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_icon_checklist_gallery_items_order_idx" ON "_services_v_version_icon_checklist_gallery_items" USING btree ("_order");
  CREATE INDEX "_services_v_version_icon_checklist_gallery_items_parent_id_idx" ON "_services_v_version_icon_checklist_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_icon_checklist_gallery_images_order_idx" ON "_services_v_version_icon_checklist_gallery_images" USING btree ("_order");
  CREATE INDEX "_services_v_version_icon_checklist_gallery_images_parent_id_idx" ON "_services_v_version_icon_checklist_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_icon_checklist_gallery_images_image_idx" ON "_services_v_version_icon_checklist_gallery_images" USING btree ("image_id");
  CREATE INDEX "_services_v_version_image_checklist_items_order_idx" ON "_services_v_version_image_checklist_items" USING btree ("_order");
  CREATE INDEX "_services_v_version_image_checklist_items_parent_id_idx" ON "_services_v_version_image_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_materials_showcase_items_order_idx" ON "_services_v_version_materials_showcase_items" USING btree ("_order");
  CREATE INDEX "_services_v_version_materials_showcase_items_parent_id_idx" ON "_services_v_version_materials_showcase_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_materials_showcase_items_image_idx" ON "_services_v_version_materials_showcase_items" USING btree ("image_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_parent_service_idx" ON "_services_v" USING btree ("version_parent_service_id");
  CREATE INDEX "_services_v_version_version_consultation_image_idx" ON "_services_v" USING btree ("version_consultation_image_id");
  CREATE INDEX "_services_v_version_version_featured_image_idx" ON "_services_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_services_v_version_version_client_approach_image_idx" ON "_services_v" USING btree ("version_client_approach_image_id");
  CREATE INDEX "_services_v_version_dont_settle_version_dont_settle_imag_idx" ON "_services_v" USING btree ("version_dont_settle_image_id");
  CREATE INDEX "_services_v_version_location_video_version_location_vide_idx" ON "_services_v" USING btree ("version_location_video_poster_id");
  CREATE INDEX "_services_v_version_quote_version_quote_image_idx" ON "_services_v" USING btree ("version_quote_image_id");
  CREATE INDEX "_services_v_version_silicon_valley_loves_version_silicon_idx" ON "_services_v" USING btree ("version_silicon_valley_loves_image_id");
  CREATE INDEX "_services_v_version_hero_version_hero_image_idx" ON "_services_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_services_v_version_hero_version_hero_image_secondary_idx" ON "_services_v" USING btree ("version_hero_image_secondary_id");
  CREATE INDEX "_services_v_version_hero_version_hero_video_idx" ON "_services_v" USING btree ("version_hero_video_id");
  CREATE INDEX "_services_v_version_image_checklist_version_image_checkl_idx" ON "_services_v" USING btree ("version_image_checklist_image_id");
  CREATE INDEX "_services_v_version_version_faq_category_idx" ON "_services_v" USING btree ("version_faq_category_id");
  CREATE INDEX "_services_v_version_seo_version_seo_og_image_idx" ON "_services_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_faqs_id_idx" ON "_services_v_rels" USING btree ("faqs_id");
  CREATE INDEX "_services_v_rels_media_id_idx" ON "_services_v_rels" USING btree ("media_id");
  CREATE INDEX "_services_v_rels_testimonials_id_idx" ON "_services_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_service_locations_v_version_location_hero_blurbs_order_idx" ON "_service_locations_v_version_location_hero_blurbs" USING btree ("_order");
  CREATE INDEX "_service_locations_v_version_location_hero_blurbs_parent_id_idx" ON "_service_locations_v_version_location_hero_blurbs" USING btree ("_parent_id");
  CREATE INDEX "_service_locations_v_version_offerings_cards_order_idx" ON "_service_locations_v_version_offerings_cards" USING btree ("_order");
  CREATE INDEX "_service_locations_v_version_offerings_cards_parent_id_idx" ON "_service_locations_v_version_offerings_cards" USING btree ("_parent_id");
  CREATE INDEX "_service_locations_v_version_offerings_cards_image_idx" ON "_service_locations_v_version_offerings_cards" USING btree ("image_id");
  CREATE INDEX "_service_locations_v_version_prime_difference_checklist_order_idx" ON "_service_locations_v_version_prime_difference_checklist" USING btree ("_order");
  CREATE INDEX "_service_locations_v_version_prime_difference_checklist_parent_id_idx" ON "_service_locations_v_version_prime_difference_checklist" USING btree ("_parent_id");
  CREATE INDEX "_service_locations_v_version_prime_difference_reasons_order_idx" ON "_service_locations_v_version_prime_difference_reasons" USING btree ("_order");
  CREATE INDEX "_service_locations_v_version_prime_difference_reasons_parent_id_idx" ON "_service_locations_v_version_prime_difference_reasons" USING btree ("_parent_id");
  CREATE INDEX "_service_locations_v_version_silicon_valley_loves_stats_order_idx" ON "_service_locations_v_version_silicon_valley_loves_stats" USING btree ("_order");
  CREATE INDEX "_service_locations_v_version_silicon_valley_loves_stats_parent_id_idx" ON "_service_locations_v_version_silicon_valley_loves_stats" USING btree ("_parent_id");
  CREATE INDEX "_service_locations_v_version_silicon_valley_loves_buttons_order_idx" ON "_service_locations_v_version_silicon_valley_loves_buttons" USING btree ("_order");
  CREATE INDEX "_service_locations_v_version_silicon_valley_loves_buttons_parent_id_idx" ON "_service_locations_v_version_silicon_valley_loves_buttons" USING btree ("_parent_id");
  CREATE INDEX "_service_locations_v_version_section_overrides_order_idx" ON "_service_locations_v_version_section_overrides" USING btree ("_order");
  CREATE INDEX "_service_locations_v_version_section_overrides_parent_id_idx" ON "_service_locations_v_version_section_overrides" USING btree ("_parent_id");
  CREATE INDEX "_service_locations_v_version_section_overrides_image_idx" ON "_service_locations_v_version_section_overrides" USING btree ("image_id");
  CREATE INDEX "_service_locations_v_parent_idx" ON "_service_locations_v" USING btree ("parent_id");
  CREATE INDEX "_service_locations_v_version_version_slug_idx" ON "_service_locations_v" USING btree ("version_slug");
  CREATE INDEX "_service_locations_v_version_version_service_idx" ON "_service_locations_v" USING btree ("version_service_id");
  CREATE INDEX "_service_locations_v_version_version_location_idx" ON "_service_locations_v" USING btree ("version_location_id");
  CREATE INDEX "_service_locations_v_version_location_video_version_loca_idx" ON "_service_locations_v" USING btree ("version_location_video_poster_id");
  CREATE INDEX "_service_locations_v_version_dont_settle_version_dont_se_idx" ON "_service_locations_v" USING btree ("version_dont_settle_image_id");
  CREATE INDEX "_service_locations_v_version_quote_version_quote_image_idx" ON "_service_locations_v" USING btree ("version_quote_image_id");
  CREATE INDEX "_service_locations_v_version_silicon_valley_loves_versio_idx" ON "_service_locations_v" USING btree ("version_silicon_valley_loves_image_id");
  CREATE INDEX "_service_locations_v_version_version_featured_image_idx" ON "_service_locations_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_service_locations_v_version_seo_version_seo_og_image_idx" ON "_service_locations_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_service_locations_v_version_version_updated_at_idx" ON "_service_locations_v" USING btree ("version_updated_at");
  CREATE INDEX "_service_locations_v_version_version_created_at_idx" ON "_service_locations_v" USING btree ("version_created_at");
  CREATE INDEX "_service_locations_v_created_at_idx" ON "_service_locations_v" USING btree ("created_at");
  CREATE INDEX "_service_locations_v_updated_at_idx" ON "_service_locations_v" USING btree ("updated_at");
  CREATE INDEX "_service_locations_v_rels_order_idx" ON "_service_locations_v_rels" USING btree ("order");
  CREATE INDEX "_service_locations_v_rels_parent_idx" ON "_service_locations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_service_locations_v_rels_path_idx" ON "_service_locations_v_rels" USING btree ("path");
  CREATE INDEX "_service_locations_v_rels_testimonials_id_idx" ON "_service_locations_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_hero_image_secondary_idx" ON "_pages_v_blocks_hero" USING btree ("image_secondary_id");
  CREATE INDEX "_pages_v_blocks_hero_video_idx" ON "_pages_v_blocks_hero" USING btree ("video_id");
  CREATE INDEX "_pages_v_blocks_intro_order_idx" ON "_pages_v_blocks_intro" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_intro_parent_id_idx" ON "_pages_v_blocks_intro" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_intro_path_idx" ON "_pages_v_blocks_intro" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_intro_image_idx" ON "_pages_v_blocks_intro" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_difference_checklist_order_idx" ON "_pages_v_blocks_difference_checklist" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_difference_checklist_parent_id_idx" ON "_pages_v_blocks_difference_checklist" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_difference_videos_order_idx" ON "_pages_v_blocks_difference_videos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_difference_videos_parent_id_idx" ON "_pages_v_blocks_difference_videos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_difference_videos_poster_idx" ON "_pages_v_blocks_difference_videos" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_difference_order_idx" ON "_pages_v_blocks_difference" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_difference_parent_id_idx" ON "_pages_v_blocks_difference" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_difference_path_idx" ON "_pages_v_blocks_difference" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_projects_order_idx" ON "_pages_v_blocks_projects" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_projects_parent_id_idx" ON "_pages_v_blocks_projects" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_projects_path_idx" ON "_pages_v_blocks_projects" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_services_order_idx" ON "_pages_v_blocks_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_parent_id_idx" ON "_pages_v_blocks_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_path_idx" ON "_pages_v_blocks_services" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_blocks_items_order_idx" ON "_pages_v_blocks_feature_blocks_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_blocks_items_parent_id_idx" ON "_pages_v_blocks_feature_blocks_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_blocks_items_before_image_idx" ON "_pages_v_blocks_feature_blocks_items" USING btree ("before_image_id");
  CREATE INDEX "_pages_v_blocks_feature_blocks_items_after_image_idx" ON "_pages_v_blocks_feature_blocks_items" USING btree ("after_image_id");
  CREATE INDEX "_pages_v_blocks_feature_blocks_order_idx" ON "_pages_v_blocks_feature_blocks" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_blocks_parent_id_idx" ON "_pages_v_blocks_feature_blocks" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_blocks_path_idx" ON "_pages_v_blocks_feature_blocks" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_intro_order_idx" ON "_pages_v_blocks_contact_intro" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_intro_parent_id_idx" ON "_pages_v_blocks_contact_intro" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_intro_path_idx" ON "_pages_v_blocks_contact_intro" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_order_idx" ON "_pages_v_blocks_team" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_parent_id_idx" ON "_pages_v_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_path_idx" ON "_pages_v_blocks_team" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_guiding_principle_order_idx" ON "_pages_v_blocks_guiding_principle" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_guiding_principle_parent_id_idx" ON "_pages_v_blocks_guiding_principle" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_guiding_principle_path_idx" ON "_pages_v_blocks_guiding_principle" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_guiding_principle_image_idx" ON "_pages_v_blocks_guiding_principle" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_guiding_principle_image_secondary_idx" ON "_pages_v_blocks_guiding_principle" USING btree ("image_secondary_id");
  CREATE INDEX "_pages_v_blocks_core_values_values_order_idx" ON "_pages_v_blocks_core_values_values" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_core_values_values_parent_id_idx" ON "_pages_v_blocks_core_values_values" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_core_values_order_idx" ON "_pages_v_blocks_core_values" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_core_values_parent_id_idx" ON "_pages_v_blocks_core_values" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_core_values_path_idx" ON "_pages_v_blocks_core_values" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_experts_order_idx" ON "_pages_v_blocks_experts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_experts_parent_id_idx" ON "_pages_v_blocks_experts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_experts_path_idx" ON "_pages_v_blocks_experts" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_experts_video_idx" ON "_pages_v_blocks_experts" USING btree ("video_id");
  CREATE INDEX "_pages_v_blocks_experts_poster_idx" ON "_pages_v_blocks_experts" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_experts_badge_idx" ON "_pages_v_blocks_experts" USING btree ("badge_id");
  CREATE INDEX "_pages_v_blocks_social_proof_order_idx" ON "_pages_v_blocks_social_proof" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_social_proof_parent_id_idx" ON "_pages_v_blocks_social_proof" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_social_proof_path_idx" ON "_pages_v_blocks_social_proof" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_tabs_order_idx" ON "_pages_v_blocks_gallery_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_tabs_parent_id_idx" ON "_pages_v_blocks_gallery_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_tabs_path_idx" ON "_pages_v_blocks_gallery_tabs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_why_choose_us_reasons_order_idx" ON "_pages_v_blocks_why_choose_us_reasons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_why_choose_us_reasons_parent_id_idx" ON "_pages_v_blocks_why_choose_us_reasons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_why_choose_us_order_idx" ON "_pages_v_blocks_why_choose_us" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_why_choose_us_parent_id_idx" ON "_pages_v_blocks_why_choose_us" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_why_choose_us_path_idx" ON "_pages_v_blocks_why_choose_us" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_order_idx" ON "_pages_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_parent_id_idx" ON "_pages_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_path_idx" ON "_pages_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_poster_idx" ON "_pages_v_blocks_contact" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_faq_index_order_idx" ON "_pages_v_blocks_faq_index" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_index_parent_id_idx" ON "_pages_v_blocks_faq_index" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_index_path_idx" ON "_pages_v_blocks_faq_index" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_consultations_order_idx" ON "_pages_v_blocks_consultations" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_consultations_parent_id_idx" ON "_pages_v_blocks_consultations" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_consultations_path_idx" ON "_pages_v_blocks_consultations" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_videos_videos_order_idx" ON "_pages_v_blocks_testimonial_videos_videos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_videos_videos_parent_id_idx" ON "_pages_v_blocks_testimonial_videos_videos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_videos_videos_video_idx" ON "_pages_v_blocks_testimonial_videos_videos" USING btree ("video_id");
  CREATE INDEX "_pages_v_blocks_testimonial_videos_videos_poster_idx" ON "_pages_v_blocks_testimonial_videos_videos" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_testimonial_videos_order_idx" ON "_pages_v_blocks_testimonial_videos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_videos_parent_id_idx" ON "_pages_v_blocks_testimonial_videos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_videos_path_idx" ON "_pages_v_blocks_testimonial_videos" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_review_highlights_badges_order_idx" ON "_pages_v_blocks_review_highlights_badges" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_review_highlights_badges_parent_id_idx" ON "_pages_v_blocks_review_highlights_badges" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_review_highlights_badges_image_idx" ON "_pages_v_blocks_review_highlights_badges" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_review_highlights_stats_order_idx" ON "_pages_v_blocks_review_highlights_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_review_highlights_stats_parent_id_idx" ON "_pages_v_blocks_review_highlights_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_review_highlights_order_idx" ON "_pages_v_blocks_review_highlights" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_review_highlights_parent_id_idx" ON "_pages_v_blocks_review_highlights" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_review_highlights_path_idx" ON "_pages_v_blocks_review_highlights" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_spotlight_order_idx" ON "_pages_v_blocks_testimonials_spotlight" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_spotlight_parent_id_idx" ON "_pages_v_blocks_testimonials_spotlight" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_spotlight_path_idx" ON "_pages_v_blocks_testimonials_spotlight" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_service_areas_order_idx" ON "_pages_v_blocks_service_areas" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_areas_parent_id_idx" ON "_pages_v_blocks_service_areas" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_areas_path_idx" ON "_pages_v_blocks_service_areas" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_custom_buttons_order_idx" ON "_pages_v_blocks_custom_buttons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_custom_buttons_parent_id_idx" ON "_pages_v_blocks_custom_buttons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_custom_order_idx" ON "_pages_v_blocks_custom" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_custom_parent_id_idx" ON "_pages_v_blocks_custom" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_custom_path_idx" ON "_pages_v_blocks_custom" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_custom_image_idx" ON "_pages_v_blocks_custom" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_policy_sections_paragraphs_order_idx" ON "_pages_v_blocks_policy_sections_paragraphs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_policy_sections_paragraphs_parent_id_idx" ON "_pages_v_blocks_policy_sections_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_policy_sections_order_idx" ON "_pages_v_blocks_policy_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_policy_sections_parent_id_idx" ON "_pages_v_blocks_policy_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_policy_order_idx" ON "_pages_v_blocks_policy" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_policy_parent_id_idx" ON "_pages_v_blocks_policy" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_policy_path_idx" ON "_pages_v_blocks_policy" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_next_steps_steps_order_idx" ON "_pages_v_blocks_next_steps_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_next_steps_steps_parent_id_idx" ON "_pages_v_blocks_next_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_next_steps_order_idx" ON "_pages_v_blocks_next_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_next_steps_parent_id_idx" ON "_pages_v_blocks_next_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_next_steps_path_idx" ON "_pages_v_blocks_next_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_link_list_links_order_idx" ON "_pages_v_blocks_link_list_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_link_list_links_parent_id_idx" ON "_pages_v_blocks_link_list_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_order_idx" ON "_pages_v_blocks_link_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_link_list_parent_id_idx" ON "_pages_v_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_path_idx" ON "_pages_v_blocks_link_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_hero_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_blog_v_version_sections_order_idx" ON "_blog_v_version_sections" USING btree ("_order");
  CREATE INDEX "_blog_v_version_sections_parent_id_idx" ON "_blog_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_blog_v_version_sections_image_idx" ON "_blog_v_version_sections" USING btree ("image_id");
  CREATE INDEX "_blog_v_parent_idx" ON "_blog_v" USING btree ("parent_id");
  CREATE INDEX "_blog_v_version_version_slug_idx" ON "_blog_v" USING btree ("version_slug");
  CREATE INDEX "_blog_v_version_version_wordpress_id_idx" ON "_blog_v" USING btree ("version_wordpress_id");
  CREATE INDEX "_blog_v_version_version_status_idx" ON "_blog_v" USING btree ("version_status");
  CREATE INDEX "_blog_v_version_version_scheduled_publish_slot_idx" ON "_blog_v" USING btree ("version_scheduled_publish_slot");
  CREATE INDEX "_blog_v_version_version_scheduled_publish_at_idx" ON "_blog_v" USING btree ("version_scheduled_publish_at");
  CREATE INDEX "_blog_v_version_version_published_date_idx" ON "_blog_v" USING btree ("version_published_date");
  CREATE INDEX "_blog_v_version_version_author_idx" ON "_blog_v" USING btree ("version_author_id");
  CREATE INDEX "_blog_v_version_version_featured_image_idx" ON "_blog_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_blog_v_version_seo_version_seo_meta_image_idx" ON "_blog_v" USING btree ("version_seo_meta_image_id");
  CREATE INDEX "_blog_v_version_version_created_by_idx" ON "_blog_v" USING btree ("version_created_by_id");
  CREATE INDEX "_blog_v_version_version_updated_by_idx" ON "_blog_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_blog_v_version_version_updated_at_idx" ON "_blog_v" USING btree ("version_updated_at");
  CREATE INDEX "_blog_v_version_version_created_at_idx" ON "_blog_v" USING btree ("version_created_at");
  CREATE INDEX "_blog_v_created_at_idx" ON "_blog_v" USING btree ("created_at");
  CREATE INDEX "_blog_v_updated_at_idx" ON "_blog_v" USING btree ("updated_at");
  CREATE INDEX "_blog_v_rels_order_idx" ON "_blog_v_rels" USING btree ("order");
  CREATE INDEX "_blog_v_rels_parent_idx" ON "_blog_v_rels" USING btree ("parent_id");
  CREATE INDEX "_blog_v_rels_path_idx" ON "_blog_v_rels" USING btree ("path");
  CREATE INDEX "_blog_v_rels_blog_categories_id_idx" ON "_blog_v_rels" USING btree ("blog_categories_id");
  CREATE INDEX "_landing_pages_v_blocks_hero_buttons_order_idx" ON "_landing_pages_v_blocks_hero_buttons" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_hero_buttons_parent_id_idx" ON "_landing_pages_v_blocks_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_hero_order_idx" ON "_landing_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_hero_parent_id_idx" ON "_landing_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_hero_path_idx" ON "_landing_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_hero_background_media_background_idx" ON "_landing_pages_v_blocks_hero" USING btree ("background_media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_hero_background_video_background_idx" ON "_landing_pages_v_blocks_hero" USING btree ("background_video_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_hero_foreground_media_foreground_idx" ON "_landing_pages_v_blocks_hero" USING btree ("foreground_media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_cta_buttons_order_idx" ON "_landing_pages_v_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_cta_buttons_parent_id_idx" ON "_landing_pages_v_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_cta_order_idx" ON "_landing_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_cta_parent_id_idx" ON "_landing_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_cta_path_idx" ON "_landing_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_cta_media_media_asset_idx" ON "_landing_pages_v_blocks_cta" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_image_text_buttons_order_idx" ON "_landing_pages_v_blocks_image_text_buttons" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_image_text_buttons_parent_id_idx" ON "_landing_pages_v_blocks_image_text_buttons" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_image_text_order_idx" ON "_landing_pages_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_image_text_parent_id_idx" ON "_landing_pages_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_image_text_path_idx" ON "_landing_pages_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_image_text_media_media_asset_idx" ON "_landing_pages_v_blocks_image_text" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_benefit_cards_items_order_idx" ON "_landing_pages_v_blocks_benefit_cards_items" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_benefit_cards_items_parent_id_idx" ON "_landing_pages_v_blocks_benefit_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_benefit_cards_items_media_media__idx" ON "_landing_pages_v_blocks_benefit_cards_items" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_benefit_cards_order_idx" ON "_landing_pages_v_blocks_benefit_cards" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_benefit_cards_parent_id_idx" ON "_landing_pages_v_blocks_benefit_cards" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_benefit_cards_path_idx" ON "_landing_pages_v_blocks_benefit_cards" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_benefit_cards_decorative_media_d_idx" ON "_landing_pages_v_blocks_benefit_cards" USING btree ("decorative_media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_items_order_idx" ON "_landing_pages_v_blocks_craftsmanship_items" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_items_parent_id_idx" ON "_landing_pages_v_blocks_craftsmanship_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_items_media_media__idx" ON "_landing_pages_v_blocks_craftsmanship_items" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_images_order_idx" ON "_landing_pages_v_blocks_craftsmanship_images" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_images_parent_id_idx" ON "_landing_pages_v_blocks_craftsmanship_images" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_images_media_media_idx" ON "_landing_pages_v_blocks_craftsmanship_images" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_order_idx" ON "_landing_pages_v_blocks_craftsmanship" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_parent_id_idx" ON "_landing_pages_v_blocks_craftsmanship" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_path_idx" ON "_landing_pages_v_blocks_craftsmanship" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_craftsmanship_decorative_media_d_idx" ON "_landing_pages_v_blocks_craftsmanship" USING btree ("decorative_media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_video_order_idx" ON "_landing_pages_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_video_parent_id_idx" ON "_landing_pages_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_video_path_idx" ON "_landing_pages_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_video_video_idx" ON "_landing_pages_v_blocks_video" USING btree ("video_id");
  CREATE INDEX "_landing_pages_v_blocks_video_poster_idx" ON "_landing_pages_v_blocks_video" USING btree ("poster_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_items_order_idx" ON "_landing_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_gallery_items_parent_id_idx" ON "_landing_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_items_media_idx" ON "_landing_pages_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_groups_items_order_idx" ON "_landing_pages_v_blocks_gallery_groups_items" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_gallery_groups_items_parent_id_idx" ON "_landing_pages_v_blocks_gallery_groups_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_groups_items_media_idx" ON "_landing_pages_v_blocks_gallery_groups_items" USING btree ("media_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_groups_order_idx" ON "_landing_pages_v_blocks_gallery_groups" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_gallery_groups_parent_id_idx" ON "_landing_pages_v_blocks_gallery_groups" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_order_idx" ON "_landing_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_gallery_parent_id_idx" ON "_landing_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_path_idx" ON "_landing_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_project_grid_items_order_idx" ON "_landing_pages_v_blocks_project_grid_items" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_project_grid_items_parent_id_idx" ON "_landing_pages_v_blocks_project_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_project_grid_items_image_image_a_idx" ON "_landing_pages_v_blocks_project_grid_items" USING btree ("image_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_project_grid_order_idx" ON "_landing_pages_v_blocks_project_grid" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_project_grid_parent_id_idx" ON "_landing_pages_v_blocks_project_grid" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_project_grid_path_idx" ON "_landing_pages_v_blocks_project_grid" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_project_grid_eyebrow_icon_eyebro_idx" ON "_landing_pages_v_blocks_project_grid" USING btree ("eyebrow_icon_icon_media_id");
  CREATE INDEX "_landing_pages_v_blocks_before_after_order_idx" ON "_landing_pages_v_blocks_before_after" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_before_after_parent_id_idx" ON "_landing_pages_v_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_before_after_path_idx" ON "_landing_pages_v_blocks_before_after" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_before_after_before_media_idx" ON "_landing_pages_v_blocks_before_after" USING btree ("before_media_id");
  CREATE INDEX "_landing_pages_v_blocks_before_after_after_media_idx" ON "_landing_pages_v_blocks_before_after" USING btree ("after_media_id");
  CREATE INDEX "_landing_pages_v_blocks_sub_services_items_features_order_idx" ON "_landing_pages_v_blocks_sub_services_items_features" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_sub_services_items_features_parent_id_idx" ON "_landing_pages_v_blocks_sub_services_items_features" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_sub_services_items_order_idx" ON "_landing_pages_v_blocks_sub_services_items" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_sub_services_items_parent_id_idx" ON "_landing_pages_v_blocks_sub_services_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_sub_services_items_media_media_a_idx" ON "_landing_pages_v_blocks_sub_services_items" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_sub_services_order_idx" ON "_landing_pages_v_blocks_sub_services" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_sub_services_parent_id_idx" ON "_landing_pages_v_blocks_sub_services" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_sub_services_path_idx" ON "_landing_pages_v_blocks_sub_services" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_features_order_idx" ON "_landing_pages_v_blocks_prime_difference_features" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_features_parent_id_idx" ON "_landing_pages_v_blocks_prime_difference_features" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_features_icon_i_idx" ON "_landing_pages_v_blocks_prime_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_features_media__idx" ON "_landing_pages_v_blocks_prime_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_checklist_order_idx" ON "_landing_pages_v_blocks_prime_difference_checklist" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_checklist_parent_id_idx" ON "_landing_pages_v_blocks_prime_difference_checklist" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_socials_order_idx" ON "_landing_pages_v_blocks_prime_difference_socials" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_socials_parent_id_idx" ON "_landing_pages_v_blocks_prime_difference_socials" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_comparisons_order_idx" ON "_landing_pages_v_blocks_prime_difference_comparisons" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_comparisons_parent_id_idx" ON "_landing_pages_v_blocks_prime_difference_comparisons" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_comparisons_bef_idx" ON "_landing_pages_v_blocks_prime_difference_comparisons" USING btree ("before_media_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_comparisons_aft_idx" ON "_landing_pages_v_blocks_prime_difference_comparisons" USING btree ("after_media_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_videos_order_idx" ON "_landing_pages_v_blocks_prime_difference_videos" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_videos_parent_id_idx" ON "_landing_pages_v_blocks_prime_difference_videos" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_videos_video_idx" ON "_landing_pages_v_blocks_prime_difference_videos" USING btree ("video_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_videos_poster_idx" ON "_landing_pages_v_blocks_prime_difference_videos" USING btree ("poster_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_order_idx" ON "_landing_pages_v_blocks_prime_difference" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_parent_id_idx" ON "_landing_pages_v_blocks_prime_difference" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_path_idx" ON "_landing_pages_v_blocks_prime_difference" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_prime_difference_media_media_ass_idx" ON "_landing_pages_v_blocks_prime_difference" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_experience_difference_features_order_idx" ON "_landing_pages_v_blocks_experience_difference_features" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_experience_difference_features_parent_id_idx" ON "_landing_pages_v_blocks_experience_difference_features" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_experience_difference_features_i_idx" ON "_landing_pages_v_blocks_experience_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "_landing_pages_v_blocks_experience_difference_features_m_idx" ON "_landing_pages_v_blocks_experience_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_experience_difference_order_idx" ON "_landing_pages_v_blocks_experience_difference" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_experience_difference_parent_id_idx" ON "_landing_pages_v_blocks_experience_difference" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_experience_difference_path_idx" ON "_landing_pages_v_blocks_experience_difference" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_experience_difference_media_medi_idx" ON "_landing_pages_v_blocks_experience_difference" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_service_areas_areas_order_idx" ON "_landing_pages_v_blocks_service_areas_areas" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_service_areas_areas_parent_id_idx" ON "_landing_pages_v_blocks_service_areas_areas" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_service_areas_areas_location_idx" ON "_landing_pages_v_blocks_service_areas_areas" USING btree ("location_id");
  CREATE INDEX "_landing_pages_v_blocks_service_areas_order_idx" ON "_landing_pages_v_blocks_service_areas" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_service_areas_parent_id_idx" ON "_landing_pages_v_blocks_service_areas" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_service_areas_path_idx" ON "_landing_pages_v_blocks_service_areas" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_service_areas_map_media_map_medi_idx" ON "_landing_pages_v_blocks_service_areas" USING btree ("map_media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_repair_services_categories_features_order_idx" ON "_landing_pages_v_blocks_repair_services_categories_features" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_repair_services_categories_features_parent_id_idx" ON "_landing_pages_v_blocks_repair_services_categories_features" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_repair_services_categories_order_idx" ON "_landing_pages_v_blocks_repair_services_categories" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_repair_services_categories_parent_id_idx" ON "_landing_pages_v_blocks_repair_services_categories" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_repair_services_categories_media_idx" ON "_landing_pages_v_blocks_repair_services_categories" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_repair_services_order_idx" ON "_landing_pages_v_blocks_repair_services" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_repair_services_parent_id_idx" ON "_landing_pages_v_blocks_repair_services" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_repair_services_path_idx" ON "_landing_pages_v_blocks_repair_services" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_luxury_cta_buttons_order_idx" ON "_landing_pages_v_blocks_luxury_cta_buttons" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_luxury_cta_buttons_parent_id_idx" ON "_landing_pages_v_blocks_luxury_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_luxury_cta_order_idx" ON "_landing_pages_v_blocks_luxury_cta" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_luxury_cta_parent_id_idx" ON "_landing_pages_v_blocks_luxury_cta" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_luxury_cta_path_idx" ON "_landing_pages_v_blocks_luxury_cta" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_luxury_cta_media_media_asset_idx" ON "_landing_pages_v_blocks_luxury_cta" USING btree ("media_asset_id");
  CREATE INDEX "_landing_pages_v_blocks_booking_order_idx" ON "_landing_pages_v_blocks_booking" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_booking_parent_id_idx" ON "_landing_pages_v_blocks_booking" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_booking_path_idx" ON "_landing_pages_v_blocks_booking" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_contact_form_order_idx" ON "_landing_pages_v_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_contact_form_parent_id_idx" ON "_landing_pages_v_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_contact_form_path_idx" ON "_landing_pages_v_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_find_us_map_pins_order_idx" ON "_landing_pages_v_blocks_find_us_map_pins" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_find_us_map_pins_parent_id_idx" ON "_landing_pages_v_blocks_find_us_map_pins" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_find_us_order_idx" ON "_landing_pages_v_blocks_find_us" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_find_us_parent_id_idx" ON "_landing_pages_v_blocks_find_us" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_find_us_path_idx" ON "_landing_pages_v_blocks_find_us" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_landing_testimonials_providers_reviews_order_idx" ON "_landing_pages_v_blocks_landing_testimonials_providers_reviews" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_landing_testimonials_providers_32fc8bbc" ON "_landing_pages_v_blocks_landing_testimonials_providers_reviews" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_landing_testimonials_providers_order_idx" ON "_landing_pages_v_blocks_landing_testimonials_providers" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_landing_testimonials_providers_parent_id_idx" ON "_landing_pages_v_blocks_landing_testimonials_providers" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_landing_testimonials_order_idx" ON "_landing_pages_v_blocks_landing_testimonials" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_landing_testimonials_parent_id_idx" ON "_landing_pages_v_blocks_landing_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_landing_testimonials_path_idx" ON "_landing_pages_v_blocks_landing_testimonials" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_faq_categories_questions_order_idx" ON "_landing_pages_v_blocks_faq_categories_questions" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_faq_categories_questions_parent_id_idx" ON "_landing_pages_v_blocks_faq_categories_questions" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_faq_categories_order_idx" ON "_landing_pages_v_blocks_faq_categories" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_faq_categories_parent_id_idx" ON "_landing_pages_v_blocks_faq_categories" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_faq_order_idx" ON "_landing_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_faq_parent_id_idx" ON "_landing_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_faq_path_idx" ON "_landing_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_video_carousel_items_order_idx" ON "_landing_pages_v_blocks_video_carousel_items" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_video_carousel_items_parent_id_idx" ON "_landing_pages_v_blocks_video_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_video_carousel_items_video_idx" ON "_landing_pages_v_blocks_video_carousel_items" USING btree ("video_id");
  CREATE INDEX "_landing_pages_v_blocks_video_carousel_items_poster_idx" ON "_landing_pages_v_blocks_video_carousel_items" USING btree ("poster_id");
  CREATE INDEX "_landing_pages_v_blocks_video_carousel_order_idx" ON "_landing_pages_v_blocks_video_carousel" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_video_carousel_parent_id_idx" ON "_landing_pages_v_blocks_video_carousel" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_video_carousel_path_idx" ON "_landing_pages_v_blocks_video_carousel" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_blocks_gallery_carousel_items_order_idx" ON "_landing_pages_v_blocks_gallery_carousel_items" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_gallery_carousel_items_parent_id_idx" ON "_landing_pages_v_blocks_gallery_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_carousel_items_media_idx" ON "_landing_pages_v_blocks_gallery_carousel_items" USING btree ("media_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_carousel_order_idx" ON "_landing_pages_v_blocks_gallery_carousel" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_blocks_gallery_carousel_parent_id_idx" ON "_landing_pages_v_blocks_gallery_carousel" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_blocks_gallery_carousel_path_idx" ON "_landing_pages_v_blocks_gallery_carousel" USING btree ("_path");
  CREATE INDEX "_landing_pages_v_parent_idx" ON "_landing_pages_v" USING btree ("parent_id");
  CREATE INDEX "_landing_pages_v_version_version_slug_idx" ON "_landing_pages_v" USING btree ("version_slug");
  CREATE INDEX "_landing_pages_v_version_version_service_idx" ON "_landing_pages_v" USING btree ("version_service_id");
  CREATE INDEX "_landing_pages_v_version_seo_version_seo_og_image_idx" ON "_landing_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_landing_pages_v_version_version_source_word_press_id_idx" ON "_landing_pages_v" USING btree ("version_source_word_press_id");
  CREATE INDEX "_landing_pages_v_version_version_source_slug_idx" ON "_landing_pages_v" USING btree ("version_source_slug");
  CREATE INDEX "_landing_pages_v_version_version_updated_at_idx" ON "_landing_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_landing_pages_v_version_version_created_at_idx" ON "_landing_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_landing_pages_v_created_at_idx" ON "_landing_pages_v" USING btree ("created_at");
  CREATE INDEX "_landing_pages_v_updated_at_idx" ON "_landing_pages_v" USING btree ("updated_at");
  CREATE INDEX "_landing_pages_v_rels_order_idx" ON "_landing_pages_v_rels" USING btree ("order");
  CREATE INDEX "_landing_pages_v_rels_parent_idx" ON "_landing_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_landing_pages_v_rels_path_idx" ON "_landing_pages_v_rels" USING btree ("path");
  CREATE INDEX "_landing_pages_v_rels_faqs_id_idx" ON "_landing_pages_v_rels" USING btree ("faqs_id");
  CREATE INDEX "site_settings_company_opening_hours_days_order_idx" ON "site_settings_company_opening_hours_days" USING btree ("order");
  CREATE INDEX "site_settings_company_opening_hours_days_parent_idx" ON "site_settings_company_opening_hours_days" USING btree ("parent_id");
  CREATE INDEX "site_settings_company_opening_hours_order_idx" ON "site_settings_company_opening_hours" USING btree ("_order");
  CREATE INDEX "site_settings_company_opening_hours_parent_id_idx" ON "site_settings_company_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_company_opening_hours_days_order_idx" ON "_site_settings_v_version_company_opening_hours_days" USING btree ("order");
  CREATE INDEX "_site_settings_v_version_company_opening_hours_days_parent_idx" ON "_site_settings_v_version_company_opening_hours_days" USING btree ("parent_id");
  CREATE INDEX "_site_settings_v_version_company_opening_hours_order_idx" ON "_site_settings_v_version_company_opening_hours" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_company_opening_hours_parent_id_idx" ON "_site_settings_v_version_company_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_company_addresses_order_idx" ON "_site_settings_v_version_company_addresses" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_company_addresses_parent_id_idx" ON "_site_settings_v_version_company_addresses" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_service_areas_order_idx" ON "_site_settings_v_version_service_areas" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_service_areas_parent_id_idx" ON "_site_settings_v_version_service_areas" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_service_areas_location_idx" ON "_site_settings_v_version_service_areas" USING btree ("location_id");
  CREATE INDEX "_site_settings_v_version_trust_intro_stats_order_idx" ON "_site_settings_v_version_trust_intro_stats" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_trust_intro_stats_parent_id_idx" ON "_site_settings_v_version_trust_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_trust_intro_buttons_order_idx" ON "_site_settings_v_version_trust_intro_buttons" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_trust_intro_buttons_parent_id_idx" ON "_site_settings_v_version_trust_intro_buttons" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_reviews_version_reviews_google__idx" ON "_site_settings_v" USING btree ("version_reviews_google_icon_id");
  CREATE INDEX "_site_settings_v_version_reviews_version_reviews_yelp_ic_idx" ON "_site_settings_v" USING btree ("version_reviews_yelp_icon_id");
  CREATE INDEX "_site_settings_v_version_trust_intro_version_trust_intro_idx" ON "_site_settings_v" USING btree ("version_trust_intro_image_id");
  CREATE INDEX "_site_settings_v_version_seo_version_seo_og_image_idx" ON "_site_settings_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_site_settings_v_version_version_default_og_image_idx" ON "_site_settings_v" USING btree ("version_default_og_image_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_shared_sections_v_version_prime_difference_checklist_order_idx" ON "_shared_sections_v_version_prime_difference_checklist" USING btree ("_order");
  CREATE INDEX "_shared_sections_v_version_prime_difference_checklist_parent_id_idx" ON "_shared_sections_v_version_prime_difference_checklist" USING btree ("_parent_id");
  CREATE INDEX "_shared_sections_v_version_prime_difference_reasons_order_idx" ON "_shared_sections_v_version_prime_difference_reasons" USING btree ("_order");
  CREATE INDEX "_shared_sections_v_version_prime_difference_reasons_parent_id_idx" ON "_shared_sections_v_version_prime_difference_reasons" USING btree ("_parent_id");
  CREATE INDEX "_shared_sections_v_version_silicon_valley_loves_stats_order_idx" ON "_shared_sections_v_version_silicon_valley_loves_stats" USING btree ("_order");
  CREATE INDEX "_shared_sections_v_version_silicon_valley_loves_stats_parent_id_idx" ON "_shared_sections_v_version_silicon_valley_loves_stats" USING btree ("_parent_id");
  CREATE INDEX "_shared_sections_v_version_silicon_valley_loves_buttons_order_idx" ON "_shared_sections_v_version_silicon_valley_loves_buttons" USING btree ("_order");
  CREATE INDEX "_shared_sections_v_version_silicon_valley_loves_buttons_parent_id_idx" ON "_shared_sections_v_version_silicon_valley_loves_buttons" USING btree ("_parent_id");
  CREATE INDEX "_shared_sections_v_version_landing_prime_difference_features_order_idx" ON "_shared_sections_v_version_landing_prime_difference_features" USING btree ("_order");
  CREATE INDEX "_shared_sections_v_version_landing_prime_difference_features_parent_id_idx" ON "_shared_sections_v_version_landing_prime_difference_features" USING btree ("_parent_id");
  CREATE INDEX "_shared_sections_v_version_landing_prime_difference_feat_idx" ON "_shared_sections_v_version_landing_prime_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "_shared_sections_v_version_landing_prime_difference_fe_1_idx" ON "_shared_sections_v_version_landing_prime_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "_shared_sections_v_landing_exp_diff_features_v_order_idx" ON "_shared_sections_v_landing_exp_diff_features_v" USING btree ("_order");
  CREATE INDEX "_shared_sections_v_landing_exp_diff_features_v_parent_id_idx" ON "_shared_sections_v_landing_exp_diff_features_v" USING btree ("_parent_id");
  CREATE INDEX "_shared_sections_v_landing_exp_diff_features_v_icon_icon_idx" ON "_shared_sections_v_landing_exp_diff_features_v" USING btree ("icon_icon_media_id");
  CREATE INDEX "_shared_sections_v_landing_exp_diff_features_v_media_med_idx" ON "_shared_sections_v_landing_exp_diff_features_v" USING btree ("media_asset_id");
  CREATE INDEX "_shared_sections_v_version_landing_service_areas_areas_order_idx" ON "_shared_sections_v_version_landing_service_areas_areas" USING btree ("_order");
  CREATE INDEX "_shared_sections_v_version_landing_service_areas_areas_parent_id_idx" ON "_shared_sections_v_version_landing_service_areas_areas" USING btree ("_parent_id");
  CREATE INDEX "_shared_sections_v_version_landing_service_areas_areas_l_idx" ON "_shared_sections_v_version_landing_service_areas_areas" USING btree ("location_id");
  CREATE INDEX "_shared_sections_v_version_services_estimate_band_buttons_order_idx" ON "_shared_sections_v_version_services_estimate_band_buttons" USING btree ("_order");
  CREATE INDEX "_shared_sections_v_version_services_estimate_band_buttons_parent_id_idx" ON "_shared_sections_v_version_services_estimate_band_buttons" USING btree ("_parent_id");
  CREATE INDEX "_shared_sections_v_version_location_video_version_locati_idx" ON "_shared_sections_v" USING btree ("version_location_video_poster_id");
  CREATE INDEX "_shared_sections_v_version_dont_settle_version_dont_sett_idx" ON "_shared_sections_v" USING btree ("version_dont_settle_image_id");
  CREATE INDEX "_shared_sections_v_version_quote_version_quote_image_idx" ON "_shared_sections_v" USING btree ("version_quote_image_id");
  CREATE INDEX "_shared_sections_v_version_silicon_valley_loves_version__idx" ON "_shared_sections_v" USING btree ("version_silicon_valley_loves_image_id");
  CREATE INDEX "_shared_sections_v_version_landing_service_areas_map_med_idx" ON "_shared_sections_v" USING btree ("version_landing_service_areas_map_media_asset_id");
  CREATE INDEX "_shared_sections_v_version_services_version_services_cli_idx" ON "_shared_sections_v" USING btree ("version_services_client_approach_image_id");
  CREATE INDEX "_shared_sections_v_created_at_idx" ON "_shared_sections_v" USING btree ("created_at");
  CREATE INDEX "_shared_sections_v_updated_at_idx" ON "_shared_sections_v" USING btree ("updated_at");
  CREATE INDEX "_shared_sections_v_rels_order_idx" ON "_shared_sections_v_rels" USING btree ("order");
  CREATE INDEX "_shared_sections_v_rels_parent_idx" ON "_shared_sections_v_rels" USING btree ("parent_id");
  CREATE INDEX "_shared_sections_v_rels_path_idx" ON "_shared_sections_v_rels" USING btree ("path");
  CREATE INDEX "_shared_sections_v_rels_testimonials_id_idx" ON "_shared_sections_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_navigation_v_version_header_items_dropdown_sub_items_order_idx" ON "_navigation_v_version_header_items_dropdown_sub_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_header_items_dropdown_sub_items_parent_id_idx" ON "_navigation_v_version_header_items_dropdown_sub_items" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_header_items_dropdown_sub_items_se_idx" ON "_navigation_v_version_header_items_dropdown_sub_items" USING btree ("service_id");
  CREATE INDEX "_navigation_v_version_header_items_dropdown_order_idx" ON "_navigation_v_version_header_items_dropdown" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_header_items_dropdown_parent_id_idx" ON "_navigation_v_version_header_items_dropdown" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_header_items_dropdown_service_idx" ON "_navigation_v_version_header_items_dropdown" USING btree ("service_id");
  CREATE INDEX "_navigation_v_version_header_items_order_idx" ON "_navigation_v_version_header_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_header_items_parent_id_idx" ON "_navigation_v_version_header_items" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_header_items_service_idx" ON "_navigation_v_version_header_items" USING btree ("service_id");
  CREATE INDEX "_navigation_v_version_footer_quick_links_order_idx" ON "_navigation_v_version_footer_quick_links" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_footer_quick_links_parent_id_idx" ON "_navigation_v_version_footer_quick_links" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_footer_service_links_order_idx" ON "_navigation_v_version_footer_service_links" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_footer_service_links_parent_id_idx" ON "_navigation_v_version_footer_service_links" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_footer_service_links_service_idx" ON "_navigation_v_version_footer_service_links" USING btree ("service_id");
  CREATE INDEX "_navigation_v_version_footer_privacy_policy_version_foot_idx" ON "_navigation_v" USING btree ("version_footer_privacy_policy_page_id");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");
  CREATE INDEX "_booking_settings_v_version_slots_order_idx" ON "_booking_settings_v_version_slots" USING btree ("_order");
  CREATE INDEX "_booking_settings_v_version_slots_parent_id_idx" ON "_booking_settings_v_version_slots" USING btree ("_parent_id");
  CREATE INDEX "_booking_settings_v_version_closed_weekdays_order_idx" ON "_booking_settings_v_version_closed_weekdays" USING btree ("order");
  CREATE INDEX "_booking_settings_v_version_closed_weekdays_parent_idx" ON "_booking_settings_v_version_closed_weekdays" USING btree ("parent_id");
  CREATE INDEX "_booking_settings_v_version_closed_dates_order_idx" ON "_booking_settings_v_version_closed_dates" USING btree ("_order");
  CREATE INDEX "_booking_settings_v_version_closed_dates_parent_id_idx" ON "_booking_settings_v_version_closed_dates" USING btree ("_parent_id");
  CREATE INDEX "_booking_settings_v_version_date_capacities_order_idx" ON "_booking_settings_v_version_date_capacities" USING btree ("_order");
  CREATE INDEX "_booking_settings_v_version_date_capacities_parent_id_idx" ON "_booking_settings_v_version_date_capacities" USING btree ("_parent_id");
  CREATE INDEX "_booking_settings_v_created_at_idx" ON "_booking_settings_v" USING btree ("created_at");
  CREATE INDEX "_booking_settings_v_updated_at_idx" ON "_booking_settings_v" USING btree ("updated_at");

  -- Seed: Mon–Fri 08:00–18:00, from "Open: 8am - 6pm (Mon - Fri)".
  INSERT INTO "site_settings_company_opening_hours" ("_order", "_parent_id", "id", "opens", "closes")
  SELECT 1, s."id", 'opening-hours-weekdays', '08:00', '18:00' FROM "site_settings" s
  WHERE NOT EXISTS (SELECT 1 FROM "site_settings_company_opening_hours");
  INSERT INTO "site_settings_company_opening_hours_days" ("order", "parent_id", "value")
  SELECT d.ord, 'opening-hours-weekdays', d.day::"public"."enum_site_settings_company_opening_hours_days"
  FROM (VALUES (1, 'Mo'), (2, 'Tu'), (3, 'We'), (4, 'Th'), (5, 'Fr')) AS d(ord, day)
  WHERE EXISTS (SELECT 1 FROM "site_settings_company_opening_hours" WHERE "id" = 'opening-hours-weekdays')
    AND NOT EXISTS (SELECT 1 FROM "site_settings_company_opening_hours_days");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "_faqs_v" CASCADE;
  DROP TABLE "_services_v_version_section_order" CASCADE;
  DROP TABLE "_services_v_blocks_cta_buttons" CASCADE;
  DROP TABLE "_services_v_blocks_cta" CASCADE;
  DROP TABLE "_services_blocks_image_text_2_v_buttons" CASCADE;
  DROP TABLE "_services_blocks_image_text_2_v" CASCADE;
  DROP TABLE "_services_blocks_video_2_v" CASCADE;
  DROP TABLE "_services_blocks_gallery_2_v_items" CASCADE;
  DROP TABLE "_services_blocks_gallery_2_v_groups_items" CASCADE;
  DROP TABLE "_services_blocks_gallery_2_v_groups" CASCADE;
  DROP TABLE "_services_blocks_gallery_2_v" CASCADE;
  DROP TABLE "_services_v_blocks_project_grid_items" CASCADE;
  DROP TABLE "_services_v_blocks_project_grid" CASCADE;
  DROP TABLE "_services_v_blocks_before_after" CASCADE;
  DROP TABLE "_services_blocks_sub_services_2_v_items_features" CASCADE;
  DROP TABLE "_services_blocks_sub_services_2_v_items" CASCADE;
  DROP TABLE "_services_blocks_sub_services_2_v" CASCADE;
  DROP TABLE "_services_v_blocks_prime_difference_features" CASCADE;
  DROP TABLE "_services_v_blocks_prime_difference_checklist" CASCADE;
  DROP TABLE "_services_v_blocks_prime_difference_socials" CASCADE;
  DROP TABLE "_services_v_blocks_prime_difference_comparisons" CASCADE;
  DROP TABLE "_services_v_blocks_prime_difference_videos" CASCADE;
  DROP TABLE "_services_v_blocks_prime_difference" CASCADE;
  DROP TABLE "_services_v_blocks_experience_difference_features" CASCADE;
  DROP TABLE "_services_v_blocks_experience_difference" CASCADE;
  DROP TABLE "_services_v_blocks_service_areas_areas" CASCADE;
  DROP TABLE "_services_v_blocks_service_areas" CASCADE;
  DROP TABLE "_services_v_blocks_repair_services_categories_features" CASCADE;
  DROP TABLE "_services_v_blocks_repair_services_categories" CASCADE;
  DROP TABLE "_services_v_blocks_repair_services" CASCADE;
  DROP TABLE "_services_v_blocks_luxury_cta_buttons" CASCADE;
  DROP TABLE "_services_v_blocks_luxury_cta" CASCADE;
  DROP TABLE "_services_v_blocks_booking" CASCADE;
  DROP TABLE "_services_v_blocks_contact_form" CASCADE;
  DROP TABLE "_services_v_blocks_find_us_map_pins" CASCADE;
  DROP TABLE "_services_v_blocks_find_us" CASCADE;
  DROP TABLE "_services_v_blocks_landing_testimonials_providers_reviews" CASCADE;
  DROP TABLE "_services_v_blocks_landing_testimonials_providers" CASCADE;
  DROP TABLE "_services_v_blocks_landing_testimonials" CASCADE;
  DROP TABLE "_services_v_blocks_faq_categories_questions" CASCADE;
  DROP TABLE "_services_v_blocks_faq_categories" CASCADE;
  DROP TABLE "_services_v_blocks_faq" CASCADE;
  DROP TABLE "_services_v_blocks_video_carousel_items" CASCADE;
  DROP TABLE "_services_v_blocks_video_carousel" CASCADE;
  DROP TABLE "_services_v_blocks_gallery_carousel_items" CASCADE;
  DROP TABLE "_services_v_blocks_gallery_carousel" CASCADE;
  DROP TABLE "_services_v_version_process_steps" CASCADE;
  DROP TABLE "_services_v_version_location_hero_blurbs" CASCADE;
  DROP TABLE "_services_v_version_silicon_valley_loves_stats" CASCADE;
  DROP TABLE "_services_v_version_silicon_valley_loves_buttons" CASCADE;
  DROP TABLE "_services_v_version_why_choose_us_items" CASCADE;
  DROP TABLE "_services_v_version_real_homes_testimonials" CASCADE;
  DROP TABLE "_services_v_version_hero_buttons" CASCADE;
  DROP TABLE "_services_v_version_prime_kitchens_cards" CASCADE;
  DROP TABLE "_services_v_version_icon_checklist_gallery_items" CASCADE;
  DROP TABLE "_services_v_version_icon_checklist_gallery_images" CASCADE;
  DROP TABLE "_services_v_version_image_checklist_items" CASCADE;
  DROP TABLE "_services_v_version_materials_showcase_items" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  DROP TABLE "_service_locations_v_version_location_hero_blurbs" CASCADE;
  DROP TABLE "_service_locations_v_version_offerings_cards" CASCADE;
  DROP TABLE "_service_locations_v_version_prime_difference_checklist" CASCADE;
  DROP TABLE "_service_locations_v_version_prime_difference_reasons" CASCADE;
  DROP TABLE "_service_locations_v_version_silicon_valley_loves_stats" CASCADE;
  DROP TABLE "_service_locations_v_version_silicon_valley_loves_buttons" CASCADE;
  DROP TABLE "_service_locations_v_version_section_overrides" CASCADE;
  DROP TABLE "_service_locations_v" CASCADE;
  DROP TABLE "_service_locations_v_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_intro" CASCADE;
  DROP TABLE "_pages_v_blocks_difference_checklist" CASCADE;
  DROP TABLE "_pages_v_blocks_difference_videos" CASCADE;
  DROP TABLE "_pages_v_blocks_difference" CASCADE;
  DROP TABLE "_pages_v_blocks_projects" CASCADE;
  DROP TABLE "_pages_v_blocks_services" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_blocks_items" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_blocks" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_intro" CASCADE;
  DROP TABLE "_pages_v_blocks_team" CASCADE;
  DROP TABLE "_pages_v_blocks_guiding_principle" CASCADE;
  DROP TABLE "_pages_v_blocks_core_values_values" CASCADE;
  DROP TABLE "_pages_v_blocks_core_values" CASCADE;
  DROP TABLE "_pages_v_blocks_experts" CASCADE;
  DROP TABLE "_pages_v_blocks_social_proof" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_why_choose_us_reasons" CASCADE;
  DROP TABLE "_pages_v_blocks_why_choose_us" CASCADE;
  DROP TABLE "_pages_v_blocks_contact" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_index" CASCADE;
  DROP TABLE "_pages_v_blocks_consultations" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_videos_videos" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_videos" CASCADE;
  DROP TABLE "_pages_v_blocks_review_highlights_badges" CASCADE;
  DROP TABLE "_pages_v_blocks_review_highlights_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_review_highlights" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_spotlight" CASCADE;
  DROP TABLE "_pages_v_blocks_service_areas" CASCADE;
  DROP TABLE "_pages_v_blocks_custom_buttons" CASCADE;
  DROP TABLE "_pages_v_blocks_custom" CASCADE;
  DROP TABLE "_pages_v_blocks_policy_sections_paragraphs" CASCADE;
  DROP TABLE "_pages_v_blocks_policy_sections" CASCADE;
  DROP TABLE "_pages_v_blocks_policy" CASCADE;
  DROP TABLE "_pages_v_blocks_next_steps_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_next_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_link_list_links" CASCADE;
  DROP TABLE "_pages_v_blocks_link_list" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_blog_v_version_sections" CASCADE;
  DROP TABLE "_blog_v" CASCADE;
  DROP TABLE "_blog_v_rels" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_hero_buttons" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_cta_buttons" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_image_text_buttons" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_image_text" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_benefit_cards_items" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_benefit_cards" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_craftsmanship_items" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_craftsmanship_images" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_craftsmanship" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_video" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_gallery_groups_items" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_gallery_groups" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_project_grid_items" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_project_grid" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_before_after" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_sub_services_items_features" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_sub_services_items" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_sub_services" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_prime_difference_features" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_prime_difference_checklist" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_prime_difference_socials" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_prime_difference_comparisons" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_prime_difference_videos" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_prime_difference" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_experience_difference_features" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_experience_difference" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_service_areas_areas" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_service_areas" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_repair_services_categories_features" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_repair_services_categories" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_repair_services" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_luxury_cta_buttons" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_luxury_cta" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_booking" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_contact_form" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_find_us_map_pins" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_find_us" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_landing_testimonials_providers_reviews" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_landing_testimonials_providers" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_landing_testimonials" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_faq_categories_questions" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_faq_categories" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_video_carousel_items" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_video_carousel" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_gallery_carousel_items" CASCADE;
  DROP TABLE "_landing_pages_v_blocks_gallery_carousel" CASCADE;
  DROP TABLE "_landing_pages_v" CASCADE;
  DROP TABLE "_landing_pages_v_rels" CASCADE;
  DROP TABLE "site_settings_company_opening_hours_days" CASCADE;
  DROP TABLE "site_settings_company_opening_hours" CASCADE;
  DROP TABLE "_site_settings_v_version_company_opening_hours_days" CASCADE;
  DROP TABLE "_site_settings_v_version_company_opening_hours" CASCADE;
  DROP TABLE "_site_settings_v_version_company_addresses" CASCADE;
  DROP TABLE "_site_settings_v_version_service_areas" CASCADE;
  DROP TABLE "_site_settings_v_version_trust_intro_stats" CASCADE;
  DROP TABLE "_site_settings_v_version_trust_intro_buttons" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_shared_sections_v_version_prime_difference_checklist" CASCADE;
  DROP TABLE "_shared_sections_v_version_prime_difference_reasons" CASCADE;
  DROP TABLE "_shared_sections_v_version_silicon_valley_loves_stats" CASCADE;
  DROP TABLE "_shared_sections_v_version_silicon_valley_loves_buttons" CASCADE;
  DROP TABLE "_shared_sections_v_version_landing_prime_difference_features" CASCADE;
  DROP TABLE "_shared_sections_v_landing_exp_diff_features_v" CASCADE;
  DROP TABLE "_shared_sections_v_version_landing_service_areas_areas" CASCADE;
  DROP TABLE "_shared_sections_v_version_services_estimate_band_buttons" CASCADE;
  DROP TABLE "_shared_sections_v" CASCADE;
  DROP TABLE "_shared_sections_v_rels" CASCADE;
  DROP TABLE "_navigation_v_version_header_items_dropdown_sub_items" CASCADE;
  DROP TABLE "_navigation_v_version_header_items_dropdown" CASCADE;
  DROP TABLE "_navigation_v_version_header_items" CASCADE;
  DROP TABLE "_navigation_v_version_footer_quick_links" CASCADE;
  DROP TABLE "_navigation_v_version_footer_service_links" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TABLE "_booking_settings_v_version_slots" CASCADE;
  DROP TABLE "_booking_settings_v_version_closed_weekdays" CASCADE;
  DROP TABLE "_booking_settings_v_version_closed_dates" CASCADE;
  DROP TABLE "_booking_settings_v_version_date_capacities" CASCADE;
  DROP TABLE "_booking_settings_v" CASCADE;
  DROP TYPE "public"."enum__services_v_version_section_order_section";
  DROP TYPE "public"."enum__services_v_blocks_cta_buttons_variant";
  DROP TYPE "public"."enum__services_v_blocks_cta_layout";
  DROP TYPE "public"."enum__services_blocks_image_text_2_v_buttons_variant";
  DROP TYPE "public"."enum__services_blocks_image_text_2_v_alignment";
  DROP TYPE "public"."enum__services_blocks_video_2_v_source";
  DROP TYPE "public"."enum__services_v_blocks_luxury_cta_buttons_variant";
  DROP TYPE "public"."enum__services_v_version_silicon_valley_loves_buttons_variant";
  DROP TYPE "public"."enum__service_locations_v_silicon_valley_loves_buttons_variant";
  DROP TYPE "public"."enum__service_locations_v_version_section_overrides_section_key";
  DROP TYPE "public"."enum__pages_v_blocks_hero_cta_style";
  DROP TYPE "public"."enum__pages_v_blocks_hero_align";
  DROP TYPE "public"."enum__pages_v_blocks_custom_image_side";
  DROP TYPE "public"."enum__blog_v_version_sections_image_position";
  DROP TYPE "public"."enum__blog_v_version_status";
  DROP TYPE "public"."enum__blog_v_version_scheduled_publish_slot";
  DROP TYPE "public"."enum__landing_pages_v_blocks_hero_buttons_variant";
  DROP TYPE "public"."enum__landing_pages_v_blocks_cta_buttons_variant";
  DROP TYPE "public"."enum__landing_pages_v_blocks_image_text_buttons_variant";
  DROP TYPE "public"."enum__landing_pages_v_blocks_image_text_alignment";
  DROP TYPE "public"."enum__landing_pages_v_blocks_video_source";
  DROP TYPE "public"."enum__landing_pages_v_blocks_luxury_cta_buttons_variant";
  DROP TYPE "public"."enum__landing_pages_v_version_status";
  DROP TYPE "public"."enum_site_settings_company_opening_hours_days";
  DROP TYPE "public"."enum__site_settings_v_version_company_opening_hours_days";
  DROP TYPE "public"."enum__site_settings_v_version_trust_intro_buttons_variant";
  DROP TYPE "public"."enum__shared_sections_v_silicon_valley_loves_buttons_variant";
  DROP TYPE "public"."enum__shared_sections_v_services_estimate_band_buttons_variant";
  DROP TYPE "public"."enum__booking_settings_v_version_closed_weekdays";`)
}
