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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateGoogleDirGen = exports.migrateGoogleDir = void 0;
const walk_dir_1 = require("../fs/walk-dir");
const path_1 = require("path");
const find_meta_file_1 = require("../meta/find-meta-file");
const apply_meta_file_1 = require("../meta/apply-meta-file");
const title_json_map_1 = require("./title-json-map");
const extensions_1 = require("../config/extensions");
const InvalidExtError_1 = require("./InvalidExtError");
const NoMetaFileError_1 = require("./NoMetaFileError");
const apply_meta_errors_1 = require("../meta/apply-meta-errors");
const exiftool_vendored_1 = require("exiftool-vendored");
const read_meta_title_1 = require("../meta/read-meta-title");
const save_to_dir_1 = require("./save-to-dir");
function migrateGoogleDir(args) {
    return __asyncGenerator(this, arguments, function* migrateGoogleDir_1() {
        var _a, e_1, _b, _c;
        const wg = [];
        try {
            for (var _d = true, _e = __asyncValues(migrateGoogleDirGen(args)), _f; _f = yield __await(_e.next()), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const result = _c;
                wg.push(result);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield __await(_b.call(_e));
            }
            finally { if (e_1) throw e_1.error; }
        }
        return yield __await(yield __await(Promise.all(wg)));
    });
}
exports.migrateGoogleDir = migrateGoogleDir;
function migrateGoogleDirGen(args) {
    var _a, _b, _c;
    return __asyncGenerator(this, arguments, function* migrateGoogleDirGen_1() {
        var _d, e_2, _e, _f;
        const migCtx = Object.assign(Object.assign({ titleJsonMap: yield __await((0, title_json_map_1.indexJsonFiles)(args.googleDir)), migrationLocks: new Map() }, args), { exiftool: (_a = args.exiftool) !== null && _a !== void 0 ? _a : new exiftool_vendored_1.ExifTool(), endExifTool: (_b = args.endExifTool) !== null && _b !== void 0 ? _b : !args.exiftool, warnLog: (_c = args.warnLog) !== null && _c !== void 0 ? _c : (() => { }) });
        try {
            for (var _g = true, _h = __asyncValues((0, walk_dir_1.walkDir)(args.googleDir)), _j; _j = yield __await(_h.next()), _d = _j.done, !_d; _g = true) {
                _f = _j.value;
                _g = false;
                const mediaPath = _f;
                if (mediaPath.endsWith('.json'))
                    continue;
                yield yield __await(migrateMediaFile(mediaPath, migCtx));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_g && !_d && (_e = _h.return)) yield __await(_e.call(_h));
            }
            finally { if (e_2) throw e_2.error; }
        }
        migCtx.endExifTool && migCtx.exiftool.end();
    });
}
exports.migrateGoogleDirGen = migrateGoogleDirGen;
function migrateMediaFile(originalPath, migCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const mediaFileInfo = {
            originalPath,
            path: originalPath,
        };
        const ext = extensions_1.supportedExtensions.reduce((longestMatch, cur) => {
            if (!originalPath.endsWith(cur.suffix))
                return longestMatch;
            if (longestMatch === null)
                return cur;
            return cur.suffix.length > longestMatch.suffix.length
                ? cur
                : longestMatch;
        }, null);
        if (!ext) {
            mediaFileInfo.path = yield (0, save_to_dir_1.saveToDir)(originalPath, migCtx.errorDir, migCtx);
            return new InvalidExtError_1.InvalidExtError(mediaFileInfo);
        }
        const jsonPath = yield (0, find_meta_file_1.findMetaFile)(originalPath, ext, migCtx);
        if (!jsonPath) {
            mediaFileInfo.path = yield (0, save_to_dir_1.saveToDir)(originalPath, migCtx.errorDir, migCtx);
            return new NoMetaFileError_1.NoMetaFileError(mediaFileInfo);
        }
        mediaFileInfo.jsonPath = jsonPath;
        mediaFileInfo.path = yield (0, save_to_dir_1.saveToDir)(originalPath, migCtx.outputDir, migCtx, false, yield (0, read_meta_title_1.readMetaTitle)(mediaFileInfo));
        const mediaFile = Object.assign(Object.assign({}, mediaFileInfo), { ext,
            jsonPath });
        let err = yield (0, apply_meta_file_1.applyMetaFile)(mediaFile, migCtx);
        if (!err) {
            return mediaFile;
        }
        if (err instanceof apply_meta_errors_1.WrongExtensionError) {
            const oldBase = (0, path_1.basename)(mediaFile.path);
            const newBase = oldBase.slice(0, oldBase.length - err.expectedExt.length) + err.actualExt;
            mediaFile.path = yield (0, save_to_dir_1.saveToDir)(mediaFile.path, migCtx.outputDir, migCtx, true, newBase);
            migCtx.warnLog(`Renamed wrong extension ${err.expectedExt} to ${err.actualExt}: ${mediaFile.path}`);
            err = yield (0, apply_meta_file_1.applyMetaFile)(mediaFile, migCtx);
            if (!err) {
                return mediaFile;
            }
        }
        const savedPaths = yield Promise.all([
            (0, save_to_dir_1.saveToDir)(mediaFile.path, migCtx.errorDir, migCtx, true),
            (0, save_to_dir_1.saveToDir)(mediaFile.jsonPath, migCtx.errorDir, migCtx),
        ]);
        mediaFile.path = savedPaths[0];
        return err;
    });
}
