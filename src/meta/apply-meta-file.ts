import { WriteTags } from 'exiftool-vendored';
import { MediaFile } from '../media/MediaFile';
import { exhaustiveCheck } from '../ts';
import { MetaType } from './MetaType';
import { readFile } from 'fs/promises';
import { GoogleMetadata } from './GoogleMeta';
import {
  ApplyMetaError,
  ExifToolError,
  MissingMetaError,
  WrongExtensionError,
} from './apply-meta-errors';
import { MigrationContext } from '../dir/migrate-flat';

export async function applyMetaFile(
  mediaFile: MediaFile,
  migCtx: MigrationContext
): Promise<ApplyMetaError | null> {
  const metaJson = (await readFile(mediaFile.jsonPath)).toString();
  const meta: GoogleMetadata | undefined = JSON.parse(metaJson);

  // time
  const timeTakenTimestamp = meta?.photoTakenTime?.timestamp;
  if (timeTakenTimestamp === undefined)
    return new MissingMetaError(mediaFile, 'photoTakenTime');
  const timeTaken = new Date(parseInt(timeTakenTimestamp) * 1000);
  // always UTC as per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  const timeTakenUTC = timeTaken.toISOString();

  const tags: WriteTags = {};

  switch (mediaFile.ext.metaType) {
    case MetaType.EXIF:
      tags.SubSecDateTimeOriginal = timeTakenUTC;
      tags.SubSecCreateDate = timeTakenUTC;
      tags.SubSecModifyDate = timeTakenUTC;
      break;
    case MetaType.QUICKTIME:
      tags.DateTimeOriginal = timeTakenUTC;
      tags.CreateDate = timeTakenUTC;
      tags.ModifyDate = timeTakenUTC;
      tags.TrackCreateDate = timeTakenUTC;
      tags.TrackModifyDate = timeTakenUTC;
      tags.MediaCreateDate = timeTakenUTC;
      tags.MediaModifyDate = timeTakenUTC;
      break;
    case MetaType.NONE:
      break;
    default:
      exhaustiveCheck(mediaFile.ext.metaType);
  }

  tags.ModifyDate = timeTakenUTC;

  // description
  const description = meta?.description;
  tags.Description = description;
  tags['Caption-Abstract'] = description;
  tags.ImageDescription = description;

  // gps
  const [alt, lat, lon] = [
    meta?.geoData?.altitude,
    meta?.geoData?.latitude,
    meta?.geoData?.longitude,
  ];
  if (![alt, lat, lon].some((axis) => axis === undefined)) {
    tags.GPSAltitude = alt;
    tags.GPSAltitudeRef = `${alt}`;
    tags.GPSLatitude = lat;
    tags.GPSLatitudeRef = `${lat}`;
    tags.GPSLongitude = lon;
    tags.GPSLongitudeRef = `${lon}`;
  }

  try {
    await migCtx.exiftool.write(mediaFile.path, tags, [
      '-overwrite_original',
      '-api',
      'quicktimeutc',
      '-api',
      'largefilesupport=1',
    ]);
  } catch (e) {
    if (e instanceof Error) {
      const wrongExtMatch = e.message.match(
        /Not a valid (?<current>\w+) \(looks more like a (?<actual>\w+)\)/
      );
      const current = wrongExtMatch?.groups?.['current'];
      const actual = wrongExtMatch?.groups?.['actual'];
      if (current !== undefined && actual !== undefined) {
        return new WrongExtensionError(
          mediaFile,
          `.${current.toLowerCase()}`,
          `.${actual.toLowerCase()}`
        );
      }
      return new ExifToolError(mediaFile, e);
    }
    return new ExifToolError(mediaFile, new Error(`${e}`));
  }

  return null;
}
