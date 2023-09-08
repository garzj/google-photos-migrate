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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexJsonFiles = void 0;
const promises_1 = require("fs/promises");
const walk_dir_1 = require("../fs/walk-dir");
const path_1 = require("path");
const MAX_BASE_LENGTH = 51;
function trimTitle(title) { }
function indexJsonFiles(googleDir) {
    var _a, e_1, _b, _c;
    var _d;
    return __awaiter(this, void 0, void 0, function* () {
        const titleJsonMap = new Map();
        try {
            for (var _e = true, _f = __asyncValues((0, walk_dir_1.walkDir)(googleDir)), _g; _g = yield _f.next(), _a = _g.done, !_a; _e = true) {
                _c = _g.value;
                _e = false;
                const jsonPath = _c;
                if (!jsonPath.endsWith('.json'))
                    continue;
                let title;
                try {
                    const data = JSON.parse((yield (0, promises_1.readFile)(jsonPath)).toString());
                    title = data.title;
                }
                catch (e) { }
                if (typeof title !== 'string')
                    continue;
                const potTitles = new Set();
                const ext = (0, path_1.extname)(title);
                const woExt = title.slice(0, -ext.length);
                const maxWoExt = MAX_BASE_LENGTH - ext.length;
                potTitles.add(woExt.slice(0, maxWoExt) + ext);
                potTitles.add((woExt + '-edited').slice(0, maxWoExt) + ext);
                potTitles.add((woExt + '-bearbeitet').slice(0, maxWoExt) + ext);
                for (const potTitle of potTitles) {
                    const jsonPaths = (_d = titleJsonMap.get(potTitle)) !== null && _d !== void 0 ? _d : [];
                    jsonPaths.push(jsonPath);
                    titleJsonMap.set(potTitle, jsonPaths);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_e && !_a && (_b = _f.return)) yield _b.call(_f);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return titleJsonMap;
    });
}
exports.indexJsonFiles = indexJsonFiles;
