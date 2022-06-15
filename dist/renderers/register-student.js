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
/** CONSTANT  */
var subjectObjectArray;
/** FUNCTIONS  */
function getNameObjectLiteral() {
    const nameObjectLiteral = {};
    $('.names').each(function (index, element) {
        var _a, _b, _c;
        var currentEle = $(this);
        switch (currentEle.attr('id')) {
            case 'surname':
                nameObjectLiteral.surname = (_a = currentEle.val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
                return;
            case 'first-name':
                nameObjectLiteral.firstName = (_b = currentEle.val()) === null || _b === void 0 ? void 0 : _b.toString().trim();
                return;
            case 'middle-name':
                nameObjectLiteral.middleName = (_c = currentEle.val()) === null || _c === void 0 ? void 0 : _c.toString().trim();
                return;
        }
        ;
    });
    return nameObjectLiteral;
}
;
function getPersonalDetailsObjectLiteral() {
    var _a, _b;
    const personalDetailsObjectLiteral = {};
    personalDetailsObjectLiteral.gender = 'none';
    $('.gender-option').each(function (index, element) {
        var _a;
        if (Object(element).checked) {
            personalDetailsObjectLiteral.gender = (_a = $(element).val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
        }
        ;
    });
    personalDetailsObjectLiteral.dateOfBirth = (_a = $('#dob').val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
    personalDetailsObjectLiteral.stateOfOrigin = (_b = $('#state').val()) === null || _b === void 0 ? void 0 : _b.toString().trim();
    return personalDetailsObjectLiteral;
}
;
function getSchoolDetailsObjectLiteral() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const clazz = (_a = $('#select-class').val()) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase().trim();
        const department = (_b = $('#select-department').val()) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase().trim();
        //Invoke the Main process to generate a StudentNo for the current student, updating the variable above
        const studentId = yield generateNewStudentId();
        const payload = { date: new Date(), department: department, id: studentId };
        const studentNo = yield generateStudentNoFromMain(payload);
        return {
            clazz: clazz,
            department: department,
            studentNo: studentNo,
            passport: $('#passport').attr('src'),
            admissionYear: new Date().getFullYear().toString()
        };
    });
}
function getSubjectsArray() {
    const subjectArray = [];
    $("input[type='checkbox']").each(function (index, element) {
        var _a;
        if (Object(element).checked) {
            const overallParent = (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
            const subject = compress($(Object(overallParent)).find('label').text().toLowerCase().trim());
            subjectArray.push(subject);
        }
        ;
    });
    return subjectArray;
}
;
function compressSubject(subject) {
    return subject.split(' ').filter(token => token !== ' ').join('');
}
;
function getAllSubjectCompressed() {
    return getSubjectsArray().join('#');
}
;
function compressClass(clazz) {
    return clazz.split(' ').join('');
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
function getStudentObjectAndSendToMain() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const name = getNameObjectLiteral();
        const personalDetails = getPersonalDetailsObjectLiteral();
        const schoolDetails = yield getSchoolDetailsObjectLiteral();
        const subjectsString = getAllSubjectCompressed();
        const databaseInfo = {
            year: (_a = $('#select-year').val()) === null || _a === void 0 ? void 0 : _a.toString().trim(),
            term: compress((_b = $('#select-term').val()) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase().trim()),
            clazz: compressClass(schoolDetails.clazz)
        };
        const studentObjectLiteral = {
            data: databaseInfo,
            name: name,
            personalDetails: personalDetails,
            schoolDetails: schoolDetails,
            subjects: subjectsString
        };
        return studentObjectLiteral;
    });
}
;
function getClassDatabaseInfo() {
    var _a, _b, _c;
    return {
        year: (_a = $('#select-year').val()) === null || _a === void 0 ? void 0 : _a.toString().trim(),
        term: compress((_b = $('#select-term').val()) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase().trim()),
        clazz: compressClass((_c = $('#select-class').val()) === null || _c === void 0 ? void 0 : _c.toString().toLowerCase().trim())
    };
}
;
function populateSelectYearBox() {
    return __awaiter(this, void 0, void 0, function* () {
        const academicYearsArray = yield getAllRegisteredAcademicYears();
        const fragment = $(document.createDocumentFragment());
        academicYearsArray.forEach(year => {
            const option = $('<option />', { 'text': year });
            fragment.append(option);
        });
        console.log(fragment);
        $('#select-year').append(fragment);
    });
}
;
function initiateSubjectObjectVariable() {
    return __awaiter(this, void 0, void 0, function* () {
        const databaseInfo = getClassDatabaseInfo();
        subjectObjectArray = yield electron_1.ipcRenderer.invoke('all-subjects-object', databaseInfo);
        console.log(subjectObjectArray);
    });
}
;
function expand(value) {
    value = value.trim();
    return value.split('_')
        .map((token) => token.charAt(0).toUpperCase() + token.substring(1))
        .join(' ');
}
function implementOnchangeOfClassSelectBox() {
    return __awaiter(this, void 0, void 0, function* () {
        $('#select-class').on('change', function (event) {
            return __awaiter(this, void 0, void 0, function* () {
                // //first clear out everything from the subjects
                $('.subject-section-inner').remove();
                const databaseInfo = getClassDatabaseInfo();
                subjectObjectArray = yield electron_1.ipcRenderer.invoke('all-subjects-object', databaseInfo);
                // create  divs
                const subjectNames = subjectObjectArray.map((object) => {
                    return object.Subject_Name;
                });
                let i = 0;
                while (i < subjectNames.length) {
                    const parent1 = $('<div/>', {});
                    const first1 = $('<div/>', {}).append($('<input/>', { 'type': 'checkbox' }));
                    const second1 = $('<div/>', { 'class': 'subject-label' }).append($('<label/>', { 'text': expand(subjectNames[i]) }));
                    parent1.addClass('subject-section-inner').append(first1, second1);
                    $('#subject-section-left').append(parent1);
                    if ((i + 1) >= subjectNames.length) {
                        break;
                    }
                    ;
                    const parent2 = $('<div/>', {});
                    const first2 = $('<div/>', {}).append($('<input/>', { 'type': 'checkbox' }));
                    const second2 = $('<div/>', { 'class': 'subject-label' }).append($('<label/>', { 'text': expand(subjectNames[i + 1]) }));
                    parent2.addClass('subject-section-inner').append(first2, second2);
                    $('#subject-section-center').append(parent2);
                    if ((i + 2) >= subjectNames.length) {
                        break;
                    }
                    ;
                    const parent3 = $('<div/>', {});
                    const first3 = $('<div/>', {}).append($('<input/>', { 'type': 'checkbox' }));
                    const second3 = $('<div/>', { 'class': 'subject-label' }).append($('<label/>', { 'text': expand(subjectNames[i + 2]) }));
                    parent3.addClass('subject-section-inner').append(first3, second3);
                    $('#subject-section-right').append(parent3);
                    i = i + 3;
                }
                ;
            });
        });
    });
}
;
/** fFunctions that invokes the main process */
function generateStudentNoFromMain(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield electron_1.ipcRenderer.invoke('student-no', payload));
    });
}
;
function getTotalNumberOfStudentsInDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = Object.assign({}, getClassDatabaseInfo());
        return (yield electron_1.ipcRenderer.invoke('count-of-students', payload));
    });
}
;
function generateNewStudentId() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getTotalNumberOfStudentsInDatabase()) + 1;
    });
}
;
function saveNewStudent(studentObjectLiteral) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield electron_1.ipcRenderer.invoke('save-student', studentObjectLiteral));
    });
}
;
function getAllRegisteredAcademicYears() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('academic-years');
    });
}
;
// erroInfo = message and title and type
function showDialogSync(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('show-dialog', payload);
    });
}
;
/** Document Element Handlers */
document.body.onload = function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield populateSelectYearBox();
        yield initiateSubjectObjectVariable();
        yield implementOnchangeOfClassSelectBox();
        $('#select-department').attr('disabled', 'disabled');
    });
};
$('#select-passport-btn').on('click', function () {
    // trigger the file input click handler
    $('#select-passport').trigger('click');
});
$('#select-passport').on('change', function () {
    const imageFile = Object(document.getElementById('select-passport')).files[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(imageFile);
    fileReader.onload = function (event) {
        $('#passport').attr('src', fileReader.result);
        $('#passport').css('display', 'block');
    };
});
$('#select-class').on('change', function (event) {
    var _a, _b;
    if ((_a = $('#select-class').val()) === null || _a === void 0 ? void 0 : _a.toString().includes('JSS')) {
        //clear everything about the senior department
        $('.j').remove();
        $('.s').remove();
        $('#select-department').append($('<option/>', { 'text': 'None' }).addClass('j'))
            .attr('disabled', 'disabled');
        return;
    }
    ;
    if ((_b = $('#select-class').val()) === null || _b === void 0 ? void 0 : _b.toString().includes('SSS')) {
        //clear everything about the junior and add back the senior
        $('.j').remove();
        $('.s').remove();
        $('#select-department').append($('<option/>', { 'text': 'Science' }).addClass('s'))
            .append($('<option/>', { 'text': 'Commercial' }).addClass('s'))
            .append($('<option/>', { 'text': 'Arts' }).addClass('s'))
            .removeAttr('disabled');
        return;
    }
    ;
});
$('#reset-btn').on('click', function (event) {
    event === null || event === void 0 ? void 0 : event.preventDefault();
    window.location.reload();
});
$('#form').on('submit', function () {
    getStudentObjectAndSendToMain()
        .then((studentObjectLiteral) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (((_a = $('#select-class').val()) === null || _a === void 0 ? void 0 : _a.toString().trim()) === 'Select class') {
            yield showDialogSync({
                message: 'Please select a class for the student',
                title: 'Error',
                type: 'error'
            });
            return;
        }
        ;
        const done = yield saveNewStudent(studentObjectLiteral);
        return done;
    }))
        .then((success) => __awaiter(this, void 0, void 0, function* () {
        if (success) {
            yield showDialogSync({
                message: 'Successful registration of student',
                title: 'Success',
                type: 'info'
            });
            window.location.reload();
            return;
        }
        yield showDialogSync({
            message: 'Error while trying to save student.',
            title: 'Error',
            type: 'error'
        });
    }))
        .catch(error => console.log('could not save student.'))
        .finally(() => console.log('Handled'));
    return false;
});
