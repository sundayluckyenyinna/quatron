"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SchoolDetails {
    constructor(clazz = '', department = '', studentNo = '', passport = '', admissionYear = '') {
        this.clazz = clazz;
        this.department = department;
        this.studentNo = studentNo;
        this.passport = passport;
        this.admissionYear = admissionYear;
    }
    ;
    static NewInstance(object) {
        return new SchoolDetails(object.clazz, object.department, object.studentNo, object.passport, object.admissionYear);
    }
    ;
    getClass() {
        return this.clazz;
    }
    ;
    getDepartment() {
        return this.department;
    }
    ;
    getStudentNo() {
        return this.studentNo;
    }
    ;
    getPassport() {
        return this.passport;
    }
    ;
    getAdmissionYear() {
        return this.admissionYear;
    }
    ;
    setClass(clazz) {
        this.clazz = clazz;
        return this;
    }
    ;
    setDepartment(dept) {
        this.department = dept;
        return this;
    }
    ;
    setStudentNo(studentNo) {
        this.studentNo = studentNo;
        return this;
    }
    ;
    setPassport(passportBase64String) {
        this.passport = passportBase64String;
        return this;
    }
    ;
    setAdmissionYear(admissionYear) {
        this.admissionYear = admissionYear;
        return this;
    }
    ;
}
exports.default = SchoolDetails;
