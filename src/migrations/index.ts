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
    name: '20260901_174951_google_ads_service_template'
  },
];
