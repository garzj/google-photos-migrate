import './config/env';

import { supportedExtensions } from './config/extensions';
import { migrateDirFlat, migrateDirFlatGen } from './dir/migrate-flat';
import { migrateDirFull, migrateDirFullGen } from './dir/migrate-full';
import type { MigrationArgs } from './dir/migration-args';
import type { MediaFileExtension } from './media/MediaFileExtension';

export {
  migrateDirFlat,
  migrateDirFlatGen,
  migrateDirFull,
  migrateDirFullGen,
  supportedExtensions,
};
export type { MediaFileExtension, MigrationArgs };
