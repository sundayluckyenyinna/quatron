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
// the color system
let colors = [];
// load all the default teacher and principal comments from the database through the main process.
function getDefaultTeacherComments() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('get-default-teacher-comments');
    });
}
function getDefaultPrincipalComments() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('get-default-principal-comments');
    });
}
// collects the 'comments'
function getAllComments() {
    return __awaiter(this, void 0, void 0, function* () {
        const teacherComments = yield electron_1.ipcRenderer.invoke('get-teacher-comments');
        const principalComments = yield electron_1.ipcRenderer.invoke('get-principal-comments');
        return [teacherComments, principalComments];
    });
}
// collects the color schemes
function getAllColors() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('get-colors');
    });
}
document.body.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultTeacherComments = yield getDefaultTeacherComments();
        const defaultPrincipalComments = yield getDefaultPrincipalComments();
        // const teacherComments = await (await getAllComments())[0];
        // const principalComments = await (await getAllComments())[1];
        // // the teachers comment type
        // const goodTeacherComments : string[] | any = teacherComments.map((comment : string  ) => {
        //     if( comment.endsWith('#good') ){ return comment.substring(0, comment.lastIndexOf('#')); }
        // });
        // const badComments : string[] | any = teacherComments.map((comment : string ) => {
        //     if( comment.endsWith('#bad') ){ return comment.substring(0, comment.lastIndexOf('#')); }
        // });
        // // the principal comments
        // const excellentPrincipal : string[] | any  = principalComments.map((comment : string) => {
        //     if( comment.endsWith('#excellent') ){ return comment.substring(0, comment.lastIndexOf('#')); }
        // });
        // const veryGoodPrincipal : string[] | any = principalComments.map((comment : string) => {
        //     if( comment.endsWith('#verygood') ){ return comment.substring(0, comment.lastIndexOf('#')); }
        // });
        // const goodPrincipal : string[] | any = principalComments.map((comment : string) => {
        //     if( comment.endsWith('#good') ){ return comment.substring(0, comment.lastIndexOf('#')); }
        // });
        // const poorPrincipal : string[] | any = principalComments.map((comment : string) => {
        //     if( comment.endsWith('#poor') ){ return comment.substring(0, comment.lastIndexOf('#')); }
        // });
        // const failedPrincipal : string[] | any = principalComments.map((comment : string) => {
        //     if( comment.endsWith('#failed') ){ return comment.substring(0, comment.lastIndexOf('#')); }
        // });
        // colors = await getAllColors();
        const [data, additionalData] = yield electron_1.ipcRenderer.invoke('student-data');
        // await ipcRenderer.invoke('print', data);
        // await ipcRenderer.invoke('print', additionalData);
        // populate the teachers comment
        populateTeacherComments(defaultTeacherComments.good);
        const averageScore = populateReportSheetWithStudentData(data, additionalData);
        //The long statement to decide the principal's comment
        if (averageScore >= 80) {
            populatePrincipalComments([...defaultPrincipalComments.excellent]);
        }
        else if (averageScore >= 70 && averageScore <= 79) {
            populatePrincipalComments([...defaultPrincipalComments.veryGood]);
        }
        else if (averageScore >= 60 && averageScore <= 69) {
            populatePrincipalComments([...defaultPrincipalComments.good]);
        }
        else if (averageScore >= 40 && averageScore <= 59) {
            populatePrincipalComments([...defaultPrincipalComments.poor]);
        }
        else {
            populatePrincipalComments([...defaultPrincipalComments.failed]);
        }
        const html = document.documentElement.outerHTML;
        yield electron_1.ipcRenderer.invoke('update-report-html', html);
    });
};
function populateReportSheetWithStudentData(data, additionalData) {
    populateHeader(additionalData);
    populateStudentData(data);
    populateNextTermDetails(additionalData);
    const totalsArray = populateSubjectTable(data.subjectsAndScores);
    const averageScore = populateAverageScore(totalsArray);
    populateDateGenerated();
    return averageScore;
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
function populateTeacherComments(combinedTeacherComments) {
    // Get a random good comment from the given array and populate the comment part of the report sheet with it.
    const comment = getRandomCommentFromComments(combinedTeacherComments);
    $('#class-teacher-comment').text(comment);
}
function populatePrincipalComments(combinedPrincipalComments) {
    const headTeacherComment = getRandomCommentFromComments(combinedPrincipalComments);
    let principalComment = '';
    while (true) {
        let anotherComment = getRandomCommentFromComments(combinedPrincipalComments);
        if (anotherComment !== headTeacherComment) {
            principalComment = anotherComment;
            break;
        }
        else {
            continue;
        }
    }
    $('#head-teacher-comment').text(headTeacherComment);
    $('#principal-comment').text(principalComment);
}
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
function getRandomCommentFromComments(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
