# google-photos-migrate

A tool like [google-photos-exif](https://github.com/mattwilson1024/google-photos-exif), but does some extra things:

- moves duplicates into their own folder
- tries to match files by the title in their .json file
- fixes wrong extensions, identified by [ExifTool](https://exiftool.org/)
- video files won't show up as from 1970

## Run

```bash
git clone https://github.com/garzj/google-photos-migrate.git
cd google-photos-migrate

yarn
yarn build

mkdir output error
yarn start '/path/to/takeout/Google Fotos' './output' './error'
```

## Supported extensions

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
- `.mkv`
- `.wmv`
- `.webm`
