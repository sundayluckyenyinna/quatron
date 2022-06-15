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
        .append($('<td/>', { 'class': 'total-score', 'text': score.Total_Score }));
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
function printHandler() {
    $('#print').on('click', function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            // get the folder path
            const subjectName = yield getSubjectNameFromHost();
            const payload = yield getPayloadFromHost();
            payload.subject = expandSubject(subjectName);
            const pathFile = yield electron_1.ipcRenderer.invoke('get-broadsheet-file-path', payload);
            $(this).css('display', 'none');
            const html = document.documentElement.outerHTML;
            yield electron_1.ipcRenderer.invoke('print-broadsheet', html, payload, pathFile);
        });
    });
}
document.body.onload = function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield populateScoreTable();
        printHandler();
        const payload = yield getPayloadFromHost();
        console.log(payload);
        console.log(yield getSubjectNameFromHost());
    });
};
