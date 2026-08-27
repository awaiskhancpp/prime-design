import * as migration_20260827_024700_service_content_blocks from './20260827_024700_service_content_blocks';
import * as migration_20260827_025500_services_media_relation from './20260827_025500_services_media_relation';
import * as migration_20260827_030500_services_hero_fields from './20260827_030500_services_hero_fields';

export const migrations = [
  {
    up: migration_20260827_024700_service_content_blocks.up,
    down: migration_20260827_024700_service_content_blocks.down,
    name: '20260827_024700_service_content_blocks'
  },
  {
    up: migration_20260827_025500_services_media_relation.up,
    down: migration_20260827_025500_services_media_relation.down,
    name: '20260827_025500_services_media_relation'
  },
  {
    up: migration_20260827_030500_services_hero_fields.up,
    down: migration_20260827_030500_services_hero_fields.down,
    name: '20260827_030500_services_hero_fields'
  },
];
