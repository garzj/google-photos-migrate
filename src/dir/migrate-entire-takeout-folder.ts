import { glob } from 'glob';
import { basename, join } from 'path';
import { ExifTool } from 'exiftool-vendored';
import { migrateSingleFolder } from './migrate-single-folder';
import { isEmptyDir } from '../fs/is-empty-dir';
import { fileExists } from '../fs/file-exists';

export async function migrateEntireTakoutFolder(
  albumDir: string,
  outDir: string,
  errDir: string,
  check_errDir: boolean,
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

  if (check_errDir && !(await isEmptyDir(errDir))) {
    const errFiles: string[] = await glob(`${errDir}/*`);
    for (let file of errFiles) {
      if (file.endsWith('.json')) {
        console.log(
          `Cannot fix metadata for ${file} as .json is an unsupported file type.`
        );
        continue;
      }
      console.log(
        `Rewriting all tags from ${file}, to  ${join(
          albumDir,
          `cleaned-${basename(file)}`
        )}`
      );
      await exifTool.rewriteAllTags(
        file,
        join(albumDir, `cleaned-${basename(file)}`)
      );
    }
    await migrateEntireTakoutFolder(albumDir, outDir, errDir, false, exifTool);
  }
}
