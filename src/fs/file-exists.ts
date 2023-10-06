import { stat } from 'fs/promises';

export const fileExists = (path: string) =>
  stat(path)
    .then(() => true)
    .catch((e) => (e.code === 'ENOENT' ? false : Promise.reject(e)));
