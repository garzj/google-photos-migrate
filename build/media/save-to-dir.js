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
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToDir = void 0;
const path_1 = require("path");
const file_exists_1 = require("../fs/file-exists");
const sanitize = require("sanitize-filename");
const promises_1 = require("fs/promises");
function _saveToDir(file, destDir, saveBase, move = false, duplicateIndex = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        const saveDir = (0, path_1.resolve)(destDir, duplicateIndex > 0 ? `duplicates-${duplicateIndex}` : '.');
        yield (0, promises_1.mkdir)(saveDir, { recursive: true });
        const savePath = (0, path_1.resolve)(saveDir, saveBase);
        const exists = yield (0, file_exists_1.fileExists)(savePath);
        if (exists) {
            return _saveToDir(file, destDir, saveBase, move, duplicateIndex + 1);
        }
        if (move) {
            yield (0, promises_1.rename)(file, savePath);
        }
        else {
            yield (0, promises_1.copyFile)(file, savePath);
        }
        return savePath;
    });
}
/** Copies or moves a file to dir, saves duplicates in subfolders and returns the new path.
 * Atomic within this app, sanitizes filenames.
 */
function saveToDir(file, destDir, migCtx, move = false, saveBase) {
    return __awaiter(this, void 0, void 0, function* () {
        saveBase = saveBase !== null && saveBase !== void 0 ? saveBase : (0, path_1.basename)(file);
        const sanitized = sanitize(saveBase, { replacement: '_' });
        if (saveBase != sanitized) {
            migCtx.warnLog(`Sanitized file: ${file}` + '\nNew filename: ${sanitized}');
        }
        const lcBase = saveBase.toLowerCase();
        let lock;
        while ((lock = migCtx.migrationLocks.get(lcBase))) {
            yield lock;
        }
        lock = _saveToDir(file, destDir, sanitized, move);
        migCtx.migrationLocks.set(lcBase, lock);
        try {
            return yield lock;
        }
        finally {
            migCtx.migrationLocks.delete(lcBase);
        }
    });
}
exports.saveToDir = saveToDir;
