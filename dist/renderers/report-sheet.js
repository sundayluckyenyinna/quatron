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
document.body.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const [data, additionalData] = yield electron_1.ipcRenderer.invoke('student-data');
        console.log(data, additionalData);
        populateReportSheetWithStudentData(data, additionalData);
        console.log(document.documentElement.outerHTML);
    });
};
function populateReportSheetWithStudentData(data, additionalData) {
    populateHeader(additionalData);
    populateStudentData(data);
    populateNextTermDetails(additionalData);
    const totalsArray = populateSubjectTable(data.subjectsAndScores);
    populateAverageScore(totalsArray);
    populateDateGenerated();
}
;
/** populate the report sheet with the student data */
// populate the header payload is additionalData
function populateHeader(payload) {
    $('#term').text(neat(payload.term));
    let year = payload.year === payload.nextTermBeginYear ? payload.year : payload.year + '/' + payload.nextTermBeginYear;
    $('#year').text(year);
}
;
// the data is the main payload, not the additionalPayload o
function populateStudentData(data) {
    $('#surname').text(data.studentDetails.Surname);
    $('#othernames').text(data.studentDetails.First_Name + '  ' + data.studentDetails.Middle_Name);
    $('#class').text(neat(data.studentDetails.Clazz));
    $('#department').text(neat(data.studentDetails.Department));
    $('#student-no').text(neat(data.studentDetails.Student_No));
    $('#nationality').text('Nigeria');
    $('#gender').text(data.studentDetails.Gender);
    $('#origin').text(data.studentDetails.State_of_Origin);
    $('#passport').attr('src', data.studentDetails.Passport_Image);
}
;
function populateNextTermDetails(additionalPayload) {
    $('#next-term-begin').text(additionalPayload.nextTermBeginMonth + ' ' + additionalPayload.nextTermBeginYear);
    $('#next-term-end').text(additionalPayload.nextTermEndMonth + ' ' + additionalPayload.nextTermEndYear);
}
;
function populateSubjectTable(data) {
    const table = $('#subject-table');
    const totals = [];
    // create a fragment
    const fragment = $(document.createDocumentFragment());
    // create as many elements as there are in the data object array
    for (let index = 0; index < data.length; index++) {
        const object = data[index];
        // create a row
        const sN = String(index + 1);
        const row = $('<tr/>', {}).css(getRowCSS())
            .append($('<td/>', { 'text': sN }).css(getGeneralColumnCSS()))
            .append($('<td/>', { 'text': object.subjectName }).css(getSubjectColumnCSS()))
            .append($('<td/>', { 'text': object.Ca_Score }).css(getGeneralColumnCSS()))
            .append($('<td/>', { 'text': object.Exam_Score }).css(getGeneralColumnCSS()))
            .append($('<td/>', { 'text': object.Total_Score }).css(getGeneralColumnCSS()))
            .append($('<td/>', { 'text': object.Grade }).css(getGeneralColumnCSS()))
            .append($('<td/>', { 'text': object.Remarks }).css(getGeneralColumnCSS()));
        fragment.append(row);
        totals.push(Number(object.Total_Score));
    }
    ;
    table.append(fragment);
    return totals;
}
;
function populateAverageScore(scores) {
    const totalScores = scores.reduce((a, b) => a.valueOf() + b.valueOf(), 0);
    const averageScore = Number((totalScores.valueOf() / scores.length).toFixed(2));
    $('#average-score').text(averageScore.toString() + '%');
    return averageScore;
}
;
function populateDateGenerated() {
    const date = new Date();
    const formattedDate = [date.toLocaleString('default', { day: 'numeric' }),
        date.toLocaleString('default', { month: 'short' }),
        date.toLocaleString('default', { year: 'numeric' })];
    $('#date-generated').text(formattedDate.join(' '));
}
;
function getGeneralColumnCSS() {
    return {
        "padding-left": "10px",
        "padding-right": "10px",
        "border": "solid 1px lightgrey",
        "border-collapse": "collapse"
    };
}
;
function getSubjectColumnCSS() {
    return {
        "text-align": "left",
        "padding-left": "10px"
    };
}
;
function getRowCSS() {
    return {
        "font-size": "9pt",
        "border": "solid 1px lightgrey",
        "border-collapse": "collapse"
    };
}
;
function neat(value) {
    return value.split('_').map(token => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
}
;
