"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_reader_1 = require("./file-reader");
class FileReaderFactory {
    constructor(fileSettings) {
        this.fileSettings = fileSettings;
    }
    ;
    createFileReader() {
        switch (Object(this.fileSettings).fileType) {
            case 'word': return new file_reader_1.DocumentReader(Object(this.fileSettings).filePath);
            case 'pdf': return new file_reader_1.PDFReader(Object(this.fileSettings).filePath);
            case 'excel': return new file_reader_1.ExcelReader(Object(this.fileSettings).filePath);
            default: throw { message: 'Invalid file type', status: 403 };
        }
    }
}
exports.default = FileReaderFactory;
