import { MediaFileExtension } from './MediaFileExtension';

export interface MediaFileInfo {
  originalPath: string;
  path: string;
  ext?: MediaFileExtension;
  jsonPath?: string;
}

export type MediaFile = Required<MediaFileInfo>;
