import { glob } from 'glob';
import { restructureAndProcess } from './restructure-and-process';
import { processPhotos } from './process-photos';
import { processAlbums } from './process-albums';
import { ExifTool } from 'exiftool-vendored';
import { fileExists } from '../fs/file-exists';

export async function runFullMigration(
  sourceDirectory: string,
  processedDirectory: string,
  timeout: number,
) {
  // at least in my takeout, the Takeout folder contains a subfolder
  // Takeout/Google Foto
  // rootdir refers to that subfolder
  // Can add more language support here in the future
  const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
  let googlePhotosDir: string = "";
  if (await fileExists(`${sourceDirectory}/Google Photos`)){
    googlePhotosDir = `${sourceDirectory}/Google Photos`;
  } else if (await fileExists(`${sourceDirectory}/Google Fotos`)){
    googlePhotosDir = `${sourceDirectory}/Google Fotos`
  }
  await restructureAndProcess(googlePhotosDir, exifTool);
  await exifTool.end();
}
