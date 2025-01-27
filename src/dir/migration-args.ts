import { ExifTool } from 'exiftool-vendored';

export type MigrationArgs = {
  inputDir: string;
  outputDir: string;
  errorDir: string;
  log?: (msg: string) => void;
  warnLog?: (msg: string) => void;
  verboseLog?: (msg: string) => void;
  exiftool?: ExifTool;
  exiftoolArgs?: string[];
  endExifTool?: boolean;
  skipCorrections?: boolean;
  renameEmpty?: string;
  migrationLocks?: Map<string, Promise<string>>;
};

const defaultExiftoolArgs = [
  '-overwrite_original',
  '-api',
  'quicktimeutc',
  '-api',
  'largefilesupport=1',
];

export async function migrationArgsDefaults(
  args: MigrationArgs,
): Promise<Required<MigrationArgs>> {
  let exiftoolArgs =
    typeof args.exiftoolArgs === 'string'
      ? [args.exiftoolArgs]
      : (args.exiftoolArgs ?? []);
  exiftoolArgs = [...defaultExiftoolArgs, ...exiftoolArgs];

  return {
    ...args,
    migrationLocks: args.migrationLocks ?? new Map(),
    exiftool: args.exiftool ?? new ExifTool(),
    exiftoolArgs,
    endExifTool: args.endExifTool ?? !args.exiftool,
    log: args.log ?? (() => {}),
    warnLog: args.warnLog ?? (() => {}),
    verboseLog: args.verboseLog ?? (() => {}),
    skipCorrections: args.skipCorrections ?? false,
    renameEmpty: args.renameEmpty ? args.renameEmpty : '_',
  };
}
