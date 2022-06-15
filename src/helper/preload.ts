import { ipcRenderer } from "electron";

const title = Array.from(document.getElementsByTagName('title'))[0].innerText;
ipcRenderer.invoke('print', title)
alert(title);