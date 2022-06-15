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
/**
 * Returns the academic year selected on this document page.
 * @returns academicYear : string
 */
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
function compressMonth(month) {
    month = month.trim();
    if (month.length === 3 || month.length === 4) {
        return (month.charAt(0).toUpperCase() + month.substring(1));
    }
    ;
    return month.charAt(0) + month.substring(1, 3) + ".";
}
;
function getMonthOfNextTermBegin() {
    return compressMonth($('#month-next-begin').val());
}
;
function getYearOfNextTermBegin() {
    return $('#year-next-begin').val();
}
;
function getMonthOfNextTermEnd() {
    return compressMonth($('#month-next-end').val());
}
;
function getYearOfNextTermEnd() {
    return $('#year-next-end').val();
}
;
function getStudentNumberOrAll() {
    return $('#student-nos').val();
}
;
function getRootFolderPathChosen() {
    var _a;
    return (_a = $('#root-folder').val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
}
;
function getAllSelectedBoxValues() {
    return {
        year: getAcademicYear(),
        term: getTerm(),
        clazz: getClass(),
        studentNo: getStudentNumberOrAll(),
        nextTermBeginMonth: getMonthOfNextTermBegin(),
        nextTermBeginYear: getYearOfNextTermBegin(),
        nextTermEndMonth: getMonthOfNextTermEnd(),
        nextTermEndYear: getYearOfNextTermEnd(),
        rootFolder: getRootFolderPathChosen()
    };
}
function getAcademicYearArray() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('academic-years');
    });
}
;
function populateAcademicYear() {
    return __awaiter(this, void 0, void 0, function* () {
        const fragment = $(document.createDocumentFragment());
        yield (yield getAcademicYearArray()).forEach(year => {
            const option = $('<option/>', { 'text': year });
            fragment.append(option);
        });
        $('#select-year').append(fragment);
    });
}
;
function populateYearOfNextTermBegin() {
    return __awaiter(this, void 0, void 0, function* () {
        const fragment = $(document.createDocumentFragment());
        const academicYears = yield getAcademicYearArray();
        const extraYear1 = (Number(academicYears[academicYears.length - 1]) + 1).toString();
        const extraYear2 = (Number(academicYears[academicYears.length - 1]) + 2).toString();
        academicYears.push(extraYear1, extraYear2);
        academicYears.forEach(year => {
            const option = $('<option/>', { 'text': year });
            fragment.append(option);
        });
        $('#year-next-begin').append(fragment);
    });
}
;
function populateYearOfNextTermEnd() {
    return __awaiter(this, void 0, void 0, function* () {
        const fragment = $(document.createDocumentFragment());
        const academicYears = yield getAcademicYearArray();
        const extraYear1 = (Number(academicYears[academicYears.length - 1]) + 1).toString();
        const extraYear2 = (Number(academicYears[academicYears.length - 1]) + 2).toString();
        academicYears.push(extraYear1, extraYear2);
        academicYears.forEach(year => {
            const option = $('<option/>', { 'text': year });
            fragment.append(option);
        });
        $('#year-next-end').append(fragment);
    });
}
;
function populateYearOfNextTermBeginAndEnd() {
    return __awaiter(this, void 0, void 0, function* () {
        yield populateYearOfNextTermBegin();
        yield populateYearOfNextTermEnd();
    });
}
;
function classChangeHandler() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!readyToPopulateStudentNo()) {
            return;
        }
        ;
        let studentsInClass;
        try {
            studentsInClass = yield electron_1.ipcRenderer.invoke('students-for-class', getAllSelectedBoxValues());
        }
        catch (error) {
            return;
        }
        const fragment = $(document.createDocumentFragment());
        studentsInClass.forEach((student) => {
            const option = $('<option/>', { 'text': student.Student_No, 'class': 'student-no-option' });
            fragment.append(option);
        });
        $('.student-no-option').remove();
        fragment.prepend($('<option/>', { 'text': 'All students in class', 'class': 'student-no-option' }));
        $('#student-nos').append(fragment);
    });
}
;
function validateAllSelectBoxInput() {
    //console.log( Object.values(getAllSelectedBoxValues() ));
    return !(Object.values(getAllSelectedBoxValues()).join('').indexOf('select') !== -1 || // i.e
        Object.values(getAllSelectedBoxValues()).includes('--Student No--') ||
        Object.values(getAllSelectedBoxValues()).join('').indexOf('Sel') !== -1);
}
;
function readyToPopulateStudentNo() {
    return (getClass() !== 'selectclass'
        && getAcademicYear() !== 'Select year'
        && getTerm() !== 'select_term');
}
;
/**
 *
 * Functions that invokes the main method
 */
