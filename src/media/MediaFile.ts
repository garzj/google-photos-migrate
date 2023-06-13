import { MediaFileExtension } from './MediaFileExtension';

export interface MediaFile {
  ext: MediaFileExtension;
  path: string;
  originalPath: string;
  jsonPath: string;
}
