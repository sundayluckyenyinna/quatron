import { DocumentReader, ExcelReader, PDFReader } from './file-reader';
import ConcreteRepository from '../database/concrete/concrete-repository';

export default class ScoreUploader
{
    // private validRows : Object[];
    // private payload : Object;

    // constructor( payload : Object | any, valid ){
    //     this.absolutePath = payload.filePath.trim();
    //     this.fileType = payload.fileType.trim();
    // };

    // protected getFileReader(){
    //     switch( this.fileType ){
    //         case 'word' : return new DocumentReader( this.absolutePath );
    //         case 'pdf' : return new PDFReader( this.absolutePath );
    //         case 'excel' : return new ExcelReader( this.absolutePath );
    //         default: throw { message: 'Incorrect file type', status: 403 };
    //     }
    // }

}

export class SingleFileScoreUploader extends ScoreUploader
{
    private validRows : Object[];
    private databasePayload : Object;

    // the payload must contain the subject to upload to
    constructor( validRows : Object[], databasePayload : Object ){
        super();
        this.validRows = validRows;
        this.databasePayload = databasePayload;
    };

    public getReadyStudentsRows() : Object[]{
        return this.validRows.map((row : Object | any) => {
            return {
                Student_No : row.studentNo,
                Ca_Score : row.caScore,
                Exam_Score : row.examScore
            };
        })
    }

    getDatabasePayload(){
        return this.databasePayload;
    }

    async uploadScores(){
        return await new ConcreteRepository().updateStudentScoresForYearTermClass( this.getReadyStudentsRows(), this.getDatabasePayload());
    };
}