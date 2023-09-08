"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedExtensions = exports.migrateGoogleDir = void 0;
require("./config/env");
const migrate_google_dir_1 = require("./media/migrate-google-dir");
Object.defineProperty(exports, "migrateGoogleDir", { enumerable: true, get: function () { return migrate_google_dir_1.migrateGoogleDir; } });
const extensions_1 = require("./config/extensions");
Object.defineProperty(exports, "supportedExtensions", { enumerable: true, get: function () { return extensions_1.supportedExtensions; } });
