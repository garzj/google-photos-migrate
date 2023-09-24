import { restructureAndProcess } from './restructure-and-process';
import { ExifTool } from 'exiftool-vendored';
import { fileExists } from '../fs/file-exists';
import { possiblePhotosLocations } from '../config/langs';

export async function migrateFullDirectory(
  sourceDirectory: string,
  targetDirectory: string,
  timeout: number
) {
  // at least in my takeout, the Takeout folder contains a subfolder
  // Takeout/Google Foto
  // rootdir refers to that subfolder
  // Can add more language support here in the future
  const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
  let googlePhotosDir: string = '';
  for (let i of possiblePhotosLocations) {
    if (await fileExists(`${sourceDirectory}/${i}`)) {
      googlePhotosDir = `${sourceDirectory}/${i}`;
      break;
    }
  }
  if (googlePhotosDir == '') {
    console.log('No Google Photos (Fotos) directory was found');
    process.exit(1);
  }
  await restructureAndProcess(googlePhotosDir, targetDirectory, exifTool);
  await exifTool.end();
}
