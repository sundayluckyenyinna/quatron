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
const home_page_handler_1 = __importDefault(require("./handlers/home-page-handler"));
const path_1 = __importDefault(require("path"));
const window_config_1 = require("./config/window-config");
const build_helper_1 = __importDefault(require("./helper/build-helper"));
const error_config_1 = require("./config/error-config");
const concrete_repository_1 = __importDefault(require("./database/concrete/concrete-repository"));
const name_1 = __importDefault(require("./model/data/name"));
const personal_data_1 = __importDefault(require("./model/data/personal-data"));
const school_details_1 = __importDefault(require("./model/data/school-details"));
const student_1 = __importDefault(require("./model/student"));
const student_no_1 = __importDefault(require("./helper/student-no"));
const subject_1 = __importDefault(require("./model/subject"));
const fs_1 = __importDefault(require("fs"));
const electron_progressbar_1 = __importDefault(require("electron-progressbar"));
const pdf_merger_js_1 = __importDefault(require("pdf-merger-js"));
const electron_2 = require("electron");
const browser_1 = __importDefault(require("./helper/browser"));
const file_reader_1 = require("./helper/file-reader");
const score_uploader_1 = require("./helper/score-uploader");
const upload_validator_1 = require("./helper/upload-validator");
const file_reader_factory_1 = __importDefault(require("./helper/file-reader-factory"));
const validator_factory_1 = __importDefault(require("./helper/validator-factory"));
const file_subject_name_1 = __importDefault(require("./helper/file-subject-name"));
const email_sender_1 = __importDefault(require("./google/email-sender"));
const zip_folder_1 = __importDefault(require("./helper/zip-folder"));
const electron_3 = require("electron");
const grade_settings_1 = __importDefault(require("./model/grade-settings"));
// const worker = new Worker('./dist/workers/report-sheet-worker.js', { workerData : { message : 'I am good'} } );
// worker.on('message', function(value){
//     console.log( value );
// });
const pdf = require('html-pdf-node');
var studentData;
var additionalData;
var currentProgressBar;
var studentProfileData;
const browserMap = new Map();
var showingBrowser;
var shouldDoUpload = false;
var currentUploadWindow;
var subjectNames;
var payload;
var broadsheetFolderPath;
// variables to hold for the guest pages.
var subjectName;
/**
 * Set up the logic once the application is ready to show.
 */
electron_1.app.on('ready', function () {
    return __awaiter(this, void 0, void 0, function* () {
        /** Display the Home page to user */
        const win = new electron_1.BrowserWindow(window_config_1.HomeWindowConfig);
        win.loadFile(getRelativePathOfFile('home-page.html'));
        win.once('ready-to-show', function () {
            win.maximize();
            win.show();
        });
        electron_1.nativeTheme.themeSource = 'dark';
    });
});
electron_1.ipcMain.handle('all-or-single-students-report', function (event, payload, additionalPayload) {
    return __awaiter(this, void 0, void 0, function* () {
        const reportDatas = [];
        for (let i = 0; i < payload.length; i++) {
            // create a new invisble browser window 
            var win = new electron_1.BrowserWindow({
                show: false,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    webviewTag: true
                },
            });
            // update the studentData and additionalData variable for each student for each report sheet.
            studentData = payload[i];
            additionalData = additionalPayload;
            const studentId = [studentData.studentDetails.Surname, studentData.studentDetails.First_Name,
                studentData.studentDetails.Middle_Name, studentData.studentDetails.Student_No].join('_');
            yield win.loadFile(path_1.default.join(__dirname, 'ui', 'html', 'report-sheet.html'));
            const updatedHtml = yield win.webContents.executeJavaScript('document.documentElement.outerHTML');
            reportDatas.push({ studentId: studentId + '.pdf', html: updatedHtml });
        }
        ;
        // call the method to actually generate the report sheet
        generateReportSheetForSingleOrAllStudents(reportDatas, additionalPayload)
            .then((numberOfStudents) => {
            currentProgressBar.close();
            const messagePart = numberOfStudents > 1 ? 'Report sheets for all students' : 'Report sheet for student';
            electron_1.dialog.showMessageBoxSync({
                message: messagePart + ` generated\n\nDestination Folder: ${additionalPayload.rootFolder}\n\nNumber of student(s): ${numberOfStudents} `,
                title: 'Report sheet generation status',
                type: 'info',
            });
            return;
        })
            .catch(error => {
            // first close the current progressBar
            currentProgressBar.close();
            // display an error dialog
            electron_1.dialog.showMessageBoxSync({
                message: 'Some report sheets might have been opened on your PDF reader\nTry to close the opened report sheets and try again.',
                title: 'Access error',
                type: 'error'
            });
            return;
        });
    });
});
electron_1.ipcMain.handle('merge-reports', function (event, additionalPayload) {
    return __awaiter(this, void 0, void 0, function* () {
        // create a new progress bar
        const progressBar = new electron_progressbar_1.default({
            text: 'Merging report for ' + additionalPayload.clazz,
            detail: 'Report sheets merging...',
            abortOnError: true,
            browserWindow: {
                parent: electron_1.BrowserWindow.getFocusedWindow(),
                modal: true
            }
        });
        let destination;
        try {
            destination = yield mergeReports(additionalPayload);
        }
        catch (error) {
            progressBar.close();
            electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), {
                message: 'Some PDF files in the folder are corrupt. Delete some of the PDF files.\n\nIt is advisable that only the PDF of the student report sheets are stored in the chosen folder.',
                title: '   File error',
                type: 'error'
            });
            return;
        }
        ;
        // close the progress bar after 5 seconds of completion of merging process
        setTimeout(function () {
            progressBar.close();
        }, 5000);
        progressBar.on('aborted', function () {
            electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), {
                message: 'Report sheets for all students reports in selected folder saved and merged.',
                title: '  Merge success',
                type: 'info'
            });
            return;
        });
    });
});
function mergeReports(additionalPayload) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the list of all the pdfs to merge
        const reportSheets = [];
        const sheets = fs_1.default.readdirSync(additionalPayload.rootFolder)
            .filter((report) => report.endsWith('.pdf'));
        sheets.forEach(report => reportSheets.push(path_1.default.join(additionalPayload.rootFolder, report)));
        console.log(reportSheets);
        // create an instance of the PDFMerger
        const pdfMerger = new pdf_merger_js_1.default();
        for (let i = 0; i < reportSheets.length; i++) {
            pdfMerger.add(reportSheets[i]);
        }
        ;
        const destination = path_1.default.join(additionalPayload.rootFolder, additionalPayload.clazz + '_reports.pdf');
        try {
            yield pdfMerger.save(destination);
        }
        catch (error) {
            console.log(error);
        }
        ;
        return destination;
    });
}
;
function generateReportSheetForSingleOrAllStudents(reportData, additionalPayload) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the current BrowserWindow
        const win = electron_1.BrowserWindow.getFocusedWindow();
        // create a new progress bar
        const progressBar = new electron_progressbar_1.default({
            indeterminate: false,
            text: 'Preparing report for ' + additionalPayload.clazz,
            detail: 'Report sheets generation',
            initialValue: 0,
            maxValue: reportData.length,
            abortOnError: true,
            browserWindow: {
                parent: win || undefined
            }
        });
        currentProgressBar = progressBar;
        for (let i = 0; i < reportData.length; i++) {
            var reportObject = reportData[i];
            var html = reportObject.html;
            var reportSheetPath = path_1.default.join(additionalPayload.rootFolder, reportObject.studentId);
            yield pdf.generatePdf({ content: html }, { format: 'A4', path: reportSheetPath, printBackground: true });
            if (!progressBar.isCompleted()) {
                progressBar.value += 1;
            }
            ;
        }
        ;
        return reportData.length;
    });
}
;
electron_1.ipcMain.handle('upload-scores-single', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (payload.fileType === 'word' || payload.fileType === 'pdf') {
            yield handleSingleFileWordAndPdfScoreUpload(payload);
            return;
        }
        ;
        // then it is definitely excel file
        yield handleSingleFileExcelScoreUpload(payload);
        return;
    });
});
/**
 * payload {
 *      ...payload,
 *      filePaths : [...,...,...]
 * }
 */
