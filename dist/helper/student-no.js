"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StudentNumberGenerator {
    static generateStudentNo(date, department, id) {
        return this.getDateCode(date) + this.getDepartmentCode(department) + String(id).trim() + this.getLevelCode(department);
    }
    ;
    static getDepartmentCode(department) {
        var code = '';
        department = department.toLowerCase().trim();
        switch (department) {
            case 'science':
                code = '100';
                break;
            case 'commercial':
                code = '200';
                break;
            case 'arts':
                code = '300';
                break;
            case 'none':
                code = '400';
                break;
            default: throw new Error('Invalid department');
        }
        ;
        return code;
    }
    ;
    static getClassCode(clazz) {
        var code = '';
        clazz = clazz.toLowerCase().trim();
        switch (clazz) {
            case 'jss1':
                code = '100';
                break;
            case 'jss2':
                code = '200';
                break;
            case 'jss3':
                code = '300';
                break;
            default: throw new Error('Invalid class');
        }
        ;
        return code;
    }
    ;
    static getDateCode(date) {
        return date.getFullYear().toString().substring(2).trim();
    }
    ;
    static getLevelCode(dept) {
        if (dept.toLowerCase().trim() === 'none')
            return 'JNR';
        return 'SNR';
    }
    ;
}
exports.default = StudentNumberGenerator;
;
