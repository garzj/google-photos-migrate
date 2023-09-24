# google-photos-migrate

A tool like [google-photos-exif](https://github.com/mattwilson1024/google-photos-exif), but does some extra things:

- uses the titles from the .json file to recover previous filenames
- moves duplicates into their own folder
- tries to match files by the title in their .json file
- fixes wrong extensions, identified by [ExifTool](https://exiftool.org/)
- video files won't show up as from 1970
- works for English, German and French (for more langs fix [this file](./src/config/langs.ts))

## Run this tool

### Natively 

**Prerec**: Must have at least node 18 & yarn installed.

If you wish to migrate a single folder from a Google Photos takeout file:

```bash
mkdir output error

npx google-photos-migrate@latest folderMigrate '/path/to/takeout/Google Fotos' './output' './error' --timeout 60000
```
Optional flags for folder takeout (see `--help` for all details):

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

Optional flags for full takeout (see `--help` for all details):

```
--timeout integer
    Shorthand: -t integer
    Meaning: Sets the timeout for exiftool, default is 30000 (30s)
```

The processed folders will be automatically put in `/path/to/takeout/Google Photos[Fotos]/PhotosProcessed` & `/path/to/takeout/Google Photos[Fotos]/AlbumsProcessed`.

**WARNING:** The `fullMigrate` command non-destructively modifies your files, which results in 3 nearly complete copies of your Takeout folder by the time it completes successfully: the original, the intermediate metadata-modified files, and the final organized and de-duplicated files.  Make sure you have sufficient disk space for this.

Additional intermediate folders are created as part of this command and in the event of errors will need to be manually removed before retrying. All are under the `/path/to/takeout/Google Photos[Fotos]/` folder:
```
Albums
AlbumsProcessed
Photos
PhotosError
PhotosProcessed
```

### Docker

**Prerec:** You must have a working `docker` or `podman` install.

A Dockerfile is also provided to make running this tool easier on most hosts.  The image must be built manually (see below), no pre-built images are provided. Using it will by default use only software-based format conversion, hardware accelerated format conversion is beyond these instructions.

**You must build the image yourself (see above), no public pre-built images are provided.**

You must build the image once before you run it:
```shell
# get the source code
git clone https://github.com/garzj/google-photos-migrate
cd google-photos-migrate

# Build the image. Must be run from within the source code folder.
docker build -f Dockerfile -t localhost/google-photos-migrate:latest .
```

To run `folderMigrate`, which requires providing multiple folders:
```shell
mkdir output error
docker run --rm -it --security-opt=label=disable \
    -v $(readlink -e path/to/takeout):/takeout \
    -v $(readlink -e ./output):/output \
    -v $(readlink -e ./error):/error \
   localhost/google-photos-migrate:latest \
     folderMigrate '/takeout/Google Fotos' '/output' '/error' --timeout=60000
```

To run `fullMigrate`, which requires only the Takeout folder:
```shell
mkdir output error
docker run --rm -it -security-opt=label=disable \
    -v $(readlink -e path/to/takeout):/takeout \
   localhost/google-photos-migrate:latest \
     fullMigrate '/takeout' --timeout=60000
```

All other commands and options are also available. The only difference from running it natively is the lack of (possible) hardware acceleration, and the need to explicitly add any folders the command will need to reference as host-mounts for the container.

For the overall help:
```shell
# no folders needed, so keep it simple
docker run --rm -it --security-opt=label=disable \
   localhost/google-photos-migrate:latest \
     --help
```

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
