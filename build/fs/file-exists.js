"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileExists = void 0;
const promises_1 = require("fs/promises");
const fileExists = (path) => (0, promises_1.stat)(path)
    .then(() => true)
    .catch((e) => (e.code === 'ENOENT' ? false : Promise.reject(e)));
exports.fileExists = fileExists;
