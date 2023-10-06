import { glob } from 'glob';
import { basename } from 'path';
import { mkdir } from 'fs/promises';
import { checkErrorDir } from './check-error-dir';
import { migrateDirFlatGen } from './migrate-flat';
import { FullMigrationContext } from './migrate-full';
import { untitledNames } from '../config/langs';

async function* _restructureAndProcess(
  folders: string[],
  processingAlbums: boolean, // true for Albums, false for Photos
  migCtx: FullMigrationContext
) {
  migCtx.log(`Starting restructure of ${folders.length} directories.`);

  for (const folder of folders) {
    processingAlbums && migCtx.log(`Processing album ${folder}...`);

    let albumName = processingAlbums ? basename(folder) : 'Photos';
    for (const untitledName of untitledNames) {
      if (albumName.startsWith(`${untitledName}(`)) {
        albumName = untitledName;
      }
    }

    const outDir = `${migCtx.outputDir}/${albumName}`;
    const errDir = `${migCtx.errorDir}/${albumName}`;

    await mkdir(outDir, { recursive: true });
    await mkdir(errDir, { recursive: true });
    yield* migrateDirFlatGen({
      ...migCtx,
      inputDir: folder,
      outputDir: outDir,
      errorDir: errDir,
    });

    await checkErrorDir(outDir, errDir, migCtx.exiftool);
  }

  console.log(`Sucsessfully restructured ${folders.length} directories`);
}

export async function* restructureAndProcess(
  sourceDir: string,
  migCtx: FullMigrationContext
) {
  // before
  // $rootdir/My Album 1/*
  // $rootdir/My Album 2/*
  // $rootdir/Photos from 2008/*

  // after
  // $rootdir/AlbumsProcessed/My Album 1/*
  // $rootdir/AlbumsProcessed/My Album 2/*
  // $rootdir/PhotosProcessed/*

  // move the "Photos from $YEAR" directories to Photos/
  migCtx.log('Processing photos...');
  const photoSet = new Set(
    await glob([`${sourceDir}/Photos`, `${sourceDir}/Photos from */`])
  );
  yield* _restructureAndProcess([...photoSet], false, migCtx);

  // move everythingg else to Albums/, so we end up with two top level folders
  migCtx.log('Processing albums...');
  const fullSet: Set<string> = new Set(await glob(`${sourceDir}/*/`));
  const everythingExceptPhotosDir = [
    ...new Set([...fullSet].filter((x) => !photoSet.has(x))),
  ];
  yield* _restructureAndProcess(everythingExceptPhotosDir, true, migCtx);
}
