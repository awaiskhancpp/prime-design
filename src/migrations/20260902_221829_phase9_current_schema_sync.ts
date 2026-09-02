import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_blocks_hero_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_services_blocks_cta_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_services_blocks_image_text_2_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_services_blocks_image_text_2_alignment" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_services_blocks_video_2_source" AS ENUM('media', 'externalUrl');
  CREATE TYPE "public"."enum_services_blocks_luxury_cta_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_landing_pages_hero_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_landing_pages_blocks_hero_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_landing_pages_blocks_cta_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_landing_pages_blocks_image_text_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_landing_pages_blocks_image_text_alignment" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_landing_pages_blocks_video_source" AS ENUM('media', 'externalUrl');
  CREATE TYPE "public"."enum_landing_pages_blocks_luxury_cta_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TABLE "services_blocks_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_services_blocks_hero_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"background_media_asset_id" integer,
  	"background_media_alt" varchar,
  	"background_media_caption" varchar,
  	"background_media_source_attachment_id" numeric,
  	"background_media_source_url" varchar,
  	"foreground_media_asset_id" integer,
  	"foreground_media_alt" varchar,
  	"foreground_media_caption" varchar,
  	"foreground_media_source_attachment_id" numeric,
  	"foreground_media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_services_blocks_cta_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_image_text_2_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_services_blocks_image_text_2_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_image_text_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"alignment" "enum_services_blocks_image_text_2_alignment",
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"source" "enum_services_blocks_video_2_source",
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"controls" boolean DEFAULT true,
  	"source_video_id" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_gallery_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric
  );
  
  CREATE TABLE "services_blocks_gallery_2_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric
  );
  
  CREATE TABLE "services_blocks_gallery_2_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"heading" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "services_blocks_gallery_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"layout" jsonb,
  	"lightbox" boolean DEFAULT true,
  	"source_gallery_type" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"before_media_id" integer,
  	"after_media_id" integer,
  	"before_label" varchar,
  	"after_label" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_sub_services_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_sub_services_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_prime_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_prime_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_experience_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_experience_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_service_areas_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"location_id" integer,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_service_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_repair_services_categories_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_blocks_repair_services_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar
  );
  
  CREATE TABLE "services_blocks_repair_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_luxury_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_services_blocks_luxury_cta_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_luxury_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_booking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"provider" varchar,
  	"shortcode" varchar,
  	"source_element_id" varchar,
  	"integration_metadata" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"provider" varchar,
  	"shortcode" varchar,
  	"source_element_id" varchar,
  	"integration_metadata" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_find_us" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"address" varchar,
  	"map_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_testimonials_providers_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reviewer" varchar,
  	"rating" numeric,
  	"body" varchar,
  	"date" timestamp(3) with time zone,
  	"source_id" varchar
  );
  
  CREATE TABLE "services_blocks_testimonials_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"shortcode" varchar,
  	"collection_id" varchar
  );
  
  CREATE TABLE "services_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_faq_categories_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"source_id" varchar
  );
  
  CREATE TABLE "services_blocks_faq_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"source_query" jsonb,
  	"source_id" varchar
  );
  
  CREATE TABLE "services_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_video_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"caption" varchar,
  	"source_id" varchar,
  	"source_order" numeric
  );
  
  CREATE TABLE "services_blocks_video_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"settings" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_gallery_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric
  );
  
  CREATE TABLE "services_blocks_gallery_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"settings" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_landing_pages_hero_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_landing_pages_blocks_hero_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"background_media_asset_id" integer,
  	"background_media_alt" varchar,
  	"background_media_caption" varchar,
  	"background_media_source_attachment_id" numeric,
  	"background_media_source_url" varchar,
  	"foreground_media_asset_id" integer,
  	"foreground_media_alt" varchar,
  	"foreground_media_caption" varchar,
  	"foreground_media_source_attachment_id" numeric,
  	"foreground_media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_landing_pages_blocks_cta_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_image_text_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_landing_pages_blocks_image_text_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"alignment" "enum_landing_pages_blocks_image_text_alignment",
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"source" "enum_landing_pages_blocks_video_source",
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"controls" boolean DEFAULT true,
  	"source_video_id" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric
  );
  
  CREATE TABLE "landing_pages_blocks_gallery_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric
  );
  
  CREATE TABLE "landing_pages_blocks_gallery_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"heading" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"layout" jsonb,
  	"lightbox" boolean DEFAULT true,
  	"source_gallery_type" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"before_media_id" integer,
  	"after_media_id" integer,
  	"before_label" varchar,
  	"after_label" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_sub_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_sub_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_prime_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_prime_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_experience_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_experience_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_service_areas_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"location_id" integer,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_service_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_repair_services_categories_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_repair_services_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"source_id" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_repair_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_luxury_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_landing_pages_blocks_luxury_cta_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_luxury_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_booking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"provider" varchar,
  	"shortcode" varchar,
  	"source_element_id" varchar,
  	"integration_metadata" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"provider" varchar,
  	"shortcode" varchar,
  	"source_element_id" varchar,
  	"integration_metadata" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_find_us" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"address" varchar,
  	"map_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_testimonials_providers_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reviewer" varchar,
  	"rating" numeric,
  	"body" varchar,
  	"date" timestamp(3) with time zone,
  	"source_id" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_testimonials_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"shortcode" varchar,
  	"collection_id" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_faq_categories_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"source_id" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_faq_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"source_query" jsonb,
  	"source_id" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_video_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"caption" varchar,
  	"source_id" varchar,
  	"source_order" numeric
  );
  
  CREATE TABLE "landing_pages_blocks_video_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"settings" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_gallery_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt" varchar,
  	"source_order" numeric,
  	"source_attachment_id" numeric
  );
  
  CREATE TABLE "landing_pages_blocks_gallery_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"settings" jsonb,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  ALTER TABLE "landing_pages_section_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_sub_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_prime_difference_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_projects_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_faq_categories_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_faq_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_faq_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "landing_pages_section_order" CASCADE;
  DROP TABLE "landing_pages_sub_services_items" CASCADE;
  DROP TABLE "landing_pages_prime_difference_checklist" CASCADE;
  DROP TABLE "landing_pages_projects_items" CASCADE;
  DROP TABLE "landing_pages_faq_categories_items" CASCADE;
  DROP TABLE "landing_pages_faq_categories" CASCADE;
  DROP TABLE "landing_pages_faq_items" CASCADE;
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_hero_image_id_media_id_fk";
  
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_intro_image_id_media_id_fk";
  
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_video_video_file_id_media_id_fk";
  
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_video_poster_id_media_id_fk";
  
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DATA TYPE text;
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DEFAULT 'information'::text;
  DROP TYPE "public"."enum_landing_pages_template";
  CREATE TYPE "public"."enum_landing_pages_template" AS ENUM('information');
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DEFAULT 'information'::"public"."enum_landing_pages_template";
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DATA TYPE "public"."enum_landing_pages_template" USING "template"::"public"."enum_landing_pages_template";
  DROP INDEX "landing_pages_hero_hero_image_idx";
  DROP INDEX "landing_pages_intro_intro_image_idx";
  DROP INDEX "landing_pages_video_video_video_file_idx";
  DROP INDEX "landing_pages_video_video_poster_idx";
  ALTER TABLE "service_locations_section_overrides" ALTER COLUMN "section_key" SET DATA TYPE varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "hero_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "hero_background_media_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "hero_foreground_media_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "source_word_press_id" numeric;
  ALTER TABLE "landing_pages" ADD COLUMN "source_slug" varchar;
  ALTER TABLE "services_blocks_hero_buttons" ADD CONSTRAINT "services_blocks_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_hero" ADD CONSTRAINT "services_blocks_hero_background_media_asset_id_media_id_fk" FOREIGN KEY ("background_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_hero" ADD CONSTRAINT "services_blocks_hero_foreground_media_asset_id_media_id_fk" FOREIGN KEY ("foreground_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_hero" ADD CONSTRAINT "services_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cta_buttons" ADD CONSTRAINT "services_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cta" ADD CONSTRAINT "services_blocks_cta_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_cta" ADD CONSTRAINT "services_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_text_2_buttons" ADD CONSTRAINT "services_blocks_image_text_2_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_image_text_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_text_2" ADD CONSTRAINT "services_blocks_image_text_2_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_text_2" ADD CONSTRAINT "services_blocks_image_text_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_video_2" ADD CONSTRAINT "services_blocks_video_2_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_video_2" ADD CONSTRAINT "services_blocks_video_2_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_video_2" ADD CONSTRAINT "services_blocks_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_2_items" ADD CONSTRAINT "services_blocks_gallery_2_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_2_items" ADD CONSTRAINT "services_blocks_gallery_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_gallery_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_2_groups_items" ADD CONSTRAINT "services_blocks_gallery_2_groups_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_2_groups_items" ADD CONSTRAINT "services_blocks_gallery_2_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_gallery_2_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_2_groups" ADD CONSTRAINT "services_blocks_gallery_2_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_gallery_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_2" ADD CONSTRAINT "services_blocks_gallery_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after" ADD CONSTRAINT "services_blocks_before_after_before_media_id_media_id_fk" FOREIGN KEY ("before_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after" ADD CONSTRAINT "services_blocks_before_after_after_media_id_media_id_fk" FOREIGN KEY ("after_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after" ADD CONSTRAINT "services_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_sub_services_2_items" ADD CONSTRAINT "services_blocks_sub_services_2_items_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_sub_services_2_items" ADD CONSTRAINT "services_blocks_sub_services_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_sub_services_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_sub_services_2" ADD CONSTRAINT "services_blocks_sub_services_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_prime_difference_features" ADD CONSTRAINT "services_blocks_prime_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_prime_difference_features" ADD CONSTRAINT "services_blocks_prime_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_prime_difference_features" ADD CONSTRAINT "services_blocks_prime_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_prime_difference" ADD CONSTRAINT "services_blocks_prime_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_prime_difference" ADD CONSTRAINT "services_blocks_prime_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_experience_difference_features" ADD CONSTRAINT "services_blocks_experience_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_experience_difference_features" ADD CONSTRAINT "services_blocks_experience_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_experience_difference_features" ADD CONSTRAINT "services_blocks_experience_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_experience_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_experience_difference" ADD CONSTRAINT "services_blocks_experience_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_experience_difference" ADD CONSTRAINT "services_blocks_experience_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_service_areas_areas" ADD CONSTRAINT "services_blocks_service_areas_areas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_service_areas_areas" ADD CONSTRAINT "services_blocks_service_areas_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_service_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_service_areas" ADD CONSTRAINT "services_blocks_service_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_repair_services_categories_features" ADD CONSTRAINT "services_blocks_repair_services_categories_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_repair_services_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_repair_services_categories" ADD CONSTRAINT "services_blocks_repair_services_categories_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_repair_services_categories" ADD CONSTRAINT "services_blocks_repair_services_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_repair_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_repair_services" ADD CONSTRAINT "services_blocks_repair_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_luxury_cta_buttons" ADD CONSTRAINT "services_blocks_luxury_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_luxury_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_luxury_cta" ADD CONSTRAINT "services_blocks_luxury_cta_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_luxury_cta" ADD CONSTRAINT "services_blocks_luxury_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_booking" ADD CONSTRAINT "services_blocks_booking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_contact_form" ADD CONSTRAINT "services_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_find_us" ADD CONSTRAINT "services_blocks_find_us_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_testimonials_providers_reviews" ADD CONSTRAINT "services_blocks_testimonials_providers_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_testimonials_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_testimonials_providers" ADD CONSTRAINT "services_blocks_testimonials_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_testimonials" ADD CONSTRAINT "services_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_faq_categories_questions" ADD CONSTRAINT "services_blocks_faq_categories_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_faq_categories" ADD CONSTRAINT "services_blocks_faq_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_faq" ADD CONSTRAINT "services_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_video_carousel_items" ADD CONSTRAINT "services_blocks_video_carousel_items_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_video_carousel_items" ADD CONSTRAINT "services_blocks_video_carousel_items_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_video_carousel_items" ADD CONSTRAINT "services_blocks_video_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_video_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_video_carousel" ADD CONSTRAINT "services_blocks_video_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_carousel_items" ADD CONSTRAINT "services_blocks_gallery_carousel_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_carousel_items" ADD CONSTRAINT "services_blocks_gallery_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_gallery_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_carousel" ADD CONSTRAINT "services_blocks_gallery_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_hero_buttons" ADD CONSTRAINT "landing_pages_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_hero_buttons" ADD CONSTRAINT "landing_pages_blocks_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_hero" ADD CONSTRAINT "landing_pages_blocks_hero_background_media_asset_id_media_id_fk" FOREIGN KEY ("background_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_hero" ADD CONSTRAINT "landing_pages_blocks_hero_foreground_media_asset_id_media_id_fk" FOREIGN KEY ("foreground_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_hero" ADD CONSTRAINT "landing_pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_cta_buttons" ADD CONSTRAINT "landing_pages_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_cta" ADD CONSTRAINT "landing_pages_blocks_cta_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_cta" ADD CONSTRAINT "landing_pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_image_text_buttons" ADD CONSTRAINT "landing_pages_blocks_image_text_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_image_text" ADD CONSTRAINT "landing_pages_blocks_image_text_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_image_text" ADD CONSTRAINT "landing_pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video" ADD CONSTRAINT "landing_pages_blocks_video_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video" ADD CONSTRAINT "landing_pages_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video" ADD CONSTRAINT "landing_pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery_items" ADD CONSTRAINT "landing_pages_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery_items" ADD CONSTRAINT "landing_pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery_groups_items" ADD CONSTRAINT "landing_pages_blocks_gallery_groups_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery_groups_items" ADD CONSTRAINT "landing_pages_blocks_gallery_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_gallery_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery_groups" ADD CONSTRAINT "landing_pages_blocks_gallery_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery" ADD CONSTRAINT "landing_pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_before_after" ADD CONSTRAINT "landing_pages_blocks_before_after_before_media_id_media_id_fk" FOREIGN KEY ("before_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_before_after" ADD CONSTRAINT "landing_pages_blocks_before_after_after_media_id_media_id_fk" FOREIGN KEY ("after_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_before_after" ADD CONSTRAINT "landing_pages_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_sub_services_items" ADD CONSTRAINT "landing_pages_blocks_sub_services_items_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_sub_services_items" ADD CONSTRAINT "landing_pages_blocks_sub_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_sub_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_sub_services" ADD CONSTRAINT "landing_pages_blocks_sub_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_prime_difference_features" ADD CONSTRAINT "landing_pages_blocks_prime_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_prime_difference_features" ADD CONSTRAINT "landing_pages_blocks_prime_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_prime_difference_features" ADD CONSTRAINT "landing_pages_blocks_prime_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_prime_difference" ADD CONSTRAINT "landing_pages_blocks_prime_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_prime_difference" ADD CONSTRAINT "landing_pages_blocks_prime_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_experience_difference_features" ADD CONSTRAINT "landing_pages_blocks_experience_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_experience_difference_features" ADD CONSTRAINT "landing_pages_blocks_experience_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_experience_difference_features" ADD CONSTRAINT "landing_pages_blocks_experience_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_experience_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_experience_difference" ADD CONSTRAINT "landing_pages_blocks_experience_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_experience_difference" ADD CONSTRAINT "landing_pages_blocks_experience_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_service_areas_areas" ADD CONSTRAINT "landing_pages_blocks_service_areas_areas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_service_areas_areas" ADD CONSTRAINT "landing_pages_blocks_service_areas_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_service_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_service_areas" ADD CONSTRAINT "landing_pages_blocks_service_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_repair_services_categories_features" ADD CONSTRAINT "landing_pages_blocks_repair_services_categories_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_repair_services_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_repair_services_categories" ADD CONSTRAINT "landing_pages_blocks_repair_services_categories_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_repair_services_categories" ADD CONSTRAINT "landing_pages_blocks_repair_services_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_repair_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_repair_services" ADD CONSTRAINT "landing_pages_blocks_repair_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_luxury_cta_buttons" ADD CONSTRAINT "landing_pages_blocks_luxury_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_luxury_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_luxury_cta" ADD CONSTRAINT "landing_pages_blocks_luxury_cta_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_luxury_cta" ADD CONSTRAINT "landing_pages_blocks_luxury_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_booking" ADD CONSTRAINT "landing_pages_blocks_booking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_contact_form" ADD CONSTRAINT "landing_pages_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_find_us" ADD CONSTRAINT "landing_pages_blocks_find_us_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_testimonials_providers_reviews" ADD CONSTRAINT "landing_pages_blocks_testimonials_providers_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_testimonials_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_testimonials_providers" ADD CONSTRAINT "landing_pages_blocks_testimonials_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_testimonials" ADD CONSTRAINT "landing_pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_faq_categories_questions" ADD CONSTRAINT "landing_pages_blocks_faq_categories_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_faq_categories" ADD CONSTRAINT "landing_pages_blocks_faq_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_faq" ADD CONSTRAINT "landing_pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video_carousel_items" ADD CONSTRAINT "landing_pages_blocks_video_carousel_items_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video_carousel_items" ADD CONSTRAINT "landing_pages_blocks_video_carousel_items_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video_carousel_items" ADD CONSTRAINT "landing_pages_blocks_video_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_video_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video_carousel" ADD CONSTRAINT "landing_pages_blocks_video_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery_carousel_items" ADD CONSTRAINT "landing_pages_blocks_gallery_carousel_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery_carousel_items" ADD CONSTRAINT "landing_pages_blocks_gallery_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_gallery_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery_carousel" ADD CONSTRAINT "landing_pages_blocks_gallery_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_blocks_hero_buttons_order_idx" ON "services_blocks_hero_buttons" USING btree ("_order");
  CREATE INDEX "services_blocks_hero_buttons_parent_id_idx" ON "services_blocks_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_hero_order_idx" ON "services_blocks_hero" USING btree ("_order");
  CREATE INDEX "services_blocks_hero_parent_id_idx" ON "services_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_hero_path_idx" ON "services_blocks_hero" USING btree ("_path");
  CREATE INDEX "services_blocks_hero_background_media_background_media_a_idx" ON "services_blocks_hero" USING btree ("background_media_asset_id");
  CREATE INDEX "services_blocks_hero_foreground_media_foreground_media_a_idx" ON "services_blocks_hero" USING btree ("foreground_media_asset_id");
  CREATE INDEX "services_blocks_cta_buttons_order_idx" ON "services_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "services_blocks_cta_buttons_parent_id_idx" ON "services_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cta_order_idx" ON "services_blocks_cta" USING btree ("_order");
  CREATE INDEX "services_blocks_cta_parent_id_idx" ON "services_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cta_path_idx" ON "services_blocks_cta" USING btree ("_path");
  CREATE INDEX "services_blocks_cta_media_media_asset_idx" ON "services_blocks_cta" USING btree ("media_asset_id");
  CREATE INDEX "services_blocks_image_text_2_buttons_order_idx" ON "services_blocks_image_text_2_buttons" USING btree ("_order");
  CREATE INDEX "services_blocks_image_text_2_buttons_parent_id_idx" ON "services_blocks_image_text_2_buttons" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_text_2_order_idx" ON "services_blocks_image_text_2" USING btree ("_order");
  CREATE INDEX "services_blocks_image_text_2_parent_id_idx" ON "services_blocks_image_text_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_text_2_path_idx" ON "services_blocks_image_text_2" USING btree ("_path");
  CREATE INDEX "services_blocks_image_text_2_media_media_asset_idx" ON "services_blocks_image_text_2" USING btree ("media_asset_id");
  CREATE INDEX "services_blocks_video_2_order_idx" ON "services_blocks_video_2" USING btree ("_order");
  CREATE INDEX "services_blocks_video_2_parent_id_idx" ON "services_blocks_video_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_video_2_path_idx" ON "services_blocks_video_2" USING btree ("_path");
  CREATE INDEX "services_blocks_video_2_video_idx" ON "services_blocks_video_2" USING btree ("video_id");
  CREATE INDEX "services_blocks_video_2_poster_idx" ON "services_blocks_video_2" USING btree ("poster_id");
  CREATE INDEX "services_blocks_gallery_2_items_order_idx" ON "services_blocks_gallery_2_items" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_2_items_parent_id_idx" ON "services_blocks_gallery_2_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_2_items_media_idx" ON "services_blocks_gallery_2_items" USING btree ("media_id");
  CREATE INDEX "services_blocks_gallery_2_groups_items_order_idx" ON "services_blocks_gallery_2_groups_items" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_2_groups_items_parent_id_idx" ON "services_blocks_gallery_2_groups_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_2_groups_items_media_idx" ON "services_blocks_gallery_2_groups_items" USING btree ("media_id");
  CREATE INDEX "services_blocks_gallery_2_groups_order_idx" ON "services_blocks_gallery_2_groups" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_2_groups_parent_id_idx" ON "services_blocks_gallery_2_groups" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_2_order_idx" ON "services_blocks_gallery_2" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_2_parent_id_idx" ON "services_blocks_gallery_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_2_path_idx" ON "services_blocks_gallery_2" USING btree ("_path");
  CREATE INDEX "services_blocks_before_after_order_idx" ON "services_blocks_before_after" USING btree ("_order");
  CREATE INDEX "services_blocks_before_after_parent_id_idx" ON "services_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_before_after_path_idx" ON "services_blocks_before_after" USING btree ("_path");
  CREATE INDEX "services_blocks_before_after_before_media_idx" ON "services_blocks_before_after" USING btree ("before_media_id");
  CREATE INDEX "services_blocks_before_after_after_media_idx" ON "services_blocks_before_after" USING btree ("after_media_id");
  CREATE INDEX "services_blocks_sub_services_2_items_order_idx" ON "services_blocks_sub_services_2_items" USING btree ("_order");
  CREATE INDEX "services_blocks_sub_services_2_items_parent_id_idx" ON "services_blocks_sub_services_2_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_sub_services_2_items_media_media_asset_idx" ON "services_blocks_sub_services_2_items" USING btree ("media_asset_id");
  CREATE INDEX "services_blocks_sub_services_2_order_idx" ON "services_blocks_sub_services_2" USING btree ("_order");
  CREATE INDEX "services_blocks_sub_services_2_parent_id_idx" ON "services_blocks_sub_services_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_sub_services_2_path_idx" ON "services_blocks_sub_services_2" USING btree ("_path");
  CREATE INDEX "services_blocks_prime_difference_features_order_idx" ON "services_blocks_prime_difference_features" USING btree ("_order");
  CREATE INDEX "services_blocks_prime_difference_features_parent_id_idx" ON "services_blocks_prime_difference_features" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_prime_difference_features_icon_icon_icon_idx" ON "services_blocks_prime_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "services_blocks_prime_difference_features_media_media_as_idx" ON "services_blocks_prime_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "services_blocks_prime_difference_order_idx" ON "services_blocks_prime_difference" USING btree ("_order");
  CREATE INDEX "services_blocks_prime_difference_parent_id_idx" ON "services_blocks_prime_difference" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_prime_difference_path_idx" ON "services_blocks_prime_difference" USING btree ("_path");
  CREATE INDEX "services_blocks_prime_difference_media_media_asset_idx" ON "services_blocks_prime_difference" USING btree ("media_asset_id");
  CREATE INDEX "services_blocks_experience_difference_features_order_idx" ON "services_blocks_experience_difference_features" USING btree ("_order");
  CREATE INDEX "services_blocks_experience_difference_features_parent_id_idx" ON "services_blocks_experience_difference_features" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_experience_difference_features_icon_icon_idx" ON "services_blocks_experience_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "services_blocks_experience_difference_features_media_med_idx" ON "services_blocks_experience_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "services_blocks_experience_difference_order_idx" ON "services_blocks_experience_difference" USING btree ("_order");
  CREATE INDEX "services_blocks_experience_difference_parent_id_idx" ON "services_blocks_experience_difference" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_experience_difference_path_idx" ON "services_blocks_experience_difference" USING btree ("_path");
  CREATE INDEX "services_blocks_experience_difference_media_media_asset_idx" ON "services_blocks_experience_difference" USING btree ("media_asset_id");
  CREATE INDEX "services_blocks_service_areas_areas_order_idx" ON "services_blocks_service_areas_areas" USING btree ("_order");
  CREATE INDEX "services_blocks_service_areas_areas_parent_id_idx" ON "services_blocks_service_areas_areas" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_service_areas_areas_location_idx" ON "services_blocks_service_areas_areas" USING btree ("location_id");
  CREATE INDEX "services_blocks_service_areas_order_idx" ON "services_blocks_service_areas" USING btree ("_order");
  CREATE INDEX "services_blocks_service_areas_parent_id_idx" ON "services_blocks_service_areas" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_service_areas_path_idx" ON "services_blocks_service_areas" USING btree ("_path");
  CREATE INDEX "services_blocks_repair_services_categories_features_order_idx" ON "services_blocks_repair_services_categories_features" USING btree ("_order");
  CREATE INDEX "services_blocks_repair_services_categories_features_parent_id_idx" ON "services_blocks_repair_services_categories_features" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_repair_services_categories_order_idx" ON "services_blocks_repair_services_categories" USING btree ("_order");
  CREATE INDEX "services_blocks_repair_services_categories_parent_id_idx" ON "services_blocks_repair_services_categories" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_repair_services_categories_media_media_a_idx" ON "services_blocks_repair_services_categories" USING btree ("media_asset_id");
  CREATE INDEX "services_blocks_repair_services_order_idx" ON "services_blocks_repair_services" USING btree ("_order");
  CREATE INDEX "services_blocks_repair_services_parent_id_idx" ON "services_blocks_repair_services" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_repair_services_path_idx" ON "services_blocks_repair_services" USING btree ("_path");
  CREATE INDEX "services_blocks_luxury_cta_buttons_order_idx" ON "services_blocks_luxury_cta_buttons" USING btree ("_order");
  CREATE INDEX "services_blocks_luxury_cta_buttons_parent_id_idx" ON "services_blocks_luxury_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_luxury_cta_order_idx" ON "services_blocks_luxury_cta" USING btree ("_order");
  CREATE INDEX "services_blocks_luxury_cta_parent_id_idx" ON "services_blocks_luxury_cta" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_luxury_cta_path_idx" ON "services_blocks_luxury_cta" USING btree ("_path");
  CREATE INDEX "services_blocks_luxury_cta_media_media_asset_idx" ON "services_blocks_luxury_cta" USING btree ("media_asset_id");
  CREATE INDEX "services_blocks_booking_order_idx" ON "services_blocks_booking" USING btree ("_order");
  CREATE INDEX "services_blocks_booking_parent_id_idx" ON "services_blocks_booking" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_booking_path_idx" ON "services_blocks_booking" USING btree ("_path");
  CREATE INDEX "services_blocks_contact_form_order_idx" ON "services_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "services_blocks_contact_form_parent_id_idx" ON "services_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_contact_form_path_idx" ON "services_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "services_blocks_find_us_order_idx" ON "services_blocks_find_us" USING btree ("_order");
  CREATE INDEX "services_blocks_find_us_parent_id_idx" ON "services_blocks_find_us" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_find_us_path_idx" ON "services_blocks_find_us" USING btree ("_path");
  CREATE INDEX "services_blocks_testimonials_providers_reviews_order_idx" ON "services_blocks_testimonials_providers_reviews" USING btree ("_order");
  CREATE INDEX "services_blocks_testimonials_providers_reviews_parent_id_idx" ON "services_blocks_testimonials_providers_reviews" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_testimonials_providers_order_idx" ON "services_blocks_testimonials_providers" USING btree ("_order");
  CREATE INDEX "services_blocks_testimonials_providers_parent_id_idx" ON "services_blocks_testimonials_providers" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_testimonials_order_idx" ON "services_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "services_blocks_testimonials_parent_id_idx" ON "services_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_testimonials_path_idx" ON "services_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "services_blocks_faq_categories_questions_order_idx" ON "services_blocks_faq_categories_questions" USING btree ("_order");
  CREATE INDEX "services_blocks_faq_categories_questions_parent_id_idx" ON "services_blocks_faq_categories_questions" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_faq_categories_order_idx" ON "services_blocks_faq_categories" USING btree ("_order");
  CREATE INDEX "services_blocks_faq_categories_parent_id_idx" ON "services_blocks_faq_categories" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_faq_order_idx" ON "services_blocks_faq" USING btree ("_order");
  CREATE INDEX "services_blocks_faq_parent_id_idx" ON "services_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_faq_path_idx" ON "services_blocks_faq" USING btree ("_path");
  CREATE INDEX "services_blocks_video_carousel_items_order_idx" ON "services_blocks_video_carousel_items" USING btree ("_order");
  CREATE INDEX "services_blocks_video_carousel_items_parent_id_idx" ON "services_blocks_video_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_video_carousel_items_video_idx" ON "services_blocks_video_carousel_items" USING btree ("video_id");
  CREATE INDEX "services_blocks_video_carousel_items_poster_idx" ON "services_blocks_video_carousel_items" USING btree ("poster_id");
  CREATE INDEX "services_blocks_video_carousel_order_idx" ON "services_blocks_video_carousel" USING btree ("_order");
  CREATE INDEX "services_blocks_video_carousel_parent_id_idx" ON "services_blocks_video_carousel" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_video_carousel_path_idx" ON "services_blocks_video_carousel" USING btree ("_path");
  CREATE INDEX "services_blocks_gallery_carousel_items_order_idx" ON "services_blocks_gallery_carousel_items" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_carousel_items_parent_id_idx" ON "services_blocks_gallery_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_carousel_items_media_idx" ON "services_blocks_gallery_carousel_items" USING btree ("media_id");
  CREATE INDEX "services_blocks_gallery_carousel_order_idx" ON "services_blocks_gallery_carousel" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_carousel_parent_id_idx" ON "services_blocks_gallery_carousel" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_carousel_path_idx" ON "services_blocks_gallery_carousel" USING btree ("_path");
  CREATE INDEX "landing_pages_hero_buttons_order_idx" ON "landing_pages_hero_buttons" USING btree ("_order");
  CREATE INDEX "landing_pages_hero_buttons_parent_id_idx" ON "landing_pages_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_hero_buttons_order_idx" ON "landing_pages_blocks_hero_buttons" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_hero_buttons_parent_id_idx" ON "landing_pages_blocks_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_hero_order_idx" ON "landing_pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_hero_parent_id_idx" ON "landing_pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_hero_path_idx" ON "landing_pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_hero_background_media_background_me_idx" ON "landing_pages_blocks_hero" USING btree ("background_media_asset_id");
  CREATE INDEX "landing_pages_blocks_hero_foreground_media_foreground_me_idx" ON "landing_pages_blocks_hero" USING btree ("foreground_media_asset_id");
  CREATE INDEX "landing_pages_blocks_cta_buttons_order_idx" ON "landing_pages_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_cta_buttons_parent_id_idx" ON "landing_pages_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_cta_order_idx" ON "landing_pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_cta_parent_id_idx" ON "landing_pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_cta_path_idx" ON "landing_pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_cta_media_media_asset_idx" ON "landing_pages_blocks_cta" USING btree ("media_asset_id");
  CREATE INDEX "landing_pages_blocks_image_text_buttons_order_idx" ON "landing_pages_blocks_image_text_buttons" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_image_text_buttons_parent_id_idx" ON "landing_pages_blocks_image_text_buttons" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_image_text_order_idx" ON "landing_pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_image_text_parent_id_idx" ON "landing_pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_image_text_path_idx" ON "landing_pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_image_text_media_media_asset_idx" ON "landing_pages_blocks_image_text" USING btree ("media_asset_id");
  CREATE INDEX "landing_pages_blocks_video_order_idx" ON "landing_pages_blocks_video" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_video_parent_id_idx" ON "landing_pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_video_path_idx" ON "landing_pages_blocks_video" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_video_video_idx" ON "landing_pages_blocks_video" USING btree ("video_id");
  CREATE INDEX "landing_pages_blocks_video_poster_idx" ON "landing_pages_blocks_video" USING btree ("poster_id");
  CREATE INDEX "landing_pages_blocks_gallery_items_order_idx" ON "landing_pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_gallery_items_parent_id_idx" ON "landing_pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_gallery_items_media_idx" ON "landing_pages_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "landing_pages_blocks_gallery_groups_items_order_idx" ON "landing_pages_blocks_gallery_groups_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_gallery_groups_items_parent_id_idx" ON "landing_pages_blocks_gallery_groups_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_gallery_groups_items_media_idx" ON "landing_pages_blocks_gallery_groups_items" USING btree ("media_id");
  CREATE INDEX "landing_pages_blocks_gallery_groups_order_idx" ON "landing_pages_blocks_gallery_groups" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_gallery_groups_parent_id_idx" ON "landing_pages_blocks_gallery_groups" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_gallery_order_idx" ON "landing_pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_gallery_parent_id_idx" ON "landing_pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_gallery_path_idx" ON "landing_pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_before_after_order_idx" ON "landing_pages_blocks_before_after" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_before_after_parent_id_idx" ON "landing_pages_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_before_after_path_idx" ON "landing_pages_blocks_before_after" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_before_after_before_media_idx" ON "landing_pages_blocks_before_after" USING btree ("before_media_id");
  CREATE INDEX "landing_pages_blocks_before_after_after_media_idx" ON "landing_pages_blocks_before_after" USING btree ("after_media_id");
  CREATE INDEX "landing_pages_blocks_sub_services_items_order_idx" ON "landing_pages_blocks_sub_services_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_sub_services_items_parent_id_idx" ON "landing_pages_blocks_sub_services_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_sub_services_items_media_media_asse_idx" ON "landing_pages_blocks_sub_services_items" USING btree ("media_asset_id");
  CREATE INDEX "landing_pages_blocks_sub_services_order_idx" ON "landing_pages_blocks_sub_services" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_sub_services_parent_id_idx" ON "landing_pages_blocks_sub_services" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_sub_services_path_idx" ON "landing_pages_blocks_sub_services" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_prime_difference_features_order_idx" ON "landing_pages_blocks_prime_difference_features" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_prime_difference_features_parent_id_idx" ON "landing_pages_blocks_prime_difference_features" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_prime_difference_features_icon_icon_idx" ON "landing_pages_blocks_prime_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "landing_pages_blocks_prime_difference_features_media_med_idx" ON "landing_pages_blocks_prime_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "landing_pages_blocks_prime_difference_order_idx" ON "landing_pages_blocks_prime_difference" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_prime_difference_parent_id_idx" ON "landing_pages_blocks_prime_difference" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_prime_difference_path_idx" ON "landing_pages_blocks_prime_difference" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_prime_difference_media_media_asset_idx" ON "landing_pages_blocks_prime_difference" USING btree ("media_asset_id");
  CREATE INDEX "landing_pages_blocks_experience_difference_features_order_idx" ON "landing_pages_blocks_experience_difference_features" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_experience_difference_features_parent_id_idx" ON "landing_pages_blocks_experience_difference_features" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_experience_difference_features_icon_idx" ON "landing_pages_blocks_experience_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "landing_pages_blocks_experience_difference_features_medi_idx" ON "landing_pages_blocks_experience_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "landing_pages_blocks_experience_difference_order_idx" ON "landing_pages_blocks_experience_difference" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_experience_difference_parent_id_idx" ON "landing_pages_blocks_experience_difference" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_experience_difference_path_idx" ON "landing_pages_blocks_experience_difference" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_experience_difference_media_media_a_idx" ON "landing_pages_blocks_experience_difference" USING btree ("media_asset_id");
  CREATE INDEX "landing_pages_blocks_service_areas_areas_order_idx" ON "landing_pages_blocks_service_areas_areas" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_service_areas_areas_parent_id_idx" ON "landing_pages_blocks_service_areas_areas" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_service_areas_areas_location_idx" ON "landing_pages_blocks_service_areas_areas" USING btree ("location_id");
  CREATE INDEX "landing_pages_blocks_service_areas_order_idx" ON "landing_pages_blocks_service_areas" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_service_areas_parent_id_idx" ON "landing_pages_blocks_service_areas" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_service_areas_path_idx" ON "landing_pages_blocks_service_areas" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_repair_services_categories_features_order_idx" ON "landing_pages_blocks_repair_services_categories_features" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_repair_services_categories_features_parent_id_idx" ON "landing_pages_blocks_repair_services_categories_features" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_repair_services_categories_order_idx" ON "landing_pages_blocks_repair_services_categories" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_repair_services_categories_parent_id_idx" ON "landing_pages_blocks_repair_services_categories" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_repair_services_categories_media_me_idx" ON "landing_pages_blocks_repair_services_categories" USING btree ("media_asset_id");
  CREATE INDEX "landing_pages_blocks_repair_services_order_idx" ON "landing_pages_blocks_repair_services" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_repair_services_parent_id_idx" ON "landing_pages_blocks_repair_services" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_repair_services_path_idx" ON "landing_pages_blocks_repair_services" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_luxury_cta_buttons_order_idx" ON "landing_pages_blocks_luxury_cta_buttons" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_luxury_cta_buttons_parent_id_idx" ON "landing_pages_blocks_luxury_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_luxury_cta_order_idx" ON "landing_pages_blocks_luxury_cta" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_luxury_cta_parent_id_idx" ON "landing_pages_blocks_luxury_cta" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_luxury_cta_path_idx" ON "landing_pages_blocks_luxury_cta" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_luxury_cta_media_media_asset_idx" ON "landing_pages_blocks_luxury_cta" USING btree ("media_asset_id");
  CREATE INDEX "landing_pages_blocks_booking_order_idx" ON "landing_pages_blocks_booking" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_booking_parent_id_idx" ON "landing_pages_blocks_booking" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_booking_path_idx" ON "landing_pages_blocks_booking" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_contact_form_order_idx" ON "landing_pages_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_contact_form_parent_id_idx" ON "landing_pages_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_contact_form_path_idx" ON "landing_pages_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_find_us_order_idx" ON "landing_pages_blocks_find_us" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_find_us_parent_id_idx" ON "landing_pages_blocks_find_us" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_find_us_path_idx" ON "landing_pages_blocks_find_us" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_testimonials_providers_reviews_order_idx" ON "landing_pages_blocks_testimonials_providers_reviews" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_testimonials_providers_reviews_parent_id_idx" ON "landing_pages_blocks_testimonials_providers_reviews" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_testimonials_providers_order_idx" ON "landing_pages_blocks_testimonials_providers" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_testimonials_providers_parent_id_idx" ON "landing_pages_blocks_testimonials_providers" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_testimonials_order_idx" ON "landing_pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_testimonials_parent_id_idx" ON "landing_pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_testimonials_path_idx" ON "landing_pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_faq_categories_questions_order_idx" ON "landing_pages_blocks_faq_categories_questions" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_faq_categories_questions_parent_id_idx" ON "landing_pages_blocks_faq_categories_questions" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_faq_categories_order_idx" ON "landing_pages_blocks_faq_categories" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_faq_categories_parent_id_idx" ON "landing_pages_blocks_faq_categories" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_faq_order_idx" ON "landing_pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_faq_parent_id_idx" ON "landing_pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_faq_path_idx" ON "landing_pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_video_carousel_items_order_idx" ON "landing_pages_blocks_video_carousel_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_video_carousel_items_parent_id_idx" ON "landing_pages_blocks_video_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_video_carousel_items_video_idx" ON "landing_pages_blocks_video_carousel_items" USING btree ("video_id");
  CREATE INDEX "landing_pages_blocks_video_carousel_items_poster_idx" ON "landing_pages_blocks_video_carousel_items" USING btree ("poster_id");
  CREATE INDEX "landing_pages_blocks_video_carousel_order_idx" ON "landing_pages_blocks_video_carousel" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_video_carousel_parent_id_idx" ON "landing_pages_blocks_video_carousel" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_video_carousel_path_idx" ON "landing_pages_blocks_video_carousel" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_gallery_carousel_items_order_idx" ON "landing_pages_blocks_gallery_carousel_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_gallery_carousel_items_parent_id_idx" ON "landing_pages_blocks_gallery_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_gallery_carousel_items_media_idx" ON "landing_pages_blocks_gallery_carousel_items" USING btree ("media_id");
  CREATE INDEX "landing_pages_blocks_gallery_carousel_order_idx" ON "landing_pages_blocks_gallery_carousel" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_gallery_carousel_parent_id_idx" ON "landing_pages_blocks_gallery_carousel" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_gallery_carousel_path_idx" ON "landing_pages_blocks_gallery_carousel" USING btree ("_path");
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_hero_background_media_id_media_id_fk" FOREIGN KEY ("hero_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_hero_foreground_media_id_media_id_fk" FOREIGN KEY ("hero_foreground_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "landing_pages_hero_hero_background_media_idx" ON "landing_pages" USING btree ("hero_background_media_id");
  CREATE INDEX "landing_pages_hero_hero_foreground_media_idx" ON "landing_pages" USING btree ("hero_foreground_media_id");
  CREATE INDEX "landing_pages_source_word_press_id_idx" ON "landing_pages" USING btree ("source_word_press_id");
  CREATE INDEX "landing_pages_source_slug_idx" ON "landing_pages" USING btree ("source_slug");
  ALTER TABLE "landing_pages" DROP COLUMN "hero_lead";
  ALTER TABLE "landing_pages" DROP COLUMN "hero_image_id";
  ALTER TABLE "landing_pages" DROP COLUMN "estimate_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "estimate_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "estimate_body";
  ALTER TABLE "landing_pages" DROP COLUMN "estimate_link";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_body";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_image_id";
  ALTER TABLE "landing_pages" DROP COLUMN "sub_services_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "sub_services_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "sub_services_body";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_heading_accent";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_body";
  ALTER TABLE "landing_pages" DROP COLUMN "project_gallery_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "project_gallery_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "reflection_gallery_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "reflection_gallery_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "projects_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "projects_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "projects_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "projects_description";
  ALTER TABLE "landing_pages" DROP COLUMN "video_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "video_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "video_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "video_description";
  ALTER TABLE "landing_pages" DROP COLUMN "video_video_url";
  ALTER TABLE "landing_pages" DROP COLUMN "video_video_file_id";
  ALTER TABLE "landing_pages" DROP COLUMN "video_poster_id";
  ALTER TABLE "landing_pages" DROP COLUMN "why_choose_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "service_areas_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "faq_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "faq_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "testimonials_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_body";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_link";
  ALTER TABLE "landing_pages" DROP COLUMN "booking_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "booking_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "booking_description";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_phone";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_email";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_address";
  ALTER TABLE "landing_pages" DROP COLUMN "contact_form_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "contact_form_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "contact_form_description";
  ALTER TABLE "landing_pages" DROP COLUMN "cta_text";
  ALTER TABLE "landing_pages" DROP COLUMN "cta_link";
  ALTER TABLE "landing_pages" DROP COLUMN "cta_show_form";
  DROP TYPE "public"."enum_service_locations_section_overrides_section_key";
  DROP TYPE "public"."enum_landing_pages_section_order_section";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_service_locations_section_overrides_section_key" AS ENUM('hero', 'intro', 'video', 'offerings', 'quote', 'reviews', 'prime-difference', 'silicon-valley-loves', 'contact');
  CREATE TYPE "public"."enum_landing_pages_section_order_section" AS ENUM('estimate', 'intro', 'subServices', 'primeDifference', 'projects', 'projectGallery', 'reflectionGallery', 'video', 'whyChoose', 'serviceAreas', 'faq', 'testimonials', 'luxuryCta', 'booking', 'findUs', 'contactForm');
  ALTER TYPE "public"."enum_landing_pages_template" ADD VALUE 'default';
  CREATE TABLE "landing_pages_section_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_landing_pages_section_order_section" NOT NULL
  );
  
  CREATE TABLE "landing_pages_sub_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"link" varchar
  );
  
  CREATE TABLE "landing_pages_prime_difference_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pages_projects_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"link" varchar
  );
  
  CREATE TABLE "landing_pages_faq_categories_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pages_faq_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pages_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  ALTER TABLE "services_blocks_hero_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_text_2_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_text_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_2_groups_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_2_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_sub_services_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_sub_services_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_prime_difference_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_prime_difference" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_experience_difference_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_experience_difference" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_service_areas_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_service_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_repair_services_categories_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_repair_services_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_repair_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_luxury_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_luxury_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_booking" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_find_us" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_testimonials_providers_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_testimonials_providers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_faq_categories_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_faq_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_video_carousel_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_video_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_carousel_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_hero_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_hero_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_image_text_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_gallery_groups_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_gallery_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_sub_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_sub_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_prime_difference_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_prime_difference" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_experience_difference_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_experience_difference" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_service_areas_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_service_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_repair_services_categories_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_repair_services_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_repair_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_luxury_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_luxury_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_booking" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_find_us" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_testimonials_providers_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_testimonials_providers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_faq_categories_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_faq_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_video_carousel_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_video_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_gallery_carousel_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_gallery_carousel" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_blocks_hero_buttons" CASCADE;
  DROP TABLE "services_blocks_hero" CASCADE;
  DROP TABLE "services_blocks_cta_buttons" CASCADE;
  DROP TABLE "services_blocks_cta" CASCADE;
  DROP TABLE "services_blocks_image_text_2_buttons" CASCADE;
  DROP TABLE "services_blocks_image_text_2" CASCADE;
  DROP TABLE "services_blocks_video_2" CASCADE;
  DROP TABLE "services_blocks_gallery_2_items" CASCADE;
  DROP TABLE "services_blocks_gallery_2_groups_items" CASCADE;
  DROP TABLE "services_blocks_gallery_2_groups" CASCADE;
  DROP TABLE "services_blocks_gallery_2" CASCADE;
  DROP TABLE "services_blocks_before_after" CASCADE;
  DROP TABLE "services_blocks_sub_services_2_items" CASCADE;
  DROP TABLE "services_blocks_sub_services_2" CASCADE;
  DROP TABLE "services_blocks_prime_difference_features" CASCADE;
  DROP TABLE "services_blocks_prime_difference" CASCADE;
  DROP TABLE "services_blocks_experience_difference_features" CASCADE;
  DROP TABLE "services_blocks_experience_difference" CASCADE;
  DROP TABLE "services_blocks_service_areas_areas" CASCADE;
  DROP TABLE "services_blocks_service_areas" CASCADE;
  DROP TABLE "services_blocks_repair_services_categories_features" CASCADE;
  DROP TABLE "services_blocks_repair_services_categories" CASCADE;
  DROP TABLE "services_blocks_repair_services" CASCADE;
  DROP TABLE "services_blocks_luxury_cta_buttons" CASCADE;
  DROP TABLE "services_blocks_luxury_cta" CASCADE;
  DROP TABLE "services_blocks_booking" CASCADE;
  DROP TABLE "services_blocks_contact_form" CASCADE;
  DROP TABLE "services_blocks_find_us" CASCADE;
  DROP TABLE "services_blocks_testimonials_providers_reviews" CASCADE;
  DROP TABLE "services_blocks_testimonials_providers" CASCADE;
  DROP TABLE "services_blocks_testimonials" CASCADE;
  DROP TABLE "services_blocks_faq_categories_questions" CASCADE;
  DROP TABLE "services_blocks_faq_categories" CASCADE;
  DROP TABLE "services_blocks_faq" CASCADE;
  DROP TABLE "services_blocks_video_carousel_items" CASCADE;
  DROP TABLE "services_blocks_video_carousel" CASCADE;
  DROP TABLE "services_blocks_gallery_carousel_items" CASCADE;
  DROP TABLE "services_blocks_gallery_carousel" CASCADE;
  DROP TABLE "landing_pages_hero_buttons" CASCADE;
  DROP TABLE "landing_pages_blocks_hero_buttons" CASCADE;
  DROP TABLE "landing_pages_blocks_hero" CASCADE;
  DROP TABLE "landing_pages_blocks_cta_buttons" CASCADE;
  DROP TABLE "landing_pages_blocks_cta" CASCADE;
  DROP TABLE "landing_pages_blocks_image_text_buttons" CASCADE;
  DROP TABLE "landing_pages_blocks_image_text" CASCADE;
  DROP TABLE "landing_pages_blocks_video" CASCADE;
  DROP TABLE "landing_pages_blocks_gallery_items" CASCADE;
  DROP TABLE "landing_pages_blocks_gallery_groups_items" CASCADE;
  DROP TABLE "landing_pages_blocks_gallery_groups" CASCADE;
  DROP TABLE "landing_pages_blocks_gallery" CASCADE;
  DROP TABLE "landing_pages_blocks_before_after" CASCADE;
  DROP TABLE "landing_pages_blocks_sub_services_items" CASCADE;
  DROP TABLE "landing_pages_blocks_sub_services" CASCADE;
  DROP TABLE "landing_pages_blocks_prime_difference_features" CASCADE;
  DROP TABLE "landing_pages_blocks_prime_difference" CASCADE;
  DROP TABLE "landing_pages_blocks_experience_difference_features" CASCADE;
  DROP TABLE "landing_pages_blocks_experience_difference" CASCADE;
  DROP TABLE "landing_pages_blocks_service_areas_areas" CASCADE;
  DROP TABLE "landing_pages_blocks_service_areas" CASCADE;
  DROP TABLE "landing_pages_blocks_repair_services_categories_features" CASCADE;
  DROP TABLE "landing_pages_blocks_repair_services_categories" CASCADE;
  DROP TABLE "landing_pages_blocks_repair_services" CASCADE;
  DROP TABLE "landing_pages_blocks_luxury_cta_buttons" CASCADE;
  DROP TABLE "landing_pages_blocks_luxury_cta" CASCADE;
  DROP TABLE "landing_pages_blocks_booking" CASCADE;
  DROP TABLE "landing_pages_blocks_contact_form" CASCADE;
  DROP TABLE "landing_pages_blocks_find_us" CASCADE;
  DROP TABLE "landing_pages_blocks_testimonials_providers_reviews" CASCADE;
  DROP TABLE "landing_pages_blocks_testimonials_providers" CASCADE;
  DROP TABLE "landing_pages_blocks_testimonials" CASCADE;
  DROP TABLE "landing_pages_blocks_faq_categories_questions" CASCADE;
  DROP TABLE "landing_pages_blocks_faq_categories" CASCADE;
  DROP TABLE "landing_pages_blocks_faq" CASCADE;
  DROP TABLE "landing_pages_blocks_video_carousel_items" CASCADE;
  DROP TABLE "landing_pages_blocks_video_carousel" CASCADE;
  DROP TABLE "landing_pages_blocks_gallery_carousel_items" CASCADE;
  DROP TABLE "landing_pages_blocks_gallery_carousel" CASCADE;
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_hero_background_media_id_media_id_fk";
  
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_hero_foreground_media_id_media_id_fk";
  
  DROP INDEX "landing_pages_hero_hero_background_media_idx";
  DROP INDEX "landing_pages_hero_hero_foreground_media_idx";
  DROP INDEX "landing_pages_source_word_press_id_idx";
  DROP INDEX "landing_pages_source_slug_idx";
  ALTER TABLE "service_locations_section_overrides" ALTER COLUMN "section_key" SET DATA TYPE "public"."enum_service_locations_section_overrides_section_key" USING "section_key"::"public"."enum_service_locations_section_overrides_section_key";
  ALTER TABLE "landing_pages" ADD COLUMN "hero_lead" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "estimate_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "estimate_heading" varchar DEFAULT 'Ready to schedule your free estimate?';
  ALTER TABLE "landing_pages" ADD COLUMN "estimate_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "estimate_link" varchar DEFAULT '/contact';
  ALTER TABLE "landing_pages" ADD COLUMN "intro_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "intro_eyebrow" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "intro_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "intro_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "intro_image_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "sub_services_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "sub_services_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "sub_services_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_eyebrow" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_heading_accent" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "project_gallery_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "project_gallery_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "reflection_gallery_enabled" boolean DEFAULT false;
  ALTER TABLE "landing_pages" ADD COLUMN "reflection_gallery_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "projects_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "projects_eyebrow" varchar DEFAULT 'Our Projects';
  ALTER TABLE "landing_pages" ADD COLUMN "projects_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "projects_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_enabled" boolean DEFAULT false;
  ALTER TABLE "landing_pages" ADD COLUMN "video_eyebrow" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_video_url" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_video_file_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "video_poster_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "why_choose_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "service_areas_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "faq_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "faq_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "testimonials_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_eyebrow" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_link" varchar DEFAULT '/contact';
  ALTER TABLE "landing_pages" ADD COLUMN "booking_enabled" boolean DEFAULT false;
  ALTER TABLE "landing_pages" ADD COLUMN "booking_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "booking_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_phone" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_email" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_address" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "contact_form_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "contact_form_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "contact_form_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "cta_text" varchar DEFAULT 'Get Your Free Estimate';
  ALTER TABLE "landing_pages" ADD COLUMN "cta_link" varchar DEFAULT '/contact';
  ALTER TABLE "landing_pages" ADD COLUMN "cta_show_form" boolean DEFAULT true;
  ALTER TABLE "landing_pages_section_order" ADD CONSTRAINT "landing_pages_section_order_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_sub_services_items" ADD CONSTRAINT "landing_pages_sub_services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_sub_services_items" ADD CONSTRAINT "landing_pages_sub_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_prime_difference_checklist" ADD CONSTRAINT "landing_pages_prime_difference_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_projects_items" ADD CONSTRAINT "landing_pages_projects_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_projects_items" ADD CONSTRAINT "landing_pages_projects_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_faq_categories_items" ADD CONSTRAINT "landing_pages_faq_categories_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_faq_categories" ADD CONSTRAINT "landing_pages_faq_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_faq_items" ADD CONSTRAINT "landing_pages_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "landing_pages_section_order_order_idx" ON "landing_pages_section_order" USING btree ("_order");
  CREATE INDEX "landing_pages_section_order_parent_id_idx" ON "landing_pages_section_order" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_sub_services_items_order_idx" ON "landing_pages_sub_services_items" USING btree ("_order");
  CREATE INDEX "landing_pages_sub_services_items_parent_id_idx" ON "landing_pages_sub_services_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_sub_services_items_image_idx" ON "landing_pages_sub_services_items" USING btree ("image_id");
  CREATE INDEX "landing_pages_prime_difference_checklist_order_idx" ON "landing_pages_prime_difference_checklist" USING btree ("_order");
  CREATE INDEX "landing_pages_prime_difference_checklist_parent_id_idx" ON "landing_pages_prime_difference_checklist" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_projects_items_order_idx" ON "landing_pages_projects_items" USING btree ("_order");
  CREATE INDEX "landing_pages_projects_items_parent_id_idx" ON "landing_pages_projects_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_projects_items_image_idx" ON "landing_pages_projects_items" USING btree ("image_id");
  CREATE INDEX "landing_pages_faq_categories_items_order_idx" ON "landing_pages_faq_categories_items" USING btree ("_order");
  CREATE INDEX "landing_pages_faq_categories_items_parent_id_idx" ON "landing_pages_faq_categories_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_faq_categories_order_idx" ON "landing_pages_faq_categories" USING btree ("_order");
  CREATE INDEX "landing_pages_faq_categories_parent_id_idx" ON "landing_pages_faq_categories" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_faq_items_order_idx" ON "landing_pages_faq_items" USING btree ("_order");
  CREATE INDEX "landing_pages_faq_items_parent_id_idx" ON "landing_pages_faq_items" USING btree ("_parent_id");
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_intro_image_id_media_id_fk" FOREIGN KEY ("intro_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_video_video_file_id_media_id_fk" FOREIGN KEY ("video_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_video_poster_id_media_id_fk" FOREIGN KEY ("video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "landing_pages_hero_hero_image_idx" ON "landing_pages" USING btree ("hero_image_id");
  CREATE INDEX "landing_pages_intro_intro_image_idx" ON "landing_pages" USING btree ("intro_image_id");
  CREATE INDEX "landing_pages_video_video_video_file_idx" ON "landing_pages" USING btree ("video_video_file_id");
  CREATE INDEX "landing_pages_video_video_poster_idx" ON "landing_pages" USING btree ("video_poster_id");
  ALTER TABLE "landing_pages" DROP COLUMN "hero_description";
  ALTER TABLE "landing_pages" DROP COLUMN "hero_background_media_id";
  ALTER TABLE "landing_pages" DROP COLUMN "hero_foreground_media_id";
  ALTER TABLE "landing_pages" DROP COLUMN "source_word_press_id";
  ALTER TABLE "landing_pages" DROP COLUMN "source_slug";
  DROP TYPE "public"."enum_services_blocks_hero_buttons_variant";
  DROP TYPE "public"."enum_services_blocks_cta_buttons_variant";
  DROP TYPE "public"."enum_services_blocks_image_text_2_buttons_variant";
  DROP TYPE "public"."enum_services_blocks_image_text_2_alignment";
  DROP TYPE "public"."enum_services_blocks_video_2_source";
  DROP TYPE "public"."enum_services_blocks_luxury_cta_buttons_variant";
  DROP TYPE "public"."enum_landing_pages_hero_buttons_variant";
  DROP TYPE "public"."enum_landing_pages_blocks_hero_buttons_variant";
  DROP TYPE "public"."enum_landing_pages_blocks_cta_buttons_variant";
  DROP TYPE "public"."enum_landing_pages_blocks_image_text_buttons_variant";
  DROP TYPE "public"."enum_landing_pages_blocks_image_text_alignment";
  DROP TYPE "public"."enum_landing_pages_blocks_video_source";
  DROP TYPE "public"."enum_landing_pages_blocks_luxury_cta_buttons_variant";`)
}
