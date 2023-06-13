import { readFile } from 'fs/promises';
import { MediaFileInfo } from '../media/MediaFile';
import { GoogleMetadata } from './GoogleMeta';

export async function readMetaTitle(mediaFileInfo: MediaFileInfo) {
  if (!mediaFileInfo.jsonPath) return undefined;
  const metaJson = (await readFile(mediaFileInfo.jsonPath)).toString();
  const meta: GoogleMetadata | undefined = JSON.parse(metaJson);
  return meta?.title;
}
