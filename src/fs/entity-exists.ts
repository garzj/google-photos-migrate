import { stat } from 'fs/promises';

export const entitiyExists = (path: string) =>
  stat(path)
    .then(() => true)
    .catch((e) => (e.code === 'ENOENT' ? false : Promise.reject(e)));
