"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const window_config_1 = require("../config/window-config");
/**
 *
 */
class FileMapper {
    /**
     *
     * @param id
     * @returns
     */
    static mapFileFromButtonId(id) {
        var fileObject = { filename: '', windowSettings: {} };
        switch (id) {
            case 'register-term':
                {
                    Object(fileObject).filename = 'register-term.html';
                    Object(fileObject).windowSettings = window_config_1.RegisterTermWindowConfig;
                    break;
                }
                ;
            case 'register-student':
                {
                    Object(fileObject).filename = 'register-student.html';
                    Object(fileObject).windowSettings = window_config_1.RegisterStudentWindowConfig;
                    break;
                }
                ;
            case 'generate-report':
                {
                    Object(fileObject).filename = 'generate-report.html';
                    Object(fileObject).windowSettings = window_config_1.GenerateWindowConfig;
                    break;
                }
                ;
            case 'upload-score':
                {
                    Object(fileObject).filename = 'upload-score.html';
                    Object(fileObject).windowSettings = window_config_1.UploadScoreWindowConfig;
                    break;
                }
                ;
            case 'view-all-students':
                {
                    Object(fileObject).filename = 'view-all-students.html';
                    Object(fileObject).windowSettings = window_config_1.ViewAllStudentWindowConfig;
                    break;
                }
                ;
            case 'add-remove-subject':
                {
                    fileObject.filename = 'subject.html';
                    fileObject.windowSettings = window_config_1.SubjectPageWindowConfig;
                    break;
                }
                ;
            case 'manual-upload':
                {
                    fileObject.filename = 'manual-upload.html';
                    fileObject.windowSettings = window_config_1.ManualUploadPageWindowConfig;
                    break;
                }
                ;
            case 'view-all-subjects':
                {
                    fileObject.filename = 'subjects.html';
                    fileObject.windowSettings = window_config_1.GenerateWindowConfig;
                    break;
                }
                ;
            default: throw {
                message: 'No file found for the given id !',
                statusCode: 404
            };
        }
        ;
        return fileObject;
    }
    ;
}
exports.default = FileMapper;
;
