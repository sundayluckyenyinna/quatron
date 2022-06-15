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
function getSubjectNames() {
    return __awaiter(this, void 0, void 0, function* () {
        return Object(yield electron_1.ipcRenderer.invoke('subject-names-guest-page'))[0];
    });
}
function getPayloadFromHostPage() {
    return __awaiter(this, void 0, void 0, function* () {
        return Object(yield electron_1.ipcRenderer.invoke('subject-names-guest-page'))[1];
    });
}
// this function returns an object of the subjects names and the total number of students in a level (e.g Jss1, jss2, jss3 offering the subjects)
function getSubjectsAndCount() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield electron_1.ipcRenderer.invoke('subjects-and-student-count', yield getPayloadFromHostPage());
    });
}
;
function populateSubjectsDiv() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = $('#subjects');
        const subjects = yield getSubjectNames();
        console.log(subjects);
        const groupedArray = groupArrayInNumber(3, subjects);
        const subjectsAndCounts = yield getSubjectsAndCount();
        console.log(groupedArray);
        for (let i = 0; i < groupedArray.length; i++) {
            const setForRow = groupedArray[i];
            const row = getRowOfSubject(setForRow, subjectsAndCounts);
            // append the row to the container
            container.append(row);
        }
        return 1;
    });
}
function getRowOfSubject(subjects, subAndCount) {
    const row = $('<div/>', { 'class': 'row', 'css': { 'display': 'flex', 'flex-direction': 'row' } });
    subjects.forEach((subjectName) => {
        const subjectDiv = getSubjectOverallDiv(expandNeat(subjectName), subAndCount[subjectName]);
        row.append(subjectDiv);
    });
    return row;
}
function getSubjectOverallDiv(subjectName, numOffering) {
    return $('<div/>', { 'class': 'overall-subject' }).append(getSubjectNameDiv(subjectName))
        .append(getSummaryDiv(numOffering))
        .append(getButtonNavigationAndTrashDiv());
}
function getSubjectNameDiv(subjectName) {
    return $('<div/>', { 'text': subjectName, 'class': 'subject-name' });
}
function getSummaryDiv(numOffering) {
    const summaryDiv = $('<div/>', { 'class': 'offering-div' })
        .append($('<span/>', { 'text': 'Student offering', 'class': 'offering-span' }))
        .append($('<span/>', { 'text': numOffering.toString(), 'class': 'number-span' }));
    const natureDiv = $('<div/>', { 'text': 'Type : core' });
    return $('<div/>', { 'class': 'summary-div' }).append(summaryDiv, natureDiv);
}
function getButtonNavigationAndTrashDiv() {
    const button = $('<button/>', { 'text': 'Click to enter this subject', 'class': 'button-nav' });
    const trash = $('<button/>', { 'class': 'trash' });
    const div = $('<div/>', 'nav-and-trash').append(button);
    return div;
}
// utility function 
function expandNeat(subject) {
    subject = subject.trim();
    return subject.split('_').map((token) => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
}
function getNumberFromSubjectName(subjectName, object) {
    return object[subjectName];
}
function groupArrayInNumber(num, array) {
    const arr = array;
    const n = num;
    const groupedArray = arr.reduce((r, e, i) => (i % n ? r[r.length - 1].push(e) : r.push([e])) && r, []);
    return groupedArray;
}
;
function compress(value) {
    value = value.trim().toLowerCase();
    return value.split(' ').filter((token) => token !== '').join('_');
}
;
// handlers
function subjectButtonNavigationClickHandler() {
    $('.button-nav').on('click', function (event) {
        const subjectName = compress($(this).parent().parent().find('.subject-name').first().text());
        // send the subject name to the host page with the instruction to open a new page in the webview
        electron_1.ipcRenderer.sendToHost('open-class-broadsheet', subjectName);
    });
}
;
document.body.onload = function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        const done = yield populateSubjectsDiv();
        subjectButtonNavigationClickHandler();
        // ipcRenderer.invoke('subjects-and-student-count', {year:'2022', term:'first_term', level:'junior'});
    });
};
