import { basename, join } from 'path';
import { mkdir, readdir } from 'fs/promises';
import { migrateDirFlatGen } from './migrate-flat';
import { FullMigrationContext } from './migrate-full';
import { untitledDirs } from '../config/langs';

async function* _restructureAndProcess(
  folders: string[],
  processingAlbums: boolean, // true for Albums, false for Photos
  migCtx: FullMigrationContext
) {
  for (const folder of folders) {
    processingAlbums && migCtx.log(`Processing album ${folder}...`);

    let albumName = processingAlbums ? basename(folder) : 'Photos';
    for (const untitledName of untitledDirs) {
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
  }
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

  const allDirs = (await readdir(sourceDir, { withFileTypes: true })).filter(
    (f) => f.isDirectory()
  );

  // move the "Photos from $YEAR" directories to Photos/
  migCtx.log('Processing photos...');
  const photosFromDirs = new Set(
    allDirs
      .filter((f) => f.name === 'Photos' || f.name.startsWith('Photos from '))
      .map((f) => join(f.path, f.name))
  );
  yield* _restructureAndProcess([...photosFromDirs], false, migCtx);

  // move everythingg else to Albums/, so we end up with two top level folders
  migCtx.log('Processing albums...');
  const albumDirs = allDirs
    .filter((f) => !photosFromDirs.has(join(f.path, f.name)))
    .map((f) => join(f.path, f.name));
  yield* _restructureAndProcess(albumDirs, true, migCtx);
}
