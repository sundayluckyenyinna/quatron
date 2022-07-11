import Repository from '../abstracts/repository';
import Subject from '../../model/subject';
import GradeSystem from '../../model/grade-settings';
import ConcreteRepository from './concrete-repository';

export default class Reader 
{
    private respository : Repository;

    constructor( repository : Repository ){
        this.respository = repository;
    };

    async getAcademicYears() : Promise<string[]> {
        await this.getDefaultAcademicYearTable();
        const yearsArray : string[] = [];
        const yearsObjectArray  = await (await this.getRepository().getAcademicYearDatabaseConnection()).all(
            "SELECT Year from academic_year"
        );
        if ( yearsObjectArray ){
            yearsObjectArray.forEach( (object: { Year: string; }) => {
                yearsArray.push(object.Year);
            });
        };
        return yearsArray;
    };

    async getAllSubjectNames() : Promise<string[]>{
        return await (await this.getRepository().getSubjectsDatabaseConnection()).all(
            "SELECT Subject_Name FROM all_subjects"
        );
    };

    async getAllSubjectsNameForYearTermClass( data : Object ) : Promise<string[]>{
        await this.getDefaultSubjectsTable( data );
        const subjectArray : string[] = [];
        const subjectsObjectArray = await (await this.getRepository().getClassDatabaseConnection(data)).all(
            "SELECT Subject_Name FROM subjects"
        );
        if ( subjectsObjectArray ){
            subjectsObjectArray.forEach( (object: { Subject_Name: string; }) => {
                subjectArray.push(object.Subject_Name);
            });
        };
        return subjectArray
    };

    async getAllSubjectObjectForYearTermLevel( data : Object ) : Promise<Object[]>{
        await this.getDefaultSubjectsTable( data );
        const subjectsObjectArray = await (await this.getRepository().getClassDatabaseConnection(data)).all(
            "SELECT * FROM subjects"
        );
        return subjectsObjectArray;
    };

    async getNumberOfStudentsFromAllStudents( data : Object ) : Promise<number>{
        await (await this.getDefaultAllStudentsTable( data ));
        return await (await (await this.getRepository().getAllStudentsDatabaseConnection( data )).all("SELECT Student_No FROM all_students")).length;
    };

    async getAllStudentsByClass( data : Object | any  ) : Promise<Object[]> {
        return await (await this.getRepository().getClassDatabaseConnection( data )).all(
            "SELECT * FROM " + data.clazz
        );
    };

    async getAllStudentScores( data : Object | any ) : Promise<Object[]> {
        return await ( await this.getRepository().getClassDatabaseConnection ( data )).all(
            "SELECT * FROM " + data.subject + " ORDER BY Student_No ASC"
        );
    };

    // the payload contains year, term and clazz
    async getStudentInClassByStudentNo( payload : Object | any, studentNo : string ) : Promise<Object | undefined>{
        return await (await this.getRepository().getClassDatabaseConnection(payload)).get('SELECT * FROM ' + payload.clazz + ' WHERE Student_No = ?', studentNo);
    };

    async getStudentPassport( studentNo : string, data : Object  ) : Promise<string | undefined> {
        return await (await this.getRepository().getPassportDatabaseConnection( data)).get('SELECT Passport_Image FROM passport WHERE Student_No = ?', studentNo );
    };

    async getStudentSubjectsAndScores( payload : Object | any, studentNo : string, subjects : string[] ) : Promise<Object[]> {
        const studentScores : Object[] = [];
        
        for(let i = 0; i < subjects.length; i++){
            const subject = subjects[i];
            const scoreObject = await (await this.getRepository().getClassDatabaseConnection(payload)).get('SELECT * FROM ' + subject + ' WHERE Student_No = ?', studentNo );
            // create a SubjectObject to get Total_Score, Grade and Remarks
            const subjectDTO = new Subject()
                                            .setGradeSystemArray( await this.getGradingSystem() )
                                            .setCaScore(scoreObject.Ca_Score)
                                            .setExamScore(scoreObject.Exam_Score);

            scoreObject.subjectName = this.getNeatSubject( subject );
            scoreObject.Total_Score = subjectDTO.getTotalScore();
            scoreObject.Grade = subjectDTO.getGrade();
            scoreObject.Remarks = subjectDTO.getRemarks();
            
            studentScores.push( scoreObject );            
        };
        return studentScores;
    };

    // the payload contains the actual student no
    async getStudentDataForYearTermClass( payload : Object | any ) : Promise<Object|undefined>{
        const studentData : Object | any = {};

        const studentPassport = await this.getStudentPassport( payload.studentNo, payload );

        const studentObject : Object | any  = await this.getStudentInClassByStudentNo(payload, payload.studentNo);

        const subjectsAndScores = await this.getStudentSubjectsAndScores(payload, payload.studentNo, studentObject.Subject.split('#'));

        studentData.studentNo = payload.studentNo;
        studentData.studentDetails = studentObject;
        studentData.subjectsAndScores = subjectsAndScores;
        studentData.passport = studentPassport;
        return studentData;
    };

