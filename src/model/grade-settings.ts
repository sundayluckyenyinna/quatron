

export default class GradeSystem
{
    constructor(private grade : string, 
        private lowerScoreRange : number, 
        private higherScoreRange : number, 
        private remarks : string ){
    }

    getGrade : Function = () : string => { return this.grade; }
    getLowerScoreRange : Function = () : number => { return this.lowerScoreRange; }
    getHigherScoreRange : Function = () : number => { return this.higherScoreRange; }
    getRemarks : Function = () : string => { return this.remarks; }
    setGrade : Function = ( grade : string ) : GradeSystem => { this.grade = grade; return this;  }
    setLowerScoreRange : Function = ( lowerScoreRange : number ) : GradeSystem => { this.lowerScoreRange = lowerScoreRange; return this; }
    setHigherScoreRange : Function = ( higherScoreRange : number ) : GradeSystem => {
        this.higherScoreRange = higherScoreRange;
        return this;
    }
    setRemarks : Function = ( remarks : string ) : GradeSystem => {
        this.remarks = remarks;
        return this;
    }

}