# google-photos-migrate

<details>
  <summary>Table of contents</summary>
  
- [Project info](#project-info)
- [Run this tool](#run-this-tool)
  - [Natively](#natively)
  - [Docker](#docker)
- [Further steps](#further-steps)
- [Development](#development)
  - [Build instructions](#build-instructions)
  - [Watch file changes](#watch-file-changes)

</details>

## Project info

A tool like [google-photos-exif](https://github.com/mattwilson1024/google-photos-exif), but does some extra things:

- uses the titles from the .json file to recover previous filenames
- moves duplicates into their own folder
- tries to match files by the title in their .json file
- fixes wrong extensions, identified by [ExifTool](https://exiftool.org/) (or use `--skip-corrections`)
- video files won't show up as from 1970
- works for English, German, French, Turkish, Russian and Spanish (for more langs fix [this file](./src/config/langs.ts))
- supported extensions can be found and configured in [extensions.ts](./src/config/extensions.ts)

## Run this tool

**Note:** On Windows, make sure to use double quotes `"` instead of `'`.

### Natively

**Prerec**: Must have at least node 18 & yarn installed.

#### Full structured migration

If you wish to migrate an entire takeout folder (and keep the album directory structure):

```bash
mkdir output error

npx google-photos-migrate@latest full '/path/to/takeout' './output' './error' --timeout 60000
```

The folder names in the `output` and `error` directories will now correspond to the original album names.

#### Flat migration

If you wish to migrate your Google Photos folder into a flat directory (and don't care about albums):

```bash
mkdir output error

npx google-photos-migrate@latest flat '/path/to/takeout/Google Photos' './output' './error' --timeout 60000
```

#### Optional flags (see `--help` for all details):

```
--timeout integer
    Shorthand: -t integer
    Meaning: Sets the timeout for exiftool, default is 30000 (30s)
--force
    Shorthand: -f
    Meaning: Forces the migration and overwrites files in the target directory.
```

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

To run the full migration:

```shell
mkdir output error
docker run --rm -it --security-opt=label=disable \
    -v "$(readlink -e path/to/takeout):/takeout" \
    -v "$(readlink -e ./output):/output" \
    -v "$(readlink -e ./error):/error" \
   localhost/google-photos-migrate:latest \
     full '/takeout' '/output' '/error' --timeout=60000
```

To run the flat migration:

```shell
mkdir output error
docker run --rm -it --security-opt=label=disable \
    -v "$(readlink -e path/to/takeout):/takeout" \
    -v "$(readlink -e ./output):/output" \
    -v "$(readlink -e ./error):/error" \
   localhost/google-photos-migrate:latest \
     flat '/takeout/Google Fotos' '/output' '/error' --timeout=60000
```

All other options are also available. The only difference from running it natively is the lack of (possible) hardware acceleration, and the need to explicitly add any folders the command will need to reference as host-mounts for the container.

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

### Build instructions

**Prerec**: Must have [Node](https://nodejs.org/en/download) 18 & yarn installed.

To build and run the app:

```bash
git clone https://github.com/garzj/google-photos-migrate
cd google-photos-migrate
yarn
yarn build
yarn start <subcommand>
```

### Watch file changes

Use `yarn dev` to watch for file changes and make sure to pass the `-f` flag to overwrite migrated files after restarts.

The entrypoint of the cli is in `src/cli.ts` and library code should be exported from `src/index.ts`.
