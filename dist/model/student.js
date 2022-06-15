"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Student {
    constructor(name, personalDetails, schoolDetails, subjects) {
        this.name = name;
        this.personalDetails = personalDetails;
        this.schoolDetails = schoolDetails;
        this.subjects = subjects;
    }
    ;
    static NewInstance(object) {
    }
    ;
    getName() {
        return this.name;
    }
    ;
    getPersonalDetails() {
        return this.personalDetails;
    }
    ;
    getSchoolDetails() {
        return this.schoolDetails;
    }
    ;
    getSubjects() {
        return this.subjects;
    }
    ;
    getSubjectString(delimiter = '#') {
        var subjectString = '';
        this.subjects.forEach(subject => { subjectString += delimiter + subject; });
        return subjectString.substring(subjectString.indexOf(delimiter) + 1);
    }
    ;
}
exports.default = Student;
;
