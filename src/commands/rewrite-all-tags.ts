import { command, string, positional, number, option } from 'cmd-ts';
import { ExifTool } from 'exiftool-vendored';

export const rewriteAllTags = command({
  name: 'rewrite all tags for single file',
  args: {
    inFile: positional({
      type: string,
      displayName: 'in_file',
      description: 'The path to your input file.',
    }),
    outFile: positional({
      type: string,
      displayName: 'out_file',
      description: 'The path to your output location for the file.',
    }),
    timeout: option({
      type: number,
      defaultValue: () => 30000,
      short: 't',
      long: 'timeout',
      description:
        'Sets the task timeout in milliseconds that will be passed to ExifTool.',
    }),
  },
  handler: async ({ inFile, outFile, timeout }) => {
    const exifTool = new ExifTool({ taskTimeoutMillis: timeout });
    await exifTool.rewriteAllTags(inFile, outFile);
    exifTool.end();
  },
});
