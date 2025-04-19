export interface LocalizedTerm {
  editedSuffix?: string;
  photosDir?: string;
  untitledDir?: string;
}

export const localizedTerms: Record<string, LocalizedTerm> = {
  de: {
    editedSuffix: 'bearbeitet',
    photosDir: 'Google Fotos',
    untitledDir: 'Unbenannt',
  },
  en: {
    editedSuffix: 'edited',
    photosDir: 'Google Photos',
    untitledDir: 'Untitled',
  },
  es: {
    editedSuffix: 'ha editado',
    untitledDir: 'Sin título',
  },
  fi: {
    editedSuffix: 'muokattu',
    photosDir: 'Google Kuvat',
    untitledDir: 'Nimetön',
  },
  fr: {
    editedSuffix: 'modifié',
  },
  ja: {
    editedSuffix: '編集済み',
    photosDir: 'Google フォト',
    untitledDir: '無題',
  },
  ru: {
    editedSuffix: 'измененный',
    photosDir: 'Google Фото',
    untitledDir: 'Без названия',
  },
  tr: {
    editedSuffix: 'düzenlendi',
    photosDir: 'Google Fotoğraflar',
    untitledDir: 'Adsız',
  },
  'zh-CN': {
    editedSuffix: '已修改',
    photosDir: 'Google 相册',
    untitledDir: '未命名',
  },
  'zh-TW': {
    editedSuffix: '已編輯',
    photosDir: 'Google 相簿',
    untitledDir: '未命名',
  },
};

const getValues = (key: keyof LocalizedTerm) =>
  Object.values(localizedTerms)
    .map((t) => t[key])
    .filter((v): v is Exclude<typeof v, undefined> => v !== undefined);
export const photosDirs = getValues('photosDir');
export const untitledDirs = getValues('untitledDir');
export const editedSuffices = getValues('editedSuffix');
