import './config/env';

import { supportedExtensions } from './media/extensions';
import { migrateGoogleDir } from './media/migrate-google-dir';
import type { MediaFileExtension } from './media/extensions';

export { migrateGoogleDir, supportedExtensions };
export type { MediaFileExtension };
