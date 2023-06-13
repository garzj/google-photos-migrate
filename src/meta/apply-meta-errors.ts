import { MediaFileInfo } from '../media/MediaFile';
import { MediaMigrationError } from '../media/MediaMigrationError';
import { GoogleMetadata } from './GoogleMeta';

export class ApplyMetaError extends MediaMigrationError {
  constructor(failedMedia: MediaFileInfo) {
    super(failedMedia);
  }
}

export class ExifToolError extends ApplyMetaError {
  constructor(failedMedia: MediaFileInfo, public reason: Error) {
    super(failedMedia);
  }
}

export class WrongExtensionError extends ApplyMetaError {
  constructor(
    failedMedia: MediaFileInfo,
    public expectedExt: string,
    public actualExt: string
  ) {
    super(failedMedia);
  }
}

export class MissingMetaError extends ApplyMetaError {
  constructor(
    failedMedia: MediaFileInfo,
    public keyName: keyof GoogleMetadata
  ) {
    super(failedMedia);
  }
}
