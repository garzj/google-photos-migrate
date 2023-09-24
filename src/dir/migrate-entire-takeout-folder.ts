import { glob } from 'glob';
import { basename, join } from 'path';
import { ExifTool } from 'exiftool-vendored';
import { migrateSingleFolder } from './migrate-single-folder';
import { isEmptyDir } from '../fs/is-empty-dir';
import { fileExists } from '../fs/file-exists';
import { checkErrorDir } from './check-error-dir';

export async function migrateSingleFolderAndCheckErrors(
  albumDir: string,
  outDir: string,
  errDir: string,
  exifTool: ExifTool
) {
  const errs: string[] = [];
  if (!(await fileExists(albumDir))) {
    errs.push(`The specified album directory does not exist: ${albumDir}`);
  }
  if (!(await fileExists(outDir))) {
    errs.push(`The specified output directory does not exist: ${outDir}`);
  }
  if (!(await fileExists(errDir))) {
    errs.push(`The specified error directory does not exist: ${errDir}`);
  }
  if (errs.length !== 0) {
    errs.forEach((e) => console.error(e));
    process.exit(1);
  }

  await migrateSingleFolder(albumDir, outDir, errDir, exifTool, false);
  await checkErrorDir(outDir, errDir, exifTool);
}
