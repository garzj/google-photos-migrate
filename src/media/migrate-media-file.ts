import { basename, dirname } from 'path';
import { findMetaFile } from '../meta/find-meta-file';
import {
  MediaFileAliasDetails,
  MediaFileExtension,
} from './MediaFileExtension';
import { MediaFile, MediaFileInfo } from './MediaFile';
import { applyMetaFile } from '../meta/apply-meta-file';
import { supportedExtensions } from '../config/extensions';
import { MediaMigrationError } from './MediaMigrationError';
import { InvalidExtError } from './InvalidExtError';
import { NoMetaFileError } from '../meta/NoMetaFileError';
import { ApplyMetaError, WrongExtensionError } from '../meta/apply-meta-errors';
import { readMetaTitle } from '../meta/read-meta-title';
import { saveToDir } from './save-to-dir';
import { MigrationContext } from '../dir/migrate-flat';

function applyExt(path: string, from: string, to: string) {
  return path.slice(0, path.length - from.length) + to;
}

async function renameExt(
  migCtx: MigrationContext,
  file: MediaFile,
  from: string,
  to: string
) {
  const destDir = dirname(file.path);
  const saveBase = applyExt(basename(file.path), from, to);
  file.path = await saveToDir(file.path, destDir, migCtx, true, saveBase);
  return file.path;
}

function getOutExtRename(ext: MediaFileExtension, metaTitle: string) {
  const renames = (ext.aliases ?? []).filter(
    (x): x is MediaFileAliasDetails => typeof x === 'object'
  );
  return renames.find((r) => metaTitle.endsWith(r.suffix));
}

export async function migrateMediaFile(
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

  const metaBase =
    (await readMetaTitle(mediaFileInfo)) ?? basename(mediaFileInfo.path);
  const outExtRename = getOutExtRename(
    ext,
    metaBase ?? basename(mediaFileInfo.path)
  );
  const outBase = outExtRename
    ? applyExt(metaBase, outExtRename.suffix, outExtRename.out)
    : metaBase;
  mediaFileInfo.path = await saveToDir(
    originalPath,
    migCtx.outputDir,
    migCtx,
    false,
    outBase
  );
  const mediaFile: MediaFile = {
    ...mediaFileInfo,
    ext,
    jsonPath,
  };
  const err = await applyMetaFile(mediaFile, migCtx);

  return await handleApplyMetaErr(mediaFile, migCtx, err, outExtRename);
}

async function handleApplyMetaErr(
  mediaFile: MediaFile,
  migCtx: MigrationContext,
  err: ApplyMetaError | null,
  outExtRename?: MediaFileAliasDetails
): Promise<MediaFile | ApplyMetaError> {
  if (err) {
    if (err instanceof WrongExtensionError) {
      if (migCtx.skipCorrections) {
        return mediaFile;
      }

      if (outExtRename) {
        migCtx.warnLog(
          `Extension ${err.currentExt} should be ${err.actualExt}, but was forcibly set: ${mediaFile.path}`
        );
        return mediaFile;
      }

      await renameExt(migCtx, mediaFile, err.currentExt, err.actualExt);
      migCtx.warnLog(
        `Renamed wrong extension ${err.currentExt} to ${err.actualExt}: ${mediaFile.path}`
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

  return mediaFile;
}
