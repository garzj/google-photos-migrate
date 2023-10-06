export class DirMigrationError extends Error {
  constructor(public folder: string) {
    super();
  }
}

export class NoPhotosDirError extends DirMigrationError {
  constructor(public folder: string) {
    super(folder);
  }

  toString() {
    return `Failed to find Google Photos directory in folder: ${this.folder}`;
  }
}
