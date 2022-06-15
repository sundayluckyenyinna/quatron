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
var clazz = '';
var term = '';
var year = '';
function getCurrentSelectedStudentData() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('student-profile-data');
    });
}
;
function populatePassportField() {
    getCurrentSelectedStudentData()
        .then((data) => {
        $('#passport').attr('src', data.Passport_Image);
    });
}
;
function populatePersonalInfo() {
    getCurrentSelectedStudentData()
        .then((data) => fillPersonalDetailsTable(data));
}
;
function populateSubjectTable() {
    getCurrentSelectedStudentData()
        .then((data) => {
        const subjects = data.Subject;
        const neatSubjectArray = getNeatSubjectArray(subjects);
        fillSubjectTable(neatSubjectArray);
    });
}
function fillPersonalDetailsTable(data) {
    $('#surname-input').val(data.Surname);
    $('#firstname-input').val(data.First_Name);
    $('#middlename-input').val(data.Middle_Name);
    $('#student-no').text(data.Student_No);
    $('#dept-input').val(data.Department);
    $('#class').text(data.Clazz);
    $('#gender-input').val(data.Gender);
    $('#marital-input').val('Single');
    $('#dob-input').val(data.D_O_B);
    $('#nationality-input').val('Nigeria');
    $('#state-input').val(data.State_of_Origin);
}
;
function fillSubjectTable(neatSubject) {
    const fragment = $(document.createDocumentFragment());
    for (let i = 0; i < neatSubject.length; i++) {
        const sn = i + 1;
        const subjectName = neatSubject[i];
        const row = $('<tr/>', { 'data-index': i }).append($('<td/>', { 'text': sn, 'class': 'sn' }))
            .append($('<td/>', { 'text': subjectName, 'class': 'subject' }))
            .append($('<td/>', { 'class': 'sub-action', 'data-index': i }).append(createRemoveButton(i)));
        fragment.append(row);
    }
    ;
    $('#subjects-table').append(fragment);
    // add event listeners
    $('.remove-btn').on('click', function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            const subjects = getSubjectsArray((yield getCurrentSelectedStudentData()).Subject);
            $(this).parents('tr').remove();
        });
    });
    $('.remove-btn').attr('disabled', 'true');
}
;
function getPossibleChangedData() {
    var _a, _b, _c, _d, _e, _f, _g;
    const state = (_a = $('#state-input').val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
    const gender = (_b = $('#gender-input').val()) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase().trim();
    const dept = (_c = $('#dept-input').val()) === null || _c === void 0 ? void 0 : _c.toString().toLowerCase().trim();
    return {
        Student_No: $('#student-no').text(),
        Surname: (_d = $('#surname-input').val()) === null || _d === void 0 ? void 0 : _d.toString().toUpperCase().trim(),
        First_Name: (_e = $('#firstname-input').val()) === null || _e === void 0 ? void 0 : _e.toString().toUpperCase().trim(),
        Middle_Name: (_f = $('#middlename-input').val()) === null || _f === void 0 ? void 0 : _f.toString().toUpperCase().trim(),
        Department: (dept === null || dept === void 0 ? void 0 : dept.charAt(0).toUpperCase()) + (dept === null || dept === void 0 ? void 0 : dept.substring(1)),
        Gender: gender.charAt(0).toUpperCase() + gender.substring(1),
        D_O_B: (_g = $('#dob-input').val()) === null || _g === void 0 ? void 0 : _g.toString().toUpperCase().trim(),
        State_of_Origin: state.charAt(0).toUpperCase() + state.substring(1)
    };
}
function fillSubjectList(subjects) {
    const fragment = $(document.createDocumentFragment());
    subjects.forEach(subject => {
        const option = $('<option/>', { 'text': subject });
        fragment.append(option);
    });
    $('#select-subject').append(fragment);
}
function populateSubjects() {
    getCurrentSelectedStudentData()
        .then((data) => {
        electron_1.ipcRenderer.invoke('level-subject-names', { clazz: data.clazz, term: data.term, year: data.year })
            .then(subjects => {
            clazz = data.clazz;
            term = data.term;
            year = data.year;
            fillSubjectList(getNeatSubjectArray(subjects.join('#')));
        });
    });
}
;
function createRemoveButton(index) {
    return $('<button/>', { 'text': 'Remove', 'class': 'remove-btn', 'data-index': index });
}
;
function getNeatSubjectArray(subjects) {
    return subjects.split('#')
        .map(subject => splitSubject(subject));
}
;
function createNewSubjectRow(subject, position) {
    // return $('<tr/>', {}).append($('<td/>',{'text': position, 'class': 'sn'}))
    //                      .append($('<td/>',{'text': subject}))
    return $('<tr/>', { 'data-index': position - 1 }).append($('<td/>', { 'text': position, 'class': 'sn' }))
        .append($('<td/>', { 'text': subject, 'class': 'subject' }))
        .append($('<td/>', { 'class': 'sub-action', 'data-index': position - 1 }).append(createRemoveButton(position - 1)));
}
function getCurrentSubjectList() {
    const list = [];
    $('#subjects-table').find('.subject').each(function (index, element) {
        list.push($(this).text().trim());
    });
    return list;
}
function getDatatabaseInfo() {
    return {
        clazz: clazz,
        term: term,
        year: year
    };
}
function splitSubject(subject) {
    return subject.split('_').map(token => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
}
function getSubjectsArray(subjects) {
    return subjects.split('#');
}
;
function selectSubjectChangeHandler() {
    $('#select-subject').on('change', function (event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (((_a = $(this).val()) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase()) === 'select a registered subject') {
                return;
            }
            ;
            const numOfSubjects = $('#subjects-table').find('tr').length;
            if (getCurrentSubjectList().includes($(this).val())) {
                yield electron_1.ipcRenderer.invoke('show-dialog', {
                    message: 'Student already offering subject',
                    title: 'Error',
                    type: 'error'
                });
                return;
            }
            ;
            const newSubjectRow = createNewSubjectRow($(this).val(), (numOfSubjects));
            $('#subjects-table').append(newSubjectRow);
        });
    });
}
function saveChangesHandler() {
    $('#save-changes').on('click', function (save) {
        //invoke the main method to save the update
        const subjectString = getCurrentSubjectList().map(subject => subject.split(' ').join('_').toLowerCase()).join('#');
        const updatePayload = Object.assign(Object.assign({}, getPossibleChangedData()), { Subject: subjectString, data: getDatatabaseInfo() });
        electron_1.ipcRenderer.invoke('update-student-data', updatePayload);
    });
}
function editButtonHandler() {
    $('input').attr('disabled', 'true');
    $('.remove-btn').attr('disabled', 'true');
    $('#edit-button').on('click', function (event) {
        if ($(this).text().trim() === 'Edit') {
            $('input').removeAttr('disabled');
            $('.remove-btn').removeAttr('disabled');
            $(this).text('Done');
            return;
        }
        $('input').attr('disabled', 'true');
        $('.remove-btn').attr('disabled', 'true');
        $(this).text('Edit');
        return;
    });
}
document.body.onload = function () {
    populatePassportField();
    populatePersonalInfo();
    populateSubjectTable();
    populateSubjects();
    selectSubjectChangeHandler();
    saveChangesHandler();
    editButtonHandler();
};
