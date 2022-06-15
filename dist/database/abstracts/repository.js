"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
/**
 *
 */
class Repository {
    constructor() {
    }
    ;
    getSchoolDataDatabaseConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getStaticDatabaseConnection('school');
        });
    }
    getGradeSystemDatabaseConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getStaticDatabaseConnection('grade_system');
        });
    }
    getPassportDatabaseConnection(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // return await this.getStaticDatabaseConnection('passport');
            const databaseInnerFolderPath = path_1.default.join(this.getDataStoreRootDir(), data.year, data.term);
            if (!fs_1.default.existsSync(databaseInnerFolderPath)) {
                fs_1.default.mkdirSync(databaseInnerFolderPath, { recursive: true });
            }
            ;
            const databaseFullPath = path_1.default.join(databaseInnerFolderPath, 'passport.db');
            return yield (0, sqlite_1.open)({
                filename: databaseFullPath,
                driver: sqlite3_1.default.Database
            });
        });
    }
    ;
    getAllStudentsDatabaseConnection(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // return await this.getStaticDatabaseConnection('all_students');
            const databaseInnerFolderPath = path_1.default.join(this.getDataStoreRootDir(), data.year, data.term);
            if (!fs_1.default.existsSync(databaseInnerFolderPath)) {
                fs_1.default.mkdirSync(databaseInnerFolderPath, { recursive: true });
            }
            ;
            const databaseFullPath = path_1.default.join(databaseInnerFolderPath, 'all_students.db');
            return yield (0, sqlite_1.open)({
                filename: databaseFullPath,
                driver: sqlite3_1.default.Database
            });
        });
    }
    ;
    getAcademicYearDatabaseConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getStaticDatabaseConnection('academic_year');
        });
    }
    ;
    getSubjectsDatabaseConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getStaticDatabaseConnection('subjects');
        });
    }
    ;
    getClassDatabaseConnection(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const databaseInnerFolderPath = path_1.default.join(this.getDataStoreRootDir(), data.year, data.term);
            if (!fs_1.default.existsSync(databaseInnerFolderPath)) {
                fs_1.default.mkdirSync(databaseInnerFolderPath, { recursive: true });
            }
            ;
            const databaseFullPath = path_1.default.join(databaseInnerFolderPath, (data.clazz + '.db'));
            return yield (0, sqlite_1.open)({
                filename: databaseFullPath,
                driver: sqlite3_1.default.Database
            });
        });
    }
    ;
    getStaticDatabaseConnection(databaseName) {
        return __awaiter(this, void 0, void 0, function* () {
            const databaseInnerFolderPath = path_1.default.join(this.getDataStoreRootDir(), 'static');
            if (!fs_1.default.existsSync(databaseInnerFolderPath)) {
                fs_1.default.mkdirSync(databaseInnerFolderPath, { recursive: true });
            }
            ;
            const databaseFullPath = path_1.default.join(databaseInnerFolderPath, (databaseName + '.db'));
            return yield (0, sqlite_1.open)({
                filename: databaseFullPath,
                driver: sqlite3_1.default.Database
            });
        });
    }
    ;
    getProjectDir() {
        return path_1.default.resolve('./');
    }
    ;
    getDataStoreRootDir() {
        return path_1.default.join(this.getProjectDir(), 'dist', 'datastore');
    }
    ;
}
exports.default = Repository;
;
