import * as migration_20260727_195118_phase_1_initial from './20260727_195118_phase_1_initial';

export const migrations = [
  {
    up: migration_20260727_195118_phase_1_initial.up,
    down: migration_20260727_195118_phase_1_initial.down,
    name: '20260727_195118_phase_1_initial'
  },
];
