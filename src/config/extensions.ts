import {
  MediaFileAlias,
  MediaFileExtension,
} from '../media/MediaFileExtension';
import { MetaType } from '../meta/MetaType';

// The extensions are identified by their suffix
// A list of aliases will match each .<ext> with .<alias>.json
// If an alias is an object, the output extension can forcibly
// be set based on the extension found in the json file

let extensions: MediaFileExtension[] = [
  { suffix: '.jpg', metaType: MetaType.EXIF },
  { suffix: '.jpeg', metaType: MetaType.EXIF },
  { suffix: '.png', metaType: MetaType.EXIF },
  { suffix: '.raw', metaType: MetaType.EXIF }, // could be TIFF
  { suffix: '.dng', metaType: MetaType.EXIF }, // based on TIFF
  { suffix: '.ico', metaType: MetaType.NONE },
  { suffix: '.tiff', metaType: MetaType.EXIF },
  { suffix: '.webp', metaType: MetaType.EXIF }, // based on RIFF
  { suffix: '.heic', metaType: MetaType.QUICKTIME },
  { suffix: '.heif', metaType: MetaType.QUICKTIME },
  { suffix: '.gif', metaType: MetaType.NONE },
  { suffix: '.qt', metaType: MetaType.QUICKTIME },
  { suffix: '.mov.qt', metaType: MetaType.QUICKTIME },
  { suffix: '.3gp', metaType: MetaType.QUICKTIME },
  { suffix: '.mp4v', metaType: MetaType.QUICKTIME },
  { suffix: '.mkv', metaType: MetaType.NONE },
  { suffix: '.wmv', metaType: MetaType.NONE },
  { suffix: '.webm', metaType: MetaType.NONE },
  ...['.mp4', '.mov'].map(
    (suf): MediaFileExtension => ({
      suffix: suf,
      metaType: MetaType.QUICKTIME,
      // Apple live photos
      aliases: ['.heic', '.jpg', '.jpeg'],
    }),
  ),
  // Google live photos
  ...['.mp', '.mvimg'].map(
    (suf): MediaFileExtension => ({
      suffix: suf,
      metaType: MetaType.QUICKTIME,
      aliases: [
        { suffix: '.jpg', out: '.mp4' },
        { suffix: '.jpeg', out: '.mp4' },
      ],
    }),
  ),
];

// match lower-/uppercase versions
extensions = extensions.flatMap((e) => {
  const aliases = e.aliases?.flatMap((alias): MediaFileAlias[] => {
    return typeof alias === 'string'
      ? [alias.toLowerCase(), alias.toUpperCase()]
      : [
          { ...alias, suffix: alias.suffix.toLowerCase() },
          { ...alias, suffix: alias.suffix.toUpperCase() },
        ];
  });
  return [
    { ...e, suffix: e.suffix.toLowerCase(), aliases },
    { ...e, suffix: e.suffix.toUpperCase(), aliases },
  ];
});

export const supportedExtensions = extensions;
