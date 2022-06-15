"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
class SubjectNameExtractor {
    constructor(absolutePath) {
        this.absolutePath = absolutePath;
    }
    ;
    getAbsolutePath() {
        return this.absolutePath;
    }
    ;
    getOSPathSeparator() {
        return path_1.default.sep;
    }
    ;
    getFileName() {
        return path_1.default.basename(this.absolutePath);
    }
    ;
    getFileNameWithoutExtension() {
        const baseName = this.getFileName();
        return this.compress(baseName.substring(0, baseName.lastIndexOf('.')));
    }
    ;
    static getFileNameWithoutExtension(absolutePath) {
        return new SubjectNameExtractor(absolutePath).getFileNameWithoutExtension();
    }
    ;
    compress(value) {
        value = value.trim().toLowerCase(); // first trim the incoming string to sanitize it
        if (!value.includes(' ')) {
            return value;
        }
        ;
        return value.split(' ').filter(entry => entry !== '').join('_');
    }
    ;
}
exports.default = SubjectNameExtractor;
