import { MigrationError } from '../MigrationError';

export class NoPhotosDirError extends MigrationError {
  constructor(public parentDir: string) {
    super();
  }

  toString() {
    return `Failed to find Google Photos directory in dir: ${this.parentDir}`;
  }
}
