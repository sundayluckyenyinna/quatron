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
const repository_1 = __importDefault(require("../abstracts/repository"));
const creator_1 = __importDefault(require("./creator"));
const reader_1 = __importDefault(require("./reader"));
const updator_1 = __importDefault(require("./updator"));
const deletor_1 = __importDefault(require("./deletor"));
class ConcreteRepository extends repository_1.default {
    constructor() {
        super();
        this.creator = new creator_1.default(this);
        this.reader = new reader_1.default(this);
        this.updator = new updator_1.default(this);
        this.deletor = new deletor_1.default(this);
    }
    ;
    createAcademicYear(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const executionPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const info = yield this.getCreator().createAcademicYear(data);
                if (info.changes === 1) {
                    resolve(true);
                    return;
                }
                reject(false);
            }));
            return executionPromise;
        });
    }
    ;
    createStudent(data, student) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const saveInfoArray = yield this.getCreator().createStudent(data, student);
            if (saveInfoArray) {
                resolve(true);
                return;
            }
            ;
            reject(false);
        }));
    }
    ;
    createSubject(data, subject) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const saveSubjectInfo = yield this.getCreator().createSubject(data, subject);
            if (saveSubjectInfo) {
                resolve(true);
                return;
            }
            ;
            reject(false);
        }));
    }
    ;
    getAcademicYears() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const yearsArray = yield this.getReader().getAcademicYears();
            if (yearsArray) {
                resolve(yearsArray);
                return;
            }
            ;
            reject(new Error('Unsuccessful access to database'));
        }));
    }
    ;
    getStudentByStudentNo() {
        throw new Error('Method not implemented.');
    }
    ;
    getAllStudentsByClass(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getAllStudentsByClass(data);
        });
    }
    ;
    getAllStudentScores(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getAllStudentScores(data);
        });
    }
    ;
    getAllStudentsByDepartment(department) {
        throw new Error('Method not implemented.');
    }
    getAllStudents() {
        throw new Error('Method not implemented.');
    }
    getAllSubjects() {
        throw new Error('Method not implemented.');
    }
    getAllSubjectNames() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getAllSubjectNames();
        });
    }
    ;
    getAllSubjectsNameForYearTermClass(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getAllSubjectsNameForYearTermClass(data);
        });
    }
    ;
    getAllSubjectObjectsForYearTermLevel(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getAllSubjectObjectForYearTermLevel(data);
        });
    }
    getNumberOfStudentsFromAllStudents(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getNumberOfStudentsFromAllStudents(data);
        });
    }
    ;
    // the payload will contain the year, term and class
    getStudentDataForYearTermClass(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getStudentDataForYearTermClass(payload);
        });
    }
    ;
    getAllStudentsDataForYearTermClass(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getAllStudentsDataForYearTermClass(payload);
        });
    }
    ;
    getSubjectsAndCountForLevel(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getSubjectsAndCountForLevel(data);
        });
    }
    getStudentNameArray(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getStudentNameArray(payload);
        });
    }
    getSchoolEmailAddressString() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getSchoolEmailAddressString();
        });
    }
    getAllSchoolData() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getReader().getAllSchoolData();
        });
    }
    getGradingSystem() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getGradingSystem();
        });
    }
    getGradingSystemObjectArray() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getReader().getGradingSystemObjectArray();
        });
    }
    updateStudentScoresForYearTermClass(scores, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getUpdator().updateStudentScoresForYearTermClass(scores, payload);
        });
    }
    ;
    updateStudentDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getUpdator().updateStudentDetailsForYearTermClass(payload);
        });
    }
    ;
    updateStudentPassport(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getUpdator().updateStudentPassportForYearTermClass(data);
        });
    }
    ;
    updateSchoolData(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getUpdator().updateSchoolData(payload);
        });
    }
    updateGradingSystem(gradeSystemArray) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getUpdator().updateGradingSystem(gradeSystemArray);
        });
    }
    deleteStudentByStudentNo(studentNo) {
        throw new Error('Method not implemented.');
    }
    ;
    deleteStudentFromClassTable(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getDeletor().deleteStudentFromClass(data);
        });
    }
    deleteSubject(subject) {
        throw new Error('Method not implemented.');
    }
    deleteSubjectForStudents(studentNos, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getDeletor().deleteSubjectForStudents(studentNos, payload);
        });
    }
    deleteSchoolEmail(emailText) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getDeletor().deleteSchoolEmail(emailText);
        });
    }
    getCreator() {
        return this.creator;
    }
    ;
    getReader() {
        return this.reader;
    }
    ;
    getUpdator() {
        return this.updator;
    }
    ;
    getDeletor() {
        return this.deletor;
    }
    ;
}
exports.default = ConcreteRepository;
