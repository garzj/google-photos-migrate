#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync } from 'fs';
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
import { inferLikelyOffsetMinutes } from 'exiftool-vendored/dist/Timezones';


async function runBasicMigration(
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

async function runMigrationsChecked(
  albumDir: string,
  outDir: string,
  errDir: string,
  timeout: number,
  check_errDir: boolean
) {
  const errs: string[] = [];
  if (!existsSync(albumDir)) {
    errs.push(`The specified google directory does not exist: ${albumDir}`);
  }
  if (!existsSync(outDir)) {
    errs.push(`The specified google directory does not exist: ${outDir}`);
  }
  if (!existsSync(errDir)) {
    errs.push(`The specified google directory does not exist: ${errDir}`);
  }
  if (errs.length !== 0) {
    errs.forEach((e) => console.error(e));
    process.exit(1);
  }

  const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
  await runBasicMigration(albumDir, outDir, errDir, exifTool);

  if (check_errDir && !(await isEmptyDir(errDir))) {
    const errFiles: string[] = await glob(`${errDir}/*`);
    const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
    for (let file of errFiles) {
      if (file.endsWith(".json")){
        console.log(`Cannot fix metadata for ${file} as .json is an unsupported file type.`);
        continue;
      }
      console.log(`Rewriting all tags from ${file}, to  ${path.join(albumDir, `cleaned-${basename(file)}`)}`);
      await exifTool.rewriteAllTags(file, path.join(albumDir, `cleaned-${basename(file)}`));
    }
    exifTool.end();
    await runMigrationsChecked(
      albumDir,
      outDir,
      errDir,
      timeout,
      false
    );
  }
}

async function processAlbums(
  rootDir: string,
  timeout: number,
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
    mkdirSync(album, {recursive: true});
    mkdirSync(outDir, {recursive: true});
    mkdirSync(errDir, {recursive: true});
    await runMigrationsChecked(
      album,
      outDir,
      errDir,
      timeout,
      true
    );
  }
}

async function processPhotos(
  rootDir: string,
  timeout: number,
) {
  // Also run the exif fix for the photos
  console.log('Processing photos...');
  const albumDir = `${rootDir}/Photos`;
  const outDir = `${rootDir}/PhotosProcessed`;
  const errDir = `${rootDir}/PhotosError`;
  mkdirSync(albumDir, {recursive: true});
  mkdirSync(outDir, {recursive: true});
  mkdirSync(errDir, {recursive: true});

  await runMigrationsChecked(
    albumDir,
    outDir,
    errDir,
    timeout,
    true
  );
}

async function _restructureIfNeeded(folders: string[], targetDir: string) {
  if (existsSync(targetDir) && ((await glob(`${targetDir}/*`)).length) > 0){
    console.log(`${targetDir} exists and is not empty. No restructuring needed.`);
    return;
  }
  console.log(`Starting restructure of ${folders.length} directories`)
  mkdirSync(targetDir, {recursive: true});
  for (let folder of folders){
    console.log(`Copying ${folder} to ${targetDir}/${basename(folder)}`)
    cpSync(folder, `${targetDir}/${basename(folder)}`, {recursive: true});
  }
  console.log(`Sucsessfully restructured ${folders.length} directories`)
}

async function restructureIfNeeded(rootDir: string) {
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
  _restructureIfNeeded(await glob(`${rootDir}/Photos from */`), photosDir);
  
  // move everythingg else to Albums/, so we end up with two top level folders
  const fullSet: Set<string> = new Set(await glob(`${rootDir}/*/`));
  const photoSet: Set<string> = new Set(await glob(`${rootDir}/Photos from */`));
  photoSet.add(`${rootDir}/Photos`);
  const everythingExceptPhotosDir: string[] = Array.from(
    new Set([...fullSet].filter((x) => !photoSet.has(x)))
  );
  _restructureIfNeeded(everythingExceptPhotosDir, `${rootDir}/Albums`);
}

async function runFullMigration(
  rootDir: string,
  timeout: number,
) {
  // at least in my takeout, the Takeout folder contains a subfolder
  // Takeout/Google Foto
  // rootdir refers to that subfolder

  rootDir = (await glob(`${rootDir}/Google*`))[0].replace(/\/+$/, '');
  await restructureIfNeeded(rootDir);
  await processPhotos(rootDir, timeout);
  await processAlbums(rootDir, timeout);
}

const rewriteAllTags = command({
  name: 'rewrite all tags for single file',
  args: {
    inFile: positional({
      type: string,
      displayName: 'in_file',
      description: 'The path to your input file.',
    }),
    outFile: positional({
      type: string,
      displayName: 'out_file',
      description: 'The path to your output location for the file.',
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
  handler: async ({inFile, outFile, timeout}) => {
    const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
    await exifTool.rewriteAllTags(inFile, outFile);
    exifTool.end();
  },
});

const fullMigrate = command({
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
      errs.push(`The specified takeout directory does not exist: ${takeoutDir}`);
    }
    if (errs.length !== 0) {
      errs.forEach((e) => console.error(e));
      process.exit(1);
    }
    if (await isEmptyDir(takeoutDir)) {
      errs.push('The google directory is empty. Nothing to do.');
    }
    if (!(await isEmptyDir(`${takeoutDir}/Photos`))) {
      errs.push(
        'The Photos directory is not empty. Please delete it and try again.'
      );
    }
    if (!(await isEmptyDir(`${takeoutDir}/Albums`))) {
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

const folderMigrate = command({
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

const app = subcommands({
  name: 'google-photos-migrate',
  cmds: { fullMigrate, folderMigrate, rewriteAllTags },
});

run(app, process.argv.slice(2));
