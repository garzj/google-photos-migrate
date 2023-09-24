import { glob } from 'glob';
import { basename, dirname } from 'path';
import { fileExists } from '../fs/file-exists';
import { mkdir, cp } from 'fs/promises';
import { ExifTool } from 'exiftool-vendored';
import { migrateEntireTakoutFolder } from './migrate-entire-takeout-folder';

async function _restructureAndProcess(
  folders: string[],
  targetDir: string,
  processingType: boolean, // true for Albums, false for Photos
  exifTool: ExifTool,
) {
  if ((!await fileExists(targetDir)) && (await glob(`${targetDir}/*`)).length > 0) {
    console.log(
      `${targetDir} exists and is not empty. No restructuring needed.`
    );
    return;
  }
  console.log(`Starting restructure of ${folders.length} directories`);
  await mkdir(targetDir, { recursive: true });
  for (let folder of folders) {
    // Moves all Untitled(x) directories to one large folder
    // if (basename(folder).includes('Untitled')) { 
    //   console.log(`Copying ${folder} to ${targetDir}/Untitled`);
    //   cp(folder, `${targetDir}/Untitled`);
    // } else {
    //   console.log(`Copying ${folder} to ${targetDir}/${basename(folder)}`);
    //   cp(folder, `${targetDir}/${basename(folder)}`);
    // }

    if (processingType){  // true for Albums, false for Photos
      console.log(`Processing album ${folder}...`);
      let outDir = `${dirname(folder)}/AlbumsProcessed/${basename(folder)}`;
      let errDir = `${dirname(folder)}/AlbumsError/${basename(folder)}`;
      if (basename(folder).includes('Untitled(')){
        outDir = `${dirname(folder)}/AlbumsProcessed/Untitled`;
        errDir = `${dirname(folder)}/AlbumsError/Untitled`;
      }
      await mkdir(outDir, { recursive: true });
      await mkdir(errDir, { recursive: true });
      await migrateEntireTakoutFolder(folder, outDir, errDir, true, exifTool);
    }else{
      const outDir = `${dirname(folder)}/PhotosProcessed`;
      const errDir = `${dirname(folder)}/PhotosError`;
      await mkdir(outDir, { recursive: true });
      await mkdir(errDir, { recursive: true });
      await migrateEntireTakoutFolder(folder, outDir, errDir, true, exifTool);
    }
    
  }
  console.log(`Sucsessfully restructured ${folders.length} directories`);
}

export async function restructureAndProcess(rootDir: string, exifTool: ExifTool) {
  // before
  // $rootdir/My Album 1
  // $rootdir/My Album 2
  // $rootdir/Photos from 2008

  // after
  // $rootdir/Albums/My Album 1
  // $rootdir/Albums/My Album 2
  // $rootdir/Photos/Photos from 2008

  console.log('Processing photos...');
  
  const photosDir: string = `${rootDir}/Photos`;

  // move the "Photos from $YEAR" directories to Photos/
  await _restructureAndProcess(
    await glob(`${rootDir}/Photos from */`),
    photosDir,
    false,
    exifTool
  );

  console.log('Processing albums...');

  // move everythingg else to Albums/, so we end up with two top level folders
  const fullSet: Set<string> = new Set(await glob(`${rootDir}/*/`));
  const photoSet: Set<string> = new Set(
    await glob(`${rootDir}/Photos from */`)
  );
  photoSet.add(`${rootDir}/Photos`);
  const everythingExceptPhotosDir: string[] = Array.from(
    new Set([...fullSet].filter((x) => !photoSet.has(x)))
  );
  await _restructureAndProcess(
    everythingExceptPhotosDir,
    `${rootDir}/Albums`,
    true,
    exifTool
  );
}
