# google-photos-migrate

A tool like [google-photos-exif](https://github.com/mattwilson1024/google-photos-exif), but does some extra things:

- uses the titles from the .json file to recover previous filenames
- moves duplicates into their own folder
- tries to match files by the title in their .json file
- fixes wrong extensions, identified by [ExifTool](https://exiftool.org/)
- video files won't show up as from 1970
- works for English, German and French (for more langs fix [this file](./src/config/langs.ts))

## Run this tool

If you wish to migrate a single folder from a Google Photos takeout file:

```bash
mkdir output error

npx google-photos-migrate@latest folderMigrate '/path/to/takeout/Google Fotos' './output' './error' --timeout 60000
```

Optional flags for folder takeout:

```
--timeout integer
    Shorthand: -t integer
    Meaning: Sets the timeout for exiftool, default is 30000 (30s)
--force
    Shorthand: -f
    Meaning: Forces the migration and overwrites files in the target directory.
```

If you wish to migrate an entire takeout folder:

```bash
mkdir output error

npx google-photos-migrate@latest fullMigrate '/path/to/takeout/' --timeout 60000
```

Optional flags for full takeout:

```
--timeout integer
    Shorthand: -t integer
    Meaning: Sets the timeout for exiftool, default is 30000 (30s)
```

The processed folders will be automatically put in `/path/to/takeout/Google Photos[Fotos]/PhotosProcessed` & `/path/to/takeout/Google Photos[Fotos]/AlbumsProcessed`.

## Further steps

- If you use Linux + Android, you might want to check out the scripts I used to locate duplicate media and keep the better versions in the [android-dups](./android-dups/) directory.
- Use a tool like [Immich](https://github.com/immich-app/immich) and upload your photos

## Supported extensions

Configured in [extensions.ts](./src/config/extensions.ts):

- `.jpg`
- `.jpeg`
- `.png`
- `.raw`
- `.ico`
- `.tiff`
- `.webp`
- `.heic`
- `.heif`
- `.gif`
- `.mp4`
- `.mov`
- `.qt`
- `.mov.qt`
- `.3gp`
- `.mp4v`
- `.mkv`
- `.wmv`
- `.webm`

## Development

**Prerec**: Must have node 18 & yarn installed.

For basic deployment do the following:

```bash
git clone https://github.com/garzj/google-photos-migrate
yarn
yarn build
yarn start <subcommand>
```

The entrypoint into the codebase is `src/cli.ts`
