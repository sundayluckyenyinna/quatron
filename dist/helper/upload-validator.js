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
exports.ExcelFileUploadValidator = exports.WordAndPdfUploadValidator = void 0;
class WordAndPdfUploadValidator {
    constructor(rows, standardRows) {
        this.rows = rows;
        this.standardNos = standardRows;
    }
    getRows() {
        return this.rows.map((object, index) => {
            const copy = Object.assign({}, object);
            copy.rowNumber = index + 1;
            return copy;
        });
    }
    // functions to check the validity of a row object
    hasValidStudentNoByRegistration(testRow) {
        return this.getStandardStudentNos().includes(testRow.studentNo);
    }
    hasValidCaScore(testRow) {
        return String(testRow.caScore) === 'NaN' ? false : true;
    }
    ;
    hasValidExamScore(testRow) {
        return String(testRow.examScore) === 'NaN' ? false : true;
    }
    ;
    passAllCheck(testRow) {
        return this.hasValidStudentNoByRegistration(testRow) &&
            this.hasValidCaScore(testRow) &&
            this.hasValidExamScore(testRow);
    }
    ;
    getValidRowObjects() {
        const validRows = [];
        this.getRows().forEach((row) => {
            if (this.passAllCheck(row)) {
                validRows.push(row);
            }
            ;
        });
        return validRows;
    }
    ;
    getInvalidRowObject() {
        const invalidRows = [];
        this.getRows().forEach((row) => {
            if (!this.passAllCheck(row)) {
                row.error = this.generateAdequateError(row);
                invalidRows.push(row);
            }
            ;
        });
        return invalidRows;
    }
    ;
    getStandardStudentNos() {
        return this.standardNos;
    }
    ;
    // function to generate adequate error for the invalid object
    generateAdequateError(invalidRow) {
        const error = {};
        if (!this.hasValidStudentNoByRegistration(invalidRow)) {
            error.invalidNumberMessage = 'The number ' + invalidRow.studentNo + ' does not represent a valid Student No. registered for this class, for the specified year and term. You need to register the student with this Student No., or you likely want to correct the typographic error made in spelling out the Student No.';
        }
        ;
        if (!this.hasValidCaScore(invalidRow)) {
            error.invalidCaMessage = 'The CA score for the Student No. ' + invalidRow.studentNo + ' is of invalid type. A number is expected. It likely that you entered a text or you left the column empty. Enter a score or you can enter 0 if you mean that the candidate has no score for this particular subject.';
        }
        ;
        if (!this.hasValidExamScore(invalidRow)) {
            error.invalidExamMessage = 'The Exam score for the Student No. ' + invalidRow.studentNo + ' is of invalid type. A number is expected. It likely that you entered a text or you left the column empty. Enter a score or you can enter 0 if you mean that the candidate has no score for this particular subject.';
        }
        ;
        return error;
    }
}
exports.WordAndPdfUploadValidator = WordAndPdfUploadValidator;
;
class ExcelFileUploadValidator {
    constructor(standardNos, excelReader) {
        this.standardNos = standardNos;
        this.excelReader = excelReader;
    }
    ;
    getRows(sheetName) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.excelReader.getRowObjects(sheetName)).map((object, index) => {
                const copy = Object.assign({}, object);
                copy.rowNumber = index + 1;
                return copy;
            });
        });
    }
    hasValidStudentNoByRegistration(object) {
        return this.standardNos.includes(object.studentNo);
    }
    hasValidCaScore(object) {
        return object.caScore === undefined ? false : true;
    }
    hasValidExamScore(object) {
        return object.examScore === undefined ? false : true;
    }
    passAllCheck(object) {
        return this.hasValidStudentNoByRegistration(object) &&
            this.hasValidCaScore(object) &&
            this.hasValidExamScore(object);
    }
    ;
    getErrorArray(sheetName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.excelReader.getErrorArray(sheetName);
        });
    }
    getValidRowObjects(sheetName) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRows(sheetName)).filter((row) => this.passAllCheck(row));
        });
    }
    getInvalidRowObject(sheetName) {
        return __awaiter(this, void 0, void 0, function* () {
            const invalidRows = [];
            (yield this.getRows(sheetName)).forEach((object) => {
                if (!this.passAllCheck(object)) {
                    const error = this.generateAdequateError(object);
                    object.error = error;
                    invalidRows.push(object);
                }
            });
            return invalidRows;
        });
    }
    ;
    getAllPosiibleSheetsObject() {
        return __awaiter(this, void 0, void 0, function* () {
            const allSheetRecords = [];
            // get all the sheet names in an array
            const sheets = yield this.excelReader.getSheetNames();
            for (let i = 0; i < sheets.length; i++) {
                const all = {};
                const sheetName = sheets[i];
                // get both the valid and invalid row objects
                const validRows = yield this.getValidRowObjects(sheetName);
                const invalidRows = yield this.getInvalidRowObject(sheetName);
                // add it to the object using the sheetName as key. This is also the subject concerned
                all[this.compress(sheetName)] = { validRows: validRows, invalidRows: invalidRows };
                allSheetRecords.push(all);
            }
            ;
            return allSheetRecords;
        });
    }
    ;
    // function to generate adequate error for the invalid object
    generateAdequateError(invalidRow) {
        const error = {};
        if (!this.hasValidStudentNoByRegistration(invalidRow)) {
            error.invalidNumberMessage = 'The number ' + invalidRow.studentNo + ' does not represent a valid Student No. registered for this class, for the specified year and term. You need to register the student with this Student No., or you change it to a registered one if it is likely that you have made a typographical error.';
        }
        ;
        if (!this.hasValidCaScore(invalidRow)) {
            error.invalidCaMessage = 'The CA score for the Student No. ' + invalidRow.studentNo + ' is of invalid type. A number is expected in the column. It might be that you entered a text or you left it empty. You can enter 0 if you mean that the candidate has no score for this subject.';
        }
        ;
        if (!this.hasValidExamScore(invalidRow)) {
            error.invalidExamMessage = 'The Exam score for the Student No. ' + invalidRow.studentNo + ' is of invalid type. A number is expected in the column. It might be that you entered a text or you left it empty. You can enter 0 if you mean that the candidate has no score for this subject.';
        }
        ;
        return error;
    }
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
exports.ExcelFileUploadValidator = ExcelFileUploadValidator;
