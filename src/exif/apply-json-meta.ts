import { WriteTags, exiftool } from 'exiftool-vendored';
import { MediaFile } from '../media/MediaFile';
import { exhaustiveCheck } from '../ts';
import { MetaType } from '../media/MetaType';
import { readFile } from 'fs/promises';
import { GoogleMetadata } from './GoogleMeta';
import { ExifWrongExtensionError } from './errors';

export async function applyJsonMeta(
  mediaFile: MediaFile
): Promise<Error | null> {
  const metaJson = (await readFile(mediaFile.jsonPath)).toString();
  const meta: GoogleMetadata | undefined = JSON.parse(metaJson);

  const timeTakenTimestamp = meta?.photoTakenTime?.timestamp;
  if (timeTakenTimestamp === undefined)
    return new Error('Coud not read time taken from json file.');
  const timeTaken = new Date(parseInt(timeTakenTimestamp) * 1000);

  // const timeCreatedTimestamp = meta?.creationTime?.timestamp;
  // const timeCreated = timeCreatedTimestamp
  //   ? new Date(parseInt(timeCreatedTimestamp) * 1000)
  //   : undefined;

  const timeModifiedTimestamp = meta?.creationTime?.timestamp;
  const timeModified = timeModifiedTimestamp
    ? new Date(parseInt(timeModifiedTimestamp) * 1000)
    : undefined;

  // const curTags = await exiftool.read(mediaFile.path);
  const tags: WriteTags = {};

  switch (mediaFile.ext.metaType) {
    case MetaType.EXIF:
      tags.DateTimeOriginal = timeTaken.toISOString();
      tags.CreateDate = timeTaken?.toISOString();
      tags.ModifyDate = timeModified?.toISOString();
      break;
    case MetaType.QUICKTIME:
      tags.TrackCreateDate = timeTaken.toISOString();
      tags.TrackModifyDate = timeModified?.toISOString();
      tags.MediaCreateDate = timeTaken.toISOString();
      tags.MediaModifyDate = timeModified?.toISOString();
      break;
    case MetaType.NONE:
      break;
    default:
      exhaustiveCheck(mediaFile.ext.metaType);
  }

  tags.FileModifyDate = timeTaken.toISOString();

  try {
    await exiftool.write(mediaFile.path, tags, ['-overwrite_original']);
  } catch (e) {
    if (e instanceof Error) {
      const wrongExtMatch = e.message.match(
        /Not a valid (?<expected>\w+) \(looks more like a (?<actual>\w+)\)/
      );
      const expected = wrongExtMatch?.groups?.['expected'];
      const actual = wrongExtMatch?.groups?.['actual'];
      if (expected !== undefined && actual !== undefined) {
        return new ExifWrongExtensionError(
          `.${expected.toLowerCase()}`,
          `.${actual.toLowerCase()}`
        );
      }
      return e;
    }
    return new Error(`${e}`);
  }

  return null;
}