electron_1.ipcMain.handle('upload-scores-multiple', function (event, payloads) {
    return __awaiter(this, void 0, void 0, function* () {
        // get all the file paths in the payload
        const files = payloads.filePaths;
        const wordAndPdfFiles = yield getAllRegisteredWordAndPdfFiles(files, payloads);
        const excelFiles = getAllExcelFile(files);
        const allReadyFiles = concatenateFiles(wordAndPdfFiles, excelFiles);
        const filePaths = allReadyFiles;
        const absolutePaths = files.filter((file) => !file.startsWith('~$')).map((file) => path_1.default.join(payloads.folderPath, file));
        const valids = [];
        const invalids = [];
        function getSubjectNameFromFileName(fileName) { return fileName.trim().toLowerCase().substring(0, fileName.lastIndexOf('.')); }
        ;
        function getSubjectNameFromAbsolutePath(abs) {
            return getSubjectNameFromFileName(path_1.default.basename(abs).trim()).split(' ').filter((token) => token !== '').join('_');
        }
        function isWord(abs) {
            return abs.substring(abs.lastIndexOf('.') + 1) === 'docx';
        }
        ;
        function isPdf(abs) { return abs.substring(abs.lastIndexOf('.') + 1) === 'pdf'; }
        ;
        function isExcel(abs) { return abs.substring(abs.lastIndexOf('.') + 1) === 'xlsx'; }
        ;
        const studentNos = (yield new concrete_repository_1.default().getAllStudentsByClass(payloads))
            .map((object) => object.Student_No);
        for (let i = 0; i < absolutePaths.length; i++) {
            const subjectObjectOverall = {};
            const subjectObjectValue = {};
            const absolutePath = absolutePaths[i];
            if (isWord(absolutePath) || isPdf(absolutePath)) {
                const fileType = isWord(absolutePath) ? 'word' : 'pdf';
                const subjectName = getSubjectNameFromAbsolutePath(absolutePath);
                const reader = new file_reader_factory_1.default({ filePath: absolutePath, fileType: fileType }).createFileReader();
                const fileValidator = yield new validator_factory_1.default(fileType, reader, studentNos).createValidator();
                // get the valid and the invalid rows
                const validRows = yield (fileValidator === null || fileValidator === void 0 ? void 0 : fileValidator.getValidRowObjects(''));
                const invalidRows = yield (fileValidator === null || fileValidator === void 0 ? void 0 : fileValidator.getInvalidRowObject(''));
                subjectObjectValue.validRows = validRows;
                subjectObjectValue.invalidRows = invalidRows;
                subjectObjectOverall[subjectName] = subjectObjectValue;
                if (invalidRows.length === 0) { // then the file contains only valid rows
                    // append it to the valids
                    valids.push(subjectObjectOverall);
                }
                else {
                    invalids.push(subjectObjectOverall);
                }
                ;
            }
            if (isExcel(absolutePath)) {
                // create the excel file reader 
                const excelReader = new file_reader_1.ExcelReader(absolutePath);
                // create the excel file validator
                const validator = new upload_validator_1.ExcelFileUploadValidator(studentNos, excelReader);
                // call the score uploader to upload all the subject
                const allSubjectsArray = yield validator.getAllPosiibleSheetsObject();
                const invalidsForExcel = getSubjectObjectsWithInvalidRows(allSubjectsArray);
                const validsForExcel = getSubjectObjectWithValidRows(allSubjectsArray);
                // concatenate the valids and invalids of the word, pdf and excels files
                validsForExcel.forEach((validRow) => valids.push(validRow));
                invalidsForExcel.forEach((invalidRow) => invalids.push(invalidRow));
                const uploadWindow = electron_1.BrowserWindow.getFocusedWindow();
                currentUploadWindow = uploadWindow;
            }
            ;
        }
        if (invalids.length !== 0) {
            showErrorPageWithInfoExcel(valids, invalids, payloads);
            return;
        }
        ;
        // This line means that all the subjects score rows are perfect.
        // combine all the subjects both the ones that has only valid rows and the ones that has both to upload their valid rows
        const allSubjectsArray = valids.concat(invalids);
        // get some info from the payload
        let clazz = payloads.clazz.toUpperCase();
        clazz = clazz.substring(0, 3) + ' ' + clazz.charAt(3);
        // create and start a progress bar
        const progress = new electron_progressbar_1.default({
            text: 'Automatic upload of scores for ' + clazz,
            detail: '',
            maxValue: allSubjectsArray.length,
            indeterminate: false,
            closeOnComplete: false,
            browserWindow: {
                parent: currentUploadWindow,
                modal: true
            }
        });
        // set the handler for the progressbar when it closes
        progress.on('completed', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield sleep(1000);
                progress.close();
                yield sleep(1000);
                electron_1.dialog.showMessageBoxSync({
                    message: 'Successful automatic upload of scores for ' + clazz + '\n\nNo errors found',
                    title: ' Success',
                    type: 'info'
                });
            });
        });
        // get the subjects names in this allSubjectArray 
        for (let i = 0; i < allSubjectsArray.length; i++) {
            // get the current object and retrieve the subject name 
            const subjectObject = allSubjectsArray[i];
            const subjectName = Object.keys(subjectObject)[0].toLowerCase();
            const validRows = subjectObject[subjectName].validRows;
            const databasePayload = Object.assign(Object.assign({}, payloads), { subject: subjectName });
            // sleep for somet time to avoid database shock
            yield sleep(1000);
            yield new score_uploader_1.SingleFileScoreUploader(validRows, databasePayload).uploadScores();
            if (!progress.isCompleted()) {
                progress.detail = 'Uploading scores for ' + expandNeat(subjectName);
                progress.value += 1;
            }
            ;
        }
        ;
    });
});
function handleSingleFileWordAndPdfScoreUpload(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // create a file reader
        const fileSettings = { filePath: payload.filePath, fileType: payload.fileType };
        const reader = new file_reader_factory_1.default(fileSettings).createFileReader();
        const studentNos = (yield new concrete_repository_1.default().getAllStudentsByClass(payload))
            .map((object) => object.Student_No);
        // create the validator
        const fileValidator = yield new validator_factory_1.default(payload.fileType, reader, studentNos).createValidator();
        // get the valid and the invalid row objects
        const validRows = yield (fileValidator === null || fileValidator === void 0 ? void 0 : fileValidator.getValidRowObjects(''));
        const invalidRows = yield (fileValidator === null || fileValidator === void 0 ? void 0 : fileValidator.getInvalidRowObject(''));
        // get the subject name and put it in the payload
        const subjectName = file_subject_name_1.default.getFileNameWithoutExtension(payload.filePath);
        const databasePayload = Object.assign(Object.assign({}, payload), { subject: subjectName });
        const uploadWindow = electron_1.BrowserWindow.getFocusedWindow();
        currentUploadWindow = uploadWindow;
        if ((invalidRows === null || invalidRows === void 0 ? void 0 : invalidRows.length) !== 0) {
            // show the error page
            showErrorPageWithInfo(validRows, invalidRows, databasePayload);
            return;
        }
        else {
            const clazz = payload.clazz.toUpperCase();
            const progress = new electron_progressbar_1.default({
                text: 'Automatic upload for ' + clazz.substring(0, 3) + ' ' + clazz.charAt(3),
                detail: 'No errors found',
            });
            yield new score_uploader_1.SingleFileScoreUploader(validRows, databasePayload).uploadScores();
            setTimeout(() => {
                progress.close();
                electron_1.dialog.showMessageBoxSync({
                    message: 'Successful automatic upload of scores for ' + clazz.substring(0, 3) + ' ' + clazz.charAt(3) + '\n\nNo errors found',
                    title: ' Success',
                    type: 'info'
                });
            }, 5000);
            return;
        }
        ;
    });
}
;
function showErrorPageWithInfo(validRows, invalidRows, databasePayload) {
    return __awaiter(this, void 0, void 0, function* () {
        const b = new electron_1.BrowserWindow({
            width: 600,
            height: 600,
            center: true,
            autoHideMenuBar: true,
            minimizable: false,
            maximizable: false,
            parent: electron_1.BrowserWindow.getFocusedWindow(),
            modal: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webviewTag: true
            }
        });
        electron_1.nativeTheme.themeSource = 'dark';
        yield b.loadURL(getRelativePathOfFile('invalid-rows-display.html'));
        b.on('ready-to-show', function () {
            b.show();
            b.webContents.send('show-invalid-rows', validRows, invalidRows, databasePayload);
        });
        return 1;
    });
}
function handleSingleFileExcelScoreUpload(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // create the excel file reader 
        const excelReader = new file_reader_1.ExcelReader(payload.filePath);
        // get the standard student nos
        const studentNos = (yield new concrete_repository_1.default().getAllStudentsByClass(payload))
            .map((object) => object.Student_No);
        // create the excel file validator
        const validator = new upload_validator_1.ExcelFileUploadValidator(studentNos, excelReader);
        // call the score uploader to upload all the subject
        const allSubjectsArray = yield validator.getAllPosiibleSheetsObject();
        const invalids = getSubjectObjectsWithInvalidRows(allSubjectsArray);
        const valids = getSubjectObjectWithValidRows(allSubjectsArray);
        const uploadWindow = electron_1.BrowserWindow.getFocusedWindow();
        currentUploadWindow = uploadWindow;
        console.log(invalids);
        if (invalids.length !== 0) {
            showErrorPageWithInfoExcel(valids, invalids, payload);
            return;
        }
        ;
        // this line reached means all subjects are perfect. Now starts a progress bar
        const clazz = payload.clazz.toUpperCase();
        const progress = new electron_progressbar_1.default({
            text: 'Automatic upload of scores for ' + clazz.substring(0, 3) + ' ' + clazz.charAt(3),
            detail: '',
            indeterminate: false,
            closeOnComplete: false,
            maxValue: allSubjectsArray.length,
            browserWindow: {
                parent: currentUploadWindow,
                modal: true
            }
        });
        progress.on('completed', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield sleep(1000);
                // close the progress and display a success dialog
                progress.close();
                // wait for 2 second before displaying final message dialog
                yield sleep(1000);
                const uploadNo = payload.uploadType === 'single_file_upload' ? 'Single file,' : 'Multiple files in folder,';
                const uploadType = allSubjectsArray.length > 1 ? uploadNo + ' multiple subjects' : uploadNo + ' single subject.';
                electron_1.dialog.showMessageBoxSync(currentUploadWindow, {
                    message: 'Successful upload of scores for ' + clazz + '\n\nUpload type: ' + uploadType,
                    title: 'Upload sucess',
                    type: 'info',
                });
                return;
            });
        });
        for (let i = 0; i < allSubjectsArray.length; i++) {
            // get the current object and retrieve the subject name 
            const subjectObject = allSubjectsArray[i];
            const subjectName = Object.keys(subjectObject)[0].toLowerCase();
            const validRows = subjectObject[subjectName].validRows;
            const databasePayload = Object.assign(Object.assign({}, payload), { subject: subjectName });
            // sleep to avoid database shock
            yield sleep(1000);
            yield new score_uploader_1.SingleFileScoreUploader(validRows, databasePayload).uploadScores();
            yield sleep(1000);
            // update the progress bar 
            if (!progress.isCompleted()) {
                progress.detail = 'Automatic upload of scores for ' + expandNeat(subjectName);
                progress.value += 1;
            }
            ;
        }
        ;
    });
}
;
function showErrorPageWithInfoExcel(valids, invalidRows, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const b = new electron_1.BrowserWindow({
            width: 600,
            height: 600,
            center: true,
            autoHideMenuBar: true,
            minimizable: false,
            maximizable: false,
            parent: electron_1.BrowserWindow.getFocusedWindow(),
            modal: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webviewTag: true
            }
        });
        electron_1.nativeTheme.themeSource = 'dark';
        yield b.loadURL(getRelativePathOfFile('invalid-rows-display-excel.html'));
        b.on('ready-to-show', function () {
            b.show();
            b.webContents.send('show-invalid-rows-excel', valids, invalidRows, payload);
        });
        return 1;
    });
}
;
function getSubjectObjectsWithInvalidRows(subjects) {
    const subjectsWithInvalidRows = [];
    subjects.forEach((subjectObject) => {
        const subjectName = Object.keys(subjectObject)[0];
        const subjectValue = subjectObject[subjectName];
        const invalidRow = subjectValue.invalidRows;
        const validRow = subjectValue.validRows;
        // it can have invalid rows but must at least gave some valid rows too
        if (invalidRow.length !== 0) {
            subjectsWithInvalidRows.push(subjectObject);
        }
        ;
    });
    return subjectsWithInvalidRows;
}
;
function getSubjectObjectWithValidRows(subjects) {
    const subjectsWithValidRows = [];
    subjects.forEach((subjectObject) => {
        const subjectName = Object.keys(subjectObject)[0];
        const subjectValue = subjectObject[subjectName];
        const invalidRow = subjectValue.invalidRows;
        if (invalidRow.length === 0) {
            subjectsWithValidRows.push(subjectObject);
        }
        ;
    });
    return subjectsWithValidRows;
}
;
electron_1.ipcMain.handle('update-scores-single-excel', function (event, submissionArray) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // close the current BrwoserWindow
        (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.close();
        let clazz = Object(submissionArray[0])[1].clazz;
        let uploadTypes = Object(submissionArray[0])[1].uploadType;
        clazz = clazz.substring(0, 3).toUpperCase() + ' ' + clazz.charAt(3);
        // start a progress bar if the number of subject
        const progress = new electron_progressbar_1.default({
            text: 'Automatic upload of scores for ' + clazz,
            detail: '',
            indeterminate: false,
            maxValue: submissionArray.length,
            closeOnComplete: false,
            browserWindow: {
                parent: currentUploadWindow,
                modal: true
            }
        });
        progress.on('completed', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield sleep(1000);
                // close the progress and display a success dialog
                progress.close();
                // wait for 2 second before displaying final message dialog
                yield sleep(1000);
                const uploadNo = uploadTypes === 'single_file_upload' ? 'Single file,' : 'Multiple files in folder,';
                const uploadType = submissionArray.length > 1 ? uploadNo + ' multiple subjects' : uploadNo + ' single subject.';
                electron_1.dialog.showMessageBoxSync(currentUploadWindow, {
                    message: 'Successful upload of scores for ' + clazz + '\n\nUpload type: ' + uploadType,
                    title: 'Upload sucess',
                    type: 'info',
                });
                return;
            });
        });
        // iterarte over and call the update method of the repository
        for (let i = 0; i < submissionArray.length; i++) {
            const readySubject = submissionArray[i];
            const validRowsOfSubject = readySubject[0];
            const payloadForSubject = readySubject[1];
            // call the update function
            yield new score_uploader_1.SingleFileScoreUploader(validRowsOfSubject, payloadForSubject).uploadScores();
            // sleep for some time
            yield sleep(1000);
            // update the value of the progress bar
            progress.detail = 'Automatically uploading scores for ' + expandNeat(payloadForSubject.subject);
            if (!progress.isCompleted()) {
                progress.value += 1;
            }
            ;
        }
        ;
    });
});
electron_1.ipcMain.handle('stop-excel-upload', function () {
    var _a;
    // close the error page window. It is the current showing that would showing at that time
    (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.close();
    return;
});
function sleep(timeInMilliseconds) {
    return new Promise(resolve => setTimeout(resolve, timeInMilliseconds));
}
;
function expandNeat(value) {
    return value.trim().split('_').map((token => token.charAt(0).toUpperCase() + token.substring(1))).join(' ');
}
;
electron_1.ipcMain.handle('folder-path', function (event, absolutePath, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return fs_1.default.readdirSync(absolutePath);
    });
});
electron_1.ipcMain.handle('student-data', function (event) {
    return [studentData, additionalData];
});
electron_1.ipcMain.handle('academic-years', function (event) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // get the academic years from the database.
        const academicYearsArray = yield new concrete_repository_1.default().getAcademicYears();
        (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.webContents.send('academic-years', academicYearsArray);
        return academicYearsArray;
    });
});
electron_1.ipcMain.handle('add-academic-year', function (event, data) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const done = yield new concrete_repository_1.default().createAcademicYear(data);
        if (!done) {
            throw new Error('Could not save academic year');
        }
        ;
        const message = { message: 'Successfully added an academic year', code: 200, status: 'OK' };
        const academicYearsArray = yield new concrete_repository_1.default().getAcademicYears();
        (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.webContents.send('add-academic-year', academicYearsArray);
        return;
    });
});
/**
 * Handlers for
 */
