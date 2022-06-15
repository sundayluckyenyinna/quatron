import PdfParse from "pdf-parse";
import fs from 'fs';
import mammoth from "mammoth";
import readXlsxFile from 'read-excel-file/node'
import { readSheetNames } from "read-excel-file/node";
import { SchemaEntry } from "read-excel-file/types";
import UploadValidator from './upload-validator';
import { WordAndPdfUploadValidator } from './upload-validator';


export class PDFReader
{
    private absolutePath : string;
   
    constructor( absolutePath : string ){
        this.absolutePath = absolutePath;
    };

    private async getPdfExtract() : Promise<string[]> {
        let lineArray : string[] = [];
        const file = fs.readFileSync( this.absolutePath );
        try{
            const pdfExtract = await PdfParse( file );
            lineArray =  pdfExtract.text.split('\n');
        }catch(error){
            console.log( error );
        }
        return lineArray;
    };

    private async getAllValidLines() : Promise<string[]> {
        const trimmed = (await this.getPdfExtract()).join('#').trim();
        return trimmed.split('#').filter((line : string) => line !== '');
    };

    private async getAllLinesCompressed() : Promise<string[]> {
        const scores : string[] = [];
        (await this.getAllValidLines()).forEach((line : string) => {
            line = line.trim();
            const compressed = line.split(' ').join('#').toUpperCase().trim();
            const neatLine = compressed.split('#').filter( token => token !== '').join('#').toUpperCase();
            scores.push( neatLine );
        });
        return scores;
    };

    async getRowObjects() : Promise<Object[]> {
        const rowObjectArray : Object[] = [];
        (await this.getAllLinesCompressed()).forEach( compressedLine => {
            const array = compressedLine.split('#');
            const object = {
                studentNo : array[0].trim(),
                caScore : Number(array[array.length - 2]),
                examScore : Number(array[array.length - 1])
            };
            rowObjectArray.push( object );
        });
        return rowObjectArray;
    }

    getAbsolutePath() {
        return this.absolutePath;
    }
}


export class DocumentReader 
{
    private absolutePath : string;

    constructor( absolutePath : string ) {
        this.absolutePath = absolutePath;
    };
    
    private async getDocumentExtract() : Promise<string[]> {
        const text = (await mammoth.extractRawText({path : this.absolutePath})).value;
        return text.split('\n').filter( line => line !== '');
    }

    async getAllLinesCompressed() : Promise<string[]> {
        const compressedLineArray : string[] = [];
        (await this.getDocumentExtract()).forEach(line => {
            const compressedLine = line.split('\t').filter( token => token !== '\t').join('#');
            const neatLine = compressedLine.split('#').filter( token => token !== '').join('#').toUpperCase();
            compressedLineArray.push( neatLine );
        });
        return compressedLineArray;
    }

    // only studentNo, caScore and the examScore 
    async getRowObjects() : Promise<Object[]> {
        const rowObjectArray : Object[] = [];
        (await this.getAllLinesCompressed()).forEach( compressedLine => {
            const array = compressedLine.split('#');
            const object = {
                studentNo : array[0].trim(),
                caScore : Number(array[array.length - 2]),
                examScore : Number(array[array.length - 1])
            };
            rowObjectArray.push( object );
        });
        return rowObjectArray;
    }

    getAbsolutePath() {
        return this.absolutePath;
    }
};


export class ExcelReader
{
    private absolutePath : string;

    constructor( absolutePath : string ){
        this.absolutePath = absolutePath;
    }

    private getSchema() {
        return {
            'STUDENT_NO' : { prop : 'studentNo', type : String },
            'SURNAME' : { prop : 'surname', type : String },
            'FIRST_NAME' : { prop : 'firstName', type : String },
            'MIDDLE_NAME' : { prop : 'middleName', type : String },
            'CA_SCORE' : { prop : 'caScore', type : Number },
            'EXAM_SCORE' : { prop : 'examScore', type : Number },
            'AGE' : { prop : 'age', type : Number }
        };
    };

    // TODO: the right sheet name
    async getRowObjects( sheetName : string ) : Promise<Object[]> {
        const schema = this.getSchema();
        const result = await readXlsxFile( this.absolutePath, { schema, sheet : sheetName } );    
        return result.rows;
    };

    //TODO: he right sheet name.
    async getErrorArray( sheetName : string ) {
        const schema = this.getSchema();
        const result = await readXlsxFile( this.absolutePath, { schema, sheet : sheetName });
        return result.errors;
    }

    async getSheetNames() : Promise<string[]>{
        return await readSheetNames( this.absolutePath );
    };

    getAbsolutePath() {
        return this.absolutePath;
    }
}