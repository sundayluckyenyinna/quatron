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
/**
 * This class encapsulates the extraction, manipulation and retrievals of the teacher's comment with regards to the scores of the student.
 */
const comment_1 = __importDefault(require("./comment"));
class TeacherComment extends comment_1.default {
    constructor(teacherCommentPathFile = 'NULL') {
        super();
        this.teacherCommentPathFile = teacherCommentPathFile;
    }
    //Override the loadComment method to load extra from a file specified by the user.
    getTeacherGoodCommentFromExternalFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return ['addition 1', 'addition2'];
        });
    }
    ;
}
exports.default = TeacherComment;
