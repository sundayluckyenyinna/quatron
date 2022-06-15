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
var selectedCheckBox = [];
// Getter functions
function getPayloadFromHost() {
    return __awaiter(this, void 0, void 0, function* () {
        return Object(yield electron_1.ipcRenderer.invoke('subject-names-guest-page'))[1];
    });
}
function getSubjectNameFromHost() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('get-updated-subject-name');
    });
}
function getSelectClassBox() {
    return $('#select-class');
}
function getRemoveStudentButton() {
    return $('#remove-student');
}
function getGenerateBroadsheetButton() {
    return $('#generate-broadsheet');
}
function getSelectAllButton() {
    return $('#select-all-button');
}
function getReadyScores(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the student scores
        const scores = yield electron_1.ipcRenderer.invoke('student-scores', payload);
        const readyScores = [];
        for (let i = 0; i < scores.length; i++) {
            // get the student and student no
            const student = scores[i];
            const studentNo = student.Student_No;
            payload.studentNo = studentNo;
            // get the student name from the main 
            const nameArray = yield electron_1.ipcRenderer.invoke('student-name', payload);
            const names = Object.values(nameArray);
            const fullName = names.map((token) => {
                const name = token.toLowerCase();
                return name.charAt(0).toUpperCase() + name.substring(1);
            }).join(' ');
            // get the student total score
            const totalScore = Number(student.Ca_Score) + Number(student.Exam_Score);
            student.Full_Name = fullName;
            student.Total_Score = totalScore;
            readyScores.push(student);
        }
        return readyScores;
    });
}
function getStudentRecordRow(readyScores) {
    const rows = [];
    for (let i = 0; i < readyScores.length; i++) {
        const score = readyScores[i];
        const row = getSingleStudentRecordRow(score, i + 1);
        rows.push(row);
    }
    return rows;
}
function getSingleStudentRecordRow(score, index) {
    return $('<tr/>', { 'class': 'row' }).append($('<td/>', { 'class': 's-no', 'text': index }))
        .append($('<td/>', { 'class': 'student-no', 'text': score.Student_No }))
        .append($('<td/>', { 'class': 'full-name', 'text': score.Full_Name }))
        .append($('<td/>', { 'class': 'ca-score', 'text': score.Ca_Score }))
        .append($('<td/>', { 'class': 'exam-score', 'text': score.Exam_Score }))
        .append($('<td/>', { 'class': 'total-score', 'text': score.Total_Score }))
        .append($('<td/>', { 'class': 'check-column' }).append($('<input/>', { 'class': 'check', 'type': 'checkbox' })));
}
// A function to display the students scores in the table
function populateScoreTable() {
    return __awaiter(this, void 0, void 0, function* () {
        // get the payload from the host including the 'term', 'year' and 'clazz'
        const payload = yield getPayloadFromHost();
        const subjectName = yield getSubjectNameFromHost();
        payload.subject = subjectName;
        const table = $('#score-table');
        const readyScores = yield getReadyScores(payload);
        const allStudentRows = yield getStudentRecordRow(readyScores);
        table.append(allStudentRows);
        // set the class and subject
        $('#class').text(expandClass(payload.clazz).toUpperCase());
        $('#subject').text(expandSubject(subjectName));
    });
}
function print(value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield electron_1.ipcRenderer.invoke('print', value);
    });
}
function compress(value) {
    value = value.trim().toLowerCase();
    return value.split(' ').filter((token) => token !== '').join('_');
}
function expandClass(value) {
    value = value.trim().toUpperCase();
    return value.substring(0, 3) + ' ' + value.charAt(3);
}
function expandSubject(subject) {
    return subject.trim().split('_').map((subjectName) => subjectName.charAt(0).toUpperCase() + subjectName.substring(1)).join(' ');
}
// validations
function checkValidSelectedClass() {
    var _a;
    return ((_a = getSelectClassBox().val()) === null || _a === void 0 ? void 0 : _a.toString().trim()) !== 'Select class';
}
// value getters
function getClass() {
    var _a;
    const clazz = (_a = getSelectClassBox().val()) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase();
    return clazz.split(' ').filter((token) => token !== '').join('');
}
// THE DOM ELEMENT HANDLERS
function selectClassChangeHandler() {
    getSelectClassBox().on('change', function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValidClass = checkValidSelectedClass();
            if (!isValidClass) {
                return;
            }
            ;
            // get the class and tell the main process to update its clazz attribute in the payload
            const clazz = getClass();
            yield electron_1.ipcRenderer.invoke('update-rendered-class', clazz);
            // repopulate the page with the new class. First remove all the rows and clear the students blacklist.
            $('.row').remove();
            yield populateScoreTable();
        });
    });
}
// handler to display the remove student and the select all button 
function showRemoveAndSelectAllButtonHandler() {
    // this will be triggered when a check box is actually clicked
    $('body').on('click', '.check', function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            // get the student number associated with this check box
            const studentNo = $(this).parent().parent().find('.student-no').text().trim();
            // if it is selected, add it to the array, if not remove it immediately.
            if ($(this).is(':checked')) {
                selectedCheckBox.push(studentNo);
            }
            else {
                const newSelectedArray = selectedCheckBox.filter((studentNumber) => studentNumber !== studentNo);
                selectedCheckBox = newSelectedArray;
            }
            // now check if there is at least a selected check box and use it to decide if to show the buttons or not
            if (selectedCheckBox.length === 0) {
                getRemoveStudentButton().css('visibility', 'hidden');
                getSelectAllButton().css('visibility', 'hidden');
            }
            else {
                getRemoveStudentButton().css('visibility', 'visible');
                getSelectAllButton().css('visibility', 'visible');
            }
        });
    });
}
function removeStudentHandler() {
    getRemoveStudentButton().on('click', function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentBlackList = [];
            // get the student numbers of those to be deleted
            $('.check').each(function (index, element) {
                if ($(this).is(':checked')) {
                    const studentNo = $(this).parent().parent().find('.student-no').first().text().trim();
                    studentBlackList.push(studentNo);
                }
            });
            const payload = yield getPayloadFromHost();
            payload.subject = compress(yield getSubjectNameFromHost());
            // invoke the main process to delete the subject for this student
            yield electron_1.ipcRenderer.invoke('remove-subject-for-students', studentBlackList, payload);
            // repopulate the table
            $('.row').remove();
            yield populateScoreTable();
            // set the text of the button back to 'Selected'
            getSelectAllButton().text('Select all');
            getRemoveStudentButton().css('visibility', 'hidden');
            getSelectAllButton().css('visibility', 'hidden');
            selectedCheckBox.splice(0, selectedCheckBox.length);
        });
    });
}
function selectAllButtonHandler() {
    getSelectAllButton().on('click', function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            const compressedText = compress($(this).text().trim());
            // check if the button is on the 'select all mode'
            if (compressedText === 'select_all') {
                $('.check').each(function (index, element) {
                    const isChecked = $(this).is(':checked');
                    if (!isChecked) {
                        $(this).trigger('click');
                    }
                    ;
                });
                // change the name of the button to 'Deselect all'
                $(this).text('Deselect all');
                return;
            }
            if (compressedText === 'deselect_all') {
                // then the button is on the 'Deselect all mode'
                $('.check').each(function (index, element) {
                    if ($(this).is(':checked')) {
                        $(this).trigger('click');
                    }
                    ;
                });
                // change the name of the button back to 'Seelect all'
                $(this).text('Select all');
                return;
            }
            ;
            return;
        });
    });
}
function generateReportSheetButtonHandler() {
    getGenerateBroadsheetButton().on('click', function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield electron_1.ipcRenderer.invoke('show-broadsheet-preview');
        });
    });
}
document.body.onload = function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        const hostPayload = yield getPayloadFromHost();
        if (hostPayload.level === 'junior') {
            $('.senior').remove();
        }
        if (hostPayload.level === 'senior') {
            $('.junior').remove();
        }
        yield populateScoreTable();
        //handers
        selectClassChangeHandler();
        removeStudentHandler();
        generateReportSheetButtonHandler();
        showRemoveAndSelectAllButtonHandler();
        selectAllButtonHandler();
    });
};
