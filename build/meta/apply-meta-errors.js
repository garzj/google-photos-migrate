"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingMetaError = exports.WrongExtensionError = exports.ExifToolError = exports.ApplyMetaError = void 0;
const MediaMigrationError_1 = require("../media/MediaMigrationError");
class ApplyMetaError extends MediaMigrationError_1.MediaMigrationError {
    constructor(failedMedia) {
        super(failedMedia);
    }
    toString() {
        return `Failed to apply meta tags on file: ${this.failedMedia.path}`;
    }
}
exports.ApplyMetaError = ApplyMetaError;
class ExifToolError extends ApplyMetaError {
    constructor(failedMedia, reason) {
        super(failedMedia);
        this.reason = reason;
    }
    toString() {
        return (`ExifTool failed to modify file: ${this.failedMedia.path}` +
            `\nReason: ${this.reason.message}`);
    }
}
exports.ExifToolError = ExifToolError;
class WrongExtensionError extends ApplyMetaError {
    constructor(failedMedia, expectedExt, actualExt) {
        super(failedMedia);
        this.expectedExt = expectedExt;
        this.actualExt = actualExt;
    }
    toString() {
        return `File has wrong file extension ${this.actualExt}, should be ${this.expectedExt}: ${this.failedMedia.path}`;
    }
}
exports.WrongExtensionError = WrongExtensionError;
class MissingMetaError extends ApplyMetaError {
    constructor(failedMedia, keyName) {
        super(failedMedia);
        this.keyName = keyName;
    }
    toString() {
        return (`Missing key ${this.keyName} from meta file: ${this.failedMedia.jsonPath}` +
            `\nOriginal file: ${this.failedMedia.path}`);
    }
}
exports.MissingMetaError = MissingMetaError;
