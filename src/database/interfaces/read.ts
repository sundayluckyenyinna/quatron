import Student from "../../model/student";
import Subject from "../../model/subject";

export default interface Read
{
    getAcademicYears() : Promise<string[]>;

    getStudentByStudentNo() : Promise<Student>;

    getAllStudentsByClass( data : Object | any ) : Promise<Object[]>;

    getAllStudentsByDepartment( department : string ) : Promise<Student[]>;

    getAllStudents() : Promise<Student[]>;

    getAllSubjects() : Promise<Subject[]>
}