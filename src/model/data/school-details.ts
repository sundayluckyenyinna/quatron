
export default class SchoolDetails
{
    private clazz : string;

    private department : string;

    private studentNo : string;

    private passport : string;

    private admissionYear : string;

    constructor( clazz : string = '',
            department : string = '',
             studentNo : string = '',
              passport : string = '',
         admissionYear : string = ''){
        this.clazz = clazz;
        this.department = department;
        this.studentNo = studentNo;
        this.passport = passport;
        this.admissionYear = admissionYear;
    };

    static NewInstance( object : Object | any ) : SchoolDetails {
        return new SchoolDetails( object.clazz, object.department, object.studentNo, object.passport, object.admissionYear );
    };

    getClass() : string {
        return this.clazz;
    };

    getDepartment() : string {
        return this.department;
    };

    getStudentNo() : string {
        return this.studentNo;
    };

    getPassport() : string {
        return this.passport;
    };

    getAdmissionYear(){
        return this.admissionYear;
    };
 
    setClass( clazz : string ) : SchoolDetails {
        this.clazz = clazz; return this;
    };

    setDepartment( dept : string ) : SchoolDetails {
        this.department = dept; return this;
    };

    setStudentNo ( studentNo : string ) : SchoolDetails {
        this.studentNo = studentNo; return this;
    };

    setPassport ( passportBase64String : string ) : SchoolDetails {
        this.passport = passportBase64String; return this;
    };

    setAdmissionYear ( admissionYear : string ) : SchoolDetails {
        this.admissionYear = admissionYear; return this;
    };
}