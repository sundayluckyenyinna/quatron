"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const title = Array.from(document.getElementsByTagName('title'))[0].innerText;
electron_1.ipcRenderer.invoke('print', title);
alert(title);
