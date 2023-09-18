import './config/env';

import { migrateGoogleDir } from './dir/migrate-flat';
import type { MediaFileExtension } from './media/MediaFileExtension';
import { supportedExtensions } from './config/extensions';

export { migrateGoogleDir, supportedExtensions };
export type { MediaFileExtension };
