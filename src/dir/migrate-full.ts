import { restructureAndProcess } from './restructure-and-process';
import { ExifTool } from 'exiftool-vendored';
import { fileExists } from '../fs/file-exists';

export async function runFullMigration(
  sourceDirectory: string,
  targetDirectory: string,
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
  await restructureAndProcess(googlePhotosDir, targetDirectory, exifTool);
  await exifTool.end();
}
