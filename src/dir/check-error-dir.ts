import { ExifTool } from 'exiftool-vendored';
import { isEmptyDir } from '../fs/is-empty-dir';
import { glob } from 'glob';
import { basename, join } from 'path';
import { isDir } from '../fs/is-dir';
import { fileExists } from '../fs/file-exists';

export async function checkErrorDir(
  outDir: string,
  errDir: string,
  exifTool: ExifTool
) {
  if (!(await isEmptyDir(errDir))) {
    const errFiles: string[] = await glob(`${errDir}/*`);
    for (const file of errFiles) {
      if (file.endsWith('.json')) {
        continue;
      } else if (await isDir(file)) {
        console.log(`Cannot fix metadata for directory: ${file}`);
        continue;
      } else if (await fileExists(file)) {
        continue;
      }
      console.log(
        `Rewriting all tags from ${file}, to  ${join(
          outDir,
          `cleaned-${basename(file)}`
        )}`
      );
      await exifTool.rewriteAllTags(
        file,
        join(outDir, `cleaned-${basename(file)}`)
      );
    }
  }
}
