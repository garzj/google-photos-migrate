import { command, string, positional } from 'cmd-ts';
import { isEmptyDir } from '../fs/is-empty-dir';
import { ExifTool } from 'exiftool-vendored';
import { migrateSingleFolder } from '../dir/migrate-single-folder';
import { entitiyExists } from '../fs/entity-exists';
import { forceArg, timeoutArg } from './common';

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
    force: forceArg,
    timeout: timeoutArg,
  },
  handler: async ({ googleDir, outputDir, errorDir, force, timeout }) => {
    const errs: string[] = [];
    const checkErrs = () => {
      if (errs.length !== 0) {
        errs.forEach((e) => console.error(e));
        process.exit(1);
      }
    };

    if (!(await entitiyExists(googleDir))) {
      errs.push(`The specified google directory does not exist: ${googleDir}`);
    }
    if (!(await entitiyExists(outputDir))) {
      errs.push(`The specified output directory does not exist: ${googleDir}`);
    }
    if (!(await entitiyExists(errorDir))) {
      errs.push(`The specified error directory does not exist: ${googleDir}`);
    }
    checkErrs();

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
      errs.push(`Nothing to do, the source directory is empty: ${googleDir}`);
    }
    checkErrs();

    const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
    await migrateSingleFolder(googleDir, outputDir, errorDir, exifTool, true);
  },
});
