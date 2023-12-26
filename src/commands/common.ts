import { flag, number, option, positional, string } from 'cmd-ts';

export const errorDirArg = positional({
  type: string,
  displayName: 'error_dir',
  description: 'Failed media will be saved here.',
});

export const timeoutArg = option({
  type: number,
  defaultValue: () => 30000,
  short: 't',
  long: 'timeout',
  description:
    'Sets the task timeout in milliseconds that will be passed to ExifTool.',
});

export const forceArg = flag({
  short: 'f',
  long: 'force',
  description: "Forces the operation if the given directories aren't empty.",
});

export const skipCorrectionsArg = flag({
  long: 'skip-corrections',
  description: 'Skips renaming wrong extensions identified by ExifTool.',
});
