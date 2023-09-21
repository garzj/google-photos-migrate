import { mkdirSync } from 'fs';
import { glob } from 'glob';
import { basename } from 'path';
import { migrateEntireTakoutFolder } from './migrate-entire-takeout-folder';
import { ExifTool } from 'exiftool-vendored';

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
    mkdirSync(album, { recursive: true });
    mkdirSync(outDir, { recursive: true });
    mkdirSync(errDir, { recursive: true });
    await migrateEntireTakoutFolder(album, outDir, errDir, true, exifTool);
  }
}
