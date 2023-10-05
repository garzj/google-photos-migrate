import { restructureAndProcess } from './restructure-and-process';
import { ExifTool, exiftool } from 'exiftool-vendored';
import { entitiyExists } from '../fs/entity-exists';
import { possiblePhotosLocations } from '../config/langs';

export async function migrateFullDirectory(
  sourceDirectory: string,
  targetDirectory: string,
  timeout: number
): Promise<Error | void> {
  // at least in my takeout, the Takeout folder contains a subfolder
  // Takeout/Google Foto
  // rootdir refers to that subfolder
  // Can add more language support here in the future
  const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
  try {
    let googlePhotosDir: string = '';
    for (const i of possiblePhotosLocations) {
      if (await entitiyExists(`${sourceDirectory}/${i}`)) {
        googlePhotosDir = `${sourceDirectory}/${i}`;
        break;
      }
    }
    if (googlePhotosDir == '') {
      return new Error('No Google Photos (Fotos) directory was found');
    }
    await restructureAndProcess(googlePhotosDir, targetDirectory, exifTool);
    exifTool.end();
  } catch (e) {
    exifTool.end();
    console.error(e);
    return new Error(`Error while migrating: ${e}`);
  }
  return;
}
