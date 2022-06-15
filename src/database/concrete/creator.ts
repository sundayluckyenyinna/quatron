import Student from "../../model/student";
import Repository from '../abstracts/repository';
import Subject from '../../model/subject';

export default class Creator 
{
    private repository : Repository;

    constructor( repository : Repository ){
        this.repository = repository;
    };

    async createAcademicYear ( data : Object | any ) {
        await (await this.getRepository().getAcademicYearDatabaseConnection()).exec(
            "CREATE TABLE IF NOT EXISTS academic_year(Year varchar(10), Description varchar(50))"
        );
        return await (await this.getRepository().getAcademicYearDatabaseConnection()).run(
            "INSERT INTO academic_year (Year, Description) VALUES (?, ?)", data.year, data.description
        );
    };

    async createStudent ( data : Object | any, student : Student ) {
        // Save the student passport to the passport database.
        const savePassportInfo = await (await this.saveStudentPassport( student.getSchoolDetails().getStudentNo(), 
                                        student.getSchoolDetails().getPassport(), data )); 
        if( savePassportInfo.changes !== 1) { throw new Error('Could not save student passport') };

        // Save the student object to the overall register.
        const saveStudentToAllStudentinfo  = await (await this.saveStudentToAllStudentsDatabase( student, data ));
        if (saveStudentToAllStudentinfo.changes !== 1) { throw new Error('Could not save students to overall register')};

        // Save the student object to the class register.
        const saveStudentToClassInfo = await (await this.saveStudentToClass(data, student));
        if(saveStudentToClassInfo.changes !== 1) {throw new Error('Could not save student to class register')};

        return ([ savePassportInfo, saveStudentToAllStudentinfo, saveStudentToClassInfo ]);
    };

    async saveStudentPassport( studentNo : string, passport : string, data : Object ) {
        // save passport and student number in the passport database
        await (await this.getRepository().getPassportDatabaseConnection( data)).exec(
            "CREATE TABLE IF NOT EXISTS passport(Student_No varchar(20) primary key, Passport_Image text)"
        );        
        return await (await this.getRepository().getPassportDatabaseConnection( data )).run(
            "INSERT INTO passport(Student_No, Passport_Image) VALUES (?, ?)", studentNo, passport
        );
    };

    async saveStudentToAllStudentsDatabase( student : Student, data : Object ) {
        await (await this.getRepository().getAllStudentsDatabaseConnection(data)).exec(
            "CREATE TABLE IF NOT EXISTS all_students(Student_No varchar(50) primary key, Surname varchar(50), First_Name varchar(50), Middle_Name varchar(50), Gender varchar(10), D_O_B varchar(10), State_of_Origin varchar(20), Clazz varchar(10), Department varchar(20), Passport_Image text, Subject text)" 
        );
        return await (await this.getRepository().getAllStudentsDatabaseConnection( data )).run(
            "INSERT INTO all_students VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            student.getSchoolDetails().getStudentNo(), student.getName().getSurname(), 
            student.getName().getFirstName(), student.getName().getMiddleName(),
            student.getPersonalDetails().getGender(), student.getPersonalDetails().getDateOfBirth(),
            student.getPersonalDetails().getStateOfOrigin(), student.getSchoolDetails().getClass(),
            student.getSchoolDetails().getDepartment(), student.getSchoolDetails().getPassport(),
            student.getSubjectString()
        );
    };

    /**
     * 
     * @param data Object
     */
    async saveStudentToClass( data : Object | any, student : Student ) {
        await (await this.getRepository().getClassDatabaseConnection( data )).exec(
            "CREATE TABLE IF NOT EXISTS " + data.clazz + " (Student_No varchar(50) primary key, Surname varchar(50), First_Name varchar(50), Middle_Name varchar(50), Gender varchar(10), D_O_B varchar(10), State_of_Origin varchar(20), Clazz varchar(10), Department varchar(20), Passport_Image text, Subject text)" 
        );

        // get the subjects of the students and save the students for future scores entry.
        const studentSubjectArray = student.getSubjectString().split('#');

        studentSubjectArray.forEach(async subject => {
            await (await this.getRepository().getClassDatabaseConnection(data)).run(
                "INSERT INTO " + subject + " (Student_No, Ca_Score, Exam_Score) VALUES (?, ?, ?)", student.getSchoolDetails().getStudentNo(), 0, 0
            );
        });

        return await (await this.getRepository().getClassDatabaseConnection( data )).run(
            "INSERT INTO " + data.clazz + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            student.getSchoolDetails().getStudentNo(), student.getName().getSurname(), 
            student.getName().getFirstName(), student.getName().getMiddleName(),
            student.getPersonalDetails().getGender(), student.getPersonalDetails().getDateOfBirth(),
            student.getPersonalDetails().getStateOfOrigin(), student.getSchoolDetails().getClass(),
            student.getSchoolDetails().getDepartment(), student.getSchoolDetails().getPassport(),
            student.getSubjectString()
        );
        
    };

