import { basename, dirname } from 'path';
import { MigrationContext } from '../dir/migrate-flat';
import { MediaFileExtension } from '../media/MediaFileExtension';
import { entitiyExists } from '../fs/entity-exists';
import { editedSuffices } from '../config/langs';

export async function findMetaFile(
  mediaPath: string,
  ext: MediaFileExtension,
  migCtx: MigrationContext
): Promise<string | null> {
  const title = basename(mediaPath);

  // Most json files can be matched by indexed titles
  const indexedJson = migCtx.titleJsonMap.get(title);
  if (indexedJson) {
    const sameFolder = indexedJson.filter(
      (jsonPath) => dirname(jsonPath) === dirname(mediaPath)
    );
    if (sameFolder.length === 1) {
      return sameFolder[0];
    }
  }

  // Otherwise, try (from most to least significant)
  const potPaths = new Set<string>();

  const pushWithPotExt = (base: string, potExt: string) => {
    const potBases: string[] = [];

    // <name>(.<ext|extAlias>)?.json
    potBases.push(`${base}${potExt}`);

    // Stolen from https://github.com/mattwilson1024/google-photos-exif/blob/master/src/helpers/get-companion-json-path-for-media-file.ts
    const nameCounterMatch = base.match(/(?<name>.*)(?<counter>\(\d+\))$/);
    const name = nameCounterMatch?.groups?.['name'];
    const counter = nameCounterMatch?.groups?.['counter'];
    if (name !== undefined && counter !== undefined) {
      // <file>(.<ext|extAlias>)?(n).json
      potBases.push(`${name}${potExt}${counter}`);
    }

    // <file>(_n-?|_n?|_?)(.<ext|extAlias>)?.json
    if (base.endsWith('_n-') || base.endsWith('_n') || base.endsWith('_')) {
      potBases.push(`${base.slice(0, -1)}${potExt}`);
    }

    for (const potBase of potBases) {
      potPaths.add(`${potBase}.json`);
    }
  };

  let base = mediaPath.slice(0, mediaPath.length - ext.suffix.length);
  for (const suffix of editedSuffices) {
    const prevLen = base.length;
    base = base.replace(`-${suffix}`, '');
    if (prevLen !== base.length) break;
  }

  const potExts: string[] = [];

  // <name>.<ext>.json
  potExts.push(ext.suffix);
  // <name>.<extAlias>.json
  potExts.push(...(ext.aliases ?? []));
  // <name>.json
  potExts.push('');

  for (const potExt of potExts) {
    pushWithPotExt(base, potExt);
  }

  for (const potPath of potPaths) {
    if (!(await entitiyExists(potPath))) {
      continue;
    }
    return potPath;
  }

  return null;
}
