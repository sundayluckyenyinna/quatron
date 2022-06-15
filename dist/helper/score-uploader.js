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
exports.SingleFileScoreUploader = void 0;
const concrete_repository_1 = __importDefault(require("../database/concrete/concrete-repository"));
class ScoreUploader {
}
exports.default = ScoreUploader;
class SingleFileScoreUploader extends ScoreUploader {
    // the payload must contain the subject to upload to
    constructor(validRows, databasePayload) {
        super();
        this.validRows = validRows;
        this.databasePayload = databasePayload;
    }
    ;
    getReadyStudentsRows() {
        return this.validRows.map((row) => {
            return {
                Student_No: row.studentNo,
                Ca_Score: row.caScore,
                Exam_Score: row.examScore
            };
        });
    }
    getDatabasePayload() {
        return this.databasePayload;
    }
    uploadScores() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new concrete_repository_1.default().updateStudentScoresForYearTermClass(this.getReadyStudentsRows(), this.getDatabasePayload());
        });
    }
    ;
}
exports.SingleFileScoreUploader = SingleFileScoreUploader;
