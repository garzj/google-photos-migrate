# google-photos-migrate

A tool like [google-photos-exif](https://github.com/mattwilson1024/google-photos-exif), but does some extra things:

- uses the titles from the .json file to recover previous filenames
- moves duplicates into their own folder
- tries to match files by the title in their .json file
- fixes wrong extensions, identified by [ExifTool](https://exiftool.org/)
- video files won't show up as from 1970
- works for English, German and French (for more langs fix [this file](./src/config/langs.ts))
- supported extensions can be found and configured in [extensions.ts](./src/config/extensions.ts)

## Run this tool

```bash
mkdir output error

npx google-photos-migrate@latest '/path/to/takeout/Google Fotos' './output' './error' --timeout 60000
```

## Further steps

- If you use Linux + Android, you might want to check out the scripts I used to locate duplicate media and keep the better versions in the [android-dups](./android-dups/) directory.
- Use a tool like [Immich](https://github.com/immich-app/immich) and upload your photos
