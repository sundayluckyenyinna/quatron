import student from '../../model/student';
import subject from '../../model/subject';
import Create from '../interfaces/create';
import Delete from '../interfaces/delete';
import Read from '../interfaces/read';
import Update from '../interfaces/update';
import path from 'path'
import fs from 'fs';
import Student from '../../model/student';
import Subject from '../../model/subject';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


/**
 * 
 */
export default abstract class Repository implements Create, Read, Update, Delete
{
    constructor(){

    };

    async getSchoolDataDatabaseConnection() {
        return await this.getStaticDatabaseConnection( 'school' );
    }

    async getGradeSystemDatabaseConnection() {
        return await this.getStaticDatabaseConnection('grade_system');
    }

    async getPassportDatabaseConnection( data : Object | any ) {
        // return await this.getStaticDatabaseConnection('passport');
        const databaseInnerFolderPath = path.join( this.getDataStoreRootDir(), data.year, data.term );

        if ( !fs.existsSync(databaseInnerFolderPath) ) { 
            fs.mkdirSync( databaseInnerFolderPath, { recursive: true } );
        };

        const databaseFullPath = path.join( databaseInnerFolderPath, 'passport.db' );
        
        return await open({
            filename: databaseFullPath,
            driver: sqlite3.Database
        });
    };

    async getAllStudentsDatabaseConnection( data : Object | any ) {
        // return await this.getStaticDatabaseConnection('all_students');
        const databaseInnerFolderPath = path.join( this.getDataStoreRootDir(), data.year, data.term );

        if ( !fs.existsSync(databaseInnerFolderPath) ) { 
            fs.mkdirSync( databaseInnerFolderPath, { recursive: true } );
        };

        const databaseFullPath = path.join( databaseInnerFolderPath, 'all_students.db' );
        
        return await open({
            filename: databaseFullPath,
            driver: sqlite3.Database
        });
    };

    async getAcademicYearDatabaseConnection() {
        return await this.getStaticDatabaseConnection('academic_year');
    };

    async getSubjectsDatabaseConnection() {
        return await this.getStaticDatabaseConnection('subjects');
    };

    async getClassDatabaseConnection( data : Object | any ){

        const databaseInnerFolderPath = path.join( this.getDataStoreRootDir(), data.year, data.term );

        if ( !fs.existsSync(databaseInnerFolderPath) ) { 
            fs.mkdirSync( databaseInnerFolderPath, { recursive: true } );
        };

        const databaseFullPath = path.join( databaseInnerFolderPath, (data.clazz + '.db') );
        
        return await open({
            filename: databaseFullPath,
            driver: sqlite3.Database
        });
    };

    private async getStaticDatabaseConnection( databaseName : string ) {
        const databaseInnerFolderPath = path.join( this.getDataStoreRootDir(), 'static' );

        if( !fs.existsSync( databaseInnerFolderPath )){
            fs.mkdirSync( databaseInnerFolderPath, { recursive : true });
        };

        const databaseFullPath = path.join( databaseInnerFolderPath, ( databaseName + '.db' ));

        return await open({
            filename : databaseFullPath,
            driver : sqlite3.Database
        });
    };
    
    getProjectDir() : string {
        return path.resolve('./');
    };

    getDataStoreRootDir() : string {
        return path.join( this.getProjectDir(), 'dist', 'datastore');
    };

    abstract createAcademicYear( data : Object | any ): Promise<boolean>;
    abstract createStudent( data : Object | any, student : Student ): Promise<boolean> 
    abstract createSubject( data : Object | any, subject : Subject ): Promise<boolean>;

    abstract getAcademicYears(): Promise<string[]>;
    abstract getStudentByStudentNo(): Promise<student>;
    abstract getAllStudentsByClass(data: Object | any ): Promise<Object[]>;
    abstract getAllStudentsByDepartment(department: string): Promise<student[]>;
    abstract getAllStudents(): Promise<student[]>;
    abstract getAllSubjects(): Promise<subject[]>;

    abstract deleteStudentByStudentNo( studentNo : string ) : Promise<void>;
    abstract deleteSubject( subject : string) : Promise<void>;
};