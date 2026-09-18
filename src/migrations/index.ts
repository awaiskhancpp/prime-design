import * as migration_20260827_024700_service_content_blocks from './20260827_024700_service_content_blocks';
import * as migration_20260827_025500_services_media_relation from './20260827_025500_services_media_relation';
import * as migration_20260827_030500_services_hero_fields from './20260827_030500_services_hero_fields';
import * as migration_20260827_221754_contact_consultation_types from './20260827_221754_contact_consultation_types';
import * as migration_20260828_010000_services_video_upload from './20260828_010000_services_video_upload';
import * as migration_20260828_184938_cms_architecture from './20260828_184938_cms_architecture';
import * as migration_20260828_191414_faq_category_relation from './20260828_191414_faq_category_relation';
import * as migration_20260828_194412_blog_collection_architecture from './20260828_194412_blog_collection_architecture';
import * as migration_20260829_000000_service_checklist_icon_feature_list_blocks from './20260829_000000_service_checklist_icon_feature_list_blocks';
import * as migration_20260901_174951_google_ads_service_template from './20260901_174951_google_ads_service_template';
import * as migration_20260901_194619 from './20260901_194619';
import * as migration_20260901_201227 from './20260901_201227';
import * as migration_20260901_214042 from './20260901_214042';
import * as migration_20260901_223110 from './20260901_223110';
import * as migration_20260902_221829_phase9_current_schema_sync from './20260902_221829_phase9_current_schema_sync';
import * as migration_20260903_210844 from './20260903_210844';
import * as migration_20260904_014017 from './20260904_014017';
import * as migration_20260904_230006 from './20260904_230006';
import * as migration_20260905_005425 from './20260905_005425';
import * as migration_20260905_022429 from './20260905_022429';
import * as migration_20260906_000000_landing_sub_services_heading_optional from './20260906_000000_landing_sub_services_heading_optional';
import * as migration_20260906_010000_project_grid_eyebrow_icon from './20260906_010000_project_grid_eyebrow_icon';
import * as migration_20260908_182415 from './20260908_182415';
import * as migration_20260911_212001_homepage_global from './20260911_212001_homepage_global';
import * as migration_20260911_215642_about_global from './20260911_215642_about_global';
import * as migration_20260911_225142_gallery_global from './20260911_225142_gallery_global';
import * as migration_20260914_163206_homepage_about_collections from './20260914_163206_homepage_about_collections';
import * as migration_20260914_170623_gallery_page_collection from './20260914_170623_gallery_page_collection';
import * as migration_20260914_172948_pages_section_blocks from './20260914_172948_pages_section_blocks';
import * as migration_20260914_180701_video_story_fields from './20260914_180701_video_story_fields';
import * as migration_20260915_120000_difference_video_posters from './20260915_120000_difference_video_posters';
import * as migration_20260916_010000_services_hero_image_secondary from './20260916_010000_services_hero_image_secondary';
import * as migration_20260916_120000_trust_section_fields from './20260916_120000_trust_section_fields';
import * as migration_20260916_130000_craftsmanship_cta from './20260916_130000_craftsmanship_cta';
import * as migration_20260916_140000_repair_category_eyebrow from './20260916_140000_repair_category_eyebrow';
import * as migration_20260916_150000_testimonials_page_sections from './20260916_150000_testimonials_page_sections';
import * as migration_20260917_120000_faq_index_section from './20260917_120000_faq_index_section';
import * as migration_20260917_130000_consultations_section from './20260917_130000_consultations_section';
import * as migration_20260917_140000_contact_submissions from './20260917_140000_contact_submissions';
import * as migration_20260917_150000_service_consultation_image from './20260917_150000_service_consultation_image';
import * as migration_20260917_160000_locked_documents_contact_submissions from './20260917_160000_locked_documents_contact_submissions';
import * as migration_20260917_170000_location_dont_settle_image from './20260917_170000_location_dont_settle_image';
import * as migration_20260917_180000_location_hero_copy from './20260917_180000_location_hero_copy';
import * as migration_20260917_190000_landing_information_sections from './20260917_190000_landing_information_sections';
import * as migration_20260917_191000_landing_cta_heading_optional from './20260917_191000_landing_cta_heading_optional';
import * as migration_20260917_192000_services_shared_landing_blocks from './20260917_192000_services_shared_landing_blocks';
import * as migration_20260918_100000_prime_difference_comparisons from './20260918_100000_prime_difference_comparisons';
import * as migration_20260918_110000_benefits_and_richtext_image_text from './20260918_110000_benefits_and_richtext_image_text';
import * as migration_20260919_100000_service_cards_and_project_dates from './20260919_100000_service_cards_and_project_dates';
import * as migration_20260919_110000_project_excerpt from './20260919_110000_project_excerpt';

