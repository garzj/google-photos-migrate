#!/usr/bin/env node

import { subcommands, run } from 'cmd-ts';
import { fullMigrate } from './commands/migrate-full';
import { folderMigrate } from './commands/migrate-folder';
import { rewriteAllTags } from './commands/rewrite-all-tags';

const app = subcommands({
  name: 'google-photos-migrate',
  cmds: { fullMigrate, folderMigrate, rewriteAllTags },
});

run(app, process.argv.slice(2));
