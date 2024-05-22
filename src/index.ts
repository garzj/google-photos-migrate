import './config/env';

import { supportedExtensions } from './config/extensions';
import { migrateDirFlat, migrateDirFlatGen } from './dir/migrate-flat';
import { migrateDirFull, migrateDirFullGen } from './dir/migrate-full';
import type { MigrationArgs } from './dir/migration-args';

export type * from './errors';
export type * from './media/MediaFile';
export type * from './media/MediaFileExtension';
export type * from './meta/GoogleMeta';
export {
  migrateDirFlat,
  migrateDirFlatGen,
  migrateDirFull,
  migrateDirFullGen,
  supportedExtensions,
};
export type { MigrationArgs };
