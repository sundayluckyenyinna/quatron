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
const subject_1 = __importDefault(require("../../model/subject"));
const grade_settings_1 = __importDefault(require("../../model/grade-settings"));
class Reader {
    constructor(repository) {
        this.respository = repository;
    }
    ;
    getAcademicYears() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getDefaultAcademicYearTable();
            const yearsArray = [];
            const yearsObjectArray = yield (yield this.getRepository().getAcademicYearDatabaseConnection()).all("SELECT Year from academic_year");
            if (yearsObjectArray) {
                yearsObjectArray.forEach((object) => {
                    yearsArray.push(object.Year);
                });
            }
            ;
            return yearsArray;
        });
    }
    ;
    getAllSubjectNames() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.getRepository().getSubjectsDatabaseConnection()).all("SELECT Subject_Name FROM all_subjects");
        });
    }
    ;
    getAllSubjectsNameForYearTermClass(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getDefaultSubjectsTable(data);
            const subjectArray = [];
            const subjectsObjectArray = yield (yield this.getRepository().getClassDatabaseConnection(data)).all("SELECT Subject_Name FROM subjects");
            if (subjectsObjectArray) {
                subjectsObjectArray.forEach((object) => {
                    subjectArray.push(object.Subject_Name);
                });
            }
            ;
            return subjectArray;
        });
    }
    ;
    getAllSubjectObjectForYearTermLevel(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getDefaultSubjectsTable(data);
            const subjectsObjectArray = yield (yield this.getRepository().getClassDatabaseConnection(data)).all("SELECT * FROM subjects");
            return subjectsObjectArray;
        });
    }
    ;
    getNumberOfStudentsFromAllStudents(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getDefaultAllStudentsTable(data));
            return yield (yield (yield this.getRepository().getAllStudentsDatabaseConnection(data)).all("SELECT Student_No FROM all_students")).length;
        });
    }
    ;
    getAllStudentsByClass(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.getRepository().getClassDatabaseConnection(data)).all("SELECT * FROM " + data.clazz);
        });
    }
    ;
    getAllStudentScores(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.getRepository().getClassDatabaseConnection(data)).all("SELECT * FROM " + data.subject + " ORDER BY Student_No ASC");
        });
    }
    ;
    // the payload contains year, term and clazz
    getStudentInClassByStudentNo(payload, studentNo) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.getRepository().getClassDatabaseConnection(payload)).get('SELECT * FROM ' + payload.clazz + ' WHERE Student_No = ?', studentNo);
        });
    }
    ;
    getStudentPassport(studentNo, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.getRepository().getPassportDatabaseConnection(data)).get('SELECT Passport_Image FROM passport WHERE Student_No = ?', studentNo);
        });
    }
    ;
    getStudentSubjectsAndScores(payload, studentNo, subjects) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentScores = [];
            for (let i = 0; i < subjects.length; i++) {
                const subject = subjects[i];
                const scoreObject = yield (yield this.getRepository().getClassDatabaseConnection(payload)).get('SELECT * FROM ' + subject + ' WHERE Student_No = ?', studentNo);
                // create a SubjectObject to get Total_Score, Grade and Remarks
                const subjectDTO = new subject_1.default()
                    .setGradeSystemArray(yield this.getGradingSystem())
                    .setCaScore(scoreObject.Ca_Score)
                    .setExamScore(scoreObject.Exam_Score);
                scoreObject.subjectName = this.getNeatSubject(subject);
                scoreObject.Total_Score = subjectDTO.getTotalScore();
                scoreObject.Grade = subjectDTO.getGrade();
                scoreObject.Remarks = subjectDTO.getRemarks();
                studentScores.push(scoreObject);
            }
            ;
            return studentScores;
        });
    }
    ;
    // the payload contains the actual student no
    getStudentDataForYearTermClass(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentData = {};
            const studentPassport = yield this.getStudentPassport(payload.studentNo, payload);
            const studentObject = yield this.getStudentInClassByStudentNo(payload, payload.studentNo);
            const subjectsAndScores = yield this.getStudentSubjectsAndScores(payload, payload.studentNo, studentObject.Subject.split('#'));
            studentData.studentNo = payload.studentNo;
            studentData.studentDetails = studentObject;
            studentData.subjectsAndScores = subjectsAndScores;
            studentData.passport = studentPassport;
            return studentData;
        });
    }
    ;
    getAllStudentNosForYearTermClass(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentNoArray = yield (yield this.getRepository().getClassDatabaseConnection(payload)).all('SELECT Student_No FROM ' + payload.clazz);
            return studentNoArray.map((object) => object.Student_No);
        });
    }
    ;
    // the payload will contain the year, term and class and studentno array
    getAllStudentsDataForYearTermClass(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentsByStudentNo = [];
            const studentNosInClass = yield this.getAllStudentNosForYearTermClass(payload);
            for (let i = 0; i < studentNosInClass.length; i++) {
                payload.studentNo = studentNosInClass[i];
                const studentData = yield this.getStudentDataForYearTermClass(payload);
                studentsByStudentNo.push(studentData);
            }
            ;
            return studentsByStudentNo;
        });
    }
    ;
    // this data object contains the term, year and clazz and subject of consideration.
    getScoreObjectsOfAllSubjectsForYearTermClassAsMap(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // create the map to hold each subjects and their respective array of individual student score records
            const map = new Map();
            // get the subjects names for this class
            const subjectNames = yield this.getAllSubjectsNameForYearTermClass(data);
            // for each of the subjects, get the array of the students and their scores
            for (let i = 0; i < subjectNames.length; i++) {
                const subjectName = subjectNames[i];
                data.subject = subjectName;
                // get all the scores object and push it to the map with the subjectName as key
                const scoreRecords = yield this.getAllStudentScores(data);
                map.set(subjectName, scoreRecords);
            }
            return map;
        });
    }
    ;
    getAllScoreRecordsForLevels(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const allLevelRecordMap = new Map();
            const clazzes = [];
            if (data.level.toLowerCase() === 'junior') {
                clazzes.push('jss1', 'jss2', 'jss3');
            }
            else {
                clazzes.push('sss1', 'sss2', 'sss3');
            }
            ;
            for (let i = 0; i < clazzes.length; i++) {
                const clazz = clazzes[i];
                data.clazz = clazz;
                const classScoreRecords = yield this.getScoreObjectsOfAllSubjectsForYearTermClassAsMap(data);
                allLevelRecordMap.set(clazz, classScoreRecords);
            }
            return allLevelRecordMap;
        });
    }
    ;
    getSubjectsAndCountForClass(subjectsMap) {
        const result = {};
        // get all the subjects in the map as array 
        subjectsMap.forEach((value, subjectName) => result[subjectName] = value.length);
        return result;
    }
    getCombinedSubjectsAndCountForAllClassesInLevel(arrayForClass) {
        const combinedSubjectsAndCounts = {};
        // Now, get the key of any object in the array. The subjects and number of subjects offered in that level will basically be the same thing
        const subjectNames = Object.keys(arrayForClass[0]);
        subjectNames.forEach((subjectName) => {
            let totalForSubjectName = 0;
            // go through all the objects in the array, locate the subjectName value and add to the total for that subjectName
            arrayForClass.forEach((classRecordCount) => totalForSubjectName += Number(classRecordCount[subjectName]));
            combinedSubjectsAndCounts[subjectName] = totalForSubjectName;
        });
        return combinedSubjectsAndCounts;
    }
    // data contains 'term, year and level'
    getSubjectsAndCountForLevel(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // declare a variable to hold the subjects and count for each class
            const subjectsAndCountForAllClasses = [];
            const classes = [];
            if (data.level.toLowerCase() === 'junior') {
                classes.push('jss1', 'jss2', 'jss3');
            }
            else {
                classes.push('sss1', 'sss2', 'sss3');
            }
            for (let i = 0; i < classes.length; i++) {
                const clazz = classes[i];
                data.clazz = clazz.trim();
                const classSubjectsMap = yield this.getScoreObjectsOfAllSubjectsForYearTermClassAsMap(data);
                const classSubjectsAndCount = this.getSubjectsAndCountForClass(classSubjectsMap);
                subjectsAndCountForAllClasses.push(classSubjectsAndCount);
            }
            // return the combined subject and count for all classes in that level.
            return this.getCombinedSubjectsAndCountForAllClassesInLevel(subjectsAndCountForAllClasses);
        });
    }
    getStudentNameArray(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.getRepository().getClassDatabaseConnection(payload)).get("SELECT Surname, First_Name, Middle_Name FROM " + payload.clazz + " WHERE Student_No = ?", payload.studentNo);
        });
    }
    getSchoolEmailAddressString() {
        return __awaiter(this, void 0, void 0, function* () {
            const emailObject = yield (yield this.getRepository().getSchoolDataDatabaseConnection()).get('SELECT Data FROM school WHERE Id = ?', 'email');
            return emailObject.email;
        });
    }
    getAllSchoolData() {
        return __awaiter(this, void 0, void 0, function* () {
            // check that the school table exists and create one if no one exists.
            let rows = [];
            try {
                rows = yield (yield this.getRepository().getSchoolDataDatabaseConnection()).all('SELECT * FROM school');
            }
            catch (error) {
                yield this.getRepository().getCreator().createSchoolDataTable();
                rows = yield (yield this.getRepository().getSchoolDataDatabaseConnection()).all('SELECT * FROM school');
            }
            const schoolData = {};
            rows.forEach((row) => {
                const idValue = row.Id;
                const dataValue = row.Data;
                // append this value to the defined object 
                schoolData[idValue] = dataValue;
            });
            return schoolData;
        });
    }
    getGradingSystem() {
        return __awaiter(this, void 0, void 0, function* () {
            const gradeSystemArray = [];
            const gradeObjects = yield (yield this.getRepository().getGradeSystemDatabaseConnection()).all('SELECT * FROM grade_system');
            for (const gradeObject of gradeObjects) {
                const gradeSystem = new grade_settings_1.default(gradeObject.Grade, gradeObject.Lower_Score_Range, gradeObject.Higher_Score_Range, gradeObject.Remarks);
                gradeSystemArray.push(gradeSystem);
            }
            return gradeSystemArray;
        });
    }
    /**
     * Returns an object of the grading system representing the grading scheme.
     * @returns
     */
    getGradingSystemObjectArray() {
        return __awaiter(this, void 0, void 0, function* () {
            // check that the table exists and create one if not exist.
            yield ((yield this.getRepository()).getCreator().createGradeSystemTable());
            const gradeObjects = yield (yield this.getRepository().getGradeSystemDatabaseConnection()).all('SELECT * FROM grade_system');
            return gradeObjects;
        });
    }
    // defaults
    getDefaultAcademicYearTable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getAcademicYearDatabaseConnection()).exec("CREATE TABLE IF NOT EXISTS academic_year(Year varchar(10), Description varchar(50))");
        });
    }
    ;
    getDefaultAllStudentsTable(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getAllStudentsDatabaseConnection(data)).exec("CREATE TABLE IF NOT EXISTS all_students(Student_No varchar(50) primary key, Surname varchar(50), First_Name varchar(50), Middle_Name varchar(50), Gender varchar(10), D_O_B varchar(10), State_of_Origin varchar(20), Clazz varchar(10), Department varchar(20), Passport_Image text, Subject varchar (100))");
        });
    }
    ;
    getDefaultSubjectsTable(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getRepository().getClassDatabaseConnection(data)).exec("CREATE TABLE IF NOT EXISTS subjects(Subject_Name varchar(50), Level varchar(30), Department varchar (30))");
        });
    }
    ;
    getRepository() {
        return this.respository;
    }
    ;
    getNeatSubject(subject) {
        return subject.split('_').map(token => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
    }
    ;
}
exports.default = Reader;
;
