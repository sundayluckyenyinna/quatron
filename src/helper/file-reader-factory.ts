import { DocumentReader, PDFReader, ExcelReader } from './file-reader';

export default class FileReaderFactory
{
    private fileSettings : Object;

    constructor( fileSettings : Object ){
        this.fileSettings = fileSettings;
    };

    createFileReader(){
        switch( Object(this.fileSettings).fileType ){
            case 'word' : return new DocumentReader( Object( this.fileSettings ).filePath );
            case 'pdf' : return new PDFReader( Object( this.fileSettings ).filePath );
            case 'excel' : return new ExcelReader( Object( this.fileSettings ).filePath );
            default : throw { message : 'Invalid file type', status : 403}
        }
    }
}