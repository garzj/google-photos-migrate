import { command, string, positional, flag, number, option } from 'cmd-ts';
import { existsSync } from 'fs';
import { isEmptyDir } from '../fs/is-empty-dir';
import { ExifTool } from 'exiftool-vendored';
import { runBasicMigration } from '../dir/migrate-basic';

export const folderMigrate = command({
  name: 'google-photos-migrate-folder',
  args: {
    googleDir: positional({
      type: string,
      displayName: 'google_dir',
      description: 'The path to your "Google Photos" directory.',
    }),
    outputDir: positional({
      type: string,
      displayName: 'output_dir',
      description: 'The path to your flat output directory.',
    }),
    errorDir: positional({
      type: string,
      displayName: 'error_dir',
      description: 'Failed media will be saved here.',
    }),
    force: flag({
      short: 'f',
      long: 'force',
      description:
        "Forces the operation if the given directories aren't empty.",
    }),
    timeout: option({
      type: number,
      defaultValue: () => 30000,
      short: 't',
      long: 'timeout',
      description:
        'Sets the task timeout in milliseconds that will be passed to ExifTool.',
    }),
  },
  handler: async ({ googleDir, outputDir, errorDir, force, timeout }) => {
    const errs: string[] = [];
    if (!existsSync(googleDir)) {
      errs.push(`The specified google directory does not exist: ${googleDir}`);
    }
    if (!existsSync(outputDir)) {
      errs.push(`The specified output directory does not exist: ${googleDir}`);
    }
    if (!existsSync(errorDir)) {
      errs.push(`The specified error directory does not exist: ${googleDir}`);
    }
    if (errs.length !== 0) {
      errs.forEach((e) => console.error(e));
      process.exit(1);
    }

    if (!force && !(await isEmptyDir(outputDir))) {
      errs.push(
        'The output directory is not empty. Pass "-f" to force the operation.'
      );
    }
    if (!force && !(await isEmptyDir(errorDir))) {
      errs.push(
        'The error directory is not empty. Pass "-f" to force the operation.'
      );
    }
    if (await isEmptyDir(googleDir)) {
      errs.push('The google directory is empty. Nothing to do.');
    }
    if (errs.length !== 0) {
      errs.forEach((e) => console.error(e));
      process.exit(1);
    }

    const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
    await runBasicMigration(googleDir, outputDir, errorDir, exifTool);
  },
});
