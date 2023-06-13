export class ExifWrongExtensionError extends Error {
  constructor(public expectedExt: string, public actualExt: string) {
    super();
  }
}
