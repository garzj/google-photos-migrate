import { glob } from 'glob';
import { basename, dirname } from 'path';
import { mkdir, cp } from 'fs/promises';
import { ExifTool } from 'exiftool-vendored';
import { migrateSingleFolder } from './migrate-single-folder';
import { checkErrorDir } from './check-error-dir';
import path = require('path');

async function _restructureAndProcess(
  folders: string[],
  targetDir: string,
  processingAlbums: boolean, // true for Albums, false for Photos
  exifTool: ExifTool
) {
  console.log(`Starting restructure of ${folders.length} directories`);
  await mkdir(targetDir, { recursive: true });
  for (const folder of folders) {
    if (processingAlbums) {
      // true for Albums, false for Photos
      console.log(`Processing album ${folder}...`);
      let outDir = `${targetDir}/AlbumsProcessed/${basename(folder)}`;
      let errDir = `${targetDir}/AlbumsError/${basename(folder)}`;
      if (basename(folder).includes('Untitled(')) {
        outDir = `${targetDir}/AlbumsProcessed/Untitled`;
        errDir = `${targetDir}/AlbumsError/Untitled`;
      }
      await mkdir(outDir, { recursive: true });
      await mkdir(errDir, { recursive: true });
      await migrateSingleFolder(folder, outDir, errDir, exifTool, false);
    } else {
      const outDir = `${targetDir}/PhotosProcessed`;
      const errDir = `${targetDir}/PhotosError`;
      await mkdir(outDir, { recursive: true });
      await mkdir(errDir, { recursive: true });
      await migrateSingleFolder(folder, outDir, errDir, exifTool, false);
    }
  }

  // check for errors
  if (!processingAlbums) {
    const outDir = `${targetDir}/PhotosProcessed`;
    const errDir = `${targetDir}/PhotosError`;
    await checkErrorDir(outDir, errDir, exifTool);
  } else {
    const outDir = `${targetDir}/AlbumsProcessed`;
    const errDir = `${targetDir}/AlbumsError`;
    const errAlbumDirs = await glob(errDir);
    for (const dir of errAlbumDirs) {
      if (dir == errDir) {
        continue;
      }
      await checkErrorDir(dir, path.join(outDir, basename(dir)), exifTool);
    }
  }

  console.log(`Sucsessfully restructured ${folders.length} directories`);
}

export async function restructureAndProcess(
  sourceDir: string,
  targetDir: string,
  exifTool: ExifTool
) {
  // before
  // $rootdir/My Album 1/*
  // $rootdir/My Album 2/*
  // $rootdir/Photos from 2008/*

  // after
  // $rootdir/AlbumsProcessed/My Album 1/*
  // $rootdir/AlbumsProcessed/My Album 2/*
  // $rootdir/PhotosProcessed/*

  console.log('Processing photos...');

  // move the "Photos from $YEAR" directories to Photos/
  await _restructureAndProcess(
    await glob(`${sourceDir}/Photos from */`),
    targetDir,
    false,
    exifTool
  );

  console.log('Processing albums...');

  // move everythingg else to Albums/, so we end up with two top level folders
  const fullSet: Set<string> = new Set(await glob(`${sourceDir}/*/`));
  const photoSet: Set<string> = new Set(
    await glob(`${sourceDir}/Photos from */`)
  );
  photoSet.add(`${sourceDir}/Photos`);
  const everythingExceptPhotosDir: string[] = Array.from(
    new Set([...fullSet].filter((x) => !photoSet.has(x)))
  );
  await _restructureAndProcess(
    everythingExceptPhotosDir,
    targetDir,
    true,
    exifTool
  );
}
