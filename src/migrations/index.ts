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
    name: '20260905_022429'
  },
];
