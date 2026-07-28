import * as migration_20260727_195118_phase_1_initial from './20260727_195118_phase_1_initial';
import * as migration_20260727_221426_phase_2_bilingual_localization from './20260727_221426_phase_2_bilingual_localization';
import * as migration_20260728_170253_remove_search_document_text_index from './20260728_170253_remove_search_document_text_index';

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
    name: '20260728_170253_remove_search_document_text_index'
  },
];
