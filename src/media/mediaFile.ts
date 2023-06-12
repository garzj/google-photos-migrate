import { MediaFileExtension } from './extensions';

export interface MediaFile {
  ext: MediaFileExtension;
  path: string;
  jsonPath: string;
}
