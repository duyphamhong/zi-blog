import * as migration_20260727_195118_phase_1_initial from './20260727_195118_phase_1_initial';
import * as migration_20260727_221426_phase_2_bilingual_localization from './20260727_221426_phase_2_bilingual_localization';

export const migrations = [
  {
    up: migration_20260727_195118_phase_1_initial.up,
    down: migration_20260727_195118_phase_1_initial.down,
    name: '20260727_195118_phase_1_initial',
  },
  {
    up: migration_20260727_221426_phase_2_bilingual_localization.up,
    down: migration_20260727_221426_phase_2_bilingual_localization.down,
    name: '20260727_221426_phase_2_bilingual_localization'
  },
];
