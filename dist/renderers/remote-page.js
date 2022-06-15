"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const jquery_1 = __importDefault(require("jquery"));
const $ = jquery_1.default;
function getTabGroup() {
    return $('#tabgroup');
}
;
function getAddTabButton() {
    return $('#add');
}
function getTabById(id) {
    const cssId = '#' + id;
    return $(cssId);
}
function getTabSection() {
    return $('#tab-section');
}
function getNumberOfTabs() {
    return $('#tabgroup').find('.tab').length;
}
;
function createNewTab() {
    const id = 'tab' + (getNumberOfTabs() + 1).toString();
    return $('<div/>', { 'class': 'tab' }).append(createTextDivOfTab(), createCancelDivOfTab()).attr('id', id);
}
;
function createTextDivOfTab() {
    return $('<div/>', { 'class': 'text' }).text('Springarr new tab');
}
;
function createCancelDivOfTab() {
    return $('<div/>', { 'class': 'cancel' }).append($('<img/>', { 'src': '../img/icons/cancel.png', 'width': '10', 'height': '10' }));
}
function showNewTab(tab) {
    getTabSection().append(tab);
    // send a message to the main process to hide all the other views and show a new one 
    electron_1.ipcRenderer.invoke('show-new-browser', tab.attr('id'));
}
;
function getUrlTextField() {
    return $('#url-text');
}
;
getAddTabButton().on('click', function (event) {
    event.stopPropagation();
    showNewTab(createNewTab());
});
$('body').on('click', '.text', function (event) {
    event.stopPropagation();
    electron_1.ipcRenderer.invoke('show-current-browser', $(this).parent().attr('id'));
});
$('body').on('click', '.cancel', function (event) {
    event.stopPropagation();
    const parentId = $(this).parent().attr('id');
    electron_1.ipcRenderer.invoke('remove-current-tab', parentId)
        .then(() => {
        $(this).parent().remove();
        $('body .text').trigger('click');
    });
});
// The lower control part of the browser
$('#back').on('click', function (event) {
    electron_1.ipcRenderer.invoke('go-back');
});
$('#forward').on('click', function (event) {
    electron_1.ipcRenderer.invoke('go-forward');
});
$('#reload').on('click', function (event) {
    electron_1.ipcRenderer.invoke('reload');
});
electron_1.ipcRenderer.on('display-url', function (event, data) {
    getUrlTextField().val(data.url);
});
electron_1.ipcRenderer.on('display-title', function (event, data) {
    getTabById(data.id).text(data.title);
});
