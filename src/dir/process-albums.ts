import { glob } from 'glob';
import { basename } from 'path';
import { migrateEntireTakoutFolder } from './migrate-entire-takeout-folder';
import { ExifTool } from 'exiftool-vendored';
import { mkdir } from 'fs/promises';

export async function processAlbums(rootDir: string, exifTool: ExifTool) {
  const globStr: string = `${rootDir}/Albums/*/`;
  const albums: string[] = await glob(globStr);
  if (albums.length == 0) {
    console.log(`WARN: No albums found at ${globStr}`);
  }
  for (let album of albums) {
    console.log(`Processing album ${album}...`);
    let albumName = basename(album);
    let outDir = `${rootDir}/AlbumsProcessed/${albumName}`;
    let errDir = `${rootDir}/AlbumsError/${albumName}`;
    await mkdir(album, { recursive: true });
    await mkdir(outDir, { recursive: true });
    await mkdir(errDir, { recursive: true });
    await migrateEntireTakoutFolder(album, outDir, errDir, true, exifTool);
  }
}
