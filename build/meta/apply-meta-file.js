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
exports.applyMetaFile = void 0;
const ts_1 = require("../ts");
const MetaType_1 = require("../media/MetaType");
const promises_1 = require("fs/promises");
const apply_meta_errors_1 = require("./apply-meta-errors");
function applyMetaFile(mediaFile, migCtx) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const metaJson = (yield (0, promises_1.readFile)(mediaFile.jsonPath)).toString();
        const meta = JSON.parse(metaJson);
        const timeTakenTimestamp = (_a = meta === null || meta === void 0 ? void 0 : meta.photoTakenTime) === null || _a === void 0 ? void 0 : _a.timestamp;
        if (timeTakenTimestamp === undefined)
            return new apply_meta_errors_1.MissingMetaError(mediaFile, 'photoTakenTime');
        const timeTaken = new Date(parseInt(timeTakenTimestamp) * 1000);
        // always UTC as per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
        const timeTakenUTC = timeTaken.toISOString();
        const tags = {};
        switch (mediaFile.ext.metaType) {
            case MetaType_1.MetaType.EXIF:
                tags.SubSecDateTimeOriginal = timeTakenUTC;
                tags.SubSecCreateDate = timeTakenUTC;
                tags.SubSecModifyDate = timeTakenUTC;
                break;
            case MetaType_1.MetaType.QUICKTIME:
                tags.DateTimeOriginal = timeTakenUTC;
                tags.CreateDate = timeTakenUTC;
                tags.ModifyDate = timeTakenUTC;
                tags.TrackCreateDate = timeTakenUTC;
                tags.TrackModifyDate = timeTakenUTC;
                tags.MediaCreateDate = timeTakenUTC;
                tags.MediaModifyDate = timeTakenUTC;
                break;
            case MetaType_1.MetaType.NONE:
                break;
            default:
                (0, ts_1.exhaustiveCheck)(mediaFile.ext.metaType);
        }
        tags.FileModifyDate = timeTakenUTC;
        try {
            yield migCtx.exiftool.write(mediaFile.path, tags, [
                '-overwrite_original',
                '-api',
                'quicktimeutc',
            ]);
        }
        catch (e) {
            if (e instanceof Error) {
                const wrongExtMatch = e.message.match(/Not a valid (?<expected>\w+) \(looks more like a (?<actual>\w+)\)/);
                const expected = (_b = wrongExtMatch === null || wrongExtMatch === void 0 ? void 0 : wrongExtMatch.groups) === null || _b === void 0 ? void 0 : _b['expected'];
                const actual = (_c = wrongExtMatch === null || wrongExtMatch === void 0 ? void 0 : wrongExtMatch.groups) === null || _c === void 0 ? void 0 : _c['actual'];
                if (expected !== undefined && actual !== undefined) {
                    return new apply_meta_errors_1.WrongExtensionError(mediaFile, `.${expected.toLowerCase()}`, `.${actual.toLowerCase()}`);
                }
                return new apply_meta_errors_1.ExifToolError(mediaFile, e);
            }
            return new apply_meta_errors_1.ExifToolError(mediaFile, new Error(`${e}`));
        }
        return null;
    });
}
exports.applyMetaFile = applyMetaFile;
