
export default interface Delete
{
    deleteStudentByStudentNo( studentNo : string ) : Promise<void>;

    deleteSubject( subject : string) : Promise<void>;

}