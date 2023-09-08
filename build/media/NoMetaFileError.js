"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoMetaFileError = void 0;
const MediaMigrationError_1 = require("./MediaMigrationError");
class NoMetaFileError extends MediaMigrationError_1.MediaMigrationError {
    toString() {
        return `Unable to locate meta file for: ${this.failedMedia.path}`;
    }
}
exports.NoMetaFileError = NoMetaFileError;
