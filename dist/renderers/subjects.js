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
const webView = $('#webview');
const webviewDoc = document.getElementById('webview');
var level;
// webviewDoc?.addEventListener('dom-ready', function(){
//     webviewDoc.openDevTools();
// });
webviewDoc.addEventListener('ipc-message', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (event.channel = 'open-class-broadsheet') {
            yield handleOpenClassBroadsheetFromGuestPage(event.args[0]);
            return;
        }
    });
});
// handlers from the guest page 
function handleOpenClassBroadsheetFromGuestPage(subjectName) {
    return __awaiter(this, void 0, void 0, function* () {
        // tell the main process to save or update the selected subject and make sure it is done updating it by awaiting the promise invocation.
        yield electron_1.ipcRenderer.invoke('update-selected-subject-name', subjectName);
        // update the src attribute of the webview to the new page solely for that subject.
        webView.attr('src', 'class-broadsheet-page.html');
        console.log(subjectName);
    });
}
function getYear() {
    var _a;
    return (_a = $('#select-year').val()) === null || _a === void 0 ? void 0 : _a.toString().trim();
}
;
function getTerm() {
    var _a;
    return compress((_a = $('#select-term').val()) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase());
}
;
function getDataObject() {
    return {
        year: getYear(),
        term: getTerm()
    };
}
;
function getLevel() {
    // if ( level === undefined ) { return 'junior'; };
    return level;
}
function compress(value) {
    value = value.trim().toLowerCase();
    return value.split(' ').filter((token) => token !== '').join('_');
}
;
// function to populate the junior subjects page with the subjects from database
function showGuestPage(level) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = getDataObject();
        payload.level = level;
        payload.clazz = level === 'junior' ? 'jss1' : 'sss1';
        // help the guest page to get the subject names to render
        const allSubjectNamesArray = yield electron_1.ipcRenderer.invoke('level-subject-names', payload);
        // send a message to the main process to keep this subjectNames in a variable and wait for it to do so.
        yield electron_1.ipcRenderer.invoke('keep-subject-names', allSubjectNamesArray, payload);
        // now open up the junior subjects page. This page will get the subject names already stored in the main process to render its page
        webView.attr('src', 'junior-subjects.html');
    });
}
;
function validateCorrectInput() {
    return (!getTerm().toLowerCase().includes('select') && !getYear().toLowerCase().includes('select') && level !== undefined);
}
function validateCorrectInputWithoutLevel() {
    return (!getTerm().toLowerCase().includes('select') && !getYear().toLowerCase().includes('select'));
}
function showErrorDialog() {
    return __awaiter(this, void 0, void 0, function* () {
        yield electron_1.ipcRenderer.invoke('show-dialog', {
            message: 'Incorrect selection of one of term, session or both\n\nPlease select a valid option',
            title: '   Selection error',
            type: 'error'
        });
        return;
    });
}
$('#junior-subjects').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!validateCorrectInputWithoutLevel()) {
            showErrorDialog();
            return;
        }
        ;
        // set the level to junior
        level = 'junior';
        yield showGuestPage(getLevel());
    });
});
$('#senior-subjects').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!validateCorrectInputWithoutLevel()) {
            showErrorDialog();
            return;
        }
        ;
        // set the level to junior
        level = 'senior';
        yield showGuestPage(getLevel());
    });
});
$('#select-year').on('change', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!validateCorrectInput()) {
            return;
        }
        ;
        yield showGuestPage(getLevel());
    });
});
$('#select-term').on('change', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!validateCorrectInput()) {
            return;
        }
        ;
        yield showGuestPage(getLevel());
    });
});
