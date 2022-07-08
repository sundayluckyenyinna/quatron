import student from '../../model/student';
import subject from '../../model/subject';
import Repository from '../abstracts/repository';
import Student from '../../model/student';
import Creator from './creator';
import Subject from '../../model/subject';
import Reader from './reader';
import Updator from './updator';
import Deletor from './deletor';
import GradeSystem from '../../model/grade-settings';

export default class ConcreteRepository extends Repository
{
    
    private creator : Creator;
    private reader : Reader;
    private updator : Updator;
    private deletor : Deletor;

    constructor(){
        super();
        this.creator = new Creator( this );
        this.reader = new Reader( this );
        this.updator = new Updator( this );
        this.deletor = new Deletor( this );
    };

    async createAcademicYear( data : Object | any ): Promise<boolean> {

        const executionPromise = new Promise<boolean>(async (resolve, reject) => {
            const info = await this.getCreator().createAcademicYear(data)        
            if(info.changes === 1){ resolve( true ); return; }
            reject( false );
        });

        return executionPromise;
    };


    createStudent( data : Object | any, student : Student ): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const saveInfoArray = await this.getCreator().createStudent(data, student);
            if (saveInfoArray) { resolve( true ); return; };
            reject( false );
        });
    };

    createSubject( data : Object | any, subject : Subject ): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const saveSubjectInfo = await this.getCreator().createSubject(data, subject);
            if (saveSubjectInfo) { resolve ( true ); return; };
            reject( false );
        });
    };

    getAcademicYears(): Promise<string[]> {
        return new Promise( async (resolve, reject) => {
            const yearsArray = await this.getReader().getAcademicYears();
            if(yearsArray) { resolve(yearsArray); return; };
            reject(new Error('Unsuccessful access to database'));
        });
    };

    getStudentByStudentNo(): Promise<student> {
        throw new Error('Method not implemented.');
    };

    async getAllStudentsByClass(data: Object | any ): Promise<Object[]> {
        return await this.getReader().getAllStudentsByClass( data );
    };

    async getAllStudentScores( data : object | any ) : Promise<Object[]> {
        return await this.getReader().getAllStudentScores( data );
    };

    getAllStudentsByDepartment(department: string): Promise<student[]> {
        throw new Error('Method not implemented.');
    }
    getAllStudents(): Promise<student[]> {
        throw new Error('Method not implemented.');
    }
    getAllSubjects(): Promise<subject[]> {
        throw new Error('Method not implemented.');
    }

    async getAllSubjectNames() : Promise<string[]> {
        return await this.getReader().getAllSubjectNames();
    };

    async getAllSubjectsNameForYearTermClass( data : Object ) : Promise<string[]>{
        return await this.getReader().getAllSubjectsNameForYearTermClass( data );
    };

    async getAllSubjectObjectsForYearTermLevel( data : Object ) : Promise<Object[]> {
       return await this.getReader().getAllSubjectObjectForYearTermLevel( data );
    }

    async getNumberOfStudentsFromAllStudents( data : Object ) : Promise<number>{
        return await this.getReader().getNumberOfStudentsFromAllStudents( data );
    };

    // the payload will contain the year, term and class
    async getStudentDataForYearTermClass( payload : Object ) : Promise<Object | undefined>{
        return await this.getReader().getStudentDataForYearTermClass(payload);
    };

    async getAllStudentsDataForYearTermClass(payload : Object) : Promise<(Object|undefined)[]>{
        return await this.getReader().getAllStudentsDataForYearTermClass(payload);
    };

    async getSubjectsAndCountForLevel( data : Object | any ) : Promise<Object | any> {
        return await this.getReader().getSubjectsAndCountForLevel( data );
    }

    async getStudentNameArray( payload : Object | any ) : Promise<Object | undefined> {
        return await this.getReader().getStudentNameArray( payload );
    }

    async getSchoolEmailAddressString() : Promise<string> {
        return await this.getReader().getSchoolEmailAddressString();
    }

    async getAllSchoolData() : Promise<Object> {
        return this.getReader().getAllSchoolData();
    }

    async getGradingSystem() : Promise<GradeSystem[]>{
        return await this.getReader().getGradingSystem();
    }

    async getGradingSystemObjectArray() : Promise<Object[]> {
        return await this.getReader().getGradingSystemObjectArray();
    }

    async updateStudentScoresForYearTermClass( scores : Object[], payload : Object ) : Promise<boolean> {
        return await this.getUpdator().updateStudentScoresForYearTermClass( scores, payload);
    };

    async updateStudentDetails( payload : Object | any ): Promise<boolean> {
        return await this.getUpdator().updateStudentDetailsForYearTermClass( payload );
    };

    async updateStudentPassport( data : Object | any ): Promise<boolean>{
        return await this.getUpdator().updateStudentPassportForYearTermClass( data );
    };

    async updateSchoolData( payload : Object | any ) : Promise<number> {
        return await this.getUpdator().updateSchoolData( payload );
    }

    async updateGradingSystem ( gradeSystemArray : GradeSystem[] ){
        return await this.getUpdator().updateGradingSystem( gradeSystemArray );
    }

    async updateComments( teacherPath : string, principalPath : string ){
        return await this.getUpdator().updateComments( teacherPath, principalPath );
    }

    async updateColorSystem( colors : string[] ){
        return await this.getUpdator().updateColorSystem( colors );
    }

    deleteStudentByStudentNo(studentNo: string): Promise<void> {
        throw new Error('Method not implemented.');
    };

    async deleteStudentFromClassTable( data : Object | any ) : Promise<boolean>{
        return await this.getDeletor().deleteStudentFromClass( data );
    }

    deleteSubject(subject: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async deleteSubjectForStudents(studentNos: string[], payload: Object | any ) {
        await this.getDeletor().deleteSubjectForStudents( studentNos, payload );
    }

    async deleteSchoolEmail( emailText : string ) {
        await this.getDeletor().deleteSchoolEmail ( emailText );
    }
    
    getCreator() : Creator {
        return this.creator;
    };
    
    getReader() : Reader {
        return this.reader;
    };

    getUpdator() : Updator{
        return this.updator;
    };

    getDeletor() : Deletor{
        return this.deletor;
    };
}