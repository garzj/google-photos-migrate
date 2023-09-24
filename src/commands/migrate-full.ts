import {
  command,
  string,
  positional,
  flag,
  number,
  option,
  boolean,
} from 'cmd-ts';
import { isEmptyDir } from '../fs/is-empty-dir';
import { glob } from 'glob';
import { migrateFullDirectory } from '../dir/migrate-full';
import { fileExists } from '../fs/file-exists';

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
    timeout: option({
      type: number,
      defaultValue: () => 30000,
      short: 't',
      long: 'timeout',
      description:
        'Sets the task timeout in milliseconds that will be passed to ExifTool.',
    }),
  },
  handler: async ({ sourceDir, targetDir, timeout }) => {
    const errs: string[] = [];
    if (!(await fileExists(sourceDir))) {
      errs.push(
        `The specified takeout directory does not exist: ${sourceDir}`
      );
    }
    if (await isEmptyDir(sourceDir)) {
      errs.push(`Nothing to do, the source directory is empty: ${sourceDir}`);
    }
    if ((await fileExists(targetDir)) && !(await isEmptyDir(targetDir))){
      errs.push(`The target directory is not empty, please delete it and try again: ${targetDir}`);
    }
    if (errs.length !== 0) {
      errs.forEach((e) => console.error(e));
      process.exit(1);
    }

    await migrateFullDirectory(sourceDir, targetDir, timeout);
  },
});
