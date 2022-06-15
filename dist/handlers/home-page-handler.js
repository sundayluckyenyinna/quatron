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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
class HomePageHandler {
    /**
     * Show a page of a local url passed inside the given BrowserWindow. It is up to
     * the main process to decide if this Window is a new Window or an already existing
     * window.
     * @param url
     * @param win
     */
    showLocalPage(url, win) {
        return __awaiter(this, void 0, void 0, function* () {
            win.loadFile(url);
            win.once('ready-to-show', function () {
                HomePageHandler.displayWindow(win);
            });
        });
    }
    ;
    /**
     *
     * @param url
     * @param win
     */
    showRemotePage(url, win) {
        return __awaiter(this, void 0, void 0, function* () {
            win.loadURL(url);
            win.once('ready-to-show', function () {
                HomePageHandler.displayWindow(win);
            });
        });
    }
    ;
    /**
     *
     * @param win
     */
    static displayWindow(win) {
        win.maximize();
        win.show();
        win.shadow = true;
    }
    ;
}
exports.default = HomePageHandler;
