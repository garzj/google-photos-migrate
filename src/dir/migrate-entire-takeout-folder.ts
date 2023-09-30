import { ExifTool } from 'exiftool-vendored';
import { migrateSingleFolder } from './migrate-single-folder';
import { entitiyExists } from '../fs/entity-exists';
import { checkErrorDir } from './check-error-dir';

export async function migrateSingleFolderAndCheckErrors(
  albumDir: string,
  outDir: string,
  errDir: string,
  exifTool: ExifTool
) {
  const errs: string[] = [];
  if (!(await entitiyExists(albumDir))) {
    errs.push(`The specified album directory does not exist: ${albumDir}`);
  }
  if (!(await entitiyExists(outDir))) {
    errs.push(`The specified output directory does not exist: ${outDir}`);
  }
  if (!(await entitiyExists(errDir))) {
    errs.push(`The specified error directory does not exist: ${errDir}`);
  }
  if (errs.length !== 0) {
    errs.forEach((e) => console.error(e));
    throw(Error(`Specified output directories don't exist: ${errs}`));
  }

  await migrateSingleFolder(albumDir, outDir, errDir, exifTool, false);
  await checkErrorDir(outDir, errDir, exifTool);
}