    async getAllStudentNosForYearTermClass( payload : Object | any ) : Promise<string[]> {
        const studentNoArray = await (await this.getRepository().getClassDatabaseConnection(payload)).all('SELECT Student_No FROM ' + payload.clazz);
        return studentNoArray.map( (object : Object | any ) => object.Student_No );
    };

    // the payload will contain the year, term and class and studentno array
    async getAllStudentsDataForYearTermClass( payload : Object | any ) : Promise<(Object|undefined)[]>{
        const studentsByStudentNo: (Object | undefined)[] = [];
        const studentNosInClass = await this.getAllStudentNosForYearTermClass(payload);
        for (let i = 0; i < studentNosInClass.length; i++){
            payload.studentNo = studentNosInClass[i];
            const studentData = await this.getStudentDataForYearTermClass(payload);
            studentsByStudentNo.push(studentData);
        };
        return studentsByStudentNo;
    };

    // this data object contains the term, year and clazz and subject of consideration.
    async getScoreObjectsOfAllSubjectsForYearTermClassAsMap( data : Object | any ) : Promise<Map<string, Object[]>> {

        // create the map to hold each subjects and their respective array of individual student score records
        const map : Map<string, Object[]> = new Map();

       // get the subjects names for this class
       const subjectNames = await this.getAllSubjectsNameForYearTermClass( data );

       // for each of the subjects, get the array of the students and their scores
       for ( let i = 0; i < subjectNames.length; i++ ){
           const subjectName = subjectNames[i];
           data.subject = subjectName;

           // get all the scores object and push it to the map with the subjectName as key
           const scoreRecords : Object[] = await this.getAllStudentScores( data );
           map.set( subjectName, scoreRecords);
       }

       return map;
    };


    async getAllScoreRecordsForLevels( data : Object | any ) : Promise<Map<string, Map<string, Object[]>>> {

        const allLevelRecordMap : Map<string, Map<string, Object[]>> = new Map();

        const clazzes : string[] = [];

        if( (data.level as string ).toLowerCase() === 'junior'){ clazzes.push('jss1', 'jss2', 'jss3') }
        else{ clazzes.push('sss1', 'sss2', 'sss3') };

        for ( let i = 0; i < clazzes.length; i++ ){
            const clazz = clazzes[i];
            data.clazz = clazz;
            const classScoreRecords = await this.getScoreObjectsOfAllSubjectsForYearTermClassAsMap( data );
            allLevelRecordMap.set( clazz, classScoreRecords );
        }
        return allLevelRecordMap;
    };

    getSubjectsAndCountForClass( subjectsMap : Map<string, Object[]> ) : Object | any {
        const result : Object | any = {};

        // get all the subjects in the map as array 
        subjectsMap.forEach(( value : Object[], subjectName : string ) => result[subjectName] = value.length);

        return result;
    }

    getCombinedSubjectsAndCountForAllClassesInLevel( arrayForClass : Object[] ) : Object | any {

        const combinedSubjectsAndCounts : Object | any = {};

        // Now, get the key of any object in the array. The subjects and number of subjects offered in that level will basically be the same thing

        const subjectNames = Object.keys( arrayForClass[0] );

        subjectNames.forEach((subjectName : string) => {

            let totalForSubjectName = 0;
            // go through all the objects in the array, locate the subjectName value and add to the total for that subjectName
            arrayForClass.forEach((classRecordCount : Object | any) => totalForSubjectName += Number( classRecordCount[subjectName]) );

            combinedSubjectsAndCounts[ subjectName ] = totalForSubjectName;
        });

        return combinedSubjectsAndCounts;

    }

    // data contains 'term, year and level'
    async getSubjectsAndCountForLevel( data : Object | any ): Promise< Object >{

        // declare a variable to hold the subjects and count for each class
        const subjectsAndCountForAllClasses : Object[] = [];

        const classes : string[] = [];

        if ( (data.level as string).toLowerCase() === 'junior' ){
            classes.push('jss1', 'jss2', 'jss3');
        }else{
            classes.push('sss1', 'sss2', 'sss3');
        }

        for ( let i = 0; i < classes.length; i++ ){
            const clazz = classes[i];
            data.clazz = ( clazz as string).trim();
            const classSubjectsMap : Map <string, Object[]> = await this.getScoreObjectsOfAllSubjectsForYearTermClassAsMap( data );
            const classSubjectsAndCount = this.getSubjectsAndCountForClass( classSubjectsMap );
            subjectsAndCountForAllClasses.push( classSubjectsAndCount );
        }

        // return the combined subject and count for all classes in that level.
        return this.getCombinedSubjectsAndCountForAllClassesInLevel( subjectsAndCountForAllClasses );
    }

