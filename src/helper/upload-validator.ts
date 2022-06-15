import { ExcelReader } from './file-reader';

export default interface UploadValidator
{
    getValidRowObjects() : Object[];
    getInvalidRowObject() : Object[];
    hasValidStudentNoByRegistration( object : Object | any ) : boolean;
    hasValidCaScore( object : Object | any ) : boolean;
    hasValidExamScore( object : Object | any ) : boolean;
}

export  class WordAndPdfUploadValidator implements UploadValidator
{
    private rows : Object[];
    private standardNos : string[];
    
    constructor( rows : Object[], standardRows : string[] ){
        this.rows = rows;
        this.standardNos = standardRows;
    }

    getRows() : Object[]{
        return this.rows.map( (object : Object | any, index : number) => {
            const copy = { ...object };
            copy.rowNumber = index + 1;
            return copy;
        });
    }

    // functions to check the validity of a row object
    hasValidStudentNoByRegistration( testRow : Object | any  ) : boolean {
       return this.getStandardStudentNos().includes( testRow.studentNo );
    }

    hasValidCaScore ( testRow : Object | any ) : boolean {
        return String(testRow.caScore) === 'NaN' ? false : true;
    };

    hasValidExamScore ( testRow : Object | any ) : boolean {
        return String(testRow.examScore) === 'NaN' ? false : true;
    };

    passAllCheck( testRow : Object | any ) : boolean {
        return this.hasValidStudentNoByRegistration( testRow ) && 
               this.hasValidCaScore( testRow ) &&
               this.hasValidExamScore( testRow );
    };

    getValidRowObjects(): Object[] {
        const validRows : Object[] = [];
        this.getRows().forEach( (row : Object | any) => {
            if ( this.passAllCheck( row ) ) { validRows.push(row); };
        });
        return validRows;
    };

    getInvalidRowObject(): Object[] {
        const invalidRows : Object[] = [];
        this.getRows().forEach( (row : Object | any ) => {
            if( !this.passAllCheck(row) ) {
                row.error = this.generateAdequateError( row ); 
                invalidRows.push( row ); 
            };
        });
        return invalidRows;
    };

    getStandardStudentNos() {
        return this.standardNos;
    };

    // function to generate adequate error for the invalid object
    private generateAdequateError( invalidRow : Object | any ) : Object {
        const error : Object | any = {};
        if( !this.hasValidStudentNoByRegistration( invalidRow ) ){ 
            error.invalidNumberMessage = 'The number ' + invalidRow.studentNo + ' does not represent a valid Student No. registered for this class, for the specified year and term. You need to register the student with this Student No., or you likely want to correct the typographic error made in spelling out the Student No.';
        };
        if( !this.hasValidCaScore( invalidRow ) ){
            error.invalidCaMessage = 'The CA score for the Student No. ' + invalidRow.studentNo + ' is of invalid type. A number is expected. It likely that you entered a text or you left the column empty. Enter a score or you can enter 0 if you mean that the candidate has no score for this particular subject.';
        };
        if( !this.hasValidExamScore( invalidRow ) ){
            error.invalidExamMessage = 'The Exam score for the Student No. ' + invalidRow.studentNo + ' is of invalid type. A number is expected. It likely that you entered a text or you left the column empty. Enter a score or you can enter 0 if you mean that the candidate has no score for this particular subject.';
        };
        return error;
    }
};



export class ExcelFileUploadValidator
{
    private standardNos : string[];
    private excelReader : ExcelReader;

    constructor(standardNos : string[], excelReader : ExcelReader ) {
        this.standardNos = standardNos;
        this.excelReader = excelReader;
    };

    async getRows( sheetName : string ) : Promise<Object[]> {
        return (await this.excelReader.getRowObjects( sheetName )).map( (object : Object | any, index : number) => {
            const copy = { ...object };
            copy.rowNumber = index + 1;
            return copy;
        });
    }

    hasValidStudentNoByRegistration(object: any): boolean {
        return this.standardNos.includes( object.studentNo );
    }

    hasValidCaScore(object: any): boolean {
        return object.caScore === undefined ? false : true;
    }

    hasValidExamScore(object: any): boolean {
        return object.examScore === undefined ? false : true;
    }

    private passAllCheck( object : any ) : boolean {
        return this.hasValidStudentNoByRegistration( object ) &&
               this.hasValidCaScore( object ) &&
               this.hasValidExamScore( object );
    };

    async getErrorArray( sheetName : string ){
        return await this.excelReader.getErrorArray( sheetName );
    }
    
    async getValidRowObjects( sheetName : string ): Promise<Object[]> {
        return (await this.getRows( sheetName )).filter((row : object | any) => this.passAllCheck(row));
    }

    async getInvalidRowObject( sheetName : string ): Promise<Object[]> {
        const invalidRows : Object[] = [];
        (await this.getRows( sheetName )).forEach((object : Object | any) => {
            if( !this.passAllCheck(object) ){
                const error = this.generateAdequateError( object );
                object.error = error;
                invalidRows.push( object );
            }
        });
        return invalidRows;
    };

    async getAllPosiibleSheetsObject() : Promise<Object[] | any[]> {
        const allSheetRecords : Object[] = [];
        // get all the sheet names in an array
        const sheets = await this.excelReader.getSheetNames();

        for ( let i = 0; i < sheets.length; i ++ ){

            const all : Object | any = {};
            const sheetName = sheets[i];
            // get both the valid and invalid row objects
            const validRows = await this.getValidRowObjects( sheetName );
            const invalidRows = await this.getInvalidRowObject( sheetName );
            // add it to the object using the sheetName as key. This is also the subject concerned
            all[ this.compress(sheetName) ] = { validRows : validRows, invalidRows : invalidRows };
            allSheetRecords.push( all );
        };
        return allSheetRecords;
    };

    // function to generate adequate error for the invalid object
    private generateAdequateError( invalidRow : Object | any ) : Object {
        const error : Object | any = {};
        if( !this.hasValidStudentNoByRegistration( invalidRow ) ){ 
            error.invalidNumberMessage = 'The number ' + invalidRow.studentNo + ' does not represent a valid Student No. registered for this class, for the specified year and term. You need to register the student with this Student No., or you change it to a registered one if it is likely that you have made a typographical error.';
        };
        if( !this.hasValidCaScore( invalidRow ) ){ 
            error.invalidCaMessage = 'The CA score for the Student No. ' + invalidRow.studentNo + ' is of invalid type. A number is expected in the column. It might be that you entered a text or you left it empty. You can enter 0 if you mean that the candidate has no score for this subject.';
        };
        if( !this.hasValidExamScore( invalidRow ) ){
            error.invalidExamMessage = 'The Exam score for the Student No. ' + invalidRow.studentNo + ' is of invalid type. A number is expected in the column. It might be that you entered a text or you left it empty. You can enter 0 if you mean that the candidate has no score for this subject.';
        };
        return error;
    }

    compress( value : string ) : string {
        value = value.trim().toLowerCase();       // first trim the incoming string to sanitize it
        if ( !value.includes(' ') ) { return value; };
        return value.split(' ').filter( entry => entry !== '').join('_');
    };
}