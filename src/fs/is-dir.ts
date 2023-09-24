import { lstat } from 'fs/promises';

export async function isDir(path: string) {
  try {
    var stat = await lstat(path);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}
