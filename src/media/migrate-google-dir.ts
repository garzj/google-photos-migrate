import { walkDir } from '../fs/walk-dir';
import { basename } from 'path';
import { findMetaFile } from '../meta/find-meta-file';
import { MediaFileExtension } from './MediaFileExtension';
import { MediaFile, MediaFileInfo } from './MediaFile';
import { applyMetaFile } from '../meta/apply-meta-file';
import { indexJsonFiles } from '../meta/index-meta-files';
import { supportedExtensions } from '../config/extensions';
import { MediaMigrationError } from './MediaMigrationError';
import { InvalidExtError } from './InvalidExtError';
import { NoMetaFileError } from '../meta/NoMetaFileError';
import { WrongExtensionError } from '../meta/apply-meta-errors';
import { ExifTool } from 'exiftool-vendored';
import { readMetaTitle } from '../meta/read-meta-title';
import { saveToDir } from './save-to-dir';

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

export async function* migrateGoogleDir(
  args: MigrationArgs
): AsyncGenerator<MediaFile | MediaMigrationError> {
  const wg: (MediaFile | MediaMigrationError)[] = [];
  for await (const result of migrateGoogleDirGen(args)) {
    wg.push(result);
  }
  return await Promise.all(wg);
}

export async function* migrateGoogleDirGen(
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

async function migrateMediaFile(
  originalPath: string,
  migCtx: MigrationContext
): Promise<MediaFile | MediaMigrationError> {
  const mediaFileInfo: MediaFileInfo = {
    originalPath,
    path: originalPath,
  };

  const ext = supportedExtensions.reduce<MediaFileExtension | null>(
    (longestMatch, cur) => {
      if (!originalPath.endsWith(cur.suffix)) return longestMatch;
      if (longestMatch === null) return cur;
      return cur.suffix.length > longestMatch.suffix.length
        ? cur
        : longestMatch;
    },
    null
  );
  if (!ext) {
    mediaFileInfo.path = await saveToDir(originalPath, migCtx.errorDir, migCtx);
    return new InvalidExtError(mediaFileInfo);
  }

  const jsonPath = await findMetaFile(originalPath, ext, migCtx);
  if (!jsonPath) {
    mediaFileInfo.path = await saveToDir(originalPath, migCtx.errorDir, migCtx);
    return new NoMetaFileError(mediaFileInfo);
  }
  mediaFileInfo.jsonPath = jsonPath;

  mediaFileInfo.path = await saveToDir(
    originalPath,
    migCtx.outputDir,
    migCtx,
    false,
    await readMetaTitle(mediaFileInfo)
  );
  const mediaFile: MediaFile = {
    ...mediaFileInfo,
    ext,
    jsonPath,
  };
  let err = await applyMetaFile(mediaFile, migCtx);
  if (!err) {
    return mediaFile;
  }

  if (err instanceof WrongExtensionError) {
    const oldBase = basename(mediaFile.path);
    const newBase =
      oldBase.slice(0, oldBase.length - err.expectedExt.length) + err.actualExt;
    mediaFile.path = await saveToDir(
      mediaFile.path,
      migCtx.outputDir,
      migCtx,
      true,
      newBase
    );
    migCtx.warnLog(
      `Renamed wrong extension ${err.expectedExt} to ${err.actualExt}: ${mediaFile.path}`
    );
    err = await applyMetaFile(mediaFile, migCtx);
    if (!err) {
      return mediaFile;
    }
  }

  const savedPaths = await Promise.all([
    saveToDir(mediaFile.path, migCtx.errorDir, migCtx, true),
    saveToDir(mediaFile.jsonPath, migCtx.errorDir, migCtx),
  ]);
  mediaFile.path = savedPaths[0];

  return err;
}
