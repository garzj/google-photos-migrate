import { MetaType } from './MetaType';

export interface MediaFileExtension {
  suffix: string;
  metaType: MetaType;
  aliases?: string[];
}
