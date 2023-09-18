import { existsSync } from 'fs';
import { glob } from 'glob';
import { basename, join } from 'path';
import { ExifTool } from 'exiftool-vendored';
import { runBasicMigration } from './migrate-basic';
import { isEmptyDir } from '../fs/is-empty-dir';

export async function runMigrationsChecked(
  albumDir: string,
  outDir: string,
  errDir: string,
  timeout: number,
  check_errDir: boolean
) {
  const errs: string[] = [];
  if (!existsSync(albumDir)) {
    errs.push(`The specified album directory does not exist: ${albumDir}`);
  }
  if (!existsSync(outDir)) {
    errs.push(`The specified output directory does not exist: ${outDir}`);
  }
  if (!existsSync(errDir)) {
    errs.push(`The specified error directory does not exist: ${errDir}`);
  }
  if (errs.length !== 0) {
    errs.forEach((e) => console.error(e));
    process.exit(1);
  }

  const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
  await runBasicMigration(albumDir, outDir, errDir, exifTool);

  if (check_errDir && !(await isEmptyDir(errDir))) {
    const errFiles: string[] = await glob(`${errDir}/*`);
    const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
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
    exifTool.end();
    await runMigrationsChecked(albumDir, outDir, errDir, timeout, false);
  }
}
