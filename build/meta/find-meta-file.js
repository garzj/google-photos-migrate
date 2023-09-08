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
exports.findMetaFile = void 0;
const path_1 = require("path");
const file_exists_1 = require("../fs/file-exists");
function findMetaFile(mediaPath, ext, migCtx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const title = (0, path_1.basename)(mediaPath);
        // Most json files can be matched by indexed titles
        const indexedJson = migCtx.titleJsonMap.get(title);
        if (indexedJson) {
            const sameFolder = indexedJson.filter((jsonPath) => (0, path_1.dirname)(jsonPath) === (0, path_1.dirname)(mediaPath));
            if (sameFolder.length === 1) {
                return sameFolder[0];
            }
        }
        // Otherwise, try (from most to least significant)
        const potPaths = new Set();
        const pushWithPotExt = (base, potExt) => {
            var _a, _b;
            const potBases = [];
            // <name>(.<ext|extAlias>)?.json
            potBases.push(`${base}${potExt}`);
            // Stolen from https://github.com/mattwilson1024/google-photos-exif/blob/master/src/helpers/get-companion-json-path-for-media-file.ts
            const nameCounterMatch = base.match(/(?<name>.*)(?<counter>\(\d+\))$/);
            const name = (_a = nameCounterMatch === null || nameCounterMatch === void 0 ? void 0 : nameCounterMatch.groups) === null || _a === void 0 ? void 0 : _a['name'];
            const counter = (_b = nameCounterMatch === null || nameCounterMatch === void 0 ? void 0 : nameCounterMatch.groups) === null || _b === void 0 ? void 0 : _b['counter'];
            if (name !== undefined && counter !== undefined) {
                // <file>(.<ext|extAlias>)?(n).json
                potBases.push(`${name}${potExt}${counter}`);
            }
            // <file>(_n-?|_n?|_?)(.<ext|extAlias>)?.json
            if (base.endsWith('_n-') || base.endsWith('_n') || base.endsWith('_')) {
                potBases.push(`${base.slice(0, -1)}${potExt}`);
            }
            for (const potBase of potBases) {
                potPaths.add(`${potBase}.json`);
            }
        };
        let base = mediaPath.slice(0, mediaPath.length - ext.suffix.length);
        base = base.replace(/-(edited|bearbeitet|modifié)$/i, '');
        const potExts = [];
        // <name>.<ext>.json
        potExts.push(ext.suffix);
        // <name>.<extAlias>.json
        potExts.push(...((_a = ext.aliases) !== null && _a !== void 0 ? _a : []));
        // <name>.json
        potExts.push('');
        for (const potExt of potExts) {
            pushWithPotExt(base, potExt);
        }
        for (const potPath of potPaths) {
            if (!(yield (0, file_exists_1.fileExists)(potPath))) {
                continue;
            }
            return potPath;
        }
        return null;
    });
}
exports.findMetaFile = findMetaFile;
