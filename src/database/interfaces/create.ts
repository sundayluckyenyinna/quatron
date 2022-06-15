import Student from '../../model/student';
import Subject from '../../model/subject';

/**
 * A contract that defines the methods for all creation functions of the repository associated 
 * with this application.
 */
export default interface Create
{
    // Creates a new Academic Year in the database.
    createAcademicYear( data: Object | any ) : Promise<boolean>;

    createStudent( data : Object | any, student: Student ) : Promise<boolean>;

    createSubject( data : Object | any, subject : Subject ) : Promise<boolean>;
};