import { ExifTool } from 'exiftool-vendored';
import { migrateSingleDirectoryGen } from './migrate-flat';

export async function migrateSingleFolder(
  googleDir: string,
  outputDir: string,
  errorDir: string,
  exifTool: ExifTool,
  endExifTool: boolean
) {
  console.log(`Started migration.`);
  const migGen = migrateSingleDirectoryGen({
    googleDir,
    outputDir,
    errorDir,
    warnLog: console.error,
    exiftool: exifTool,
    endExifTool: endExifTool,
  });
  const counts = { err: 0, suc: 0 };
  for await (const result of migGen) {
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
