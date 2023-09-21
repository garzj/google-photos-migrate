import { glob } from 'glob';
import { restructureIfNeeded } from './restructure-if-needed';
import { processPhotos } from './process-photos';
import { processAlbums } from './process-albums';
import { existsSync } from 'fs';
import { ExifTool } from 'exiftool-vendored';

export async function runFullMigration(
  rootDir: string,
  timeout: number,
) {
  // at least in my takeout, the Takeout folder contains a subfolder
  // Takeout/Google Foto
  // rootdir refers to that subfolder
  // Can add more language support here in the future
  const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
  rootDir;
  if (existsSync(`${rootDir}/Google Photos`)){
    rootDir = `${rootDir}/Google Photos`;
  } else if (existsSync(`${rootDir}/Google Fotos`)){
    rootDir = `${rootDir}/Google Fotos`
  }
  await restructureIfNeeded(rootDir);
  await processPhotos(rootDir, exifTool);
  await processAlbums(rootDir, exifTool);
  exifTool.end();
}
