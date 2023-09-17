import { readFile } from 'fs/promises';
import { walkDir } from '../fs/walk-dir';
import { extname } from 'path';
import { editedSuffices } from '../config/langs';

const MAX_BASE_LENGTH = 51;

function trimTitle(title: string) {}

export async function indexJsonFiles(
  googleDir: string
): Promise<Map<string, string[]>> {
  const titleJsonMap = new Map<string, string[]>();

  for await (const jsonPath of walkDir(googleDir)) {
    if (!jsonPath.endsWith('.json')) continue;

    let title: any;
    try {
      const data = JSON.parse((await readFile(jsonPath)).toString());
      title = data.title;
    } catch (e) {}
    if (typeof title !== 'string') continue;

    const potTitles = new Set<string>();

    const ext = extname(title);
    const woExt = title.slice(0, -ext.length);
    const maxWoExt = MAX_BASE_LENGTH - ext.length;
    potTitles.add(woExt.slice(0, maxWoExt) + ext);

    for (const suffix of editedSuffices) {
      potTitles.add((woExt + `-${suffix}`).slice(0, maxWoExt) + ext);
    }

    for (const potTitle of potTitles) {
      const jsonPaths = titleJsonMap.get(potTitle) ?? [];
      jsonPaths.push(jsonPath);
      titleJsonMap.set(potTitle, jsonPaths);
    }
  }

  return titleJsonMap;
}
