"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grade_1 = __importDefault(require("./grade"));
/**
 *  Defines the properties and behaviour of a Subject object.
 */
class Subject {
    /** */
    constructor() {
        /** The Subject name associted to this Subject object. */
        this.name = '';
        /**  Returns the CaScore asocited to this Subject object. */
        this.caScore = 0;
        /** Returns the ExamScore associated to this Subject object. */
        this.examScore = 0;
        this.level = '';
    }
    ;
    /**
     * Returns the subject name associated with this Subject object.
     * @returns subjectName : string
     */
    getName() {
        return this.name;
    }
    ;
    /**
     * Returns the CaScore associated to this Subject object.
     * @returns caScore : number
     */
    getCaScore() {
        return this.caScore;
    }
    ;
    /**
     * Returns the examScore associated to this Subject object.
     * @returns ExamScore : number
     */
    getExamScore() {
        return this.examScore;
    }
    ;
    getGradeSystemArray() {
        return this.gradeSystemArray;
    }
    /**
     * Returns the TotalScore associated to this Subject object.
     * @returns totalScore : number
     */
    getTotalScore() {
        return this.getCaScore() + this.getExamScore();
    }
    ;
    /**
     * Returns the Grade associated to this Subject object.
     * @returns grade : string
     */
    getGrade() {
        return new grade_1.default(this.getGradeSystemArray()).getGradeFromTotal(this.getTotalScore());
    }
    ;
    getLevel() {
        return this.level;
    }
    ;
    getRemarks() {
        return new grade_1.default(this.getGradeSystemArray()).getRemarks(this.getGrade());
    }
    ;
    setName(name) {
        this.name = name;
        return this;
    }
    ;
    setCaScore(caScore) {
        this.caScore = caScore;
        return this;
    }
    ;
    setExamScore(examScore) {
        this.examScore = examScore;
        return this;
    }
    ;
    setLevel(level) {
        this.level = level;
        return this;
    }
    ;
    setGradeSystemArray(gradeSystemArray) {
        this.gradeSystemArray = gradeSystemArray;
        return this;
    }
}
exports.default = Subject;
;
