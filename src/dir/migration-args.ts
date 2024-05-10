import { ExifTool } from 'exiftool-vendored';

export type MigrationArgs = {
  inputDir: string;
  outputDir: string;
  errorDir: string;
  log?: (msg: string) => void;
  warnLog?: (msg: string) => void;
  verboseLog?: (msg: string) => void;
  exiftool?: ExifTool;
  endExifTool?: boolean;
  skipCorrections?: boolean;
  migrationLocks?: Map<string, Promise<string>>;
};

export async function migrationArgsDefaults(
  args: MigrationArgs,
): Promise<Required<MigrationArgs>> {
  return {
    ...args,
    migrationLocks: args.migrationLocks ?? new Map(),
    exiftool: args.exiftool ?? new ExifTool(),
    endExifTool: args.endExifTool ?? !args.exiftool,
    log: args.log ?? (() => {}),
    warnLog: args.warnLog ?? (() => {}),
    verboseLog: args.verboseLog ?? (() => {}),
    skipCorrections: args.skipCorrections ?? false,
  };
}
