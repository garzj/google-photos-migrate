"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedExtensions = void 0;
const MetaType_1 = require("../media/MetaType");
exports.supportedExtensions = [
    { suffix: '.jpg', metaType: MetaType_1.MetaType.EXIF },
    { suffix: '.jpeg', metaType: MetaType_1.MetaType.EXIF },
    { suffix: '.png', metaType: MetaType_1.MetaType.EXIF },
    { suffix: '.raw', metaType: MetaType_1.MetaType.NONE },
    { suffix: '.ico', metaType: MetaType_1.MetaType.NONE },
    { suffix: '.tiff', metaType: MetaType_1.MetaType.EXIF },
    { suffix: '.webp', metaType: MetaType_1.MetaType.EXIF },
    { suffix: '.heic', metaType: MetaType_1.MetaType.QUICKTIME },
    { suffix: '.heif', metaType: MetaType_1.MetaType.QUICKTIME },
    { suffix: '.gif', metaType: MetaType_1.MetaType.NONE },
    {
        suffix: '.mp4',
        metaType: MetaType_1.MetaType.QUICKTIME,
        aliases: ['.heic', '.jpg', '.jpeg'], // Live photos
    },
    {
        suffix: '.mov',
        metaType: MetaType_1.MetaType.QUICKTIME,
        aliases: ['.heic', '.jpg', '.jpeg'], // Live photos
    },
    { suffix: '.qt', metaType: MetaType_1.MetaType.QUICKTIME },
    { suffix: '.mov.qt', metaType: MetaType_1.MetaType.QUICKTIME },
    { suffix: '.3gp', metaType: MetaType_1.MetaType.QUICKTIME },
    { suffix: '.mp4v', metaType: MetaType_1.MetaType.QUICKTIME },
    { suffix: '.mkv', metaType: MetaType_1.MetaType.NONE },
    { suffix: '.wmv', metaType: MetaType_1.MetaType.NONE },
    { suffix: '.webm', metaType: MetaType_1.MetaType.NONE },
].flatMap((e) => {
    var _a;
    const aliases = (_a = e.aliases) === null || _a === void 0 ? void 0 : _a.flatMap((s) => [s.toLowerCase(), s.toUpperCase()]);
    return [
        Object.assign(Object.assign({}, e), { suffix: e.suffix.toLowerCase(), aliases }),
        Object.assign(Object.assign({}, e), { suffix: e.suffix.toUpperCase(), aliases }),
    ];
});
