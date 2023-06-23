import { MetaType } from '../media/MetaType';
import { MediaFileExtension } from '../media/MediaFileExtension';

export const supportedExtensions: MediaFileExtension[] = [
  { suffix: '.jpg', metaType: MetaType.EXIF },
  { suffix: '.jpeg', metaType: MetaType.EXIF },
  { suffix: '.png', metaType: MetaType.EXIF },
  { suffix: '.raw', metaType: MetaType.NONE },
  { suffix: '.ico', metaType: MetaType.NONE },
  { suffix: '.tiff', metaType: MetaType.EXIF },
  { suffix: '.webp', metaType: MetaType.EXIF }, // actually RIFF, can only write EXIF
  { suffix: '.heic', metaType: MetaType.QUICKTIME },
  { suffix: '.heif', metaType: MetaType.QUICKTIME },
  { suffix: '.gif', metaType: MetaType.NONE },
  { suffix: '.mp4', metaType: MetaType.QUICKTIME, aliases: ['.heic'] },
  { suffix: '.mov', metaType: MetaType.QUICKTIME },
  { suffix: '.qt', metaType: MetaType.QUICKTIME },
  { suffix: '.mov.qt', metaType: MetaType.QUICKTIME },
  { suffix: '.3gp', metaType: MetaType.QUICKTIME },
  { suffix: '.mp4v', metaType: MetaType.QUICKTIME },
  { suffix: '.mkv', metaType: MetaType.NONE },
  { suffix: '.wmv', metaType: MetaType.NONE },
  { suffix: '.webm', metaType: MetaType.NONE },
].flatMap((e) => {
  const aliases = e.aliases?.flatMap((s) => [s.toLowerCase(), s.toUpperCase()]);
  return [
    { ...e, suffix: e.suffix.toLowerCase(), aliases },
    { ...e, suffix: e.suffix.toUpperCase(), aliases },
  ];
});
