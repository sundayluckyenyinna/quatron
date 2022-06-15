import { NegativeScoreError, OverflowScorError } from '../config/grade-error';
import GradeSystem from './grade-settings';

/**
 *  Returns the grade associated to a Subject object.
 */
export default class Grade
{
    /**
     * @param totalScore number
     * @returns grade : string
     */
    constructor( private gradeSystemArray : GradeSystem[] ){

    }

    getGradeFromTotal( totalScore : number ) : string {
        let grade = 'NaG';
        for( const gradeSystem of this.gradeSystemArray ){
            if ( totalScore >= gradeSystem.getLowerScoreRange() && totalScore <= gradeSystem.getHigherScoreRange() ){
                grade = gradeSystem.getGrade();
                break;
            }
        }
        return grade;
    };

    getRemarks( grade : string ) : string {
        var remark = 'NaR'
        for ( const gradeSystem of this.gradeSystemArray ){
            if( gradeSystem.getGrade() === grade ){
                remark = gradeSystem.getRemarks();
                break;
            }
        }
        return remark;
    }
};