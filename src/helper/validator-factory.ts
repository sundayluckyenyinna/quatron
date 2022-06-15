import UploadValidator from './upload-validator';
import { WordAndPdfUploadValidator, ExcelFileUploadValidator } from './upload-validator';
import { DocumentReader, PDFReader, ExcelReader } from './file-reader';

 export default class ValidatorFactory
 {
     private fileType : string;
     private fileReader : DocumentReader | PDFReader | ExcelReader;
     private standardStudentNos : string[];

     constructor( fileType : string, fileReader : DocumentReader | PDFReader | ExcelReader, standardStudentnos : string[] ){
         this.fileType = fileType;
         this.fileReader = fileReader;
         this.standardStudentNos = standardStudentnos;
     };

     async createValidator() : Promise<UploadValidator|ExcelFileUploadValidator|null> {
         switch( this.fileType ){
             case 'word': return new WordAndPdfUploadValidator( await ((this.fileReader) as DocumentReader).getRowObjects(), this.standardStudentNos);
             case 'pdf' : return new WordAndPdfUploadValidator( await (this.fileReader as PDFReader).getRowObjects(), this.standardStudentNos);
             case 'excel' : return new ExcelFileUploadValidator( this.standardStudentNos, this.fileReader as ExcelReader )
         };
         return null;
     }
 }