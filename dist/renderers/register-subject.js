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
/** constants */
const $ = jquery_1.default;
/** Functions */
function populateAcademicYearSelectBox() {
    return __awaiter(this, void 0, void 0, function* () {
        const fragment = $(document.createDocumentFragment());
        const academicYearsArray = yield getAcademicYears();
        academicYearsArray.forEach(year => {
            const option = $('<option/>', { 'text': year });
            fragment.append(option);
        });
        $('#select-year').append(fragment);
    });
}
;
function toggleSelectDepartmentBox() {
    $('#select-level').on('change', function (event) {
        var _a;
        if (((_a = $(this).val()) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase().trim()) === 'senior') {
            $('#department-section').css('display', 'block');
            return;
        }
        ;
        $('#department-section').css('display', 'none');
    });
}
;
function activateAddButton() {
    $('#add-subject').on('click', function (event) {
        $('#create').css('display', 'block');
    });
}
;
function validateAcademicYear(academicYear) {
    return __awaiter(this, void 0, void 0, function* () {
        // check that the academic value is valid
        if ((academicYear === null || academicYear === void 0 ? void 0 : academicYear.toLowerCase()) === 'select year') {
            yield showDialog({
                message: 'Select an academic year',
                title: 'Invalid academic year',
                type: 'error'
            });
            return false;
        }
        ;
        return true;
    });
}
;
function validateSubjectName(subjectName) {
    return __awaiter(this, void 0, void 0, function* () {
        // check that the subject name is valid
        if (subjectName.length === 0) {
            yield showDialog({
                message: 'Insert a subject name',
                title: 'Empty subject name',
                type: 'error'
            });
            return false;
        }
        ;
        return true;
    });
}
;
function validateUniqueSubjectNameForYearTermClass(subjectName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield getAllSubjectNamesForYearTermAndClass(data)).includes(subjectName)) {
            yield showDialog({
                message: 'This subject is already registered for this year and level',
                title: 'Non-unique subject name',
                type: 'error'
            });
            return false;
        }
        ;
        return true;
    });
}
;
function isEmpty(object) {
    return Object.keys(object).length === 0;
}
;
function getAllInputFromDocument() {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        const academicYear = (_a = $('#select-year').val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
        const academicTerm = compress((_b = $('#select-term').val()) === null || _b === void 0 ? void 0 : _b.toString().trim().toLowerCase());
        const level = (_c = $('#select-level').val()) === null || _c === void 0 ? void 0 : _c.toString().trim().toLowerCase();
        let department = (_d = $('#select-department').val()) === null || _d === void 0 ? void 0 : _d.toString().trim().toLowerCase();
        const subjectName = compress((_e = $('#subject-name').val()) === null || _e === void 0 ? void 0 : _e.toString().trim().toLowerCase());
        const validAcademicYear = yield validateAcademicYear(academicYear);
        const validSubjectName = yield validateSubjectName((_f = $('#subject-name').val()) === null || _f === void 0 ? void 0 : _f.toString().trim().toLowerCase());
        if (!validAcademicYear || !validSubjectName) {
            return {};
        }
        ;
        const validateUniqueSubjectName = yield validateUniqueSubjectNameForYearTermClass(subjectName, { year: academicYear, term: academicTerm, level: level });
        if (!validateUniqueSubjectName) {
            return {};
        }
        ;
        if (level === 'junior') {
            department = 'none';
        }
        ;
        return {
            academicYear: academicYear,
            academicTerm: academicTerm,
            level: level,
            department: department,
            subjectName: subjectName
        };
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
/** Functions that invokes the main */
function getAcademicYears() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('academic-years');
    });
}
;
function getAllSubjectNamesForYearTermAndClass(data) {
    return __awaiter(this, void 0, void 0, function* () {
        data.clazz = 'sss1';
        if (data.level === 'junior') {
            data.clazz = 'jss1';
        }
        return yield electron_1.ipcRenderer.invoke('level-subject-names', data);
    });
}
;
function getAllSubjectNames() {
    return __awaiter(this, void 0, void 0, function* () {
        return electron_1.ipcRenderer.invoke('all-subject-names');
    });
}
;
function showDialog(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('show-dialog', {
            message: payload.message,
            title: payload.title,
            type: payload.type
        });
    });
}
;
/** Handlers from the message of the main */
/** Handlers for html handlers  */
document.body.onload = function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield populateAcademicYearSelectBox();
        toggleSelectDepartmentBox();
        activateAddButton();
    });
};
$('#create-subject').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputs = yield getAllInputFromDocument();
        if (!isEmpty(inputs)) {
            // invoke the mainprocess to save the subject
            const done = yield electron_1.ipcRenderer.invoke('save-subject', inputs);
            if (done) {
                showDialog({
                    message: 'Subject registered successfully',
                    title: 'Success',
                    type: 'info'
                });
                return;
            }
            ;
            return;
        }
        ;
    });
});
