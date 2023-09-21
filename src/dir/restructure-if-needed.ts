import { cpSync, existsSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import { basename } from 'path';

async function _restructureIfNeeded(
  folders: string[],
  targetDir: string,
) {
  if (existsSync(targetDir) && (await glob(`${targetDir}/*`)).length > 0) {
    console.log(
      `${targetDir} exists and is not empty. No restructuring needed.`
    );
    return;
  }
  console.log(`Starting restructure of ${folders.length} directories`);
  mkdirSync(targetDir, { recursive: true });
  for (let folder of folders) {
    // Moves all Untitled(x) directories to one large folder
    if (basename(folder).includes('Untitled')) { 
      console.log(`Copying ${folder} to ${targetDir}/Untitled`);
      cpSync(folder, `${targetDir}/Untitled`, { recursive: true });
    } else {
      console.log(`Copying ${folder} to ${targetDir}/${basename(folder)}`);
      cpSync(folder, `${targetDir}/${basename(folder)}`, { recursive: true });
    }
    
  }
  console.log(`Sucsessfully restructured ${folders.length} directories`);
}

export async function restructureIfNeeded(rootDir: string) {
  // before
  // $rootdir/My Album 1
  // $rootdir/My Album 2
  // $rootdir/Photos from 2008

  // after
  // $rootdir/Albums/My Album 1
  // $rootdir/Albums/My Album 2
  // $rootdir/Photos/Photos from 2008

  const photosDir: string = `${rootDir}/Photos`;

  // move the "Photos from $YEAR" directories to Photos/
  _restructureIfNeeded(
    await glob(`${rootDir}/Photos from */`),
    photosDir,
  );

  // move everythingg else to Albums/, so we end up with two top level folders
  const fullSet: Set<string> = new Set(await glob(`${rootDir}/*/`));
  const photoSet: Set<string> = new Set(
    await glob(`${rootDir}/Photos from */`)
  );
  photoSet.add(`${rootDir}/Photos`);
  const everythingExceptPhotosDir: string[] = Array.from(
    new Set([...fullSet].filter((x) => !photoSet.has(x)))
  );
  _restructureIfNeeded(
    everythingExceptPhotosDir,
    `${rootDir}/Albums`,
  );
}
