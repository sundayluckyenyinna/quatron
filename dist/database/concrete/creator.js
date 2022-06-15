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
class Creator {
    constructor(repository) {
        this.repository = repository;
    }
    ;
    createAcademicYear(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getAcademicYearDatabaseConnection()).exec("CREATE TABLE IF NOT EXISTS academic_year(Year varchar(10), Description varchar(50))");
            return yield (yield this.getRepository().getAcademicYearDatabaseConnection()).run("INSERT INTO academic_year (Year, Description) VALUES (?, ?)", data.year, data.description);
        });
    }
    ;
    createStudent(data, student) {
        return __awaiter(this, void 0, void 0, function* () {
            // Save the student passport to the passport database.
            const savePassportInfo = yield (yield this.saveStudentPassport(student.getSchoolDetails().getStudentNo(), student.getSchoolDetails().getPassport(), data));
            if (savePassportInfo.changes !== 1) {
                throw new Error('Could not save student passport');
            }
            ;
            // Save the student object to the overall register.
            const saveStudentToAllStudentinfo = yield (yield this.saveStudentToAllStudentsDatabase(student, data));
            if (saveStudentToAllStudentinfo.changes !== 1) {
                throw new Error('Could not save students to overall register');
            }
            ;
            // Save the student object to the class register.
            const saveStudentToClassInfo = yield (yield this.saveStudentToClass(data, student));
            if (saveStudentToClassInfo.changes !== 1) {
                throw new Error('Could not save student to class register');
            }
            ;
            return ([savePassportInfo, saveStudentToAllStudentinfo, saveStudentToClassInfo]);
        });
    }
    ;
    saveStudentPassport(studentNo, passport, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // save passport and student number in the passport database
            yield (yield this.getRepository().getPassportDatabaseConnection(data)).exec("CREATE TABLE IF NOT EXISTS passport(Student_No varchar(20) primary key, Passport_Image text)");
            return yield (yield this.getRepository().getPassportDatabaseConnection(data)).run("INSERT INTO passport(Student_No, Passport_Image) VALUES (?, ?)", studentNo, passport);
        });
    }
    ;
    saveStudentToAllStudentsDatabase(student, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getAllStudentsDatabaseConnection(data)).exec("CREATE TABLE IF NOT EXISTS all_students(Student_No varchar(50) primary key, Surname varchar(50), First_Name varchar(50), Middle_Name varchar(50), Gender varchar(10), D_O_B varchar(10), State_of_Origin varchar(20), Clazz varchar(10), Department varchar(20), Passport_Image text, Subject text)");
            return yield (yield this.getRepository().getAllStudentsDatabaseConnection(data)).run("INSERT INTO all_students VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", student.getSchoolDetails().getStudentNo(), student.getName().getSurname(), student.getName().getFirstName(), student.getName().getMiddleName(), student.getPersonalDetails().getGender(), student.getPersonalDetails().getDateOfBirth(), student.getPersonalDetails().getStateOfOrigin(), student.getSchoolDetails().getClass(), student.getSchoolDetails().getDepartment(), student.getSchoolDetails().getPassport(), student.getSubjectString());
        });
    }
    ;
    /**
     *
     * @param data Object
     */
    saveStudentToClass(data, student) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getClassDatabaseConnection(data)).exec("CREATE TABLE IF NOT EXISTS " + data.clazz + " (Student_No varchar(50) primary key, Surname varchar(50), First_Name varchar(50), Middle_Name varchar(50), Gender varchar(10), D_O_B varchar(10), State_of_Origin varchar(20), Clazz varchar(10), Department varchar(20), Passport_Image text, Subject text)");
            // get the subjects of the students and save the students for future scores entry.
            const studentSubjectArray = student.getSubjectString().split('#');
            studentSubjectArray.forEach((subject) => __awaiter(this, void 0, void 0, function* () {
                yield (yield this.getRepository().getClassDatabaseConnection(data)).run("INSERT INTO " + subject + " (Student_No, Ca_Score, Exam_Score) VALUES (?, ?, ?)", student.getSchoolDetails().getStudentNo(), 0, 0);
            }));
            return yield (yield this.getRepository().getClassDatabaseConnection(data)).run("INSERT INTO " + data.clazz + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", student.getSchoolDetails().getStudentNo(), student.getName().getSurname(), student.getName().getFirstName(), student.getName().getMiddleName(), student.getPersonalDetails().getGender(), student.getPersonalDetails().getDateOfBirth(), student.getPersonalDetails().getStateOfOrigin(), student.getSchoolDetails().getClass(), student.getSchoolDetails().getDepartment(), student.getSchoolDetails().getPassport(), student.getSubjectString());
        });
    }
    ;
    createSubject(data, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            const saveSubjectToAllSubjectDatabaseInfo = yield this.saveSubjectToAllSubjectDatabase(data, subject);
            if (saveSubjectToAllSubjectDatabaseInfo.changes !== 1) {
                throw new Error('Could not save subject object to all subject table');
            }
            ;
            const saveSubjectToClassInfo = yield this.saveSubjectToClass(data, subject);
            if (saveSubjectToClassInfo !== 1) {
                throw new Error('Could not create subject table');
            }
            ;
            return [saveSubjectToAllSubjectDatabaseInfo, saveSubjectToClassInfo];
        });
    }
    ;
    saveSubjectToAllSubjectDatabase(data, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getSubjectsDatabaseConnection()).exec("CREATE TABLE IF NOT EXISTS all_subjects(Subject_Name varchar(50), Level varchar(30), Department varchar(30))");
            // check wheter subject already exist
            if ((yield this.subjectAlreadyExist(subject.getName()))) {
                return { changes: 1 };
            }
            ;
            return yield (yield this.getRepository().getSubjectsDatabaseConnection()).run("INSERT INTO all_subjects VALUES(?, ?, ?)", subject.getName(), subject.getLevel(), data.department);
        });
    }
    ;
    saveSubjectToClass(data, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getClassDatabaseConnection(data)).exec("CREATE TABLE IF NOT EXISTS subjects(Subject_Name varchar(50), Level varchar(30), Department varchar(30))");
            yield (yield this.getRepository().getClassDatabaseConnection(data)).run("INSERT INTO subjects VALUES(?, ?, ?)", subject.getName(), subject.getLevel(), data.department);
            yield (yield this.getRepository().getClassDatabaseConnection(data)).exec("CREATE TABLE IF NOT EXISTS " + subject.getName() + " (Student_No varchar(30) primary key, Ca_Score integer, Exam_Score integer)");
            return 1;
        });
    }
    ;
    createSchoolDataTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getSchoolDataDatabaseConnection()).exec('CREATE TABLE IF NOT EXISTS school ( Id varchar(30) primary key, Data text )');
            // insert the ids. If the table already have this ids, the program will throw an error. If this happens, just continue
            const ids = ['name', 'motto', 'address', 'email', 'telephone', 'logo'];
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i].trim();
                yield (yield this.getRepository().getSchoolDataDatabaseConnection()).run('INSERT INTO school VALUES (?,?)', id, 'null');
            }
        });
    }
    createGradeSystemTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getGradeSystemDatabaseConnection()).exec('CREATE TABLE IF NOT EXISTS grade_system (Grade varchar(10) primary key, Lower_Score_Range Integer, Higher_Score_Range Integer, Remarks varchar(30))');
        });
    }
    getRepository() {
        return this.repository;
    }
    ;
    // UTILITY FUNCTIONS
    subjectAlreadyExist(subjectName) {
        return __awaiter(this, void 0, void 0, function* () {
            const subjectObjectArray = yield (yield this.getRepository().getSubjectsDatabaseConnection()).all("SELECT Subject_Name FROM all_subjects");
            const names = [];
            subjectObjectArray.forEach((object) => { names.push(object.Subject_Name); });
            return names.includes(subjectName);
        });
    }
    ;
}
exports.default = Creator;
;
