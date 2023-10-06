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

### Natively

**Prerec**: Must have at least node 18 & yarn installed.

If you wish to migrate a single folder from a Google Photos takeout file (or flatten the entire Takout folder into a single output with no album hierarchy):

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

If you wish to migrate an entire takeout folder (and keep the album directory structure):

```bash
mkdir output error

npx google-photos-migrate@latest fullMigrate '/path/to/takeout' '/path/to/target' --timeout 60000
```

Optional flags for full takeout (see `--help` for all details):

```
--timeout integer
    Shorthand: -t integer
    Meaning: Sets the timeout for exiftool, default is 30000 (30s)
```

In the target directory, four sub-directories are created:

```
PhotosProcessed
PhotosError
AlbumsProcessed
AlbumsError
```

If all goes well you can ignore the error directories and just use the output in the \*Processed dirs.

### Docker

**Prerec:** You must have a working `docker` or `podman` install.

A Dockerfile is also provided to make running this tool easier on most hosts. The image must be built manually (see below), no pre-built images are provided. Using it will by default use only software-based format conversion, hardware accelerated format conversion is beyond these instructions.

Build the image once before you run it:

```shell
git clone https://github.com/garzj/google-photos-migrate
cd google-photos-migrate

# build the image
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
mkdir output
docker run --rm -it -security-opt=label=disable \
    -v $(readlink -e path/to/takeout):/takeout \
    -v $(readlink -e ./output):/output \
   localhost/google-photos-migrate:latest \
     fullMigrate '/takeout' '/output' --timeout=60000
```

All other commands and options are also available. The only difference from running it natively is the lack of (possible) hardware acceleration, and the need to explicitly add any folders the command will need to reference as host-mounts for the container.

For the overall help:

```shell
docker run --rm -it --security-opt=label=disable \
   localhost/google-photos-migrate:latest \
     --help
```

## Further steps

- If you use Linux + Android, you might want to check out the scripts I used to locate duplicate media and keep the better versions in the [android-dups](./android-dups/) directory.
- Use a tool like [Immich](https://github.com/immich-app/immich) and upload your photos

## Development

**Prerec**: Must have node 18 & yarn installed.

To test the app:

```bash
git clone https://github.com/garzj/google-photos-migrate
cd google-photos-migrate
yarn
yarn dev <subcommand>
```

The entrypoint of the cli is in `src/cli.ts` and library code should be exported from `src/index.ts`.
