import { MetaType } from '../meta/MetaType';

export interface MediaFileExtension {
  suffix: string;
  metaType: MetaType;
  aliases?: string[];
}