electron_1.ipcMain.handle('show', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (payload.fileType === undefined || payload.fileType === 'local') {
            // get the file and window settings from the id of the button clicked in the renderer.
            const filenameAndSettings = build_helper_1.default.mapFileFromButtonId(payload.id);
            const win = new electron_1.BrowserWindow(filenameAndSettings.windowSettings);
            yield new home_page_handler_1.default()
                .showLocalPage(getRelativePathOfFile(filenameAndSettings.filename), win);
            return;
        }
        ;
        if (payload.fileType === 'remote') {
            if (payload.url === undefined) {
                throw error_config_1.NoUrlError;
            }
            ;
            const win = new electron_1.BrowserWindow(window_config_1.RemotePageWindowConfig);
            yield new home_page_handler_1.default().showRemotePage(payload.url, win);
            return;
        }
        ;
        throw error_config_1.InvalidFileTypeError;
    });
});
electron_1.ipcMain.handle('show-dialog', function (event, payload) {
    const win = electron_1.BrowserWindow.getFocusedWindow();
    return electron_1.dialog.showMessageBoxSync(win, {
        message: payload.message,
        title: payload.title,
        type: payload.type
    });
});
/** Handlers for register students */
electron_1.ipcMain.handle('count-of-students', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const countOfStudents = yield (yield new concrete_repository_1.default().getNumberOfStudentsFromAllStudents(payload));
        return countOfStudents;
    });
});
electron_1.ipcMain.handle('student-no', function (event, payload) {
    return student_no_1.default.generateStudentNo(payload.date, payload.department, payload.id);
});
electron_1.ipcMain.handle('save-student', function (event, studentObjectLiteral) {
    return __awaiter(this, void 0, void 0, function* () {
        // create a student object from the object literal
        const name = name_1.default.NewInstance(studentObjectLiteral.name);
        const personalDetails = personal_data_1.default.NewInstance(studentObjectLiteral.personalDetails);
        const schoolDetails = school_details_1.default.NewInstance(studentObjectLiteral.schoolDetails);
        const subjects = String(studentObjectLiteral.subjects).split('#');
        const student = new student_1.default(name, personalDetails, schoolDetails, subjects);
        //construct the data info for the database to save the student
        const data = studentObjectLiteral.data;
        //save the student
        const isSuccessful = yield new concrete_repository_1.default().createStudent(data, student);
        return isSuccessful;
    });
});
electron_1.ipcMain.handle('save-subject', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const classArray = payload.level === 'junior' ? ['jss1', 'jss2', 'jss3'] : ['sss1', 'sss2', 'sss3'];
        const subject = new subject_1.default().setName(payload.subjectName).setLevel(payload.level);
        for (let i = 0; i < classArray.length; i++) {
            const data = { year: payload.academicYear, term: payload.academicTerm, clazz: classArray[i], department: payload.department };
            const done = yield (yield new concrete_repository_1.default().createSubject(data, subject));
            if (!done) {
                return;
            }
        }
        ;
        return true;
    });
});
electron_1.ipcMain.handle('level-subject-names', function (event, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new concrete_repository_1.default().getAllSubjectsNameForYearTermClass(data);
    });
});
electron_1.ipcMain.handle('all-subjects-object', function (event, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const subjectObjectArray = yield new concrete_repository_1.default().getAllSubjectObjectsForYearTermLevel(data);
        return subjectObjectArray;
    });
});
electron_1.ipcMain.handle('all-subject-names', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new concrete_repository_1.default().getAllSubjectNames();
    });
});
electron_1.ipcMain.handle('students-for-class', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield new concrete_repository_1.default().getAllStudentsByClass(payload);
        }
        catch (error) {
            return;
        }
    });
});
electron_1.ipcMain.handle('student-scores', function (event, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new concrete_repository_1.default().getAllStudentScores(data);
    });
});
electron_1.ipcMain.handle('show-directory-chooser', function (event) {
    return electron_1.dialog.showOpenDialogSync({
        properties: ['openDirectory'],
        filters: [{ name: 'PDF files', extensions: ['pdf'] }]
    });
});
electron_1.ipcMain.handle('show-any-folder-chooser', function (event) {
    return electron_1.dialog.showOpenDialogSync({
        properties: ['openDirectory']
    });
});
electron_1.ipcMain.handle('show-file-chooser', function (event, file) {
    var _a;
    return (_a = electron_1.dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [{ name: file.desc, extensions: [file.mediaType] }]
    })) === null || _a === void 0 ? void 0 : _a.pop();
});
electron_1.ipcMain.handle('show-file', function (event, file) {
    var _a;
    return (_a = electron_1.dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [{ name: file.desc, extensions: file.media }]
    })) === null || _a === void 0 ? void 0 : _a.pop();
});
electron_1.ipcMain.handle('all-or-single-students-data', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (payload.studentNo === 'All students in class') {
            return yield new concrete_repository_1.default().getAllStudentsDataForYearTermClass(payload);
        }
        ;
        return [yield new concrete_repository_1.default().getStudentDataForYearTermClass(payload)];
    });
});
electron_1.ipcMain.handle('update-scores-for-class', function (event, scores, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const done = yield new concrete_repository_1.default().updateStudentScoresForYearTermClass(scores, payload);
        if (done) {
            return electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), {
                message: 'Successful upload of student scores',
                title: 'Success',
                type: 'info'
            });
        }
        ;
        return;
    });
});
electron_1.ipcMain.handle('student-page', function (event, student, databaseInfo) {
    var _a;
    // create a new window and display the student
    student.clazz = databaseInfo.clazz;
    student.term = databaseInfo.term;
    student.year = databaseInfo.year;
    studentProfileData = student;
    (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.loadFile(path_1.default.join(__dirname, 'ui', 'html', 'student-profile-page.html'));
});
electron_1.ipcMain.handle('student-profile-data', function (event) {
    return studentProfileData;
});
electron_1.ipcMain.handle('update-student-data', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const bool = yield new concrete_repository_1.default().updateStudentDetails(payload);
        if (bool) {
            electron_1.dialog.showMessageBoxSync({
                message: 'Changes saved successfully',
                title: 'Successful update',
                type: 'info'
            });
        }
    });
});
electron_1.ipcMain.handle('update-student-passport-in-class', function (event, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const bool = yield new concrete_repository_1.default().updateStudentPassport(data);
        if (bool) {
            electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), {
                message: 'Passport updated successfully',
                title: 'Successful update',
                type: 'info'
            });
        }
    });
});
electron_1.ipcMain.handle('delete-student-from-class', function (event, data) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const bool = yield new concrete_repository_1.default().deleteStudentFromClassTable(data);
        if (bool) {
            // send to the renderer process that it is done
            (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.webContents.send('delete-student-done');
            electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), {
                message: 'Student deleted successfully',
                title: 'Successful update',
                type: 'info'
            });
            return;
        }
        ;
        console.log('something went wrong...');
    });
});
// Handle the showing of the remote page
electron_1.ipcMain.handle('show-remote-page', function () {
    const width = electron_2.screen.getPrimaryDisplay().workArea.width;
    const height = electron_2.screen.getPrimaryDisplay().workArea.height;
    let win = new electron_1.BrowserWindow({
        width: width,
        height: height,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });
    win.webContents.loadFile(path_1.default.join(__dirname, 'ui', 'html', 'remote-page.html'));
    win.on('ready-to-show', function () {
        win.show();
        win.maximize();
    });
    // create the first browser and add it to the window
    const browser = new browser_1.default('tab1', { width: width, height: height }, win);
    // add the browser to the map
    browserMap.set(browser.getId(), browser);
    win.addBrowserView(browser);
    showingBrowser = browser;
    electron_1.nativeTheme.themeSource = 'system';
});
electron_1.ipcMain.handle('show-new-browser', function (event, id) {
    // get the screen dimensions
    const width = electron_2.screen.getPrimaryDisplay().workArea.width;
    const height = electron_2.screen.getPrimaryDisplay().workArea.height;
    // hide all the previous browsers 
    browserMap.forEach((browser, key) => {
        browser.hide();
    });
    const win = electron_1.BrowserWindow.getFocusedWindow();
    const newBrowser = new browser_1.default(id, { width: width, height: height }, win);
    // add it to the map
    browserMap.set(newBrowser.getId(), newBrowser);
    win.addBrowserView(newBrowser);
    showingBrowser = newBrowser;
    electron_1.nativeTheme.themeSource = 'system';
});
electron_1.ipcMain.handle('show-current-browser', function (event, id) {
    const width = electron_2.screen.getPrimaryDisplay().workArea.width;
    const height = electron_2.screen.getPrimaryDisplay().workArea.height;
    // hide all other browsers
    browserMap.forEach((browser, key) => {
        browser.hide();
    });
    const currentBrowser = getBrowserById(id);
    currentBrowser.makeVisible({ width: width, height: height });
    showingBrowser = currentBrowser;
});
electron_1.ipcMain.handle('remove-current-tab', function (event, id) {
    var _a, _b, _c;
    (_a = getBrowserById(id)) === null || _a === void 0 ? void 0 : _a.hide(); // make it hide
    browserMap.delete(id); // delete it from the map
    (_b = electron_1.BrowserWindow.getFocusedWindow()) === null || _b === void 0 ? void 0 : _b.removeBrowserView(getBrowserById(id));
    // update the showing tab
    const preceedingTab = 'tab' + (Number(id.split('')[3]) - 1);
    showingBrowser = getBrowserById(preceedingTab);
    // check if no more browser showing and then close the window.
    if (!showingBrowser) {
        (_c = electron_1.BrowserWindow.getFocusedWindow()) === null || _c === void 0 ? void 0 : _c.close();
    }
    ;
});
electron_1.ipcMain.handle('print', function (event, d) {
    console.log(d);
    // console.log( getBrowserById(d));
});
electron_1.ipcMain.handle('go-back', function () {
    // let the showing browser go back
    showingBrowser.webContents.goBack();
});
electron_1.ipcMain.handle('go-forward', function () {
    // let the showing browser go forward
    showingBrowser.webContents.goForward();
});
electron_1.ipcMain.handle('reload', function () {
    // let the showing browser reload
    showingBrowser.webContents.reload();
});
electron_1.ipcMain.handle('continue-upload', function (event, validRows, invalidRows, databasePayload) {
    var _a;
    // first close the current window
    (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.close();
    const clazz = databasePayload.clazz.toUpperCase();
    // create a new progress bar
    const progress = new electron_progressbar_1.default({
        detail: 'Scores uploading...',
        text: 'Automatic upload of scores for ' + clazz.substring(0, 3) + ' ' + clazz.charAt(3),
        browserWindow: {
            parent: currentUploadWindow,
            modal: true
        }
    });
    new score_uploader_1.SingleFileScoreUploader(validRows, databasePayload);
    setTimeout(() => {
        progress.close();
        // notify the user when all is done and attach to the showing browser window.
        electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), {
            message: 'Upload completed successfully for this class and subject.',
            title: 'Upload success',
            type: 'info',
        });
    }, 5000);
    return;
});
electron_1.ipcMain.handle('stop-upload', function () {
    var _a;
    (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.close();
});
function compress(value) {
    value = value.trim(); // first trim the incoming string to sanitize it
    if (!value.includes(' ')) {
        return value;
    }
    ;
    return value.split(' ').filter(entry => entry !== '').join('_');
}
;
function filterFileBySubjectRegistration(allFiles, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // get all the subjects registered for this class in this year, term and class
        const registeredSubjects = yield new concrete_repository_1.default().getAllSubjectsNameForYearTermClass(payload);
        // return the list of those files 
        const filtered = allFiles.map((fileName) => compress(fileName).toLowerCase())
            .filter((fileName) => registeredSubjects.includes(fileName.substring(0, fileName.lastIndexOf('.'))));
        return filtered;
    });
}
;
function getAllRegisteredWordAndPdfFiles(files, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield filterFileBySubjectRegistration(files, payload))
            .filter((file) => file.endsWith('.docx') || file.endsWith('.pdf'));
    });
}
;
function getAllExcelFile(files) {
    return files.filter((file) => file.endsWith('.xlsx') && !file.startsWith('~$'));
}
;
function concatenateFiles(wordAndPdfFiles, excelFiles) {
    return wordAndPdfFiles.concat(excelFiles);
}
;
function getBrowserById(id) {
    return browserMap.get(id);
}
;
/**
 * Returns the relative path of a file given the file name.
 * @param filename string
 */
