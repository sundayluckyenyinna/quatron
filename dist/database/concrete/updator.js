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
class Updator {
    constructor(repository) {
        this.repository = repository;
    }
    ;
    updateStudentScoresForYearTermClass(scores, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (let i = 0; i < scores.length; i++) {
                const score = scores[i];
                const result = yield (yield this.getRepository().getClassDatabaseConnection(payload)).run('UPDATE ' + payload.subject + ' SET Ca_Score = ?, Exam_Score = ? WHERE Student_No = ?', score.Ca_Score, score.Exam_Score, score.Student_No);
                results.push(result.changes);
            }
            ;
            for (let j = 0; j < results.length; j++) {
                if (results[j] !== 1) {
                    return false;
                }
                ;
            }
            return true;
        });
    }
    ;
    updateStudentDetailsForYearTermClass(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            // update the student details in the all student details 
            const all = yield (yield this.getRepository().getAllStudentsDatabaseConnection(payload.data)).run('UPDATE all_students SET Surname = ?, First_Name = ?, Middle_Name = ?, Department = ?, Gender = ?, D_O_B =?, State_of_Origin =?, Subject = ? WHERE Student_No = ?', payload.Surname, payload.First_Name, payload.Middle_Name, payload.Department, payload.Gender, payload.D_O_B, payload.State_of_Origin, payload.Subject, payload.Student_No);
            // update the student in the class database
            const clazz = yield (yield this.getRepository().getClassDatabaseConnection(payload.data)).run('UPDATE ' + payload.data.clazz + ' SET Surname = ?, First_Name = ?, Middle_Name = ?, Department = ?, Gender = ?, D_O_B =?, State_of_Origin =?, Subject = ? WHERE Student_No = ?', payload.Surname, payload.First_Name, payload.Middle_Name, payload.Department, payload.Gender, payload.D_O_B, payload.State_of_Origin, payload.Subject, payload.Student_No);
            // update the student in the new subjects
            const subject = yield this.registerStudentInNewSubjects(payload);
            if (all.changes === 1 && clazz.changes === 1 && subject === 1) {
                return true;
            }
            ;
            return false;
        });
    }
    ;
    registerStudentInNewSubjects(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const subjectString = payload.Subject;
            const studentNo = payload.Student_No;
            const result = [];
            const subjectArray = subjectString.split('#');
            for (let i = 0; i < subjectArray.length; i++) {
                const subject = subjectArray[i];
                const student = yield (yield this.getRepository().getClassDatabaseConnection(payload.data)).get('SELECT Student_No FROM ' + subject + ' WHERE Student_No = ?', studentNo);
                if (student === undefined) {
                    const done = (yield (yield this.getRepository().getClassDatabaseConnection(payload.data)).run("INSERT INTO " + subject + " (Student_No, Ca_Score, Exam_Score) VALUES (?, ?, ?)", studentNo, 0, 0)).changes;
                    result.push(done);
                }
                ;
            }
            ;
            if (result.includes(0)) {
                return 0;
            }
            ;
            return 1;
        });
    }
    updateStudentPassportForYearTermClass(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const clazz = yield (yield this.getRepository().getClassDatabaseConnection(data)).run('UPDATE ' + data.clazz + ' SET Passport_Image = ? WHERE Student_No = ?', data.Passport_Image, data.Student_No);
            if (clazz.changes === 1) {
                return true;
            }
            ;
            return false;
        });
    }
    ;
    updateSchoolData(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.getDefaultSchoolDataTable();
            }
            catch (error) { }
            ; // just do nothing and continue execution.
            const keys = Object.keys(payload);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i].toString();
                yield (yield this.getRepository().getSchoolDataDatabaseConnection()).run('UPDATE school SET Data = ? WHERE Id = ? ', payload[key], key);
            }
            return 1;
        });
    }
    updateGradingSystem(gradeSystemArray) {
        return __awaiter(this, void 0, void 0, function* () {
            // first ensure there is  a table to update
            yield this.getDefaultGradeSystemTable();
            // try to delete all there is in the table before and update with the new grade system.
            try {
                yield (yield this.getRepository().getGradeSystemDatabaseConnection()).run('DELETE FROM grade_system');
                yield this.insertIntoGradeSystemTable(gradeSystemArray);
            }
            catch (error) {
                // if there is nothing to delete. then just insert straightaway.
                yield this.insertIntoGradeSystemTable(gradeSystemArray);
            }
        });
    }
    insertIntoGradeSystemTable(gradeSystemArray) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < gradeSystemArray.length; i++) {
                const gradeSystem = gradeSystemArray[i];
                yield (yield this.getRepository().getGradeSystemDatabaseConnection()).run("INSERT INTO grade_system VALUES(?,?,?,?)", gradeSystem.getGrade(), gradeSystem.getLowerScoreRange(), gradeSystem.getHigherScoreRange(), gradeSystem.getRemarks());
            }
        });
    }
    getDefaultGradeSystemTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getRepository().getCreator().createGradeSystemTable();
        });
    }
    getDefaultSchoolDataTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository()).getCreator().createSchoolDataTable();
        });
    }
    getRepository() {
        return this.repository;
    }
    ;
}
exports.default = Updator;
