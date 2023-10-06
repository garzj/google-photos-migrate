import { walkDir } from '../fs/walk-dir';
import { MediaFile } from '../media/MediaFile';
import { migrateMediaFile } from '../media/migrate-media-file';
import { MigrationArgs, migrationArgsDefaults } from './migration-args';
import { asyncGenToAsync } from '../ts';
import { indexJsonFiles } from '../meta/index-meta-files';
import { MediaMigrationError } from '../media/MediaMigrationError';

export type MigrationContext = Required<MigrationArgs> & {
  titleJsonMap: Map<string, string[]>;
};

export const migrateDirFlat = asyncGenToAsync(migrateDirFlatGen);

export async function* migrateDirFlatGen(
  _args: MigrationArgs
): AsyncGenerator<MediaFile | MediaMigrationError> {
  const args = await migrationArgsDefaults(_args);
  const migCtx: MigrationContext = {
    ...args,
    titleJsonMap: await indexJsonFiles(args.inputDir),
    endExifTool: false,
  };

  for await (const mediaPath of walkDir(args.inputDir)) {
    if (mediaPath.endsWith('.json')) continue;

    yield migrateMediaFile(mediaPath, migCtx);
  }

  migCtx.endExifTool && migCtx.exiftool.end();
}
