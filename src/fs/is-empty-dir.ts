import { readdir } from 'fs/promises';

export const isEmptyDir = async (dir: string) =>
  (await readdir(dir)).length === 0;
