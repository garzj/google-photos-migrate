import { MediaMigrationError } from './MediaMigrationError';

export class NoMetaFileError extends MediaMigrationError {
  toString() {
    return `Unable to locate meta file for: ${this.failedMedia.path}`;
  }
}
