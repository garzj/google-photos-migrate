import { move, pathExists } from 'fs-extra';
import { copyFile, mkdir } from 'fs/promises';
import { basename, resolve } from 'path';
import sanitize from 'sanitize-filename';
import { MigrationContext } from '../dir/migrate-flat';

async function _saveToDir(
  file: string,
  destDir: string,
  saveBase: string,
  doMove = false,
  duplicateIndex = 0,
) {
  const saveDir = resolve(
    destDir,
    duplicateIndex > 0 ? `duplicates-${duplicateIndex}` : '.',
  );
  await mkdir(saveDir, { recursive: true });
  const savePath = resolve(saveDir, saveBase);

  const exists = await pathExists(savePath);
  if (exists) {
    return _saveToDir(file, destDir, saveBase, doMove, duplicateIndex + 1);
  }

  if (doMove) {
    await move(file, savePath);
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
  saveBase?: string,
): Promise<string> {
  saveBase = saveBase ?? basename(file);
  let sanitized = sanitize(saveBase, { replacement: '_' });
  if (sanitized === '') {
    sanitized = migCtx.renameEmpty;
  }
  if (saveBase != sanitized) {
    migCtx.warnLog(`Sanitized file: ${file}` + ` (New filename: ${sanitized})`);
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
