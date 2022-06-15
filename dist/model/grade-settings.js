"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GradeSystem {
    constructor(grade, lowerScoreRange, higherScoreRange, remarks) {
        this.grade = grade;
        this.lowerScoreRange = lowerScoreRange;
        this.higherScoreRange = higherScoreRange;
        this.remarks = remarks;
        this.getGrade = () => { return this.grade; };
        this.getLowerScoreRange = () => { return this.lowerScoreRange; };
        this.getHigherScoreRange = () => { return this.higherScoreRange; };
        this.getRemarks = () => { return this.remarks; };
        this.setGrade = (grade) => { this.grade = grade; return this; };
        this.setLowerScoreRange = (lowerScoreRange) => { this.lowerScoreRange = lowerScoreRange; return this; };
        this.setHigherScoreRange = (higherScoreRange) => {
            this.higherScoreRange = higherScoreRange;
            return this;
        };
        this.setRemarks = (remarks) => {
            this.remarks = remarks;
            return this;
        };
    }
}
exports.default = GradeSystem;
