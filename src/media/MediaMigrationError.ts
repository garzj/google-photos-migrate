import { MediaFileInfo } from './MediaFile';

export class MediaMigrationError extends Error {
  constructor(public failedMedia: MediaFileInfo) {
    super();
  }
}
