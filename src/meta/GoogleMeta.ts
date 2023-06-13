// Stolen from https://github.com/mattwilson1024/google-photos-exif/blob/master/src/helpers/get-companion-json-path-for-media-file.ts
export interface GoogleMetadata {
  title?: string;
  description?: string;
  imageViews?: string;
  creationTime?: GoogleTimestamp;
  geoData?: GeoData;
  geoDataExif?: GeoData;
  photoTakenTime?: GoogleTimestamp;
  modificationTime?: GoogleTimestamp;
  favorited?: boolean;
}

interface GeoData {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  latitudeSpan?: number;
  longitudeSpan?: number;
}

interface GoogleTimestamp {
  timestamp?: string;
  formatted?: string;
}
