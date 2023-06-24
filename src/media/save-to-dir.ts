import { basename, resolve } from 'path';
import { fileExists } from '../fs/file-exists';
import sanitize = require('sanitize-filename');
import { copyFile, mkdir, rename } from 'fs/promises';
import { MigrationContext } from './migrate-google-dir';

async function _saveToDir(
  file: string,
  destDir: string,
  saveBase: string,
  move = false,
  duplicateIndex = 0
) {
  const saveDir = resolve(
    destDir,
    duplicateIndex > 0 ? `duplicates-${duplicateIndex}` : '.'
  );
  await mkdir(saveDir, { recursive: true });
  const savePath = resolve(saveDir, saveBase);

  const exists = await fileExists(savePath);
  if (exists) {
    return _saveToDir(file, destDir, saveBase, move, duplicateIndex + 1);
  }

  if (move) {
    await rename(file, savePath);
  } else {
    await copyFile(file, savePath);
  }
  return savePath;
}

/** Copies or moves a file to dir, saves duplicates in subfolders and returns the new path.
 * Atomic within this app, sanitizes filenames.
 */
export async function saveToDir(
  file: string,
  destDir: string,
  migCtx: MigrationContext,
  move = false,
  saveBase?: string
): Promise<string> {
  saveBase = saveBase ?? basename(file);
  const sanitized = sanitize(saveBase, { replacement: '_' });
  if (migCtx.log && saveBase != sanitized) {
    console.error(`Sanitized file: ${file}`);
    console.error(`New filename: ${sanitized}`);
  }

  const lcBase = saveBase.toLowerCase();
  let lock: Promise<string> | undefined;
  while ((lock = migCtx.migrationLocks.get(lcBase))) {
    await lock;
  }
  lock = _saveToDir(file, destDir, sanitized, move);
  migCtx.migrationLocks.set(lcBase, lock);
  try {
    return await lock;
  } finally {
    migCtx.migrationLocks.delete(lcBase);
  }
}
