import { restructureAndProcess } from './restructure-and-process';
import { photosDirs } from '../config/langs';
import { asyncGenToAsync } from '../ts';
import { MediaFile } from '../media/MediaFile';
import { MigrationArgs, migrationArgsDefaults } from './migration-args';
import { MediaMigrationError } from '../media/MediaMigrationError';
import { DirMigrationError, NoPhotosDirError } from './DirMigrationError';
import { basename } from 'path';
import { pathExists } from 'fs-extra';

export type FullMigrationContext = Required<MigrationArgs>;

export const migrateDirFull = asyncGenToAsync(migrateDirFullGen);

export async function* migrateDirFullGen(
  args: MigrationArgs
): AsyncGenerator<MediaFile | MediaMigrationError | DirMigrationError> {
  const migCtx: FullMigrationContext = await migrationArgsDefaults(args);

  // at least in my takeout, the Takeout folder contains a subfolder
  // Takeout/Google Foto
  // rootdir refers to that subfolder
  // Can add more language support here in the future
  let googlePhotosDir: string = '';
  for (const photosDir of photosDirs) {
    if (await pathExists(`${migCtx.inputDir}/${photosDir}`)) {
      googlePhotosDir = `${migCtx.inputDir}/${photosDir}`;
      break;
    }
    if (basename(migCtx.inputDir) === photosDir) {
      googlePhotosDir = migCtx.inputDir;
      break;
    }
  }
  if (googlePhotosDir == '') {
    yield new NoPhotosDirError(migCtx.inputDir);
    return;
  }
  migCtx.verboseLog(`Found google photos directory: ${googlePhotosDir}`);

  yield* restructureAndProcess(googlePhotosDir, migCtx);

  migCtx.endExifTool && migCtx.exiftool.end();
}
