import { ExifTool } from 'exiftool-vendored';
import { migrateSingleDirectory } from './migrate-flat';

export async function migrateSingleFolder(
  googleDir: string,
  outputDir: string,
  errorDir: string,
  exifTool: ExifTool,
  endExifTool: boolean
) {
  console.log(`Started migration.`);
  const migGen = migrateSingleDirectory({
    googleDir,
    outputDir,
    errorDir,
    warnLog: console.error,
    exiftool: exifTool,
    endExifTool: endExifTool,
  });
  const counts = { err: 0, suc: 0 };
  for await (const result of migGen) {
    console.log(result);
    if (result instanceof Error) {
      console.error(`Error: ${result}`);
      counts.err++;
      continue;
    } else {
      counts.suc++;
    }
  }

  console.log(`Done! Processed ${counts.suc + counts.err} files.`);
  console.log(`Files migrated: ${counts.suc}`);
  console.log(`Files failed: ${counts.err}`);
}
