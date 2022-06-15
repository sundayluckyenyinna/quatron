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
var index;
var studentRowToRemove;
$('#edit-passport-file').on('change', function (event) {
    const file = Object(this).files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
        const passportCol = $('#student-table').find('tr').eq(index).find('td').eq(1);
        const studentNo = $('#student-table').find('tr').eq(index).find('td').eq(2).text().trim();
        passportCol.find('.passport-img').first().attr('src', reader.result);
        const data = Object.assign(Object.assign({}, getAllSelectBoxData()), { Student_No: studentNo, Passport_Image: reader.result });
        electron_1.ipcRenderer.invoke('update-student-passport-in-class', data);
    };
});
/** FUNCTIONS */
function getAcademicYear() {
    var _a;
    return (_a = $('#select-year').val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
}
;
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
function getSubject() {
    var _a;
    return compress((_a = $('#select-subject').val()) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase());
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
function expand(value) {
    value = value.trim();
    return value.split('_')
        .map(entry => entry.charAt(0).toUpperCase() + entry.substring(1))
        .join(' ');
}
;
function checkThatOneFieldIsInappropriate() {
    return ((getAcademicYear().toLowerCase() === 'select academic year') ||
        (getTerm() === 'select_term') ||
        (getClass() === 'selectclass'));
}
;
function getAllSelectBoxData() {
    return {
        year: getAcademicYear(),
        term: getTerm(),
        clazz: getClass()
    };
}
;
function getSurnameLine(surname) {
    return $('<div/>', {}).append($('<span/>', { 'text': 'Surname' }), $('<span/>', { 'text': surname, 'class': 'surname' }));
}
;
function getFirstNameLine(firstname) {
    return $('<div/>', {}).append($('<span/>', { 'text': 'First Name' }), $('<span/>', { 'text': firstname, 'class': 'firstname' }));
}
;
function getMiddleNameLine(middlename) {
    return $('<div/>', {}).append($('<span/>', { 'text': 'Middle Name : ' }), $('<span/>', { 'text': middlename, 'class': 'middlename' }));
}
;
function getDepartmentLine(dept) {
    return $('<div/>', {}).append($('<span/>', { 'text': 'Department : ' }), $('<span/>', { 'text': dept, 'class': 'dept' }));
}
;
function getGenderLine(gender) {
    return $('<div/>', {}).append($('<span/>', { 'text': 'Gender : ' }), $('<span/>', { 'text': gender, 'class': 'gender' }));
}
;
function getFullNameLine(fullname) {
    return $('<div/>', {}).append($('<span/>', { 'text': 'Fullname : ' }), $('<span/>', { 'text': fullname, 'class': 'fullname' }));
}
;
function getEditAndViewPassportLine(index) {
    return $('<div/>', { 'class': 'top-line-btn' }).append($('<button/>', { 'text': 'Edit passport', 'class': 'edit-passport' }).attr('data-index', index), $('<button/>', { 'text': 'View student', 'class': 'view-student' }).attr('data-index', index));
}
;
function getRemoveStudentLine(index) {
    return $('<div/>', { 'class': 'bottom-line-btn' }).append($('<button/>', { 'text': 'Remove student', 'class': 'remove-student' }).attr('data-index', index));
}
;
function getDescriptionColumn(data) {
    const fullname = [data.Surname, data.First_Name, data.Middle_Name].join(' ');
    return $('<div/>', { 'class': 'desc' }).append(getFullNameLine(fullname))
        //   .append( getSurnameLine( data.Surname ))
        //   .append( getFirstNameLine( data.First_Name ))
        //   .append( getMiddleNameLine( data.Middle_Name ))
        .append(getDepartmentLine(data.Department))
        .append(getGenderLine(data.Gender));
}
function getActionColumn(index) {
    return $('<div/>', {}).append(getEditAndViewPassportLine(index))
        //  .append( getViewStudentLine() )
        .append(getRemoveStudentLine(index));
}
;
function createStudentRow(data) {
    return $('<tr/>', { 'class': 'row' }).append($('<td/>', { 'text': data.Serial_No, 'class': 'sn' }))
        .append($('<td/>', { 'class': 'passport' }).append($('<img/>', { 'class': 'passport-img' }).attr('src', data.Passport_Image)))
        .append($('<td/>', { 'text': data.Student_No, 'class': 'sn' }))
        .append($('<td/>', {}).append(getDescriptionColumn(data)))
        .append($('<td/>', { 'class': 'action-col' }).append(getActionColumn(data.Serial_No)));
}
function attachClickEditButtonHandler() {
    $('.edit-passport').on('click', function (event) {
        var indes = Number($(this).attr('data-index'));
        index = indes;
        console.log(index);
        $('#edit-passport-file').trigger('click');
    });
}
;
function attachClickViewStudentHandler() {
    $('.view-student').on('click', function (event) {
        const index = Number($(this).attr('data-index'));
        const studentNo = $('#student-table').find('tr').eq(index).find('td').eq(2).text().trim();
        // get the student details and send it to the main process to load the student profile page
        electron_1.ipcRenderer.invoke('students-for-class', getAllSelectBoxData())
            .then((students) => __awaiter(this, void 0, void 0, function* () {
            var student = {};
            for (let i = 0; i < students.length; i++) {
                if (students[i].Student_No === studentNo) {
                    student = students[i];
                    break;
                }
                ;
            }
            ;
            yield electron_1.ipcRenderer.invoke('student-page', student, getAllSelectBoxData());
        })).catch(error => console.log(error));
    });
}
function attachRemoveStudentHandler() {
    $('.remove-student').on('click', function (event) {
        const index = Number($(this).attr('data-index'));
        const studentNo = $('#student-table').find('tr').eq(index).find('td').eq(2).text().trim();
        const rowToRemove = $('#student-table').find('tr').eq(index);
        // send to the main process to remove and listen to the returned for removal from dom
        const data = Object.assign(Object.assign({}, getAllSelectBoxData()), { Student_No: studentNo });
        studentRowToRemove = rowToRemove;
        electron_1.ipcRenderer.invoke('delete-student-from-class', data);
    });
}
;
function getAllStudentsByClass(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('students-for-class', payload);
    });
}
;
// The handler when the class selection changes
$('#select-class').on('change', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        const studentsData = yield getAllStudentsByClass(getAllSelectBoxData());
        const fragment = $(document.createDocumentFragment());
        for (let i = 0; i < studentsData.length; i++) {
            const data = studentsData[i];
            data.Serial_No = i + 1;
            const row = createStudentRow(data);
            fragment.append(row);
        }
        ;
        // clear the student-table first
        $('.row').remove();
        $('#student-table').append(fragment);
        // add event handlers
        attachClickEditButtonHandler();
        attachClickViewStudentHandler();
        attachRemoveStudentHandler();
    });
});
// Listeners to main
electron_1.ipcRenderer.on('delete-student-done', function (event) {
    studentRowToRemove.remove();
});
