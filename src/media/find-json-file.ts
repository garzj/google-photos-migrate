import { basename, dirname } from 'path';
import { MigrationContext } from './migrate-google-dir';
import { MediaFileExtension } from './MediaFileExtension';
import { fileExists } from '../fs/file-exists';

export async function findJsonFile(
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

  const pushWithExts = (
    mapToBase: (woExt: string, ext: string) => string[]
  ) => {
    let woExt = mediaPath.slice(0, mediaPath.length - ext.suffix.length);
    woExt = woExt.replace(/-(edited|bearbeitet)$/i, '');

    const exts: string[] = [];

    // <name>.json
    exts.push('');
    // <name>.<ext>.json
    exts.push(ext.suffix);
    // <name>.<extAlias>.json
    exts.push(...(ext.aliases ?? []));

    for (const potExt of exts) {
      for (const potBase of mapToBase(woExt, potExt)) {
        potPaths.add(`${potBase}.json`);
      }
    }
  };

  // <name>(.<ext|extAlias>)?.json
  pushWithExts((woExt, ext) => [`${woExt}${ext}`]);

  pushWithExts((woExt, ext) => {
    // Stolen from https://github.com/mattwilson1024/google-photos-exif/blob/master/src/helpers/get-companion-json-path-for-media-file.ts
    const nameCounterMatch = woExt.match(/(?<name>.*)(?<counter>\(\d+\))$/);
    const name = nameCounterMatch?.groups?.['name'];
    const counter = nameCounterMatch?.groups?.['counter'];
    if (name !== undefined && counter !== undefined) {
      // <file>(.<ext|extAlias>)?(n).json
      return [`${name}${ext}${counter}`];
    }
    return [];
  });

  // <file>(_n-?|_n?|_?)(.<ext|extAlias>)?.json
  pushWithExts((woExt, ext) => {
    if (woExt.endsWith('_n-') || woExt.endsWith('_n') || woExt.endsWith('_')) {
      mediaPath.includes('IMG_1127') && console.log(woExt);
      return [`${woExt.slice(0, -1)}${ext}`];
    }
    return [];
  });

  for (const potPath of potPaths) {
    if (!(await fileExists(potPath))) {
      continue;
    }
    return potPath;
  }

  return null;
}
