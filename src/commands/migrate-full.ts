import { command, string, positional } from 'cmd-ts';
import { isEmptyDir } from '../fs/is-empty-dir';
import { errorDirArg, forceArg, timeoutArg } from './common';
import { migrateDirFullGen } from '..';
import { ExifTool } from 'exiftool-vendored';
import { MediaMigrationError } from '../media/MediaMigrationError';
import { DirMigrationError } from '../dir/DirMigrationError';
import { pathExists } from 'fs-extra';

export const migrateFull = command({
  name: 'google-photos-migrate-full',
  args: {
    inputDir: positional({
      type: string,
      displayName: 'input_dir',
      description: 'The path to your "Takeout" directory.',
    }),
    outputDir: positional({
      type: string,
      displayName: 'output_dir',
      description: 'The path where you want the processed directories to go.',
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

    if (!(await pathExists(inputDir))) {
      errs.push(`The specified takeout directory does not exist: ${inputDir}`);
    }
    if (!(await pathExists(outputDir))) {
      errs.push(`The specified target directory does not exist: ${outputDir}`);
    }
    checkErrs();

    if (!force && !(await isEmptyDir(outputDir))) {
      errs.push(
        `The target directory is not empty. Pass "-f" to force the operation.`
      );
    }
    if (await isEmptyDir(inputDir)) {
      errs.push(`Nothing to do, the source directory is empty: ${inputDir}`);
    }
    checkErrs();

    console.log('Started migration.');
    const migGen = migrateDirFullGen({
      inputDir: inputDir,
      errorDir,
      outputDir,
      log: console.log,
      warnLog: console.error,
      exiftool: new ExifTool({ taskTimeoutMillis: timeout }),
      endExifTool: true,
    });
    const counts = { err: 0, suc: 0 };
    for await (const result of migGen) {
      if (result instanceof DirMigrationError) {
        console.error(`Error: ${result}`);
        process.exit(1);
      }

      if (result instanceof MediaMigrationError) {
        console.error(`Error: ${result}`);
        counts.err++;
        continue;
      }

      counts.suc++;
    }

    console.log(`Done! Processed ${counts.suc + counts.err} files.`);
    console.log(`Files migrated: ${counts.suc}`);
    console.log(`Files failed: ${counts.err}`);
  },
});
