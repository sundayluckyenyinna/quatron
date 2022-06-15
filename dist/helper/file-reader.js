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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelReader = exports.DocumentReader = exports.PDFReader = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const fs_1 = __importDefault(require("fs"));
const mammoth_1 = __importDefault(require("mammoth"));
const node_1 = __importDefault(require("read-excel-file/node"));
const node_2 = require("read-excel-file/node");
class PDFReader {
    constructor(absolutePath) {
        this.absolutePath = absolutePath;
    }
    ;
    getPdfExtract() {
        return __awaiter(this, void 0, void 0, function* () {
            let lineArray = [];
            const file = fs_1.default.readFileSync(this.absolutePath);
            try {
                const pdfExtract = yield (0, pdf_parse_1.default)(file);
                lineArray = pdfExtract.text.split('\n');
            }
            catch (error) {
                console.log(error);
            }
            return lineArray;
        });
    }
    ;
    getAllValidLines() {
        return __awaiter(this, void 0, void 0, function* () {
            const trimmed = (yield this.getPdfExtract()).join('#').trim();
            return trimmed.split('#').filter((line) => line !== '');
        });
    }
    ;
    getAllLinesCompressed() {
        return __awaiter(this, void 0, void 0, function* () {
            const scores = [];
            (yield this.getAllValidLines()).forEach((line) => {
                line = line.trim();
                const compressed = line.split(' ').join('#').toUpperCase().trim();
                const neatLine = compressed.split('#').filter(token => token !== '').join('#').toUpperCase();
                scores.push(neatLine);
            });
            return scores;
        });
    }
    ;
    getRowObjects() {
        return __awaiter(this, void 0, void 0, function* () {
            const rowObjectArray = [];
            (yield this.getAllLinesCompressed()).forEach(compressedLine => {
                const array = compressedLine.split('#');
                const object = {
                    studentNo: array[0].trim(),
                    caScore: Number(array[array.length - 2]),
                    examScore: Number(array[array.length - 1])
                };
                rowObjectArray.push(object);
            });
            return rowObjectArray;
        });
    }
    getAbsolutePath() {
        return this.absolutePath;
    }
}
exports.PDFReader = PDFReader;
class DocumentReader {
    constructor(absolutePath) {
        this.absolutePath = absolutePath;
    }
    ;
    getDocumentExtract() {
        return __awaiter(this, void 0, void 0, function* () {
            const text = (yield mammoth_1.default.extractRawText({ path: this.absolutePath })).value;
            return text.split('\n').filter(line => line !== '');
        });
    }
    getAllLinesCompressed() {
        return __awaiter(this, void 0, void 0, function* () {
            const compressedLineArray = [];
            (yield this.getDocumentExtract()).forEach(line => {
                const compressedLine = line.split('\t').filter(token => token !== '\t').join('#');
                const neatLine = compressedLine.split('#').filter(token => token !== '').join('#').toUpperCase();
                compressedLineArray.push(neatLine);
            });
            return compressedLineArray;
        });
    }
    // only studentNo, caScore and the examScore 
    getRowObjects() {
        return __awaiter(this, void 0, void 0, function* () {
            const rowObjectArray = [];
            (yield this.getAllLinesCompressed()).forEach(compressedLine => {
                const array = compressedLine.split('#');
                const object = {
                    studentNo: array[0].trim(),
                    caScore: Number(array[array.length - 2]),
                    examScore: Number(array[array.length - 1])
                };
                rowObjectArray.push(object);
            });
            return rowObjectArray;
        });
    }
    getAbsolutePath() {
        return this.absolutePath;
    }
}
exports.DocumentReader = DocumentReader;
;
class ExcelReader {
    constructor(absolutePath) {
        this.absolutePath = absolutePath;
    }
    getSchema() {
        return {
            'STUDENT_NO': { prop: 'studentNo', type: String },
            'SURNAME': { prop: 'surname', type: String },
            'FIRST_NAME': { prop: 'firstName', type: String },
            'MIDDLE_NAME': { prop: 'middleName', type: String },
            'CA_SCORE': { prop: 'caScore', type: Number },
            'EXAM_SCORE': { prop: 'examScore', type: Number },
            'AGE': { prop: 'age', type: Number }
        };
    }
    ;
    // TODO: the right sheet name
    getRowObjects(sheetName) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema();
            const result = yield (0, node_1.default)(this.absolutePath, { schema, sheet: sheetName });
            return result.rows;
        });
    }
    ;
    //TODO: he right sheet name.
    getErrorArray(sheetName) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema();
            const result = yield (0, node_1.default)(this.absolutePath, { schema, sheet: sheetName });
            return result.errors;
        });
    }
    getSheetNames() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, node_2.readSheetNames)(this.absolutePath);
        });
    }
    ;
    getAbsolutePath() {
        return this.absolutePath;
    }
}
exports.ExcelReader = ExcelReader;
