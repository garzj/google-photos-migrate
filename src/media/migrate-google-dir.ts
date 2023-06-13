import { copyFile, mkdir, rename } from 'fs/promises';
import { walkDir } from '../fs/walk-dir';
import { basename, resolve } from 'path';
import { findMetaFile } from '../exif/find-meta-file';
import { MediaFileExtension } from './MediaFileExtension';
import { MediaFile, MediaFileInfo } from './MediaFile';
import { applyMetaFile } from '../exif/apply-meta-file';
import { indexJsonFiles } from './title-json-map';
import { supportedExtensions } from '../config/extensions';
import { MediaMigrationError } from './MediaMigrationError';
import { InvalidExtError } from './InvalidExtError';
import { NoMetaFileError } from './NoMetaFileError';
import { ExifToolError, WrongExtensionError } from '../exif/apply-meta-errors';
import { ExifTool } from 'exiftool-vendored';
import { readMetaTitle } from '../exif/read-meta-title';

export interface MigrationContext {
  googleDir: string;
  outputDir: string;
  errorDir: string;
  titleJsonMap: Map<string, string[]>;
  migratedFiles: Set<string>;
  log: boolean;
  exiftool: ExifTool;
}

export async function migrateGoogleDir(
  googleDir: string,
  outputDir: string,
  errorDir: string,
  log = false
): Promise<(MediaFile | MediaMigrationError)[]> {
  const migCtx: MigrationContext = {
    googleDir,
    outputDir,
    errorDir,
    titleJsonMap: await indexJsonFiles(googleDir),
    migratedFiles: new Set<string>(),
    log,
    exiftool: new ExifTool(),
  };

  const wg: ReturnType<typeof migrateMediaFile>[] = [];
  for await (const mediaPath of walkDir(googleDir)) {
    wg.push(migrateMediaFile(mediaPath, migCtx));
  }
  const results = (await Promise.all(wg)).filter(
    (res) => res !== null
  ) as Exclude<Awaited<(typeof wg)[number]>, null>[];

  migCtx.exiftool.end();

  return results;
}

async function migrateMediaFile(
  originalPath: string,
  migCtx: MigrationContext
): Promise<MediaFile | MediaMigrationError | null> {
  if (originalPath.endsWith('.json')) return null;

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
    mediaFileInfo.path = await saveToDir(
      originalPath,
      migCtx.errorDir,
      migCtx.migratedFiles
    );
    return new InvalidExtError(mediaFileInfo);
  }

  const jsonPath = await findMetaFile(originalPath, ext, migCtx);
  if (!jsonPath) {
    mediaFileInfo.path = await saveToDir(
      originalPath,
      migCtx.errorDir,
      migCtx.migratedFiles
    );
    return new NoMetaFileError(mediaFileInfo);
  }
  mediaFileInfo.jsonPath = jsonPath;

  mediaFileInfo.path = await saveToDir(
    originalPath,
    migCtx.outputDir,
    migCtx.migratedFiles,
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
      migCtx.migratedFiles,
      true,
      newBase
    );
    migCtx.log &&
      console.log(
        `Renamed wrong extension ${err.expectedExt} to ${err.actualExt}: ${mediaFile.path}`
      );
    err = await applyMetaFile(mediaFile, migCtx);
    if (!err) {
      return mediaFile;
    }
  }

  const savedPaths = await Promise.all([
    saveToDir(mediaFile.path, migCtx.errorDir, migCtx.migratedFiles, true),
    saveToDir(mediaFile.jsonPath, migCtx.errorDir, migCtx.migratedFiles),
  ]);
  mediaFile.path = savedPaths[0];

  if (migCtx.log) {
    // too lazy writing error msgs
    const m = err instanceof ExifToolError ? err.reason : err.constructor.name;
    console.error(`Warning: ${m}`);
    console.error(`Original path: ${mediaFile.originalPath}`);
    console.error(`Saved path: ${mediaFile.path}`);
  }

  return err;
}

// Copies or moves to dir, saves duplicates in subfolders and returns the new path
async function saveToDir(
  file: string,
  destDir: string,
  knownFiles: Set<string>,
  move = false,
  saveBase?: string,
  duplicateIndex = 0
): Promise<string> {
  const saveDir = resolve(
    destDir,
    duplicateIndex > 0 ? `duplicates-${duplicateIndex}` : '.'
  );
  await mkdir(saveDir, { recursive: true });

  saveBase = saveBase ?? basename(file);
  const savePath = resolve(saveDir, saveBase);
  if (knownFiles.has(savePath)) {
    return saveToDir(
      file,
      destDir,
      knownFiles,
      move,
      saveBase,
      duplicateIndex + 1
    );
  }
  knownFiles.add(savePath);

  if (move) {
    await rename(file, savePath);
    knownFiles.delete(file);
  } else {
    await copyFile(file, savePath);
  }
  return savePath;
}
