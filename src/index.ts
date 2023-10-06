import './config/env';

import { migrateDirFlat, migrateDirFlatGen } from './dir/migrate-flat';
import { migrateDirFull, migrateDirFullGen } from './dir/migrate-full';
import type { MediaFileExtension } from './media/MediaFileExtension';
import { supportedExtensions } from './config/extensions';
import type { MigrationArgs } from './dir/migration-args';

export {
  migrateDirFlat,
  migrateDirFlatGen,
  migrateDirFull,
  migrateDirFullGen,
  supportedExtensions,
};
export type { MigrationArgs, MediaFileExtension };
