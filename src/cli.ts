import { existsSync } from 'fs';
import { command, run, string, positional, flag } from 'cmd-ts';
import { migrateGoogleDir } from './media/migrate-google-dir';
import { isEmptyDir } from './fs/is-empty-dir';

const app = command({
  name: 'google-photos-migrate',
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
    }),
  },
  handler: async ({ googleDir, outputDir, errorDir, force }) => {
    const errs: string[] = [];
    if (!existsSync(googleDir)) {
      errs.push('The specified google directory does not exist.');
    }
    if (!existsSync(outputDir)) {
      errs.push('The specified output directory does not exist.');
    }
    if (!existsSync(errorDir)) {
      errs.push('The specified error directory does not exist.');
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

    console.log(`Started migration.`);
    const res = await migrateGoogleDir(googleDir, outputDir, errorDir);
    console.log(`Done! Copied ${res.filter((p) => p !== null).length} files.`);
  },
});

run(app, process.argv.slice(2));
