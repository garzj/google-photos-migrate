import { MediaMigrationError } from './MediaMigrationError';

export class InvalidExtError extends MediaMigrationError {
  toString() {
    return `File has invalid extension: ${this.failedMedia.path}`;
  }
}
