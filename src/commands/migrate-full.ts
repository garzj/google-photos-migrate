import { command, string, positional } from 'cmd-ts';
import { isEmptyDir } from '../fs/is-empty-dir';
import { migrateFullDirectory } from '../dir/migrate-full';
import { entitiyExists } from '../fs/entity-exists';
import { forceArg, timeoutArg } from './common';

export const fullMigrate = command({
  name: 'google-photos-migrate-full',
  args: {
    sourceDir: positional({
      type: string,
      displayName: 'source_dir',
      description: 'The path to your "Takeout" directory.',
    }),
    targetDir: positional({
      type: string,
      displayName: 'target_dir',
      description: 'The path where you want the processed directories to go.',
    }),
    force: forceArg,
    timeout: timeoutArg,
  },
  handler: async ({ sourceDir, targetDir, force, timeout }) => {
    const errs: string[] = [];
    const checkErrs = () => {
      if (errs.length !== 0) {
        errs.forEach((e) => console.error(e));
        process.exit(1);
      }
    };

    if (!(await entitiyExists(sourceDir))) {
      errs.push(`The specified takeout directory does not exist: ${sourceDir}`);
    }
    if (!(await entitiyExists(targetDir))) {
      errs.push(`The specified target directory does not exist: ${targetDir}`);
    }
    checkErrs();

    if (!force && !(await isEmptyDir(targetDir))) {
      errs.push(
        `The target directory is not empty. Pass "-f" to force the operation.`
      );
    }
    if (await isEmptyDir(sourceDir)) {
      errs.push(`Nothing to do, the source directory is empty: ${sourceDir}`);
    }
    checkErrs();

    await migrateFullDirectory(sourceDir, targetDir, timeout);
  },
});
