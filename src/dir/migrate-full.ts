import { restructureAndProcess } from './restructure-and-process';
import { entitiyExists } from '../fs/entity-exists';
import { photosLocations } from '../config/langs';
import { asyncGenToAsync } from '../ts';
import { MediaFile } from '../media/MediaFile';
import { MigrationArgs, migrationArgsDefaults } from './migration-args';
import { MediaMigrationError } from '../media/MediaMigrationError';
import { DirMigrationError, NoPhotosDirError } from './DirMigrationError';

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
  for (const i of photosLocations) {
    if (await entitiyExists(`${migCtx.inputDir}/${i}`)) {
      googlePhotosDir = `${migCtx.inputDir}/${i}`;
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
