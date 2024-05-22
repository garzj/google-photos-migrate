// Stolen from https://github.com/mattwilson1024/google-photos-exif/blob/master/src/helpers/get-companion-json-path-for-media-file.ts
export interface GoogleMetadata {
  title?: string;
  description?: string;
  imageViews?: string;
  creationTime?: GoogleTimestamp;
  geoData?: GoogleGeoData;
  geoDataExif?: GoogleGeoData;
  photoTakenTime?: GoogleTimestamp;
  modificationTime?: GoogleTimestamp;
  favorited?: boolean;
}

export interface GoogleGeoData {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  latitudeSpan?: number;
  longitudeSpan?: number;
}

export interface GoogleTimestamp {
  timestamp?: string;
  formatted?: string;
}
