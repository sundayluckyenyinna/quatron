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
$('#progress').remove();
// functions that invokes the main process
function getAcademicYearsFromMain() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('academic-years');
    });
}
;
function performUploadOfScores() {
    return __awaiter(this, void 0, void 0, function* () {
        if (getUploadType() === 'single_file_upload') {
            electron_1.ipcRenderer.invoke('upload-scores-single', getAllSelectBoxData());
            return;
        }
        ;
        electron_1.ipcRenderer.invoke('upload-scores-multiple', yield getAllSelectBoxDataForMultipleFileUpload());
    });
}
;
function showInValidSelectDialog() {
    electron_1.ipcRenderer.invoke('show-dialog', {
        message: 'Some fields were wrongly selected. \nEnsure that you select the correct options and then try again.\nEnsure that you have selected a file or a folder that contains the student scores to upload and try again.',
        title: 'Selection error',
        type: 'error'
    });
}
function showDialog(data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield electron_1.ipcRenderer.invoke('show-dialog', {
            message: data.message,
            title: data.title,
            type: data.type
        });
    });
}
// getter functions
function getAcademicYear() {
    var _a;
    return (_a = $('#select-year').val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
}
;
/**
 *
 */
function getTerm() {
    var _a;
    return compress((_a = $('#select-term').val()) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase());
}
;
function getClass() {
    var _a;
    return compressClass((_a = $('#select-class').val()) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase());
}
;
function getUploadType() {
    var _a;
    return compress((_a = $('#select-upload-type').val()) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase());
}
;
function getScoreType() {
    var _a;
    return compress((_a = $('#select-score-type').val()) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase());
}
;
function getFileType() {
    var _a;
    const raw = compress((_a = $('#select-file-type').val()) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase());
    return raw.substring(0, raw.indexOf('(') - 1);
}
;
function getPath() {
    var _a;
    return (_a = $('#path').val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
}
;
function getSubjectPaths() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('folder-path', getPath(), getAllSelectBoxData());
    });
}
;
function compress(value) {
    value = value.trim(); // first trim the incoming string to sanitize it
    if (!value.includes(' ')) {
        return value;
    }
    ;
    return value.split(' ').filter(entry => entry !== '').join('_');
}
;
function compressClass(clazz) {
    clazz = clazz.trim(); // first trim the incoming string to sanitize it
    if (!clazz.includes(' ')) {
        return clazz;
    }
    ;
    return clazz.split(' ').filter(entry => entry !== '').join('');
}
;
function getAllSelectBoxData() {
    return {
        year: getAcademicYear(),
        term: getTerm(),
        clazz: getClass(),
        uploadType: getUploadType(),
        scoreType: getScoreType(),
        fileType: getFileType(),
        filePath: getPath()
    };
}
;
function getAllSelectBoxDataForMultipleFileUpload() {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            year: getAcademicYear(),
            term: getTerm(),
            clazz: getClass(),
            uploadType: getUploadType(),
            scoreType: getScoreType(),
            fileType: getFileType(),
            folderPath: getPath(),
            filePaths: yield getSubjectPaths()
        };
    });
}
;
function getSelectedFileObject() {
    let fileObject = {};
    switch (getFileType()) {
        case 'word':
            fileObject.desc = 'Word Documents';
            fileObject.mediaType = 'docx';
            break;
        case 'pdf':
            fileObject.desc = 'PDF Documents';
            fileObject.mediaType = 'pdf';
            break;
        case 'excel':
            fileObject.desc = 'Excel Documents';
            fileObject.mediaType = 'xlsx';
            break;
    }
    ;
    return fileObject;
}
;
function getProgressBar() {
    return document.getElementById('progress');
}
;
function getProgressValue() {
    return getProgressBar().value;
}
;
function setMaxProgressValue(maxValue) {
    getProgressBar().max = maxValue;
}
;
function buttonClickHandlerForSingleFileSelection() {
    return __awaiter(this, void 0, void 0, function* () {
        const singleFilePath = yield electron_1.ipcRenderer.invoke('show-file-chooser', getSelectedFileObject());
        console.log(singleFilePath);
        $('#path').val(singleFilePath.trim());
    });
}
;
function buttonClickHandlerForMultipleFileSelection() {
    return __awaiter(this, void 0, void 0, function* () {
        const folderPath = (yield electron_1.ipcRenderer.invoke('show-directory-chooser'))[0];
        console.log(folderPath);
        $('#path').val(folderPath.trim());
    });
}
;
// ordinary function that populate the relevant fields
function populateAcademicYearSelectBox() {
    return __awaiter(this, void 0, void 0, function* () {
        const fragment = $(document.createDocumentFragment());
        (yield getAcademicYearsFromMain()).forEach((year) => {
            const option = $('<option/>', { 'text': year });
            fragment.append(option);
        });
        $('#select-year').append(fragment);
    });
}
;
function validateInputBeforeUpload() {
    let isValid = true;
    const select = 'select';
    if (getAcademicYear().includes(select)) {
        isValid = false;
    }
    ;
    if (getTerm().includes(select)) {
        isValid = false;
    }
    ;
    if (getClass().includes(select)) {
        isValid = false;
    }
    ;
    if (getUploadType().includes(select)) {
        isValid = false;
    }
    ;
    if (getScoreType().includes(select)) {
        isValid = false;
    }
    ;
    if (getFileType().includes(select) || getFileType() === "") {
        isValid = false;
    }
    ;
    if (getPath().length === 0 || getPath() === undefined) {
        isValid = false;
    }
    ;
    return isValid;
}
;
function selectFileTypeChangeHandler() {
    $('#select-upload-type').on('change', function (event) {
        const browse = document.getElementById('browse');
        if (getUploadType() === 'single_file_upload') {
            // remove the option of the folder selection of the file type field.
            $('.folder').css('display', 'none');
            $('.single-file').css('display', 'block');
            browse === null || browse === void 0 ? void 0 : browse.removeEventListener('click', buttonClickHandlerForSingleFileSelection);
            browse === null || browse === void 0 ? void 0 : browse.removeEventListener('click', buttonClickHandlerForMultipleFileSelection);
            browse === null || browse === void 0 ? void 0 : browse.addEventListener('click', buttonClickHandlerForSingleFileSelection);
            return;
        }
        if (getUploadType() === 'multiple_file_upload') {
            // remove the option of the single files selection of the file type filed
            $('.single-file').css('display', 'none');
            $('.folder').css('display', 'block');
            browse === null || browse === void 0 ? void 0 : browse.removeEventListener('click', buttonClickHandlerForSingleFileSelection);
            browse === null || browse === void 0 ? void 0 : browse.removeEventListener('click', buttonClickHandlerForMultipleFileSelection);
            browse === null || browse === void 0 ? void 0 : browse.addEventListener('click', buttonClickHandlerForMultipleFileSelection);
        }
        return;
    });
}
;
function getAllReadySubjectsNamesFromFolderPath() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('all-ready-subject-names-from-folder-path', getPath());
    });
}
;
function getRegisteredSubjects() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('level-subject-names', getAllSelectBoxData());
    });
}
;
function getUnregisteredSubjects(subjects, registered) {
    const unregistered = [];
    subjects.forEach((subject) => {
        if (!registered.includes(subject)) {
            unregistered.push(subject);
        }
        ;
    });
    return unregistered;
}
;
function expandNeat(subject) {
    subject = subject.trim();
    return subject.split('_').map((token) => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
}
;
function getDuplicateSubjects(free, insideExcel) {
    const duplicates = [];
    free.forEach((f) => {
        if (insideExcel.includes(f)) {
            duplicates.push(expandNeat(f));
        }
    });
    return duplicates;
}
;
// Verify that the file selected by the user is authentic
function verifyChoosenFile() {
    return __awaiter(this, void 0, void 0, function* () {
        // get the path of the selected file and act on it
        if (getUploadType() === 'multiple_file_upload') {
            // ensure that the user actually selected a folder without a dot
            if (getPath().indexOf('.') !== -1) {
                const data = {
                    message: 'The folder selected must not have a dot in its name. \nTry renaming the folder and try again',
                    title: 'Invalid folder name',
                    type: 'error'
                };
                yield showDialog(data);
                return false;
            }
            ;
            // getting here means that it passes the first test. Now confirm sync of subject names
            // get the names of the subjects represented by the files in the folder. word, pdf or excel.
            if ((yield getAllReadySubjectsNamesFromFolderPath()).length === 0) {
                const data = {
                    message: 'The folder selected is empty. This error might also occur if there are no Word, PDF or Excel files in this folder. Expected some Word, PDF or Excel files, but found none. \nPlease insert some Word, PDF or Excel files and try again.',
                    title: 'Invalid folder name',
                    type: 'error'
                };
                yield showDialog(data);
                return false;
            }
            ;
            const wordAndPdfs = Object(yield getAllReadySubjectsNamesFromFolderPath())[0];
            const excels = Object(yield getAllReadySubjectsNamesFromFolderPath())[1];
            const subjectNamesFromFolder = wordAndPdfs.concat(excels);
            // ensure that there are no subjects above that is not in the registered subjects
            const registeredSubjects = yield getRegisteredSubjects();
            const unregisteredSubjects = getUnregisteredSubjects(subjectNamesFromFolder, registeredSubjects);
            const duplicates = getDuplicateSubjects(wordAndPdfs, excels);
            if (duplicates.length !== 0) {
                const set = new Set();
                duplicates.forEach((d) => set.add(d));
                const singleDuplicates = [];
                set.forEach((sd) => singleDuplicates.push(sd));
                const duplicateMessage = singleDuplicates.map((duplicate) => duplicate + ' is a duplicate. This means that the subject with this name happens to be in an excel file located in the same folder as the file bearing this name.\nThis error can also occur if two or more files share the same name regardless of the spacing between, and around the spellings of their names.').join('\n\n') + '\n\nThere can be only one representation of a subject.';
                const solutionMessage = '\n\n\nPossible solution is to delete either the free file having this name in the selected folder, or delete the excel spreadsheet in one of the excel files in the same folder.';
                yield showDialog({
                    message: duplicateMessage + solutionMessage,
                    title: '  File error',
                    type: 'error'
                });
                return false;
            }
            if (unregisteredSubjects.length !== 0) {
                const unregisteredMessage = unregisteredSubjects.map((fault) => expandNeat(fault) + ' does not represent a registered subject').join('\n\n');
                const solutionMessage = '\n\n\nPossible solutions are as follows:\n\n-->Register all the subjects above\n-->Check that you have not made a typographical error in naming any of the files as the name of a subject. If this is the case, rename the file(s) correctly and try again\n-->Delete the files from the folder to continue.';
                yield showDialog({
                    message: unregisteredMessage + solutionMessage,
                    title: '  File error',
                    type: 'error'
                });
                return false;
            }
        }
        ;
        if (getUploadType() === 'single_file_upload') {
            // handle for both word and pdf documents
            if (getFileType() === 'word' || getFileType() === 'pdf') {
                // ensure that the file name of the user choice is a valid registered subject
                const filePath = getPath();
                const readyFilePath = yield electron_1.ipcRenderer.invoke('ready-filename-from-path', getPath());
                if (readyFilePath.includes('.') || readyFilePath.includes('/')) {
                    yield showDialog({
                        message: "File name should not contain special characters like '.' or '/' \n\nRename the file and try again. ",
                        title: '   File name error.',
                        type: 'error'
                    });
                    return false;
                }
                ;
                const readyFileName = yield electron_1.ipcRenderer.invoke('ready-filename-from-path', filePath);
                const registeredSubjects = yield getRegisteredSubjects();
                if (!registeredSubjects.includes(readyFileName)) {
                    yield showDialog({
                        message: "The name of the file does not map to any registered subjects. \n\nTry renaming the file to the name of a registered subject, or register a subject with this name.",
                        title: '   File name error.',
                        type: 'error'
                    });
                    return false;
                }
                ;
                // if all test are passed as a word or pdf file, retutn true.
                return true;
            }
            // then it must be an excel file. Get the sheet names and the registered subjects
            const registeredSubject = yield getRegisteredSubjects();
            const sheetNames = yield electron_1.ipcRenderer.invoke('excel-sheet-names', getPath());
            const readySheetNames = sheetNames.map((sheetName) => {
                return sheetName.trim().toLowerCase().split(' ').filter((token) => token !== '').join('_');
            });
            const unregisteredSubject = [];
            readySheetNames.forEach((readySheet) => {
                if (!registeredSubject.includes(readySheet)) {
                    unregisteredSubject.push(readySheet);
                }
                ;
            });
            if (unregisteredSubject.length !== 0) {
                const unregisteredMessage = unregisteredSubject.map((token) => expandNeat(token) + ' is not a representation of a registered subject!. \n\nThis implies that the name of the spreadsheet is wrongly spelt. If this is not the case, delete or move the spreadsheet to another location away from the chosen excel file and try again.').join('\n\n\n');
                yield showDialog({
                    message: unregisteredMessage,
                    title: 'File name error',
                    type: 'error'
                });
                return false;
            }
        }
        // getting here means that it is a single_file_upload. Now test that the subject names are in sync
        return true;
    });
}
;
// The function to call when the document body loads and is ready.
document.body.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield populateAcademicYearSelectBox();
        selectFileTypeChangeHandler();
        // set the handler for the upload button action
        $('#upload').on('click', function (event) {
            return __awaiter(this, void 0, void 0, function* () {
                const fileOkay = yield verifyChoosenFile();
                if (!fileOkay) {
                    return;
                }
                ;
                if (!validateInputBeforeUpload()) {
                    showInValidSelectDialog();
                    return;
                }
                ;
                performUploadOfScores();
            });
        });
    });
};
electron_1.ipcRenderer.on('update-max-progress-bar', function (event, value) {
    setMaxProgressValue(value);
});
electron_1.ipcRenderer.on('update-progress', function (event, value) {
    getProgressBar().style.visibility = 'visible';
    getProgressBar().value = getProgressValue() + 1;
});
