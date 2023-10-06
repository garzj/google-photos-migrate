#!/usr/bin/env node

import { subcommands, run } from 'cmd-ts';
import { migrateFull } from './commands/migrate-full';
import { migrateFlat } from './commands/migrate-flat';
import { rewriteAllTags } from './commands/rewrite-all-tags';

const app = subcommands({
  name: 'google-photos-migrate',
  cmds: {
    full: migrateFull,
    flat: migrateFlat,
    rewriteAllTags,
  },
});

run(app, process.argv.slice(2));
