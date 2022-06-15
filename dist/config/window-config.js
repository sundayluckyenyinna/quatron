"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualUploadPageWindowConfig = exports.SubjectPageWindowConfig = exports.RemotePageWindowConfig = exports.ViewAllStudentWindowConfig = exports.UploadScoreWindowConfig = exports.SubjectWindowConfig = exports.RegisterTermWindowConfig = exports.RegisterStudentWindowConfig = exports.GenerateWindowConfig = exports.HomeWindowConfig = void 0;
exports.HomeWindowConfig = {
    autoHideMenuBar: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true
    }
};
exports.GenerateWindowConfig = Object.assign({}, exports.HomeWindowConfig);
exports.RegisterStudentWindowConfig = Object.assign({}, exports.HomeWindowConfig);
exports.RegisterTermWindowConfig = Object.assign({}, exports.HomeWindowConfig);
exports.SubjectWindowConfig = Object.assign({}, exports.HomeWindowConfig);
exports.UploadScoreWindowConfig = Object.assign({}, exports.HomeWindowConfig);
exports.ViewAllStudentWindowConfig = Object.assign({}, exports.HomeWindowConfig);
exports.RemotePageWindowConfig = Object.assign({}, exports.HomeWindowConfig);
exports.SubjectPageWindowConfig = Object.assign({}, exports.HomeWindowConfig);
exports.ManualUploadPageWindowConfig = Object.assign({}, exports.HomeWindowConfig);
