import { ExifTool } from 'exiftool-vendored';
import { migrateGoogleDirGen } from './migrate-flat';

export async function runBasicMigration(
  googleDir: string,
  outputDir: string,
  errorDir: string,
  exifTool: ExifTool
) {
  console.log(`Started migration.`);
  const migGen = migrateGoogleDirGen({
    googleDir,
    outputDir,
    errorDir,
    warnLog: console.error,
    exiftool: exifTool,
    endExifTool: true,
  });

  const counts = { err: 0, suc: 0 };
  for await (const result of migGen) {
    if (result instanceof Error) {
      console.error(`Error: ${result}`);
      counts.err++;
      continue;
    }

    counts.suc++;
  }

  console.log(`Done! Processed ${counts.suc + counts.err} files.`);
  console.log(`Files migrated: ${counts.suc}`);
  console.log(`Files failed: ${counts.err}`);
}
