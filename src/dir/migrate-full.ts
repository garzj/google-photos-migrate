import { glob } from 'glob';
import { restructureIfNeeded } from './restructure-if-needed';
import { processPhotos } from './process-photos';
import { processAlbums } from './process-albums';

export async function runFullMigration(
  rootDir: string,
  timeout: number,
  untitled: boolean
) {
  // at least in my takeout, the Takeout folder contains a subfolder
  // Takeout/Google Foto
  // rootdir refers to that subfolder

  rootDir = (await glob(`${rootDir}/Google*`))[0].replace(/\/+$/, '');
  await restructureIfNeeded(rootDir, untitled);
  await processPhotos(rootDir, timeout);
  await processAlbums(rootDir, timeout);
}
