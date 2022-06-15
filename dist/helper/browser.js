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
const path_1 = __importDefault(require("path"));
class Browser extends electron_1.BrowserView {
    constructor(id, bounds, window = undefined) {
        super({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: path_1.default.join(__dirname, 'preload.js')
            }
        });
        this.getId = () => {
            return this.id;
        };
        this.setId = (id) => {
            this.id = id;
        };
        this.makeVisible = (bounds) => {
            this.setBounds({ x: 0, y: 80, width: bounds.width, height: bounds.height });
        };
        this.hide = () => {
            this.setBounds({ x: 0, y: 0, width: 0, height: 0 });
        };
        this.setAutoResize({
            width: true,
            height: true,
            horizontal: true,
            vertical: true
        });
        this.id = id;
        this.window = window;
        this.webContents.loadURL(Browser.defaultUrl);
        this.webContents.on('will-navigate', function (event, url) {
            window === null || window === void 0 ? void 0 : window.webContents.send('display-url', { id: id, url: url });
        }).on('did-navigate', function (event, url) {
            return __awaiter(this, void 0, void 0, function* () {
                window === null || window === void 0 ? void 0 : window.webContents.send('display-url', { id: id, url: url });
            });
        }).on('did-fail-load', function (event, errorCode, errorDesc, validatedUrl) {
            // implement logic for failing to load
        });
        this.webContents.session.on('will-download', function (event, item, webContents) {
            // implement logic for download
        });
        this.setBounds({ x: 0, y: 80, width: 1366, height: 728 - 80 });
        this.makeVisible(bounds);
    }
}
exports.default = Browser;
Browser.defaultUrl = 'https://www.google.com/';
