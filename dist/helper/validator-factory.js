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
Object.defineProperty(exports, "__esModule", { value: true });
const upload_validator_1 = require("./upload-validator");
class ValidatorFactory {
    constructor(fileType, fileReader, standardStudentnos) {
        this.fileType = fileType;
        this.fileReader = fileReader;
        this.standardStudentNos = standardStudentnos;
    }
    ;
    createValidator() {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.fileType) {
                case 'word': return new upload_validator_1.WordAndPdfUploadValidator(yield (this.fileReader).getRowObjects(), this.standardStudentNos);
                case 'pdf': return new upload_validator_1.WordAndPdfUploadValidator(yield this.fileReader.getRowObjects(), this.standardStudentNos);
                case 'excel': return new upload_validator_1.ExcelFileUploadValidator(this.standardStudentNos, this.fileReader);
            }
            ;
            return null;
        });
    }
}
exports.default = ValidatorFactory;
