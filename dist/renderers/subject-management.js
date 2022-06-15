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
let folderPath;
$('#browse').on('click', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        // tell the main process to open folder
        const paths = yield electron_1.ipcRenderer.invoke('show-directory-chooser');
        const path = paths[0];
        folderPath = path;
        yield electron_1.ipcRenderer.invoke('update-broadsheet-folder-path', folderPath);
        $('#folder-path').css('visibility', 'visible');
        $('#folder-path').val(folderPath);
    });
});
document.body.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const folderPath = yield electron_1.ipcRenderer.invoke('get-broadsheet-folder-path');
        if (folderPath) {
            $('#folder-path').css('visibility', 'visible');
            $('#folder-path').val(folderPath);
        }
    });
};
