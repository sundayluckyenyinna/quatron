
import Repository from '../abstracts/repository';
import ConcreteRepository from './concrete-repository';

export default class Deletor
{

    private repository : Repository;

    constructor( repository : Repository ){
        this.repository = repository;
    }

    async deleteStudentFromClass( data : Object | any ) : Promise<boolean> {
        const clazz = await(await this.getRepository().getClassDatabaseConnection(data)).run(
            'DELETE FROM ' + data.clazz +' WHERE Student_No = ?', data.Student_No
        );

        const all = await( await this.getRepository().getAllStudentsDatabaseConnection( data )).run(
            'DELETE FROM all_students WHERE Student_No = ?', data.Student_No
        );

        const passport = await (await this.getRepository().getPassportDatabaseConnection( data )).run(
            'DELETE FROM passport WHERE Student_No = ?', data.Student_No
        );

        var done : number = 0;
        // de-register the student from all the subjects
        const subjects = await (this.getRepository() as ConcreteRepository).getAllSubjectsNameForYearTermClass( data );
        console.log( subjects );

        for (let i = 0; i < subjects.length; i++){
            const subject = subjects[i];
            done = (await (await this.getRepository().getClassDatabaseConnection( data )).run(
                'DELETE FROM ' + subject + ' WHERE Student_No = ?', data.Student_No
            )).changes as number;
        };

        if ( clazz.changes ===1 && all.changes === 1 && passport.changes === 1 && done === 1){ return true; };
        return false;
    }

    async deleteSubjectForStudents(studentNos: string[], payload: any) {

        for ( let i = 0; i < studentNos.length; i++ ){
            const studentNo = studentNos[i];
            const subject = payload.subject;

            // delete the student record from the subject table in the class database
            await (await (await this.getRepository().getClassDatabaseConnection( payload )).run(
                'DELETE FROM ' + payload.subject + ' WHERE Student_No = ?', studentNo
            ));

            // delete the subject from the student subject list
            const subjectObject = await (await this.getRepository().getClassDatabaseConnection( payload )).get(
                'SELECT Subject FROM ' + payload.clazz + ' WHERE Student_No = ?', studentNo
            );
            
            const subjects : string = subjectObject.Subject;

            const newSubjectString : string = subjects.split('#').filter((subjectName : string) => subjectName !== subject).join('#');
            
            await ( await this.getRepository().getClassDatabaseConnection( payload )).run(
                'UPDATE ' + payload.clazz + ' SET Subject = ? WHERE Student_No = ?', newSubjectString, studentNo
            );

            await ( await this.getRepository().getAllStudentsDatabaseConnection( payload )).run(
                'UPDATE all_students SET Subject = ? WHERE Student_No = ?', newSubjectString, studentNo
            );

        }
    }

    async deleteSchoolEmail( emailText : string ){
        const emailString : string = await ( this.getRepository() as ConcreteRepository ).getSchoolEmailAddressString();

        // filter the emailText from the array of the email addresses
        const newEmailString : string  = emailString.split('#').filter((email : string) => email !== emailText ).join('#');
        
        // set the newEmailString to the data store
        await (await this.getRepository().getSchoolDataDatabaseConnection()).run(
            'UPDATE school SET Data = ? WHERE Id = ?', newEmailString, 'email'
        ); 
    }

    getRepository() : Repository{
        return this.repository;
    }
}