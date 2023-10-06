#!/usr/bin/env node

import { subcommands, run } from 'cmd-ts';
import { migrateFull } from './commands/migrate-full';
import { migrateFlat } from './commands/migrate-flat';

const app = subcommands({
  name: 'google-photos-migrate',
  cmds: {
    full: migrateFull,
    flat: migrateFlat,
  },
});

run(app, process.argv.slice(2));