export const migrations = [
  {
    up: migration_20260827_024700_service_content_blocks.up,
    down: migration_20260827_024700_service_content_blocks.down,
    name: '20260827_024700_service_content_blocks',
  },
  {
    up: migration_20260827_025500_services_media_relation.up,
    down: migration_20260827_025500_services_media_relation.down,
    name: '20260827_025500_services_media_relation',
  },
  {
    up: migration_20260827_030500_services_hero_fields.up,
    down: migration_20260827_030500_services_hero_fields.down,
    name: '20260827_030500_services_hero_fields',
  },
  {
    up: migration_20260827_221754_contact_consultation_types.up,
    down: migration_20260827_221754_contact_consultation_types.down,
    name: '20260827_221754_contact_consultation_types',
  },
  {
    up: migration_20260828_010000_services_video_upload.up,
    down: migration_20260828_010000_services_video_upload.down,
    name: '20260828_010000_services_video_upload',
  },
  {
    up: migration_20260828_184938_cms_architecture.up,
    down: migration_20260828_184938_cms_architecture.down,
    name: '20260828_184938_cms_architecture',
  },
  {
    up: migration_20260828_191414_faq_category_relation.up,
    down: migration_20260828_191414_faq_category_relation.down,
    name: '20260828_191414_faq_category_relation',
  },
  {
    up: migration_20260828_194412_blog_collection_architecture.up,
    down: migration_20260828_194412_blog_collection_architecture.down,
    name: '20260828_194412_blog_collection_architecture',
  },
  {
    up: migration_20260829_000000_service_checklist_icon_feature_list_blocks.up,
    down: migration_20260829_000000_service_checklist_icon_feature_list_blocks.down,
    name: '20260829_000000_service_checklist_icon_feature_list_blocks',
  },
  {
    up: migration_20260901_174951_google_ads_service_template.up,
    down: migration_20260901_174951_google_ads_service_template.down,
    name: '20260901_174951_google_ads_service_template',
  },
  {
    up: migration_20260901_194619.up,
    down: migration_20260901_194619.down,
    name: '20260901_194619',
  },
  {
    up: migration_20260901_201227.up,
    down: migration_20260901_201227.down,
    name: '20260901_201227',
  },
  {
    up: migration_20260901_214042.up,
    down: migration_20260901_214042.down,
    name: '20260901_214042',
  },
  {
    up: migration_20260901_223110.up,
    down: migration_20260901_223110.down,
    name: '20260901_223110',
  },
  {
    up: migration_20260902_221829_phase9_current_schema_sync.up,
    down: migration_20260902_221829_phase9_current_schema_sync.down,
    name: '20260902_221829_phase9_current_schema_sync',
  },
  {
    up: migration_20260903_210844.up,
    down: migration_20260903_210844.down,
    name: '20260903_210844',
  },
  {
    up: migration_20260904_014017.up,
    down: migration_20260904_014017.down,
    name: '20260904_014017',
  },
  {
    up: migration_20260904_230006.up,
    down: migration_20260904_230006.down,
    name: '20260904_230006',
  },
  {
    up: migration_20260905_005425.up,
    down: migration_20260905_005425.down,
    name: '20260905_005425',
  },
  {
    up: migration_20260905_022429.up,
    down: migration_20260905_022429.down,
    name: '20260905_022429',
  },
  {
    up: migration_20260906_000000_landing_sub_services_heading_optional.up,
    down: migration_20260906_000000_landing_sub_services_heading_optional.down,
    name: '20260906_000000_landing_sub_services_heading_optional',
  },
  {
    up: migration_20260906_010000_project_grid_eyebrow_icon.up,
    down: migration_20260906_010000_project_grid_eyebrow_icon.down,
    name: '20260906_010000_project_grid_eyebrow_icon',
  },
  {
    up: migration_20260908_182415.up,
    down: migration_20260908_182415.down,
    name: '20260908_182415',
  },
  {
    up: migration_20260911_212001_homepage_global.up,
    down: migration_20260911_212001_homepage_global.down,
    name: '20260911_212001_homepage_global',
  },
  {
    up: migration_20260911_215642_about_global.up,
    down: migration_20260911_215642_about_global.down,
    name: '20260911_215642_about_global',
  },
  {
    up: migration_20260911_225142_gallery_global.up,
    down: migration_20260911_225142_gallery_global.down,
    name: '20260911_225142_gallery_global',
  },
  {
    up: migration_20260914_163206_homepage_about_collections.up,
    down: migration_20260914_163206_homepage_about_collections.down,
    name: '20260914_163206_homepage_about_collections',
  },
  {
    up: migration_20260914_170623_gallery_page_collection.up,
    down: migration_20260914_170623_gallery_page_collection.down,
    name: '20260914_170623_gallery_page_collection',
  },
  {
    up: migration_20260914_172948_pages_section_blocks.up,
    down: migration_20260914_172948_pages_section_blocks.down,
    name: '20260914_172948_pages_section_blocks',
  },
  {
    up: migration_20260914_180701_video_story_fields.up,
    down: migration_20260914_180701_video_story_fields.down,
    name: '20260914_180701_video_story_fields'
  },
  {
    up: migration_20260915_120000_difference_video_posters.up,
    down: migration_20260915_120000_difference_video_posters.down,
    name: '20260915_120000_difference_video_posters',
  },
  {
    up: migration_20260916_010000_services_hero_image_secondary.up,
    down: migration_20260916_010000_services_hero_image_secondary.down,
    name: '20260916_010000_services_hero_image_secondary',
  },
  {
    up: migration_20260916_120000_trust_section_fields.up,
    down: migration_20260916_120000_trust_section_fields.down,
    name: '20260916_120000_trust_section_fields',
  },
  {
    up: migration_20260916_130000_craftsmanship_cta.up,
    down: migration_20260916_130000_craftsmanship_cta.down,
    name: '20260916_130000_craftsmanship_cta',
  },
  {
    up: migration_20260916_140000_repair_category_eyebrow.up,
    down: migration_20260916_140000_repair_category_eyebrow.down,
    name: '20260916_140000_repair_category_eyebrow',
  },
  {
    up: migration_20260916_150000_testimonials_page_sections.up,
    down: migration_20260916_150000_testimonials_page_sections.down,
    name: '20260916_150000_testimonials_page_sections',
  },
  {
    up: migration_20260917_120000_faq_index_section.up,
    down: migration_20260917_120000_faq_index_section.down,
    name: '20260917_120000_faq_index_section',
  },
  {
    up: migration_20260917_130000_consultations_section.up,
    down: migration_20260917_130000_consultations_section.down,
    name: '20260917_130000_consultations_section',
  },
  {
    up: migration_20260917_140000_contact_submissions.up,
    down: migration_20260917_140000_contact_submissions.down,
    name: '20260917_140000_contact_submissions',
  },
  {
    up: migration_20260917_150000_service_consultation_image.up,
    down: migration_20260917_150000_service_consultation_image.down,
    name: '20260917_150000_service_consultation_image',
  },
  {
    up: migration_20260917_160000_locked_documents_contact_submissions.up,
    down: migration_20260917_160000_locked_documents_contact_submissions.down,
    name: '20260917_160000_locked_documents_contact_submissions',
  },
  {
    up: migration_20260917_170000_location_dont_settle_image.up,
    down: migration_20260917_170000_location_dont_settle_image.down,
    name: '20260917_170000_location_dont_settle_image',
  },
  {
    up: migration_20260917_180000_location_hero_copy.up,
    down: migration_20260917_180000_location_hero_copy.down,
    name: '20260917_180000_location_hero_copy',
  },
  {
    up: migration_20260917_190000_landing_information_sections.up,
    down: migration_20260917_190000_landing_information_sections.down,
    name: '20260917_190000_landing_information_sections',
  },
  {
    up: migration_20260917_191000_landing_cta_heading_optional.up,
    down: migration_20260917_191000_landing_cta_heading_optional.down,
    name: '20260917_191000_landing_cta_heading_optional',
  },
  {
    up: migration_20260917_192000_services_shared_landing_blocks.up,
    down: migration_20260917_192000_services_shared_landing_blocks.down,
    name: '20260917_192000_services_shared_landing_blocks',
  },
  {
    up: migration_20260918_100000_prime_difference_comparisons.up,
    down: migration_20260918_100000_prime_difference_comparisons.down,
    name: '20260918_100000_prime_difference_comparisons',
  },
  {
    up: migration_20260918_110000_benefits_and_richtext_image_text.up,
    down: migration_20260918_110000_benefits_and_richtext_image_text.down,
    name: '20260918_110000_benefits_and_richtext_image_text',
  },
  {
    up: migration_20260919_100000_service_cards_and_project_dates.up,
    down: migration_20260919_100000_service_cards_and_project_dates.down,
    name: '20260919_100000_service_cards_and_project_dates',
  },
  {
    up: migration_20260919_110000_project_excerpt.up,
    down: migration_20260919_110000_project_excerpt.down,
    name: '20260919_110000_project_excerpt',
  },
];
