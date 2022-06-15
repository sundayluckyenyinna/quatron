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
const electron_1 = require("electron");
const jquery_1 = __importDefault(require("jquery"));
const $ = jquery_1.default;
// Getters 
function getSelectYearAcademicTermDatabaseBackup() {
    return $('#select-year-database');
}
function getSelectTermAcademicTermDatabaseBackup() {
    return $('#select-term-database');
}
function getAcademicTermDatabaseBackupButton() {
    return $('#academic-term-database-backup');
}
function getSelectYearAcademicSessionDatabaseBackup() {
    return $('#select-year-session-database');
}
function getAcademicSessionDatabaseBackupButton() {
    return $('#academic-session-database-backup');
}
function getSelectYearReportsheetBackup() {
    return $('#select-year-reportsheet-backup');
}
function getSelectTermReportsheetBackup() {
    return $('#select-term-reportsheet-backup');
}
function getReportsheetInput() {
    return $('#reportsheet-input');
}
function getSelectYearBroadsheetBackup() {
    return $('#select-year-broadsheet-backup');
}
function getSelectTermBroadsheetBackup() {
    return $('#select-term-broadsheet-backup');
}
function getBroadsheetInput() {
    return $('#broadsheet-input');
}
function getSelectYearScoreBackup() {
    return $('#select-year-score-backup');
}
function getSelectTermScoreBackup() {
    return $('#select-term-score-backup');
}
function getScoreInput() {
    return $('#scores-input');
}
function getSelectYearOtherItemBackup() {
    return $('#select-year-other-backup');
}
function getSelectTermOtherItemBackup() {
    return $('#select-term-other-backup');
}
function getOtherItemInput() {
    return $('#other-input');
}
function getOtherDescription() {
    return $('#other-desc');
}
// function 
// This function returns all the possible school email addresses.
function getSchoolEmailAddresses() {
    return __awaiter(this, void 0, void 0, function* () {
        // tell the main process to give the string for all the addresses
        const emailString = yield electron_1.ipcRenderer.invoke('get-school-email-string');
        return emailString.split('#');
    });
}
// utility functions 
function compress(value) {
    value = value.toLowerCase();
    return value.split(' ').filter((token) => token !== '').join('_');
}
// returns the data object that will be used by the main process to back-up academic database to the email
function getAcademicTermBackupData() {
    var _a, _b;
    return {
        year: (_a = getSelectYearAcademicTermDatabaseBackup().val()) === null || _a === void 0 ? void 0 : _a.toString(),
        term: compress((_b = getSelectTermAcademicTermDatabaseBackup().val()) === null || _b === void 0 ? void 0 : _b.toString()),
        backupType: 'academic-term-database'
    };
}
function getAcademicSessionBackupData() {
    var _a;
    return {
        year: (_a = getSelectYearAcademicSessionDatabaseBackup().val()) === null || _a === void 0 ? void 0 : _a.toString(),
        backupType: 'academic-session-database'
    };
}
function getAcademicReportBackupData() {
    var _a, _b, _c;
    return {
        year: (_a = getSelectYearReportsheetBackup().val()) === null || _a === void 0 ? void 0 : _a.toString(),
        term: compress((_b = getSelectTermReportsheetBackup().val()) === null || _b === void 0 ? void 0 : _b.toString()),
        path: (_c = getReportsheetInput().val()) === null || _c === void 0 ? void 0 : _c.toString(),
        backupType: 'academic-reportsheet'
    };
}
function getAcademicBroadsheetBackupData() {
    var _a, _b, _c;
    return {
        year: (_a = getSelectYearBroadsheetBackup().val()) === null || _a === void 0 ? void 0 : _a.toString().trim(),
        term: compress((_b = getSelectTermBroadsheetBackup().val()) === null || _b === void 0 ? void 0 : _b.toString().trim()),
        path: (_c = getBroadsheetInput().val()) === null || _c === void 0 ? void 0 : _c.toString().trim(),
        backupType: 'academic-broadsheet'
    };
}
function getAcademicScoresBackupData() {
    var _a, _b, _c;
    return {
        year: (_a = getSelectYearScoreBackup().val()) === null || _a === void 0 ? void 0 : _a.toString().trim(),
        term: compress((_b = getSelectTermScoreBackup().val()) === null || _b === void 0 ? void 0 : _b.toString().trim()),
        path: (_c = getScoreInput().val()) === null || _c === void 0 ? void 0 : _c.toString().trim(),
        backupType: 'academic-scores'
    };
}
function getOtherItemsBackupData() {
    var _a, _b, _c, _d;
    const description = (_a = getOtherDescription().val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
    return {
        year: (_b = getSelectTermOtherItemBackup().val()) === null || _b === void 0 ? void 0 : _b.toString().trim(),
        term: compress((_c = getSelectTermOtherItemBackup().val()) === null || _c === void 0 ? void 0 : _c.toString().trim()),
        path: (_d = getOtherItemInput().val()) === null || _d === void 0 ? void 0 : _d.toString().trim(),
        description: description.charAt(0).toUpperCase() + description,
        backupType: 'other-items'
    };
}
$('#academic-term-database-backup').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO
        // await ipcRenderer.invoke('backup-academic-term-database', getAcademicTermBackupData());
        yield electron_1.ipcRenderer.invoke('backup-to-mail', getAcademicTermBackupData());
        return;
    });
});
$('#academic-session-database-backup').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield electron_1.ipcRenderer.invoke('backup-to-mail', getAcademicSessionBackupData());
    });
});
$('#academic-report-backup').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO
        yield electron_1.ipcRenderer.invoke('backup-to-mail', getAcademicReportBackupData());
    });
});
$('#backup-broadsheet').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO
        yield electron_1.ipcRenderer.invoke('backup-to-mail', getAcademicBroadsheetBackupData());
    });
});
$('#backup-scores').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO
        yield electron_1.ipcRenderer.invoke('backup-to-mail', getAcademicScoresBackupData());
    });
});
$('#backup-other-items').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO
        yield electron_1.ipcRenderer.invoke('backup-to-mail', getOtherItemsBackupData());
    });
});
$('.browse').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        // await the main process to get the path of the selected folder
        const folderPath = Object(yield electron_1.ipcRenderer.invoke('show-any-folder-chooser'))[0];
        // populate the input box beside it.
        const input = $(this).parent().parent().find('input[type=text]').first();
        input.val(folderPath);
    });
});
// populate all the select box for academic years
function populateAllSelectedBox() {
    return __awaiter(this, void 0, void 0, function* () {
        const academicYears = yield electron_1.ipcRenderer.invoke('academic-years');
        $('.select-year').each(function (index, element) {
            const selectBox = $(this);
            const fragment = $(document.createDocumentFragment());
            academicYears.forEach((year) => {
                const option = $('<option/>', { 'text': year });
                fragment.append(option);
            });
            selectBox.append(fragment);
        });
    });
}
document.body.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield populateAllSelectedBox();
    });
};
