"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  Returns the grade associated to a Subject object.
 */
class Grade {
    /**
     * @param totalScore number
     * @returns grade : string
     */
    constructor(gradeSystemArray) {
        this.gradeSystemArray = gradeSystemArray;
    }
    getGradeFromTotal(totalScore) {
        let grade = 'NaG';
        for (const gradeSystem of this.gradeSystemArray) {
            if (totalScore >= gradeSystem.getLowerScoreRange() && totalScore <= gradeSystem.getHigherScoreRange()) {
                grade = gradeSystem.getGrade();
                break;
            }
        }
        return grade;
    }
    ;
    getRemarks(grade) {
        var remark = 'NaR';
        for (const gradeSystem of this.gradeSystemArray) {
            if (gradeSystem.getGrade() === grade) {
                remark = gradeSystem.getRemarks();
                break;
            }
        }
        return remark;
    }
}
exports.default = Grade;
;
