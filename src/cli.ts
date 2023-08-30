import { existsSync, mkdirSync, rename } from 'fs';
import {
  command,
  subcommands,
  run,
  string,
  positional,
  flag,
  number,
  option,
} from 'cmd-ts';
import { migrateGoogleDirGen } from './media/migrate-google-dir';
import { isEmptyDir } from './fs/is-empty-dir';
import { ExifTool } from 'exiftool-vendored';
import { glob } from 'glob';
import { basename } from 'path';
import path = require('path');

const unzip = command({
  name: 'unzipper',
  args: {},
  handler: async () => {},
});

async function run_basic_migration(
  googleDir: string,
  outputDir: string,
  errorDir: string,
  exifTool: ExifTool
) {
  console.log(`Started migration.`);
  const migGen = migrateGoogleDirGen({
    googleDir,
    outputDir,
    errorDir,
    warnLog: console.error,
    exiftool: exifTool,
    endExifTool: true,
  });

  const counts = { err: 0, suc: 0 };
  for await (const result of migGen) {
    if (result instanceof Error) {
      console.error(`Error: ${result}`);
      counts.err++;
      continue;
    }

    counts.suc++;
  }

  console.log(`Done! Processed ${counts.suc + counts.err} files.`);
  console.log(`Files migrated: ${counts.suc}`);
  console.log(`Files failed: ${counts.err}`);
}

async function run_migrations_checked(
  albumDir: string,
  outDir: string,
  errDir: string,
  timeout: number,
  exifTool: ExifTool,
  check_errDir: boolean
) {
  const errs: string[] = [];
  if (!existsSync(albumDir)) {
    errs.push('The specified google directory does not exist.');
  }
  if (!existsSync(outDir)) {
    errs.push('The specified output directory does not exist.');
  }
  if (!existsSync(errDir)) {
    errs.push('The specified error directory does not exist.');
  }
  if (errs.length !== 0) {
    errs.forEach((e) => console.error(e));
    process.exit(1);
  }

  await run_basic_migration(albumDir, outDir, errDir, exifTool);

  if (check_errDir && !(await isEmptyDir(errDir))) {
    const errFiles: string[] = await glob(`${errDir}/*`);
    for (let file of errFiles) {
      exifTool.rewriteAllTags(file, path.join(albumDir, basename(file)));
    }
    await run_migrations_checked(
      albumDir,
      outDir,
      errDir,
      timeout,
      exifTool,
      false
    );
  }
}

async function process_albums(
  rootDir: string,
  timeout: number,
  exifTool: ExifTool
) {
  const globStr: string = `${rootDir}/Albums/*/`;
  const albums: string[] = await glob(globStr);
  if (albums.length == 0) {
    console.log(`WARN: No albums found at ${globStr}`);
  }
  for (let album of albums) {
    console.log(`Processing album ${album}...`);
    let albumName = basename(album);
    let outDir = `${rootDir}/AlbumsProcessed/${albumName}`;
    let errDir = `${rootDir}/AlbumsError/${albumName}`;
    await run_migrations_checked(
      album,
      outDir,
      errDir,
      timeout,
      exifTool,
      true
    );
  }
}

async function process_photos(
  rootDir: string,
  timeout: number,
  exifTool: ExifTool
) {
  // Also run the exif fix for the photos
  console.log('Processing photos...');
  const albumDir = `${rootDir}/Photos`;
  const outDir = `${rootDir}/PhotosProcessed`;
  const errDir = `${rootDir}/PhotosError`;

  await run_migrations_checked(
    albumDir,
    outDir,
    errDir,
    timeout,
    exifTool,
    true
  );
}

async function _restructure_if_needed(folders: string[], targetDir: string) {
  if (existsSync(targetDir) && (await glob(`${targetDir}/*`)).length > 0) {
    console.log(
      `${targetDir} exists and is non-empty, assuming no further restructing needed`
    );
    return;
  }
  mkdirSync(targetDir);
  if (folders.length == 0) {
    console.log(`Warning: no folders were moved to ${targetDir}`);
  }
  for (let folder of folders) {
    rename(folder, path.join(targetDir, folder), function (err) {
      if (err) throw err;
      console.log('Successfully moved!');
    });
  }
  console.log(`Restructured ${folders.length} folders`);
}

async function restructure_if_needed(rootDir: string) {
  // before
  // $rootdir/My Album 1
  // $rootdir/My Album 2
  // $rootdir/Photos from 2008

  // after
  // $rootdir/Albums/My Album 1
  // $rootdir/Albums/My Album 2
  // $rootdir/Photos/Photos from 2008

  const photosDir: string = `${rootDir}/Photos`;

  // move the "Photos from $YEAR" directories to Photos/
  _restructure_if_needed(await glob(`${rootDir}/Photos from */`), photosDir);

  // move everythingg else to Albums/, so we end up with two top level folders
  const fullSet: Set<string> = new Set(await glob(`${rootDir}/*/`));
  const photoSet: Set<string> = new Set([photosDir]);
  const everythingExceptPhotosDir: string[] = Array.from(
    new Set([...fullSet].filter((x) => !photoSet.has(x)))
  );
  _restructure_if_needed(everythingExceptPhotosDir, `${rootDir}/Albums`);
}

async function run_full_migration(
  rootDir: string,
  timeout: number,
  exifTool: ExifTool
) {
  // at least in my takeout, the Takeout folder contains a subfolder
  // Takeout/Google Foto
  // rootdir refers to that subfolder

  rootDir = (await glob(`${rootDir}/Google*`))[0].replace(/\/+$/, '');
  await restructure_if_needed(rootDir);
  await process_albums(rootDir, timeout, exifTool);
  await process_photos(rootDir, timeout, exifTool);
}

const full_migrate = command({
  name: 'google-photos-migrate-full',
  args: {
    takeoutDir: positional({
      type: string,
      displayName: 'takeout_dir',
      description: 'The path to your "Takeout" directory.',
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
  handler: async ({ takeoutDir, force, timeout }) => {
    const errs: string[] = [];
    if (!existsSync(takeoutDir)) {
      errs.push('The specified takeout directory does not exist.');
    }
    if (errs.length !== 0) {
      errs.forEach((e) => console.error(e));
      process.exit(1);
    }

    if (!force) {
      errs.push(
        'The output directory is not empty. Pass "-f" to force the operation.'
      );
    }
    if (await isEmptyDir(takeoutDir)) {
      errs.push('The google directory is empty. Nothing to do.');
    }
    if (errs.length !== 0) {
      errs.forEach((e) => console.error(e));
      process.exit(1);
    }
    const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
    run_full_migration(takeoutDir, timeout, exifTool);
  },
});

const folder_migrate = command({
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
    const exifTool = new ExifTool({ taskTimeoutMillis: timeout });

    await run_basic_migration(googleDir, outputDir, errorDir, exifTool);
  },
});

const app = subcommands({
  name: 'google-photos-migrate',
  cmds: { full_migrate, folder_migrate, unzip },
});

run(app, process.argv.slice(2));
