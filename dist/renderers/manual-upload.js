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
/** CONSTANTS */
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
        clazz: getClass(),
        subject: getSubject()
    };
}
;
function isStudentOfferSubject(student, subject) {
    //split the student subject to arr
    return ((student.Subject).split('#')).includes(subject);
}
;
function displayStudentsInTable(studentsData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(studentsData);
        const studentScores = yield getAllStudentScoresForSubjectForYearTermClass(getAllSelectBoxData());
        // create a jquery fragment 
        const fragment = $(document.createDocumentFragment());
        // create a row and append subsequent columns
        studentsData.forEach((student, studentIndex) => {
            // get the student score object
            const score = getStudentScoreByStudentNo(student.Student_No, studentScores);
            // create input for the scores
            const caScoreInput = $('<input/>', { 'type': 'number', 'class': 'score-input-column ca_score-input' }).val(score.Ca_Score).attr('disabled', 'true');
            const examScoreInput = $('<input/>', { 'type': 'number', 'class': 'score-input-column exam_score-input' }).val(score.Exam_Score).attr('disabled', 'true');
            const studentRow = $('<tr/>', {}).append($('<td/>', { 'text': studentIndex + 1, 'class': 'column' }))
                .append($('<td/>', { 'text': student.Student_No, 'class': 'column student_no' }))
                .append($('<td/>', { 'text': student.Surname, 'class': 'column' }))
                .append($('<td/>', { 'text': student.First_Name, 'class': 'column' }))
                .append($('<td/>', { 'text': student.Middle_Name, 'class': 'column' }))
                .append($('<td/>', { 'class': 'column ca_score' }).append(caScoreInput))
                .append($('<td/>', { 'class': 'column exam_score' }).append(examScoreInput));
            studentRow.addClass('student-row');
            fragment.append(studentRow);
        });
        $('#score-table').append(fragment);
    });
}
;
function changeHandler() {
    return __awaiter(this, void 0, void 0, function* () {
        $('.student-row').remove();
        if (checkThatOneFieldIsInappropriate()) {
            $('#select-subject').find('.subject-option').remove();
            return;
        }
        ;
        const subjectNames = yield electron_1.ipcRenderer.invoke('level-subject-names', getAllSelectBoxData());
        const prettySubjects = subjectNames.map(subject => expand(subject));
        // populate the subject select box with the subjects
        populateSubjectSelectBox(prettySubjects);
        // remove all entries and trigger the display student button automatically
        if (getSubject() === 'select_subject') {
            return;
        }
        ;
        $('#display-students').trigger('click');
    });
}
;
function displayStudentHandler() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // remove the former rows and redisplay 
            $('.student-row').remove();
            if (checkThatOneFieldIsInappropriate()) {
                console.log('try again');
                return;
            }
            ;
            // if all complete, fetch the students for that subjects and populate the table
            const studentsData = yield getAllStudentsForSubjectForYearTermClass(getAllSelectBoxData());
            // display the students in the table
            yield displayStudentsInTable(studentsData);
        }
        catch (error) {
            console.log(error);
        }
        ;
    });
}
;
function getStudentScoreByStudentNo(studentNo, scores) {
    return scores.filter(score => score.Student_No === studentNo)[0];
}
;
function populateSubjectSelectBox(subjects) {
    $('#select-subject').find('.subject-option').remove();
    const fragment = $(document.createDocumentFragment());
    subjects.forEach(subject => {
        fragment.append($('<option/>', { 'text': subject }).addClass('subject-option'));
    });
    $('#select-subject').append(fragment);
}
;
/** Functions that invokes the main process */
function getAllStudentsForSubjectForYearTermClass(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const studentsArray = yield getAllStudentsByClass(data);
        const studentsOfferingSubject = [];
        studentsArray.forEach((object) => {
            if (isStudentOfferSubject(object, data.subject)) {
                studentsOfferingSubject.push(object);
                return;
            }
            ;
        });
        return studentsOfferingSubject;
    });
}
;
function getAllStudentScoresForSubjectForYearTermClass(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // data contains subjectname, year, term and clazz
        return yield electron_1.ipcRenderer.invoke('student-scores', data);
    });
}
;
function getAllStudentsByClass(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('students-for-class', data);
    });
}
;
function populateAcademicYear() {
    return __awaiter(this, void 0, void 0, function* () {
        const fragment = $(document.createDocumentFragment());
        const years = yield electron_1.ipcRenderer.invoke('academic-years');
        years.forEach((year) => {
            const option = $('<option/>', { 'text': year });
            fragment.append(option);
        });
        $('#select-year').append(fragment);
    });
}
/** Handlers for the HTML elements */
populateAcademicYear();
$('#select-year').on('change', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield changeHandler();
    });
});
$('#select-term').on('change', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield changeHandler();
    });
});
$('#select-class').on('change', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield changeHandler();
    });
});
$('#select-subject').on('change', function (event) {
    if (getSubject() === 'select_subject') {
        $('.student-row').remove();
        return;
    }
    ;
    $('#display-students').trigger('click');
});
$('#display-students').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield displayStudentHandler();
    });
});
$('#save-changes').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        const scores = [];
        $('.student-row').each(function (index, element) {
            var _a, _b;
            // get the student-no, ca score and exam score in an array
            const row = $(this);
            const student_no = row.find('.student_no').first().text().trim();
            const ca_score = (_a = row.find('.ca_score-input').first().val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
            const exam_score = (_b = row.find('.exam_score-input').first().val()) === null || _b === void 0 ? void 0 : _b.toString().trim();
            const studentScore = { Student_No: student_no, Ca_Score: ca_score, Exam_Score: exam_score };
            scores.push(studentScore);
        });
        // send a message to the main to save the records
        const done = yield electron_1.ipcRenderer.invoke('update-scores-for-class', scores, getAllSelectBoxData());
    });
});
$('#edit-ca-score').on('click', function (event) {
    if ($(this).text() === 'Edit') {
        $('.ca_score-input').each(function (index) { console.log($(this).removeAttr('disabled')); });
        $(this).text('Done').css('background-color', 'green');
        return;
    }
    // then the text must be 'Done'
    $('.ca_score-input').attr('disabled', 'false');
    $(this).text('Edit').css('background-color', 'blue');
    return;
});
$('#edit-exam-score').on('click', function (event) {
    if ($(this).text() === 'Edit') {
        $('.exam_score-input').each(function (index) { console.log($(this).removeAttr('disabled')); });
        $(this).text('Done').css('background-color', 'green');
        return;
    }
    ;
    // then the text must be 'Done' 
    $('.exam_score-input').attr('disabled', 'false');
    $(this).text('Edit').css('background-color', 'blue');
    return;
});
