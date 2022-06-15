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
const fs_1 = __importDefault(require("fs"));
const googleapis_1 = require("googleapis");
class GoogleDriveHandler {
    constructor() {
    }
    getAuth(keyFile, scope) {
        // const KEY_PATH = 'C:\Users\lucky\VScodeProjects\dis-electron\dist\disdrivestorage-9a7a145c01bf.json';
        // const SCOPES = ['https://www.googleapis.com/auth/drive'];
        const auth = new googleapis_1.google.auth.GoogleAuth({
            keyFile: keyFile,
            scopes: scope
        });
        return auth;
    }
    ;
    createAndSaveFile(auth) {
        return __awaiter(this, void 0, void 0, function* () {
            // create the driverService
            const driverService = googleapis_1.google.drive({ version: 'v3', auth });
            // create the file meta data
            const fileMetadata = {
                'name': 'scores.pdf',
                'parents': ['parent_folder']
            };
            // create the file for the file itself
            const media = {
                mimeType: 'application/pdf',
                body: fs_1.default.createReadStream('C:\Users\lucky\VScodeProjects\dis-electron\dist\scores.pdf')
            };
            // get the response from sending
            const response = yield driverService.files.create({
                requestBody: {
                    name: 'scores',
                    mimeType: 'application/pdf',
                    parents: ['parent_folder']
                },
                media: media,
                fields: 'id'
            });
            console.log(response.status);
            console.log(response.data);
        });
    }
}
exports.default = GoogleDriveHandler;
