import { readdir } from 'fs/promises';
import { resolve } from 'path';

export async function* walkDir(dir: string): AsyncGenerator<string> {
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    if (dirent.isDirectory()) {
      yield* walkDir(resolve(dir, dirent.name));
    } else {
      yield resolve(dir, dirent.name);
    }
  }
}