function getRelativePathOfFile(filename) {
    filename = filename.trim();
    return constructRelativePathPrefix([__dirname, 'ui', 'html']) + filename;
}
;
/**
 *
 * @param tokens string
 * @returns relativefolderpath : string
 */
function constructRelativePathPrefix(tokens) {
    var relativePath = tokens[0].trim();
    const osSeparator = getPlaformSeparator();
    tokens.filter(token => tokens.indexOf(token) > 0)
        .forEach(token => relativePath += (osSeparator + token));
    return relativePath + osSeparator;
}
;
/**
 * Returns the platform specific file separator.
 * @returns separator : string
 */
function getPlaformSeparator() {
    return path_1.default.sep.trim();
}
;
function getCountInArray(value, arr) {
    let count = 0;
    arr.forEach((entry) => {
        if (entry === value) {
            count += 1;
        }
        else {
            count += 0;
        }
        ;
    });
    return count;
}
;
/**  */
electron_1.ipcMain.handle('all-ready-subject-names-from-folder-path', function (event, folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const allSubjectsFromFiles = [];
        // list out all the files in the folder
        const files = fs_1.default.readdirSync(folderPath);
        // separate the word, pdf and the special excel files
        const wordAndPdf = files.filter((file) => (file.endsWith('.pdf') || file.endsWith('.docx')) && !file.startsWith('~$'));
        const excels = files.filter((file) => file.endsWith('xlsx') && !file.startsWith('~$'));
        // get the mapped subject represented by this file names
        const readyWordAndPdf = wordAndPdf.map((file) => {
            return file.toLowerCase().trim().substring(0, file.lastIndexOf('.')).split(' ').filter((token) => token !== '').join('_');
        });
        readyWordAndPdf.forEach((readyFile, index) => allSubjectsFromFiles.push(readyFile));
        const readyExcel = [];
        // get the files in the excel sheets and add it to the allSubjects container
        for (let i = 0; i < excels.length; i++) {
            const excelFile = excels[i];
            const absolutePathToExcelFile = path_1.default.join(folderPath, excelFile);
            const fileNames = yield new file_reader_1.ExcelReader(absolutePathToExcelFile).getSheetNames();
            // get the fileNames ready 
            const readySheetNames = fileNames.map((file) => {
                return file.toLowerCase().trim().split(' ').filter((token) => token !== '').join('_');
            });
            readySheetNames.forEach((sheetName, index) => allSubjectsFromFiles.push(sheetName));
            readySheetNames.forEach((sheetName) => readyExcel.push(sheetName));
        }
        ;
        return [readyWordAndPdf, readyExcel];
    });
});
electron_1.ipcMain.handle('ready-filename-from-path', function (event, filePath) {
    const baseName = path_1.default.basename(filePath).trim().toLowerCase();
    const trimmedBaseName = baseName.substring(0, baseName.lastIndexOf('.'));
    return trimmedBaseName.split(' ').filter((token) => token !== '').join('_');
});
electron_1.ipcMain.handle('excel-sheet-names', function (event, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new file_reader_1.ExcelReader(filePath).getSheetNames();
    });
});
electron_1.ipcMain.handle('show-page', function (event, filename) {
    // remove all listeners from the default session object.
    electron_3.session.defaultSession.removeAllListeners('will-download');
    // create a browserview and add it to the window
    const screenWidth = electron_2.screen.getPrimaryDisplay().bounds.width;
    const screenHeight = electron_2.screen.getPrimaryDisplay().bounds.height;
    // create a new BrowserWindow window 
    const win = new electron_1.BrowserWindow({
        center: true,
        show: false,
        autoHideMenuBar: true,
        useContentSize: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });
    electron_1.nativeTheme.themeSource = 'system';
    win.webContents.loadFile(getRelativePathOfFile(filename.trim()));
    win.webContents.on('dom-ready', function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            win.show();
            win.maximize();
        });
    });
    electron_3.session.defaultSession.on('will-download', function (event, item) {
        console.log('I am working even for this webview...');
        console.log('Trying to download ');
        console.log(item.getTotalBytes());
    });
});
electron_1.ipcMain.handle('keep-subject-names', function (event, allSubjectNamesArray, payloads) {
    subjectNames = allSubjectNamesArray;
    payload = payloads;
    return;
});
electron_1.ipcMain.handle('subject-names-guest-page', function (event) {
    return [subjectNames, payload];
});
// data contains just year and term and level. the levels are e.g jss1-3 or ss1-3
electron_1.ipcMain.handle('subjects-and-student-count', function (event, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // call the repo to return a response
        const subjectsAndCount = yield new concrete_repository_1.default().getSubjectsAndCountForLevel(data);
        return subjectsAndCount;
    });
});
// handles the saving of a subject name for reference to always show class broadshett
electron_1.ipcMain.handle('update-selected-subject-name', function (event, subject_name) {
    subjectName = subject_name;
});
// handles the sending of the updated subject name when asked by the guest page.
electron_1.ipcMain.handle('get-updated-subject-name', function (event) {
    return subjectName;
});
electron_1.ipcMain.handle('student-name', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new concrete_repository_1.default().getStudentNameArray(payload);
    });
});
electron_1.ipcMain.handle('update-rendered-class', function (event, newClazz) {
    payload.clazz = newClazz;
});
electron_1.ipcMain.handle('remove-subject-for-students', function (event, studentNos, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // show a dialog box to confirm the user really wants to delete
        const button = electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), {
            message: "Are you really sure you want to remove the seleted students from this subject?\n\nThis subject records for each selected student will be deleted permanently and therefore makes this action irrevocable!\n\nIf you wish to continue, click on the 'Continue' button below.\n",
            title: '   \nStudents subject management',
            buttons: ['Continue', 'Cancel'],
            type: 'info',
            noLink: true
        });
        if (button === 1) {
            return;
        }
        // start a progress bar 
        const progress = new electron_progressbar_1.default({
            text: 'Students subject management',
            detail: 'Removing subject for students',
            browserWindow: {
                parent: electron_1.BrowserWindow.getFocusedWindow(),
                modal: true
            }
        });
        // call the repository to delete the subject for the students and update it.
        yield new concrete_repository_1.default().deleteSubjectForStudents(studentNos, payload);
        // stop the progress bar
        yield sleep(2000);
        progress.close();
    });
});
electron_1.ipcMain.handle('show-broadsheet-preview', function (event, html) {
    const win = new electron_1.BrowserWindow({
        parent: electron_1.BrowserWindow.getFocusedWindow(),
        show: false,
        autoHideMenuBar: true,
        center: true,
        minimizable: false,
        width: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });
    win.on('ready-to-show', function () {
        win.show();
    });
    win.webContents.loadFile(getRelativePathOfFile('broadsheet.html'));
});
electron_1.ipcMain.handle('print-broadsheet', function (event, html, payload, completeFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // start a progress bar 
        const progressBar = new electron_progressbar_1.default({
            text: 'Creating broadsheet...',
            detail: 'Broadsheet generation for ' + payload.subject + ' for ' + payload.clazz.toUpperCase() + ' ...',
            browserWindow: {
                parent: electron_1.BrowserWindow.getFocusedWindow(),
                modal: true
            }
        });
        // write the event handler when the progress bar closes to show a message dialog.
        progressBar.on('aborted', function () {
            electron_1.dialog.showMessageBoxSync({
                message: payload.subject + ' broadsheet generated for ' + payload.clazz,
                title: '   Suceessful broadsheet generation',
                type: 'info'
            });
        });
        yield pdf.generatePdf({ content: html }, { format: 'A4', path: completeFilePath, printBackground: true });
        // wait for some time and then close the window after the broadsheet is generated.
        yield sleep(1000);
        progressBar.close();
    });
});
electron_1.ipcMain.handle('update-broadsheet-folder-path', function (event, folderPath) {
    broadsheetFolderPath = folderPath.trim();
});
electron_1.ipcMain.handle('get-broadsheet-folder-path', function (event) {
    return broadsheetFolderPath;
});
electron_1.ipcMain.handle('get-broadsheet-file-path', function (event, payload) {
    if (broadsheetFolderPath === undefined) {
        electron_1.dialog.showMessageBoxSync({
            message: 'No base folder found. Please select a folder in the home page and try again.',
            title: '  Folder path error',
            type: 'error'
        });
        return;
    }
    const requiredFolder = path_1.default.join(broadsheetFolderPath, payload.year, payload.term, payload.clazz.toUpperCase());
    if (!fs_1.default.existsSync(requiredFolder)) {
        fs_1.default.mkdirSync(requiredFolder, { recursive: true });
    }
    const fileName = payload.subject + '_broadsheet.pdf';
    return path_1.default.join(requiredFolder, fileName);
});
/**
 * Functions that has to do with the interaction for the school databases.
 */
