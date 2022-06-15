import { RegisterTermWindowConfig, RegisterStudentWindowConfig, GenerateWindowConfig, UploadScoreWindowConfig, ViewAllStudentWindowConfig, SubjectPageWindowConfig, ManualUploadPageWindowConfig } from '../config/window-config';

/**
 * 
 */
export default class FileMapper
{
    /**
     * 
     * @param id 
     * @returns 
     */
    static mapFileFromButtonId( id: string ) : object {
        var fileObject : object | any = { filename: '', windowSettings: {}};
        
        switch( id ){
            case 'register-term' : {
                Object(fileObject).filename = 'register-term.html';
                Object(fileObject).windowSettings = RegisterTermWindowConfig; 
                break;
            };

            case 'register-student' : { 
                Object(fileObject).filename = 'register-student.html';
                Object(fileObject).windowSettings = RegisterStudentWindowConfig; 
                break;
             };

            case 'generate-report' : { 
                Object(fileObject).filename = 'generate-report.html';
                Object( fileObject ).windowSettings = GenerateWindowConfig; 
                break;
            };

            case 'upload-score' : {
                Object(fileObject).filename = 'upload-score.html';
                Object( fileObject ).windowSettings = UploadScoreWindowConfig; 
                break;
            };

            case 'view-all-students' : { 
                Object(fileObject).filename = 'view-all-students.html';
                Object( fileObject ).windowSettings = ViewAllStudentWindowConfig; 
                break;
            };

            case 'add-remove-subject' : {
                fileObject.filename = 'subject.html';
                fileObject.windowSettings = SubjectPageWindowConfig;
                break;
            };

            case 'manual-upload' : {
                fileObject.filename = 'manual-upload.html';
                fileObject.windowSettings = ManualUploadPageWindowConfig;
                break;
            };

            case 'view-all-subjects' : {
                fileObject.filename = 'subjects.html';
                fileObject.windowSettings = GenerateWindowConfig;
                break;
            };

            default : throw { 
                message: 'No file found for the given id !',
                statusCode : 404
            };
        };

        return fileObject;
    };
};