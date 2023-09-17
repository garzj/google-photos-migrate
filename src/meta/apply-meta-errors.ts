import { MediaFileInfo } from '../media/MediaFile';
import { MediaMigrationError } from '../media/MediaMigrationError';
import { GoogleMetadata } from './GoogleMeta';

export class ApplyMetaError extends MediaMigrationError {
  constructor(failedMedia: MediaFileInfo) {
    super(failedMedia);
  }

  toString() {
    return `Failed to apply meta tags on file: ${this.failedMedia.path}`;
  }
}

export class ExifToolError extends ApplyMetaError {
  constructor(
    failedMedia: MediaFileInfo,
    public reason: Error
  ) {
    super(failedMedia);
  }

  toString() {
    return (
      `ExifTool failed to modify file: ${this.failedMedia.path}` +
      `\nReason: ${this.reason.message}`
    );
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

  toString() {
    return `File has wrong file extension ${this.actualExt}, should be ${this.expectedExt}: ${this.failedMedia.path}`;
  }
}

export class MissingMetaError extends ApplyMetaError {
  constructor(
    failedMedia: MediaFileInfo,
    public keyName: keyof GoogleMetadata
  ) {
    super(failedMedia);
  }

  toString() {
    return (
      `Missing key ${this.keyName} from meta file: ${this.failedMedia.jsonPath}` +
      `\nOriginal file: ${this.failedMedia.path}`
    );
  }
}
