"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const jquery_1 = __importDefault(require("jquery"));
const $ = jquery_1.default;
var rvalids;
var rinvalids;
var rpayload;
electron_1.ipcRenderer.on('show-invalid-rows-excel', function (event, validObjects, invalidObjects, payload) {
    rvalids = validObjects;
    rinvalids = invalidObjects;
    rpayload = payload;
    console.log(rinvalids); //
    console.log(rvalids); //
    const content = $('#content');
    const subjectErrors = [];
    invalidObjects.forEach((object) => {
        const subjectHeader = createSubjectHeader(object);
        const subjectErrorDiv = $('<div/>', {});
        subjectErrorDiv.append(subjectHeader);
        const subjectName = Object.keys(object)[0];
        const invalidRows = object[subjectName].invalidRows;
        invalidRows.forEach((errorObject) => {
            subjectErrorDiv.append(getSegmentOfFullError(errorObject));
        });
        subjectErrors.push(subjectErrorDiv);
    });
    subjectErrors.forEach((subjectError) => content.append(subjectError));
});
function createSubjectHeader(subjectObject) {
    const subjectName = expand(Object.keys(subjectObject)[0]);
    return $('<div/>', { 'text': subjectName, 'class': 'subject-header' });
}
;
function getHeaderOfErrorBox(rowNumber) {
    return $('<div/>', { 'text': 'Row number : ' + rowNumber, 'class': 'row-number' });
}
;
function getComponentErrorBox(error) {
    const allErrors = [];
    // get the keys of the object
    const keys = Object.keys(error);
    keys.forEach(key => {
        const message = getAppropriateMessageFromKey(key);
        const div = $('<div/>', { 'text': message + ' : ' + error[key], 'class': 'message' });
        allErrors.push(div);
    });
    return allErrors;
}
function getOverallErrorComponent(error) {
    const overall = $('<div/>', { 'class': 'error-container-inner' });
    getComponentErrorBox(error).forEach(div => {
        overall.append(div);
    });
    return overall;
}
function getSegmentOfFullError(errorObject) {
    const con = $('<div/>', { 'class': 'error-segment' });
    con.append(getHeaderOfErrorBox(errorObject.rowNumber), getOverallErrorComponent(errorObject.error));
    return con;
}
;
function expand(value) {
    value = value.trim();
    return value.split('_').map((token) => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
}
;
function getAppropriateMessageFromKey(key) {
    let message = '';
    switch (key) {
        case 'invalidNumberMessage':
            message = 'Student No. error';
            break;
        case 'invalidCaMessage':
            message = 'Ca Score error';
            break;
        case 'invalidExamMessage':
            message = 'Exam Score error';
            break;
    }
    ;
    return message;
}
;
$('#continue').on('click', function (event) {
    // We need an array of validRows and the payload for each subject
    const submissionArray = [];
    // submit the valid rows of both the subjects that are faulty and those that are perfect.
    const all = rvalids.concat(rinvalids);
    // walk throught the rvalids and get the validRows and their separate payloads
    all.forEach((validSubject) => {
        // get the subject name
        const subjectName = Object.keys(validSubject)[0];
        // get the validRows array for the student records
        const validRows = validSubject[subjectName].validRows;
        // construct the payload that MUST include the subjectname 
        const payload = Object.assign(Object.assign({}, rpayload), { subject: subjectName });
        // put the validRows and its own payload in an array
        const readySubjectToUpload = [validRows, payload];
        // store it in the submissionArray
        submissionArray.push(readySubjectToUpload);
    });
    console.log(submissionArray);
    // invoke the main process to update the score
    electron_1.ipcRenderer.invoke('update-scores-single-excel', submissionArray);
});
$('#stop').on('click', function (event) {
    electron_1.ipcRenderer.invoke('stop-excel-upload');
});
