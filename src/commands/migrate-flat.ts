import { command, string, positional } from 'cmd-ts';
import { isEmptyDir } from '../fs/is-empty-dir';
import { fileExists } from '../fs/file-exists';
import { errorDirArg, forceArg, timeoutArg } from './common';
import { migrateDirFlatGen } from '../dir/migrate-flat';
import { ExifTool } from 'exiftool-vendored';
import { MediaMigrationError } from '../media/MediaMigrationError';

export const migrateFlat = command({
  name: 'google-photos-migrate-flat',
  args: {
    inputDir: positional({
      type: string,
      displayName: 'input_dir',
      description: 'The path to your "Google Photos" directory.',
    }),
    outputDir: positional({
      type: string,
      displayName: 'output_dir',
      description: 'The path to your flat output directory.',
    }),
    errorDir: errorDirArg,
    force: forceArg,
    timeout: timeoutArg,
  },
  handler: async ({ inputDir, outputDir, errorDir, force, timeout }) => {
    const errs: string[] = [];
    const checkErrs = () => {
      if (errs.length !== 0) {
        errs.forEach((e) => console.error(e));
        process.exit(1);
      }
    };

    if (!(await fileExists(inputDir))) {
      errs.push(`The specified google directory does not exist: ${inputDir}`);
    }
    if (!(await fileExists(outputDir))) {
      errs.push(`The specified output directory does not exist: ${outputDir}`);
    }
    if (!(await fileExists(errorDir))) {
      errs.push(`The specified error directory does not exist: ${errorDir}`);
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
    if (await isEmptyDir(inputDir)) {
      errs.push(`Nothing to do, the source directory is empty: ${inputDir}`);
    }
    checkErrs();

    console.log('Started migration.');
    const migGen = migrateDirFlatGen({
      inputDir,
      outputDir,
      errorDir,
      log: console.log,
      warnLog: console.error,
      exiftool: new ExifTool({ taskTimeoutMillis: timeout }),
      endExifTool: true,
    });
    const counts = { err: 0, suc: 0 };
    for await (const result of migGen) {
      if (result instanceof MediaMigrationError) {
        console.error(`Error: ${result}`);
        counts.err++;
        continue;
      } else {
        counts.suc++;
      }
    }

    console.log(`Done! Processed ${counts.suc + counts.err} files.`);
    console.log(`Files migrated: ${counts.suc}`);
    console.log(`Files failed: ${counts.err}`);
  },
});
