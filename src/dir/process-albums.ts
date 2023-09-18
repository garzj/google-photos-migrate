import { mkdirSync } from 'fs';
import { glob } from 'glob';
import { basename } from 'path';
import { runMigrationsChecked } from './migrate-checked';

export async function processAlbums(rootDir: string, timeout: number) {
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
    await runMigrationsChecked(album, outDir, errDir, timeout, true);
  }
}
