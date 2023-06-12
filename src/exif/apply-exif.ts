import { exiftool } from 'exiftool-vendored';
import { MediaFile } from '../media/mediaFile';

export async function applyExifFromJson(
  mediaFile: MediaFile
): Promise<boolean> {
  const exif = await exiftool.read(mediaFile.path);
  // TODO:
  // exif.DateTimeOriginal;
  // exif.CreateDate;
  // exif.ModifyDate
  // exif.FileModifyDate;
  // exif.TrackCreateDate;
  // exif.TrackModifyDate;
  // exif.MediaCreateDate;
  // exif.MediaModifyDate
  exiftool.write(mediaFile.path, exif);
  return true;
}
