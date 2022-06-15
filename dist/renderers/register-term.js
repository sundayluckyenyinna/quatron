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
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcRenderer } = require('electron');
/** Import the jquery module */
const $ = require('jquery');
/** A global variable to hold all the academic years. */
let academicYearsArray = [];
/** FUNCTIONS  */
/**
 * Asynchronous process to populate the document select box with the academic years
 * from the database.
 */
function invokePopulateAcademicYearSelectBox() {
    return __awaiter(this, void 0, void 0, function* () {
        ipcRenderer.invoke('academic-years');
    });
}
;
invokePopulateAcademicYearSelectBox();
function populateAcademicSelectBox(academicYears) {
    const fragment = $(document.createDocumentFragment());
    academicYears.forEach((year) => {
        const option = $('<option />', { 'text': year });
        fragment.append(option);
    });
    $('#select-year').append(fragment);
}
;
function validateAcademicYearInputBeforeAttemptToSave(yearInput) {
    if (yearInput.length === 0) {
        return 300;
    }
    if (academicYearsArray.includes(yearInput)) {
        return 400;
    }
    ;
    return 200;
}
;
function validateDescriptionBeforeAttemptToSave(description) {
    if (description.length === 0)
        return false;
    return true;
}
;
// erroInfo = message and title and type
function showDialogSync(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ipcRenderer.invoke('show-dialog', payload);
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
/** HTML ELEMENTS EVENT HANDLERS */
$('#add-btn').on('click', function (event) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const statusCode = validateAcademicYearInputBeforeAttemptToSave($('#year-input').val());
        const isDescriptionValid = validateDescriptionBeforeAttemptToSave($('#desc').val());
        if (statusCode === 300) {
            yield showDialogSync({
                message: 'Academic Year cannot be empty',
                title: 'Empty Academic Year',
                type: 'error'
            });
            return;
        }
        ;
        if (statusCode === 400) {
            const id = showDialogSync({
                message: 'The academic year ' + $('#year-input').val() + ' is already saved',
                title: 'Non-Unique academic year',
                type: 'error'
            });
            return;
        }
        ;
        if (!isDescriptionValid) {
            yield showDialogSync({
                message: 'Description for the academic year cannot be empty. Enter a description.',
                title: 'Empty description',
                type: 'error'
            });
            return;
        }
        ;
        const year = compress((_a = $('#year-input').val()) === null || _a === void 0 ? void 0 : _a.toString().trim());
        const description = compress((_b = $('#desc').val()) === null || _b === void 0 ? void 0 : _b.toString().trim());
        const data = { year: year, description: description };
        ipcRenderer.invoke('add-academic-year', data);
    });
});
/** IPC EVENTS AND COMMUNICATION  */
// populate the select box with the academic years invoked.
ipcRenderer.on('academic-years', function (event, academicYears) {
    populateAcademicSelectBox(academicYears);
    academicYearsArray = academicYears;
});
ipcRenderer.on('add-academic-year', function (event, academicYears) {
    return __awaiter(this, void 0, void 0, function* () {
        const titleOption = $('<option />', { 'text': 'All acdemic years' });
        $('#select-year').find('option').remove().end().append(titleOption);
        populateAcademicSelectBox(academicYears);
        yield showDialogSync({
            message: 'Academic year ' + $('#year-input').val() + ' created successfully ',
            title: 'Success',
            type: 'info'
        });
        academicYearsArray.push($('#year-input').val());
    });
});
