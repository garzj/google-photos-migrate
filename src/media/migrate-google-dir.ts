import { copyFile, mkdir, rename } from 'fs/promises';
import { walkDir } from '../fs/walk-dir';
import { basename, resolve } from 'path';
import { findJsonFile } from './find-json-file';
import { MediaFileExtension, supportedExtensions } from './extensions';
import { MediaFile } from './mediaFile';
import { applyJsonMeta } from '../exif/apply-json-meta';
import { indexJsonFiles } from './title-json-map';
import { ExifWrongExtensionError } from '../exif/errors';

export interface MigrationContext {
  googleDir: string;
  outputDir: string;
  errorDir: string;
  titleJsonMap: Map<string, string[]>;
  migratedFiles: Set<string>;
  log: boolean;
}

export async function migrateGoogleDir(
  googleDir: string,
  outputDir: string,
  errorDir: string,
  log = false
): Promise<(string | null)[]> {
  const migCtx: MigrationContext = {
    googleDir,
    outputDir,
    errorDir,
    titleJsonMap: await indexJsonFiles(googleDir),
    migratedFiles: new Set<string>(),
    log,
  };

  const wg: Promise<string | null>[] = [];
  for await (const mediaPath of walkDir(googleDir)) {
    wg.push(migrateMediaFile(mediaPath, migCtx));
  }
  return await Promise.all(wg);
}

async function migrateMediaFile(
  mediaPath: string,
  migCtx: MigrationContext
): Promise<string | null> {
  if (mediaPath.endsWith('.json')) return null;

  const ext = supportedExtensions.reduce<MediaFileExtension | null>(
    (longestMatch, cur) => {
      if (!mediaPath.endsWith(cur.suffix)) return longestMatch;
      if (longestMatch === null) return cur;
      return cur.suffix.length > longestMatch.suffix.length
        ? cur
        : longestMatch;
    },
    null
  );
  if (!ext) {
    return await saveToDir(mediaPath, migCtx.errorDir, migCtx.migratedFiles);
  }

  const jsonPath = await findJsonFile(mediaPath, ext, migCtx);
  if (!jsonPath) {
    return await saveToDir(mediaPath, migCtx.errorDir, migCtx.migratedFiles);
  }

  const savedPath = await saveToDir(
    mediaPath,
    migCtx.outputDir,
    migCtx.migratedFiles
  );
  const mediaFile: MediaFile = { ext, path: savedPath, jsonPath };
  let err = await applyJsonMeta(mediaFile);
  if (!err) {
    return mediaFile.path;
  }

  if (err instanceof ExifWrongExtensionError) {
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
    err = await applyJsonMeta(mediaFile);
    if (!err) {
      return mediaFile.path;
    }
  }

  const savedPaths = await Promise.all([
    saveToDir(mediaFile.path, migCtx.errorDir, migCtx.migratedFiles, true),
    saveToDir(mediaFile.jsonPath, migCtx.errorDir, migCtx.migratedFiles),
  ]);
  return savedPaths[0];
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
  } else {
    await copyFile(file, savePath);
  }
  return savePath;
}
