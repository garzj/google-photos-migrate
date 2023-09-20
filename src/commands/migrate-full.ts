import {
  command,
  string,
  positional,
  flag,
  number,
  option,
  boolean,
} from 'cmd-ts';
import { existsSync } from 'fs';
import { isEmptyDir } from '../fs/is-empty-dir';
import { glob } from 'glob';
import { runFullMigration } from '../dir/migrate-full';

export const fullMigrate = command({
  name: 'google-photos-migrate-full',
  args: {
    takeoutDir: positional({
      type: string,
      displayName: 'takeout_dir',
      description: 'The path to your "Takeout" directory.',
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
  handler: async ({ takeoutDir, timeout }) => {
    const errs: string[] = [];
    if (!existsSync(takeoutDir)) {
      errs.push(
        `The specified takeout directory does not exist: ${takeoutDir}`
      );
    }
    if (await isEmptyDir(takeoutDir)) {
      errs.push('The google directory is empty. Nothing to do.');
    }
    var rootDir: string = (await glob(`${takeoutDir}/Google*`))[0].replace(
      /\/+$/,
      ''
    );
    if (
      (await existsSync(`${rootDir}/Photos`)) &&
      !(await isEmptyDir(`${rootDir}/Photos`))
    ) {
      errs.push(
        'The Photos directory is not empty. Please delete it and try again.'
      );
    }
    if (
      (await existsSync(`${rootDir}/Photos`)) &&
      !(await isEmptyDir(`${rootDir}/Albums`))
    ) {
      errs.push(
        'The Albums directory is not empty. Please delete it and try again.'
      );
    }
    if (errs.length !== 0) {
      errs.forEach((e) => console.error(e));
      process.exit(1);
    }

    runFullMigration(takeoutDir, timeout);
  },
});
