"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const cmd_ts_1 = require("cmd-ts");
const migrate_google_dir_1 = require("./media/migrate-google-dir");
const is_empty_dir_1 = require("./fs/is-empty-dir");
const exiftool_vendored_1 = require("exiftool-vendored");
const glob_1 = require("glob");
const path_1 = require("path");
const path = require("path");
const unzip = (0, cmd_ts_1.command)({
    name: 'unzipper',
    args: {},
    handler: () => __awaiter(void 0, void 0, void 0, function* () { }),
});
function runBasicMigration(googleDir, outputDir, errorDir, exifTool) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Started migration.`);
        const migGen = (0, migrate_google_dir_1.migrateGoogleDirGen)({
            googleDir,
            outputDir,
            errorDir,
            warnLog: console.error,
            exiftool: exifTool,
            endExifTool: true,
        });
        const counts = { err: 0, suc: 0 };
        try {
            for (var _d = true, migGen_1 = __asyncValues(migGen), migGen_1_1; migGen_1_1 = yield migGen_1.next(), _a = migGen_1_1.done, !_a; _d = true) {
                _c = migGen_1_1.value;
                _d = false;
                const result = _c;
                if (result instanceof Error) {
                    console.error(`Error: ${result}`);
                    counts.err++;
                    continue;
                }
                counts.suc++;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = migGen_1.return)) yield _b.call(migGen_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        console.log(`Done! Processed ${counts.suc + counts.err} files.`);
        console.log(`Files migrated: ${counts.suc}`);
        console.log(`Files failed: ${counts.err}`);
    });
}
function runMigrationsChecked(albumDir, outDir, errDir, timeout, exifTool, check_errDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const errs = [];
        if (!(0, fs_1.existsSync)(albumDir)) {
            errs.push('The specified google directory does not exist.');
        }
        if (!(0, fs_1.existsSync)(outDir)) {
            errs.push('The specified output directory does not exist.');
        }
        if (!(0, fs_1.existsSync)(errDir)) {
            errs.push('The specified error directory does not exist.');
        }
        if (errs.length !== 0) {
            errs.forEach((e) => console.error(e));
            process.exit(1);
        }
        yield runBasicMigration(albumDir, outDir, errDir, exifTool);
        if (check_errDir && !(yield (0, is_empty_dir_1.isEmptyDir)(errDir))) {
            const errFiles = yield (0, glob_1.glob)(`${errDir}/*`);
            for (let file of errFiles) {
                yield exifTool.rewriteAllTags(file, path.join(albumDir, (0, path_1.basename)(file)));
            }
            yield runMigrationsChecked(albumDir, outDir, errDir, timeout, exifTool, false);
        }
    });
}
function processAlbums(rootDir, timeout, exifTool) {
    return __awaiter(this, void 0, void 0, function* () {
        const globStr = `${rootDir}/Albums/*/`;
        const albums = yield (0, glob_1.glob)(globStr);
        if (albums.length == 0) {
            console.log(`WARN: No albums found at ${globStr}`);
        }
        for (let album of albums) {
            console.log(`Processing album ${album}...`);
            let albumName = (0, path_1.basename)(album);
            let outDir = `${rootDir}/AlbumsProcessed/${albumName}`;
            let errDir = `${rootDir}/AlbumsError/${albumName}`;
            (0, fs_1.mkdirSync)(album, { recursive: true });
            (0, fs_1.mkdirSync)(outDir, { recursive: true });
            (0, fs_1.mkdirSync)(errDir, { recursive: true });
            yield runMigrationsChecked(album, outDir, errDir, timeout, exifTool, true);
        }
    });
}
function processPhotos(rootDir, timeout, exifTool) {
    return __awaiter(this, void 0, void 0, function* () {
        // Also run the exif fix for the photos
        console.log('Processing photos...');
        const albumDir = `${rootDir}/Photos`;
        const outDir = `${rootDir}/PhotosProcessed`;
        const errDir = `${rootDir}/PhotosError`;
        (0, fs_1.mkdirSync)(albumDir, { recursive: true });
        (0, fs_1.mkdirSync)(outDir, { recursive: true });
        (0, fs_1.mkdirSync)(errDir, { recursive: true });
        yield runMigrationsChecked(albumDir, outDir, errDir, timeout, exifTool, true);
    });
}
function _restructureIfNeeded(folders, targetDir) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((0, fs_1.existsSync)(targetDir) && ((yield (0, glob_1.glob)(`${targetDir}/*`)).length) > 0) {
            console.log(`${targetDir} exists and is not empty. No restructuring needed.`);
            return;
        }
        console.log(`Starting restructure of ${folders.length} directories`);
        (0, fs_1.mkdirSync)(targetDir, { recursive: true });
        for (let folder of folders) {
            console.log(`Copying ${folder} to ${targetDir}/${(0, path_1.basename)(folder)}`);
            (0, fs_1.cpSync)(folder, `${targetDir}/${(0, path_1.basename)(folder)}`, { recursive: true });
        }
        console.log(`Sucsessfully restructured ${folders.length} directories`);
    });
}
function restructureIfNeeded(rootDir) {
    return __awaiter(this, void 0, void 0, function* () {
        // before
        // $rootdir/My Album 1
        // $rootdir/My Album 2
        // $rootdir/Photos from 2008
        // after
        // $rootdir/Albums/My Album 1
        // $rootdir/Albums/My Album 2
        // $rootdir/Photos/Photos from 2008
        const photosDir = `${rootDir}/Photos`;
        // move the "Photos from $YEAR" directories to Photos/
        _restructureIfNeeded(yield (0, glob_1.glob)(`${rootDir}/Photos from */`), photosDir);
        // move everythingg else to Albums/, so we end up with two top level folders
        const fullSet = new Set(yield (0, glob_1.glob)(`${rootDir}/*/`));
        const photoSet = new Set(yield (0, glob_1.glob)(`${rootDir}/Photos from */`));
        photoSet.add(`${rootDir}/Photos`);
        const everythingExceptPhotosDir = Array.from(new Set([...fullSet].filter((x) => !photoSet.has(x))));
        _restructureIfNeeded(everythingExceptPhotosDir, `${rootDir}/Albums`);
    });
}
function run_full_migration(rootDir, timeout, exifTool) {
    return __awaiter(this, void 0, void 0, function* () {
        // at least in my takeout, the Takeout folder contains a subfolder
        // Takeout/Google Foto
        // rootdir refers to that subfolder
        rootDir = (yield (0, glob_1.glob)(`${rootDir}/Google*`))[0].replace(/\/+$/, '');
        yield restructureIfNeeded(rootDir);
        yield processAlbums(rootDir, timeout, exifTool);
        yield processPhotos(rootDir, timeout, exifTool);
        exifTool.end();
    });
}
const fullMigrate = (0, cmd_ts_1.command)({
    name: 'google-photos-migrate-full',
    args: {
        takeoutDir: (0, cmd_ts_1.positional)({
            type: cmd_ts_1.string,
            displayName: 'takeout_dir',
            description: 'The path to your "Takeout" directory.',
        }),
        force: (0, cmd_ts_1.flag)({
            short: 'f',
            long: 'force',
            description: "Forces the operation if the given directories aren't empty.",
        }),
        timeout: (0, cmd_ts_1.option)({
            type: cmd_ts_1.number,
            defaultValue: () => 30000,
            short: 't',
            long: 'timeout',
            description: 'Sets the task timeout in milliseconds that will be passed to ExifTool.',
        }),
    },
    handler: ({ takeoutDir, force, timeout }) => __awaiter(void 0, void 0, void 0, function* () {
        const errs = [];
        if (!(0, fs_1.existsSync)(takeoutDir)) {
            errs.push('The specified takeout directory does not exist.');
        }
        if (errs.length !== 0) {
            errs.forEach((e) => console.error(e));
            process.exit(1);
        }
        if (yield (0, is_empty_dir_1.isEmptyDir)(takeoutDir)) {
            errs.push('The google directory is empty. Nothing to do.');
        }
        if (errs.length !== 0) {
            errs.forEach((e) => console.error(e));
            process.exit(1);
        }
        const exifTool = new exiftool_vendored_1.ExifTool({ taskTimeoutMillis: timeout });
        run_full_migration(takeoutDir, timeout, exifTool);
    }),
});
const folderMigrate = (0, cmd_ts_1.command)({
    name: 'google-photos-migrate-folder',
    args: {
        googleDir: (0, cmd_ts_1.positional)({
            type: cmd_ts_1.string,
            displayName: 'google_dir',
            description: 'The path to your "Google Photos" directory.',
        }),
        outputDir: (0, cmd_ts_1.positional)({
            type: cmd_ts_1.string,
            displayName: 'output_dir',
            description: 'The path to your flat output directory.',
        }),
        errorDir: (0, cmd_ts_1.positional)({
            type: cmd_ts_1.string,
            displayName: 'error_dir',
            description: 'Failed media will be saved here.',
        }),
        force: (0, cmd_ts_1.flag)({
            short: 'f',
            long: 'force',
            description: "Forces the operation if the given directories aren't empty.",
        }),
        timeout: (0, cmd_ts_1.option)({
            type: cmd_ts_1.number,
            defaultValue: () => 30000,
            short: 't',
            long: 'timeout',
            description: 'Sets the task timeout in milliseconds that will be passed to ExifTool.',
        }),
    },
    handler: ({ googleDir, outputDir, errorDir, force, timeout }) => __awaiter(void 0, void 0, void 0, function* () {
        const errs = [];
        if (!(0, fs_1.existsSync)(googleDir)) {
            errs.push('The specified google directory does not exist.');
        }
        if (!(0, fs_1.existsSync)(outputDir)) {
            errs.push('The specified output directory does not exist.');
        }
        if (!(0, fs_1.existsSync)(errorDir)) {
            errs.push('The specified error directory does not exist.');
        }
        if (errs.length !== 0) {
            errs.forEach((e) => console.error(e));
            process.exit(1);
        }
        if (!force && !(yield (0, is_empty_dir_1.isEmptyDir)(outputDir))) {
            errs.push('The output directory is not empty. Pass "-f" to force the operation.');
        }
        if (!force && !(yield (0, is_empty_dir_1.isEmptyDir)(errorDir))) {
            errs.push('The error directory is not empty. Pass "-f" to force the operation.');
        }
        if (yield (0, is_empty_dir_1.isEmptyDir)(googleDir)) {
            errs.push('The google directory is empty. Nothing to do.');
        }
        if (errs.length !== 0) {
            errs.forEach((e) => console.error(e));
            process.exit(1);
        }
        const exifTool = new exiftool_vendored_1.ExifTool({ taskTimeoutMillis: timeout });
        yield runBasicMigration(googleDir, outputDir, errorDir, exifTool);
    }),
});
const app = (0, cmd_ts_1.subcommands)({
    name: 'google-photos-migrate',
    cmds: { fullMigrate, folderMigrate, unzip },
});
(0, cmd_ts_1.run)(app, process.argv.slice(2));
