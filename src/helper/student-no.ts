
export default class StudentNumberGenerator
{
    static generateStudentNo( date : Date, department : string, id : number ) : string {
        return this.getDateCode( date ) + this.getDepartmentCode( department ) + String( id ).trim() + this.getLevelCode( department );
    };

    private static getDepartmentCode( department : string) : string {
        var code =''
        department = department.toLowerCase().trim();
        switch(department){
            case 'science' : code = '100'; break;
            case 'commercial' : code = '200'; break;
            case 'arts' : code = '300'; break;
            case 'none' : code = '400'; break;
            default : throw new Error('Invalid department');
        };
        return code;
    };

    private static getClassCode( clazz : string ) : string {
        var code =''
        clazz = clazz.toLowerCase().trim();
        switch ( clazz ){
            case 'jss1' : code = '100'; break;
            case 'jss2' : code = '200'; break;
            case 'jss3' : code = '300'; break;
            default : throw new Error('Invalid class');
        };
        return code;
    };

    private static getDateCode( date : Date ) : string {
        return date.getFullYear().toString().substring(2).trim();
    };

    private static getLevelCode( dept : string ) : string {
        if(dept.toLowerCase().trim() === 'none') return 'JNR';
        return 'SNR';
    };

};
