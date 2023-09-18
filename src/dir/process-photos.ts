import { mkdirSync } from 'fs';
import { runMigrationsChecked } from './migrate-checked';

export async function processPhotos(rootDir: string, timeout: number) {
  // Also run the exif fix for the photos
  console.log('Processing photos...');
  const albumDir = `${rootDir}/Photos`;
  const outDir = `${rootDir}/PhotosProcessed`;
  const errDir = `${rootDir}/PhotosError`;
  mkdirSync(albumDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });
  mkdirSync(errDir, { recursive: true });

  await runMigrationsChecked(albumDir, outDir, errDir, timeout, true);
}
