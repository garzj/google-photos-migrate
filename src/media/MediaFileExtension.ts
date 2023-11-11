import { MetaType } from '../meta/MetaType';

export interface MediaFileAliasDetails {
  suffix: string;
  out: string;
}

export type MediaFileAlias = string | MediaFileAliasDetails;

export interface MediaFileExtension {
  suffix: string;
  metaType: MetaType;
  aliases?: MediaFileAlias[];
}
