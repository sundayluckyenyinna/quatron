"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const jquery_1 = __importDefault(require("jquery"));
const $ = jquery_1.default;
var rvalidRows;
var rinvalidRows;
var rdatabasePayload;
electron_1.ipcRenderer.on('show-invalid-rows', function (event, validRows, invalidRows, databasePayload) {
    rvalidRows = validRows;
    rinvalidRows = invalidRows;
    rdatabasePayload = databasePayload;
    const pageDiv = $('<div/>', { 'class': 'error-section' });
    invalidRows.forEach(errorObject => {
        pageDiv.append(getSegmentOfFullError(errorObject));
    });
    $('#error-component').append(pageDiv);
});
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
    // send a message to the main process o update the continue upload progress
    console.log(rvalidRows, rinvalidRows, rdatabasePayload);
    electron_1.ipcRenderer.invoke('continue-upload', rvalidRows, rinvalidRows, rdatabasePayload);
});
$('#stop').on('click', function (event) {
    // send a message to the main process o update the continue upload progress
    electron_1.ipcRenderer.invoke('stop-upload');
});
