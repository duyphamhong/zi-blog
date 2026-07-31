import * as migration_20260727_195118_phase_1_initial from './20260727_195118_phase_1_initial'
import * as migration_20260727_221426_phase_2_bilingual_localization from './20260727_221426_phase_2_bilingual_localization'
import * as migration_20260728_170253_remove_search_document_text_index from './20260728_170253_remove_search_document_text_index'
import * as migration_20260728_180954_phase_4_markdown_import from './20260728_180954_phase_4_markdown_import'
import * as migration_20260729_000000_repair_production_site_url from './20260729_000000_repair_production_site_url'
import * as migration_20260729_195134_phase_5_anonymous_community_analytics from './20260729_195134_phase_5_anonymous_community_analytics'
import * as migration_20260730_000110_auto_publish_comments from './20260730_000110_auto_publish_comments'
import * as migration_20260730_001000_browser_local_anonymous_profiles from './20260730_001000_browser_local_anonymous_profiles'

export const migrations = [
  {
    up: migration_20260727_195118_phase_1_initial.up,
    down: migration_20260727_195118_phase_1_initial.down,
    name: '20260727_195118_phase_1_initial',
  },
  {
    up: migration_20260727_221426_phase_2_bilingual_localization.up,
    down: migration_20260727_221426_phase_2_bilingual_localization.down,
    name: '20260727_221426_phase_2_bilingual_localization',
  },
  {
    up: migration_20260728_170253_remove_search_document_text_index.up,
    down: migration_20260728_170253_remove_search_document_text_index.down,
    name: '20260728_170253_remove_search_document_text_index',
  },
  {
    up: migration_20260728_180954_phase_4_markdown_import.up,
    down: migration_20260728_180954_phase_4_markdown_import.down,
    name: '20260728_180954_phase_4_markdown_import',
  },
  {
    up: migration_20260729_000000_repair_production_site_url.up,
    down: migration_20260729_000000_repair_production_site_url.down,
    name: '20260729_000000_repair_production_site_url',
  },
  {
    up: migration_20260729_195134_phase_5_anonymous_community_analytics.up,
    down: migration_20260729_195134_phase_5_anonymous_community_analytics.down,
    name: '20260729_195134_phase_5_anonymous_community_analytics',
  },
  {
    up: migration_20260730_000110_auto_publish_comments.up,
    down: migration_20260730_000110_auto_publish_comments.down,
    name: '20260730_000110_auto_publish_comments',
  },
  {
    up: migration_20260730_001000_browser_local_anonymous_profiles.up,
    down: migration_20260730_001000_browser_local_anonymous_profiles.down,
    name: '20260730_001000_browser_local_anonymous_profiles',
  },
]
