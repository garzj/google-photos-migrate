import { pathExists } from 'fs-extra';
import { basename } from 'path';
import { MigrationError } from '../MigrationError';
import { photosDirs } from '../config/langs';
import { MediaFile } from '../media/MediaFile';
import { asyncGenToAsync } from '../ts';
import { NoPhotosDirError } from './NoPhotosDirError';
import { MigrationArgs, migrationArgsDefaults } from './migration-args';
import { restructureAndProcess } from './restructure-and-process';

export type FullMigrationContext = Required<MigrationArgs>;

export const migrateDirFull = asyncGenToAsync(migrateDirFullGen);

export async function* migrateDirFullGen(
  args: MigrationArgs,
): AsyncGenerator<MediaFile | MigrationError> {
  const migCtx: FullMigrationContext = await migrationArgsDefaults(args);

  // Either /Google Photos or Takeout/Google Photos
  let googlePhotosDir: string | undefined = undefined;
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
  if (!googlePhotosDir) {
    yield new NoPhotosDirError(migCtx.inputDir);
    return;
  }

  yield* restructureAndProcess(googlePhotosDir, migCtx);

  migCtx.endExifTool && migCtx.exiftool.end();
}
