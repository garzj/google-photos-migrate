import { flag, number, option } from 'cmd-ts';

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
