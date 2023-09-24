import { mkdir } from 'fs/promises';
import { migrateEntireTakoutFolder } from './migrate-entire-takeout-folder';
import { ExifTool } from 'exiftool-vendored';

export async function processPhotos(rootDir: string, exifTool: ExifTool) {
  // Also run the exif fix for the photos
  console.log('Processing photos...');
  const albumDir = `${rootDir}/Photos`;
  const outDir = `${rootDir}/PhotosProcessed`;
  const errDir = `${rootDir}/PhotosError`;
  await mkdir(albumDir, { recursive: true });
  await mkdir(outDir, { recursive: true });
  await mkdir(errDir, { recursive: true });

  await migrateEntireTakoutFolder(albumDir, outDir, errDir, true, exifTool);
}
