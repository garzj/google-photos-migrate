"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaMigrationError = void 0;
class MediaMigrationError extends Error {
    constructor(failedMedia) {
        super();
        this.failedMedia = failedMedia;
    }
}
exports.MediaMigrationError = MediaMigrationError;
