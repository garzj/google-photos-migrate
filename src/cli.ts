#!/usr/bin/env node

import { run, subcommands } from 'cmd-ts';
import { migrateFlat } from './commands/migrate-flat';
import { migrateFull } from './commands/migrate-full';

const app = subcommands({
  name: 'google-photos-migrate',
  cmds: {
    full: migrateFull,
    flat: migrateFlat,
  },
});

run(app, process.argv.slice(2));
