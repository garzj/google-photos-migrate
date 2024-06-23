import { flag, number, option, positional, string } from 'cmd-ts';
import { ArgParser } from 'cmd-ts/dist/cjs/argparser';
import { ProvidesHelp } from 'cmd-ts/dist/cjs/helpdoc';

type ArgTypes = Record<string, ArgParser<any> & Partial<ProvidesHelp>>;

export const commonArgs = {
  errorDir: positional({
    type: string,
    displayName: 'error_dir',
    description: 'Failed media will be saved here.',
  }),
  force: flag({
    short: 'f',
    long: 'force',
    description: "Forces the operation if the given directories aren't empty.",
  }),
  timeout: option({
    type: number,
    defaultValue: () => 30000,
    short: 't',
    long: 'timeout',
    description:
      'Sets the task timeout in milliseconds that will be passed to ExifTool.',
  }),
  skipCorrections: flag({
    long: 'skip-corrections',
    description: 'Skips renaming wrong extensions identified by ExifTool.',
  }),
  verbose: flag({
    short: 'v',
    long: 'verbose',
    description: 'Enables verbose logging.',
  }),
  renameEmpty: option({
    type: string,
    defaultValue: () => '_',
    long: 'rename-empty',
    description: 'Use this name for empty filenames.',
  }),
} satisfies ArgTypes;