    async getStudentNameArray( payload : Object | any ) : Promise<Object | undefined> {
        return await (await this.getRepository().getClassDatabaseConnection( payload )).get(
            "SELECT Surname, First_Name, Middle_Name FROM " + payload.clazz + " WHERE Student_No = ?", payload.studentNo
        )
    }

    async getSchoolEmailAddressString() : Promise<string> {
        const emailObject : Object | any  =  await ( await this.getRepository().getSchoolDataDatabaseConnection()).get(
            'SELECT Data FROM school WHERE Id = ?', 'email'
        )
        return emailObject.email;
    }

    async getAllSchoolData() : Promise<Object> {

        // check that the school table exists and create one if no one exists.
        let rows : Object[] = [];
        try{
            rows =  await (await this.getRepository().getSchoolDataDatabaseConnection()).all(
                'SELECT * FROM school'
            );
        }catch( error ){
            await ( this.getRepository() as ConcreteRepository ).getCreator().createSchoolDataTable();
            rows =  await (await this.getRepository().getSchoolDataDatabaseConnection()).all(
                'SELECT * FROM school'
            );
        }

        const schoolData : Object | any = {};

        rows.forEach( ( row : Object | any ) => {
            const idValue : string = row.Id;
            const dataValue : string = row.Data;
            // append this value to the defined object 
            schoolData[ idValue ] = dataValue;
        });

        return schoolData;
    }

    async getGradingSystem() : Promise<GradeSystem[]> {
        
        const gradeSystemArray : GradeSystem[] = [];

        const gradeObjects : [{ Grade : string, Lower_Score_Range : number, Higher_Score_Range : number, Remarks : string }] = await (await this.getRepository().getGradeSystemDatabaseConnection()).all(
            'SELECT * FROM grade_system'
        );
        
        for (const gradeObject of gradeObjects ){
            const gradeSystem = new GradeSystem( gradeObject.Grade, gradeObject.Lower_Score_Range, gradeObject.Higher_Score_Range, gradeObject.Remarks);
            gradeSystemArray.push( gradeSystem );
        }

        return gradeSystemArray;
    }

    /**
     * Returns an object of the grading system representing the grading scheme.
     * @returns 
     */
    async getGradingSystemObjectArray() : Promise<Object[]> {
        // check that the table exists and create one if not exist.
        await((await this.getRepository() as ConcreteRepository).getCreator().createGradeSystemTable());
        const gradeObjects : [{ Grade : string, Lower_Score_Range : number, Higher_Score_Range : number, Remarks : string }] = await (await this.getRepository().getGradeSystemDatabaseConnection()).all(
            'SELECT * FROM grade_system'
        );
        return gradeObjects;        
    }

    async getTeacherComments() : Promise<string[]> {
        const raw : object | any = await( await this.getRepository().getSchoolDataDatabaseConnection() ).get(
             'SELECT Data FROM school WHERE Id = ?', 'teacher-comments'
        );
        return ( raw.Data as string ).split('&');
    }

    async getPrincipalComments() : Promise<string[]> {
        const raw : object | any = await( await this.getRepository().getSchoolDataDatabaseConnection() ).get(
            'SELECT Data FROM school WHERE Id = ?', 'principal-comments'
        );
        return ( raw.Data as string ).split('&');
    }

    async getColors() : Promise<String[]> {
        const raw : object | any = await( await this.getRepository().getSchoolDataDatabaseConnection() ).get(
            'SELECT Data FROM school WHERE Id = ?', 'colors'
        );
        return ( raw.Data as string ).split('&');
    }

    // defaults
    async getDefaultAcademicYearTable(){
        await (await this.getRepository().getAcademicYearDatabaseConnection()).exec(
            "CREATE TABLE IF NOT EXISTS academic_year(Year varchar(10), Description varchar(50))"
        );        
    };

    async getDefaultAllStudentsTable( data : Object ){
        await (await this.getRepository().getAllStudentsDatabaseConnection( data )).exec(
            "CREATE TABLE IF NOT EXISTS all_students(Student_No varchar(50) primary key, Surname varchar(50), First_Name varchar(50), Middle_Name varchar(50), Gender varchar(10), D_O_B varchar(10), State_of_Origin varchar(20), Clazz varchar(10), Department varchar(20), Passport_Image text, Subject varchar (100))" 
        );  
    };

    async getDefaultSubjectsTable( data : Object ) {
        await (await this.getRepository().getClassDatabaseConnection(data)).exec(
            "CREATE TABLE IF NOT EXISTS subjects(Subject_Name varchar(50), Level varchar(30), Department varchar (30))" 
        );
    };

    getRepository() : Repository {
        return this.respository;
    };

    getNeatSubject( subject: string ) : string {
        return subject.split('_').map( token => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
    };
};