    async createSubject( data : Object | any, subject : Subject ) {
        const saveSubjectToAllSubjectDatabaseInfo  = await this.saveSubjectToAllSubjectDatabase( data, subject );
        if ( saveSubjectToAllSubjectDatabaseInfo.changes !== 1 ) { 
            throw new Error('Could not save subject object to all subject table');
        };
        const saveSubjectToClassInfo = await this.saveSubjectToClass( data, subject );
        if( saveSubjectToClassInfo !== 1 ) { throw new Error('Could not create subject table') };
        return [ saveSubjectToAllSubjectDatabaseInfo, saveSubjectToClassInfo ];  
    };


    async saveSubjectToAllSubjectDatabase( data : Object | any, subject : Subject ) {
       await (await this.getRepository().getSubjectsDatabaseConnection()).exec(
            "CREATE TABLE IF NOT EXISTS all_subjects(Subject_Name varchar(50), Level varchar(30), Department varchar(30))" 
        );
        // check wheter subject already exist
        if ( (await this.subjectAlreadyExist( subject.getName() ))) { return { changes : 1} };

       return  await (await this.getRepository().getSubjectsDatabaseConnection()).run(
            "INSERT INTO all_subjects VALUES(?, ?, ?)", subject.getName(), subject.getLevel(), data.department
        );
    };

    async saveSubjectToClass( data : Object | any, subject : Subject ) {
        await (await this.getRepository().getClassDatabaseConnection( data )).exec(
            "CREATE TABLE IF NOT EXISTS subjects(Subject_Name varchar(50), Level varchar(30), Department varchar(30))" 
        );
        await (await this.getRepository().getClassDatabaseConnection( data )).run(
            "INSERT INTO subjects VALUES(?, ?, ?)", subject.getName(), subject.getLevel(), data.department
        );
        await (await this.getRepository().getClassDatabaseConnection( data )).exec(
            "CREATE TABLE IF NOT EXISTS " + subject.getName() + " (Student_No varchar(30) primary key, Ca_Score integer, Exam_Score integer)"
        );
       
        return 1;
    };

    async createSchoolDataTable() {
        await (await this.getRepository().getSchoolDataDatabaseConnection()).exec(
            'CREATE TABLE IF NOT EXISTS school ( Id varchar(30) primary key, Data text )'
        );

        // insert the ids. If the table already have this ids, the program will throw an error. If this happens, just continue
        const ids : string [] = ['name', 'motto', 'address', 'email', 'telephone', 'logo' ];
        
        for ( let i = 0; i < ids.length; i++ ){
            const id = (ids[i] as string).trim();
            await (await this.getRepository().getSchoolDataDatabaseConnection()).run(
                'INSERT INTO school VALUES (?,?)', id, 'null'
            );
        }
    }

    async createGradeSystemTable() {
        await (await this.getRepository().getGradeSystemDatabaseConnection()).exec(
            'CREATE TABLE IF NOT EXISTS grade_system (Grade varchar(10) primary key, Lower_Score_Range Integer, Higher_Score_Range Integer, Remarks varchar(30))'
        );

    }

    getRepository() {
        return this.repository;
    };

    // UTILITY FUNCTIONS
    async subjectAlreadyExist( subjectName : string ){
        const subjectObjectArray = await ( await this.getRepository().getSubjectsDatabaseConnection()).all("SELECT Subject_Name FROM all_subjects");
        const names : string[] = [];
        subjectObjectArray.forEach((object : {Subject_Name : string}) => { names.push(object.Subject_Name)});
        return names.includes(subjectName);
    };
};