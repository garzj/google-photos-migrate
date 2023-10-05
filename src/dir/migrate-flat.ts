import { walkDir } from '../fs/walk-dir';
import { MediaFile } from '../media/MediaFile';
import { indexJsonFiles } from '../meta/index-meta-files';
import { MediaMigrationError } from '../media/MediaMigrationError';
import { ExifTool } from 'exiftool-vendored';
import { migrateMediaFile } from '../media/migrate-media-file';

export type MigrationArgs = {
  googleDir: string;
  outputDir: string;
  errorDir: string;
  warnLog?: (msg: string) => void;
  exiftool?: ExifTool;
  endExifTool?: boolean;
};

export type MigrationContext = Required<MigrationArgs> & {
  titleJsonMap: Map<string, string[]>;
  migrationLocks: Map<string, Promise<string>>;
};

export async function* migrateSingleDirectory(
  args: MigrationArgs
): AsyncGenerator<MediaFile | MediaMigrationError> {
  const wg: (MediaFile | MediaMigrationError)[] = [];
  for await (const result of migrateSingleDirectoryGen(args)) {
    wg.push(result);
  }
  return await Promise.all(wg);
}

export async function* migrateSingleDirectoryGen(
  args: MigrationArgs
): AsyncGenerator<MediaFile | MediaMigrationError> {
  const migCtx: MigrationContext = {
    titleJsonMap: await indexJsonFiles(args.googleDir),
    migrationLocks: new Map(),
    ...args,
    exiftool: args.exiftool ?? new ExifTool(),
    endExifTool: args.endExifTool ?? !args.exiftool,
    warnLog: args.warnLog ?? (() => {}),
  };

  for await (const mediaPath of walkDir(args.googleDir)) {
    if (mediaPath.endsWith('.json')) continue;

    yield migrateMediaFile(mediaPath, migCtx);
  }

  migCtx.endExifTool && migCtx.exiftool.end();
}
