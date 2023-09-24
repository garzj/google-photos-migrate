import './config/env';

import { migrateSingleDirectory } from './dir/migrate-flat';
import { migrateFullDirectory } from './dir/migrate-full';
import type { MediaFileExtension } from './media/MediaFileExtension';
import { supportedExtensions } from './config/extensions';

export { migrateSingleDirectory, migrateFullDirectory, supportedExtensions };
export type { MediaFileExtension };
