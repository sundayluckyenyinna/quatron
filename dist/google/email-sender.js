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
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
class EmailSenderService {
    constructor() {
    }
    getTransporter() {
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'sundayluckyenyinnadeveloper@gmail.com',
                pass: '123456Professor??'
            }
        });
        return transporter;
    }
    getMailOptions(payload) {
        const mailOptions = {
            from: 'Quatron@springarr.development.backup',
            sender: 'Quatron@springarr.development.backup',
            to: payload.emails,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            attachments: [
                {
                    filename: payload.filename + '.zip',
                    content: fs_1.default.createReadStream(payload.zipFilePath)
                }
            ]
        };
        // console.log( mailOptions );
        return mailOptions;
    }
    sendEmail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let success = false;
            try {
                const sentInfo = yield this.getTransporter().sendMail(this.getMailOptions(payload));
                console.log(sentInfo);
                success = true;
            }
            catch (error) {
                console.log(error);
                success = false;
            }
            return success;
        });
    }
}
exports.default = EmailSenderService;
