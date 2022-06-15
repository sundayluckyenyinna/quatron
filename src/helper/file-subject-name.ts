import path from 'path';

export default class SubjectNameExtractor
{
    private absolutePath : string;

    constructor ( absolutePath : string ){
        this.absolutePath = absolutePath;
    };

    getAbsolutePath() : string {
        return this.absolutePath;
    };

    getOSPathSeparator() : string {
        return path.sep;
    };

    getFileName() : string{
        return path.basename( this.absolutePath );
    };

    getFileNameWithoutExtension() : string {
        const baseName = this.getFileName();
        return this.compress(baseName.substring(0, baseName.lastIndexOf('.')));
    };

    static getFileNameWithoutExtension( absolutePath : string ){
        return new SubjectNameExtractor( absolutePath ).getFileNameWithoutExtension();
    };

    compress( value : string ) : string {
        value = value.trim().toLowerCase();       // first trim the incoming string to sanitize it
        if ( !value.includes(' ') ) { return value; };
        return value.split(' ').filter( entry => entry !== '').join('_');
    };
}