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
class Deletor {
    constructor(repository) {
        this.repository = repository;
    }
    deleteStudentFromClass(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const clazz = yield (yield this.getRepository().getClassDatabaseConnection(data)).run('DELETE FROM ' + data.clazz + ' WHERE Student_No = ?', data.Student_No);
            const all = yield (yield this.getRepository().getAllStudentsDatabaseConnection(data)).run('DELETE FROM all_students WHERE Student_No = ?', data.Student_No);
            const passport = yield (yield this.getRepository().getPassportDatabaseConnection(data)).run('DELETE FROM passport WHERE Student_No = ?', data.Student_No);
            var done = 0;
            // de-register the student from all the subjects
            const subjects = yield this.getRepository().getAllSubjectsNameForYearTermClass(data);
            console.log(subjects);
            for (let i = 0; i < subjects.length; i++) {
                const subject = subjects[i];
                done = (yield (yield this.getRepository().getClassDatabaseConnection(data)).run('DELETE FROM ' + subject + ' WHERE Student_No = ?', data.Student_No)).changes;
            }
            ;
            if (clazz.changes === 1 && all.changes === 1 && passport.changes === 1 && done === 1) {
                return true;
            }
            ;
            return false;
        });
    }
    deleteSubjectForStudents(studentNos, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < studentNos.length; i++) {
                const studentNo = studentNos[i];
                const subject = payload.subject;
                // delete the student record from the subject table in the class database
                yield (yield (yield this.getRepository().getClassDatabaseConnection(payload)).run('DELETE FROM ' + payload.subject + ' WHERE Student_No = ?', studentNo));
                // delete the subject from the student subject list
                const subjectObject = yield (yield this.getRepository().getClassDatabaseConnection(payload)).get('SELECT Subject FROM ' + payload.clazz + ' WHERE Student_No = ?', studentNo);
                const subjects = subjectObject.Subject;
                const newSubjectString = subjects.split('#').filter((subjectName) => subjectName !== subject).join('#');
                yield (yield this.getRepository().getClassDatabaseConnection(payload)).run('UPDATE ' + payload.clazz + ' SET Subject = ? WHERE Student_No = ?', newSubjectString, studentNo);
                yield (yield this.getRepository().getAllStudentsDatabaseConnection(payload)).run('UPDATE all_students SET Subject = ? WHERE Student_No = ?', newSubjectString, studentNo);
            }
        });
    }
    deleteSchoolEmail(emailText) {
        return __awaiter(this, void 0, void 0, function* () {
            const emailString = yield this.getRepository().getSchoolEmailAddressString();
            // filter the emailText from the array of the email addresses
            const newEmailString = emailString.split('#').filter((email) => email !== emailText).join('#');
            // set the newEmailString to the data store
            yield (yield this.getRepository().getSchoolDataDatabaseConnection()).run('UPDATE school SET Data = ? WHERE Id = ?', newEmailString, 'email');
        });
    }
    getRepository() {
        return this.repository;
    }
}
exports.default = Deletor;
