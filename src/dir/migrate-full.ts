import { pathExists } from 'fs-extra';
import { basename } from 'path';
import { photosDirs } from '../config/langs';
import { MediaFile } from '../media/MediaFile';
import { MediaMigrationError } from '../media/MediaMigrationError';
import { asyncGenToAsync } from '../ts';
import { DirMigrationError, NoPhotosDirError } from './DirMigrationError';
import { MigrationArgs, migrationArgsDefaults } from './migration-args';
import { restructureAndProcess } from './restructure-and-process';

export type FullMigrationContext = Required<MigrationArgs>;

export const migrateDirFull = asyncGenToAsync(migrateDirFullGen);

export async function* migrateDirFullGen(
  args: MigrationArgs,
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

  yield* restructureAndProcess(googlePhotosDir, migCtx);

  migCtx.endExifTool && migCtx.exiftool.end();
}
