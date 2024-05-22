import { MigrationError } from '../MigrationError';
import { MediaFileInfo } from './MediaFile';

export abstract class MediaMigrationError extends MigrationError {
  constructor(public failedMedia: MediaFileInfo) {
    super();
  }
}
