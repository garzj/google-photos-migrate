"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidExtError = void 0;
const MediaMigrationError_1 = require("./MediaMigrationError");
class InvalidExtError extends MediaMigrationError_1.MediaMigrationError {
    toString() {
        return `File has invalid extension: ${this.failedMedia.path}`;
    }
}
exports.InvalidExtError = InvalidExtError;