electron_1.ipcMain.handle('get-school-email-string', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new concrete_repository_1.default().getSchoolEmailAddressString();
    });
});
electron_1.ipcMain.handle('delete-email', function (event, emailText) {
    return __awaiter(this, void 0, void 0, function* () {
        // show a dilaog box to ensure the user really wants to delete the email address
        const button = electron_1.dialog.showMessageBoxSync({
            message: 'Are you sure you want to delete this email address?\n\nNote that this implies that the removed email address will not be updated with the school records during backup\n\nIf you wish to delete it anyways, click the continue button below.\n\nHowever if you change your mind, close this dialog or click the cancel button.\n',
            title: '  Email management',
            type: 'info'
        });
        if (button === 1) {
            return;
        }
        ;
        // delete the email and update the email string
        yield new concrete_repository_1.default().deleteSchoolEmail(emailText);
    });
});
electron_1.ipcMain.handle('update-school-data', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new concrete_repository_1.default().updateSchoolData(payload);
    });
});
electron_1.ipcMain.handle('get-school-data-from-data-store', function (event) {
    return new concrete_repository_1.default().getAllSchoolData();
});
// BACKUP! BACKUP!! BACKUP!!!
function getAllAvailableEmailAddress() {
    return __awaiter(this, void 0, void 0, function* () {
        const schoolData = yield new concrete_repository_1.default().getAllSchoolData();
        return schoolData.email.split('#');
    });
}
electron_1.ipcMain.handle('update-grade-system', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // the payload is a map with key as grade and with object as the value
        const gradeSystemArray = [];
        payload.forEach((value, key) => {
            gradeSystemArray.push(new grade_settings_1.default(key, value.lowerScoreRange, value.higherScoreRange, value.remarks));
        });
        return yield new concrete_repository_1.default().updateGradingSystem(gradeSystemArray);
    });
});
electron_1.ipcMain.handle('get-grade-system', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new concrete_repository_1.default().getGradingSystemObjectArray();
    });
});
function getGradeSystem() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new concrete_repository_1.default().getGradingSystem();
    });
}
electron_1.ipcMain.handle('backup-to-mail', function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(payload);
        var destinationZipFile = '';
        if (payload.backupType === 'academic-session-database') {
            const databaseFolderPath = path_1.default.join(__dirname, 'datastore', payload.year);
            const destinationPath = path_1.default.join(__dirname, (payload.year + '.zip'));
            // zip the academic session database folder
            yield zip_folder_1.default.zipFolderToDestination(databaseFolderPath, destinationPath);
            // update the path to the zipFolder
            destinationZipFile = destinationPath;
        }
        if (payload.backupType === 'academic-term-database') {
            console.log('Got here');
            const databaseFolderPath = path_1.default.join(__dirname, 'datastore', payload.year, payload.term);
            const destinationPath = path_1.default.join(__dirname, (payload.year + '_' + payload.term + '.zip'));
            // zip the academic session database folder
            yield zip_folder_1.default.zipFolderToDestination(databaseFolderPath, destinationPath);
            // update the path to the zipFolder
            destinationZipFile = destinationPath;
        }
        if (payload.backupType !== 'academic-session-database' && payload.backupType !== 'academic-term-database') {
            // else zip the folder in the same directory that the user chooses
            const userFolderPath = payload.path;
            console.log(userFolderPath);
            const destinationFolderPath = userFolderPath + '.zip';
            yield zip_folder_1.default.zipFolderToDestination(userFolderPath, destinationFolderPath);
            destinationZipFile = destinationFolderPath;
        }
        const emails = yield getAllAvailableEmailAddress();
        const emailLine = emails.join(', ');
        // update the payload with the path to the eventual zip file
        payload.zipFilePath = destinationZipFile;
        payload.emails = emailLine;
        // console.log("I got here 1");
        // finally send the email to the user
        yield sendEmail(payload);
        // console.log("I got here 2");
    });
});
function sendEmail(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (payload.backupType) {
            case 'academic-session-database':
                yield handleAcademicSessionDatabaseBackup(payload);
                return;
            case 'academic-term-database':
                yield handleAcademicTermDatabaseBackup(payload);
                return;
            case 'academic-reportsheet':
                yield handleAcademicReportSheetBackup(payload);
                return;
            case 'academic-broadsheet':
                yield handleAcademicBroadsheetBackup(payload);
                return;
            case 'academic-scores':
                yield handleScoresBackup(payload);
                return;
            case 'other-items':
                yield handleOtherItemsBackup(payload);
                return;
            default: throw new Error('Unsupported operation.');
        }
    });
}
function startProgressBar(payload) {
    const progress = new electron_progressbar_1.default({
        text: payload.text,
        detail: payload.detail,
    });
    progress.on('aborted', function () {
        electron_1.dialog.showMessageBoxSync({
            message: `Successful backup of ${payload.backupType} to registered emails.`,
            title: ' Email backup sucess message',
            type: 'info'
        });
    });
    return progress;
}
function handleAcademicSessionDatabaseBackup(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // construct the html for the academic session backup
        const html = `<h3 style="color:green;text-align:center"> Academic session database backup for year ${payload.year} </h3>
    <p style="text-align:justify"> The attachment below is a zip folder containing the database flat file for all classes and for all academic terms. </p>
    <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i>If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
    <p> Thank you. </p>
    <p> <strong>Quatron@springarr.development</strong> </p>`;
        const emailSubject = `${payload.year} academic session database backup`;
        const text = `Quatron`;
        const filename = `${payload.year} Database file`;
        payload.html = html;
        payload.subject = emailSubject;
        payload.text = text;
        payload.filename = filename;
        const progress = startProgressBar({ text: 'Academic session database email backup', detail: `Backing up academic year ${payload.year} database to registered email addresses...`, backupType: `${payload.year} academic session databse` });
        // send the email with the email service class
        const done = yield new email_sender_1.default().sendEmail(payload);
        if (done) {
            console.log('done');
            // delete the zip folder to clear up memory storage in user's machine
            fs_1.default.unlink(payload.zipFilePath, function (error) {
                if (error) {
                    console.log(error);
                }
                ;
                console.log("Deleted successfully");
            });
        }
        ;
        progress.close();
    });
}
function handleAcademicTermDatabaseBackup(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // construct the html for the academic session backup
        const html = `<h3 style="color:green;text-align:center"> Academic term database backup for ${payload.year + ' ' + expandNeat(payload.term)} </h3>
    <p style="text-align:justify"> The attachment below is a zip folder containing the database flat file for all classes for the <strong style="color:midnightblue;text-align:justify"> ${expandNeat(payload.term).toLowerCase()}. </strong> </p>
    <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
    <p> Thank you. </p>
    <p> <strong>Quatron@springarr.development</strong> </p>`;
        const emailSubject = `${payload.year + '_' + payload.term} academic database backup`;
        const text = `Quatron`;
        const filename = `${payload.year + '_' + expandNeat(payload.term)} Database file`;
        payload.html = html;
        payload.subject = emailSubject;
        payload.text = text;
        payload.filename = filename;
        const progress = startProgressBar({ text: 'Academic term database email backup', detail: `Backing up academic database ${payload.year + '_' + expandNeat(payload.term)} to registered emails...`, backupType: `${payload.year + '_' + expandNeat(payload.term)} academic database` });
        // send the email with the email service class
        const done = yield new email_sender_1.default().sendEmail(payload);
        if (done) {
            console.log('done');
            // delete the zip folder to clear up memory storage in user's machine
            fs_1.default.unlink(payload.zipFilePath, function (error) {
                if (error) {
                    console.log(error);
                }
                ;
                console.log("Deleted successfully");
            });
        }
        ;
        progress.close();
    });
}
function handleAcademicReportSheetBackup(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // construct the html for the academic session backup
        const html = `<h3 style="color:green;text-align:center"> Academic term report sheets for ${payload.year + ' ' + expandNeat(payload.term)} </h3>
    <p style="text-align:justify"> The attachment below is a zip folder containing the academic report sheets for all classes for the <strong style="color:midnightblue;text-align:justify"> ${expandNeat(payload.term).toLowerCase()}. </strong> </p>
    <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
    <p> Thank you. </p>
    <p> <strong>Quatron@springarr.development</strong> </p>`;
        const emailSubject = `${payload.year + '_' + payload.term} academic report sheet backup`;
        const text = `Quatron`;
        const filename = `${payload.year + '_' + expandNeat(payload.term)} Students reports`;
        payload.html = html;
        payload.subject = emailSubject;
        payload.text = text;
        payload.filename = filename;
        const progress = startProgressBar({ text: 'Academic term report sheet email backup', detail: `Backing up academic term students report for ${payload.year + '_' + expandNeat(payload.term)} to registered emails...`, backupType: `${payload.year + '_' + expandNeat(payload.term)} academic report sheets` });
        // send the email with the email service class
        const done = yield new email_sender_1.default().sendEmail(payload);
        if (done) {
            console.log('done');
            // delete the zip folder to clear up memory storage in user's machine
            fs_1.default.unlink(payload.zipFilePath, function (error) {
                if (error) {
                    console.log(error);
                }
                ;
                console.log("Deleted successfully");
            });
        }
        ;
        progress.close();
    });
}
function handleAcademicBroadsheetBackup(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // construct the html for the academic session backup
        const html = `<h3 style="color:green;text-align:center"> Academic term broad sheets for ${payload.year + ' ' + expandNeat(payload.term)} </h3>
     <p style="text-align:justify"> The attachment below is a zip folder containing the broad sheets for all classes for the <strong style="color:midnightblue;text-align:justify"> ${expandNeat(payload.term).toLowerCase()}. </strong> </p>
     <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
     <p> Thank you. </p>
     <p> <strong>Quatron@springarr.development</strong> </p>`;
        const emailSubject = `${payload.year + '_' + payload.term} academic broad sheet backup`;
        const text = `Quatron`;
        const filename = `${payload.year + '_' + expandNeat(payload.term)} Score broadsheets`;
        payload.html = html;
        payload.subject = emailSubject;
        payload.text = text;
        payload.filename = filename;
        const progress = startProgressBar({ text: 'Academic term broad sheet email backup', detail: `Backing up academic term students broad sheets for ${payload.year + '_' + expandNeat(payload.term)} to registered emails...`, backupType: `${payload.year + '_' + expandNeat(payload.term)} academic broad sheets` });
        // send the email with the email service class
        const done = yield new email_sender_1.default().sendEmail(payload);
        if (done) {
            console.log('done');
            // delete the zip folder to clear up memory storage in user's machine
            fs_1.default.unlink(payload.zipFilePath, function (error) {
                if (error) {
                    console.log(error);
                }
                ;
                console.log("Deleted successfully");
            });
        }
        ;
    });
}
function handleScoresBackup(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // construct the html for the academic session backup             
        const html = `<h3 style="color:green;text-align:center"> Academic scores for ${payload.year + ' ' + expandNeat(payload.term)} </h3>
     <p style="text-align:justify"> The attachment below is a zip folder containing the academic scores for all classes for the <strong style="color:midnightblue;text-align:justify"> ${expandNeat(payload.term).toLowerCase()}. </strong> </p>
     <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
     <p> Thank you. </p>
     <p> <strong>Quatron@springarr.development</strong> </p>`;
        const emailSubject = `${payload.year + '_' + payload.term} academic score sheet backup`;
        const text = `Quatron`;
        const filename = `${payload.year + '_' + expandNeat(payload.term)} academic scores`;
        payload.html = html;
        payload.subject = emailSubject;
        payload.text = text;
        payload.filename = filename;
        const progress = startProgressBar({ text: 'Academic term scores email backup', detail: `Backing up academic term scores for ${payload.year + '_' + expandNeat(payload.term)} to registered emails...`, backupType: `${payload.year + '_' + expandNeat(payload.term)} academic scores` });
        // send the email with the email service class
        const done = yield new email_sender_1.default().sendEmail(payload);
        if (done) {
            console.log('done');
            // delete the zip folder to clear up memory storage in user's machine
            fs_1.default.unlink(payload.zipFilePath, function (error) {
                if (error) {
                    console.log(error);
                }
                ;
                console.log("Deleted successfully");
            });
        }
        ;
        progress.close();
    });
}
function handleOtherItemsBackup(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // construct the html for the academic session backup
        const html = `<h3 style="color:green;text-align:center"> ${payload.description} for ${payload.year + ' ' + expandNeat(payload.term)} </h3>
     <p style="text-align:justify"> The attachment below is a zip folder containing the ${payload.description} for all classes for the <strong style="color:midnightblue;text-align:justify"> ${expandNeat(payload.term).toLowerCase()}. </strong> </p>
     <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
     <p> Thank you. </p>
     <p> <strong>Quatron@springarr.development</strong> </p>`;
        const emailSubject = `${payload.year + '_' + payload.term} ${payload.description}`;
        const text = `Quatron`;
        const filename = `${payload.year + '_' + expandNeat(payload.term)} ${payload.description}`;
        payload.html = html;
        payload.subject = emailSubject;
        payload.text = text;
        payload.filename = filename;
        const progress = startProgressBar({ text: `${payload.description}`, detail: `Backing up ${payload.description} for ${payload.year + '_' + expandNeat(payload.term)} to registered emails...`, backupType: `${payload.year + '_' + expandNeat(payload.term)} ${payload.description}` });
        // send the email with the email service class
        const done = yield new email_sender_1.default().sendEmail(payload);
        if (done) {
            console.log('done');
            // delete the zip folder to clear up memory storage in user's machine
            fs_1.default.unlink(payload.zipFilePath, function (error) {
                if (error) {
                    console.log(error);
                }
                ;
                console.log("Deleted successfully");
            });
        }
        ;
        progress.close();
    });
}
electron_1.ipcMain.handle('save-comments', function (event, teacherPath, principalPath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new concrete_repository_1.default().updateComments(teacherPath, principalPath);
    });
});
electron_1.ipcMain.handle('get-file-lines', function (event, filePath) {
    const lineString = fs_1.default.readFileSync(filePath, { encoding: 'utf-8' }).toString();
    const withoutComment = lineString.split('@comment');
    return withoutComment.join('').split('\r\n').filter((token) => token !== '' && token !== ' ');
});
// console.log( new TeacherComment().loa )