function showDirectoryChooser() {
    return __awaiter(this, void 0, void 0, function* () {
        const directoryPathArray = yield electron_1.ipcRenderer.invoke('show-directory-chooser');
        if (directoryPathArray) {
            $('#root-folder').val(directoryPathArray[0]);
        }
        ;
        console.log(directoryPathArray[0]);
        return;
    });
}
;
function showDialog(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('show-dialog', payload);
    });
}
;
function getSingleOrAllStudentDataForReportSheetForYearTermClass() {
    return __awaiter(this, void 0, void 0, function* () {
        // includes all details, all subject scores in an array
        return yield electron_1.ipcRenderer.invoke('all-or-single-students-data', getAllSelectedBoxValues());
    });
}
;
/**
 * HTML handlers
 */
/** The background code to run as the document loads  */
document.body.onload = function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        // populate the academic year
        yield populateAcademicYear();
        // populate the year of next term begins and end
        yield populateYearOfNextTermBeginAndEnd();
        // disable the generate button until a folder is choosen
    });
};
// chnage handler for the class selection 
$('#select-class').on('change', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!readyToPopulateStudentNo()) {
            return;
        }
        ;
        const selectedClass = this.value.trim();
        if (selectedClass.includes('Select class')) {
            $('.student-no-option').remove();
            return;
        }
        ;
        // handle the change in class by repopulating the student-nos field
        try {
            yield classChangeHandler();
        }
        catch (erorr) {
            return;
        }
    });
});
$('#select-year').on('change', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (readyToPopulateStudentNo()) {
            $('.student-no-option').remove();
            try {
                yield classChangeHandler();
            }
            catch (erorr) {
                console.log('This is the error here');
                return;
            }
        }
        ;
        return;
    });
});
$('#select-term').on('change', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (readyToPopulateStudentNo()) {
            $('.student-no-option').remove();
            try {
                yield classChangeHandler();
            }
            catch (erorr) {
                return;
            }
        }
        ;
        return;
    });
});
$('#browse-button').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(readyToPopulateStudentNo());
        yield showDirectoryChooser();
    });
});
$('#generate-report-button').on('click', function (event) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!validateAllSelectBoxInput()) {
            showDialog({
                message: 'Some selections are invalid.',
                title: 'Invalid selection(s)',
                type: 'error'
            });
            return;
        }
        ;
        if (((_a = $('#root-folder').val()) === null || _a === void 0 ? void 0 : _a.toString().trim().length) === 0) {
            showDialog({
                message: 'Please select a root folder to store all report sheets',
                title: 'Unspecified root folder',
                type: 'error'
            });
            return;
        }
        ;
        // send the request to the main process for the processing of the report sheets
        const payload = yield getSingleOrAllStudentDataForReportSheetForYearTermClass();
        yield electron_1.ipcRenderer.invoke('all-or-single-students-report', payload, getAllSelectedBoxValues());
    });
});
$('#merge-report-button').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        // verify that the folder path is not empty
        if (getRootFolderPathChosen().trim().length === 0) {
            yield showDialog({
                message: 'The folder path cannot be empty. Browse and select a folder that contains all the report sheets to be merged.',
                title: ' Folder path error',
                type: 'error'
            });
            return;
        }
        electron_1.ipcRenderer.invoke('merge-reports', getAllSelectedBoxValues());
    });
});
/** Handler for message from the main process */
electron_1.ipcRenderer.on('merge-report-done', function (event, destination) {
    showDialog({
        message: 'Message: All report sheets successfully merged!\n\nDestination: ' + destination,
        title: 'Success',
        type: 'info'
    });
    return;
});
