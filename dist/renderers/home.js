"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** Import the ipcRenderer module */
const electron_1 = require("electron");
const jquery_1 = __importDefault(require("jquery"));
/** Import the jquery module */
const $ = jquery_1.default;
$('.page-navigator').on('click', function () {
    /** construct a payload for the main process handler */
    const payload = {
        id: $(this).attr('id'),
        fileType: $(this).attr('data-filetype'),
        url: $(this).attr('data-url')
    };
    /** Invoke an event in the main process to map the button's id to the page to be shown */
    electron_1.ipcRenderer.invoke('show', payload);
});
$('#internet').on('click', function (event) {
    electron_1.ipcRenderer.invoke('show-remote-page');
});
$('#backup').on('click', function (event) {
    electron_1.ipcRenderer.invoke('show-page', 'back-up-page.html');
});
$('#view-all-subjects').on('click', function (event) {
    electron_1.ipcRenderer.invoke('show-page', 'subjects.html');
});
$('#register-settings').on('click', function (event) {
    electron_1.ipcRenderer.invoke('show-page', 'school-registration-settings.html');
});
$('#help').on('click', function (event) {
    window.location.reload();
});
