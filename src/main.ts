import { app, BrowserWindow, dialog, ipcMain, ipcRenderer, nativeTheme, BrowserView } from 'electron';
import HomePageHandler from './handlers/home-page-handler';
import path from 'path';
import { HomeWindowConfig, RemotePageWindowConfig, SubjectPageWindowConfig } from './config/window-config';
import FileMapper from './helper/build-helper';
import { NoUrlError, InvalidFileTypeError } from './config/error-config';
import ConcreteRepository from './database/concrete/concrete-repository';
import Name from './model/data/name';
import PersonalDetails from './model/data/personal-data';
import SchoolDetails from './model/data/school-details';
import Student from './model/student';
import StudentNumberGenerator from './helper/student-no';
import Subject from './model/subject';
import fs from 'fs';
import ProgressBar from 'electron-progressbar';
import PDFMerger from 'pdf-merger-js';
import { screen } from 'electron';
import Browser from './helper/browser';
import { PDFReader, DocumentReader, ExcelReader } from './helper/file-reader';
import { SingleFileScoreUploader } from './helper/score-uploader';
import { WordAndPdfUploadValidator, ExcelFileUploadValidator } from './helper/upload-validator';
import FileReaderFactory from './helper/file-reader-factory';
import ValidatorFactory from './helper/validator-factory';
import SubjectNameExtractor from './helper/file-subject-name';
import nodemailer from 'nodemailer';
import EmailSenderService from './google/email-sender';
import FolderZipper from './helper/zip-folder';
import { session } from 'electron';
import GradeSystem from './model/grade-settings';
import Comment from './helper/comment';
import TeacherComment from './helper/teacher-comment';
import { CommentType } from './helper/comment-type';

// const worker = new Worker('./dist/workers/report-sheet-worker.js', { workerData : { message : 'I am good'} } );
// worker.on('message', function(value){
//     console.log( value );
// });


const pdf = require('html-pdf-node');


var studentData : Object | any;
var additionalData : Object | any;
var currentProgressBar : ProgressBar;
var studentProfileData : Object;
const browserMap = new Map<string, Browser>();
var showingBrowser : Browser;
var shouldDoUpload: boolean = false;
var currentUploadWindow : BrowserWindow;
var subjectNames : string[];
var payload : Object | any; 
var broadsheetFolderPath : string;

// variables to hold for the guest pages.
var subjectName : string;

/**
 * Set up the logic once the application is ready to show.
 */
app.on('ready', async function(){

    /** Display the Home page to user */
    const win = new BrowserWindow( HomeWindowConfig );
    win.loadFile(getRelativePathOfFile('home-page.html'));
    win.once('ready-to-show', function(){
        win.maximize();
        win.show();
    });   

    nativeTheme.themeSource = 'dark';
});

ipcMain.handle('all-or-single-students-report', async function(event, payload, additionalPayload){

    const reportDatas = [];

    for(let i = 0; i < payload.length; i++){
        // create a new invisble browser window 
        var win = new BrowserWindow({ 
            show : false,
            webPreferences:{
                nodeIntegration: true,
                contextIsolation: false,
                webviewTag : true
            },
        });

        // update the studentData and additionalData variable for each student for each report sheet.
        studentData = payload[i];
        additionalData = additionalPayload;

        const studentId = [studentData.studentDetails.Surname, studentData.studentDetails.First_Name,
            studentData.studentDetails.Middle_Name, studentData.studentDetails.Student_No].join('_')

        await win.loadFile(path.join(__dirname,'ui','html','report-sheet.html'));

        const updatedHtml = await win.webContents.executeJavaScript('document.documentElement.outerHTML');
        reportDatas.push( { studentId: studentId + '.pdf', html: updatedHtml } );
    };

    // call the method to actually generate the report sheet
    generateReportSheetForSingleOrAllStudents(reportDatas, additionalPayload)
    .then((numberOfStudents) => {
        currentProgressBar.close();
        const messagePart = numberOfStudents > 1 ? 'Report sheets for all students' : 'Report sheet for student';
        dialog.showMessageBoxSync({
            message : messagePart + ` generated\n\nDestination Folder: ${additionalPayload.rootFolder}\n\nNumber of student(s): ${numberOfStudents} `,
            title : 'Report sheet generation status',
            type : 'info',
        }); return;
    })
    .catch(error => {
        // first close the current progressBar
        currentProgressBar.close();
        // display an error dialog
        dialog.showMessageBoxSync({
            message : 'Some report sheets might have been opened on your PDF reader\nTry to close the opened report sheets and try again.',
            title : 'Access error',
            type : 'error'
        });
        return;
    });
 
});

ipcMain.handle('merge-reports', async function(event, additionalPayload){

    // create a new progress bar
    const progressBar = new ProgressBar({
        text: 'Merging report for ' + additionalPayload.clazz,
        detail : 'Report sheets merging...',
        abortOnError: true,
        browserWindow:{
            parent: BrowserWindow.getFocusedWindow() as BrowserWindow,
            modal : true
        }
    });

    let destination : string | any;
    try{
        destination = await mergeReports( additionalPayload );
    }catch(error : any){ 
        progressBar.close();
        dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow() as BrowserWindow,{
            message: 'Some PDF files in the folder are corrupt. Delete some of the PDF files.\n\nIt is advisable that only the PDF of the student report sheets are stored in the chosen folder.',
            title: '   File error',
            type : 'error'
        }); return;
    };

    // close the progress bar after 5 seconds of completion of merging process
    setTimeout(function(){
        progressBar.close();
    }, 5000);

    progressBar.on('aborted', function(){
        dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow() as BrowserWindow,{
            message: 'Report sheets for all students reports in selected folder saved and merged.',
            title: '  Merge success',
            type : 'info'
        }); return;
    });

});

async function mergeReports( additionalPayload : Object | any ) : Promise<string>{

    // get the list of all the pdfs to merge
    const reportSheets : (string | any)[] = [];
    const sheets = fs.readdirSync(additionalPayload.rootFolder)
    .filter( (report : string) => report.endsWith('.pdf') );

      sheets.forEach( report => reportSheets.push(path.join( additionalPayload.rootFolder, report)));

      console.log( reportSheets );
      // create an instance of the PDFMerger
      const pdfMerger = new PDFMerger();

      for (let i = 0; i < reportSheets.length; i++){
        pdfMerger.add( reportSheets[i] );
      };

      const destination = path.join(additionalPayload.rootFolder, additionalPayload.clazz + '_reports.pdf');

      try{
        await pdfMerger.save( destination );
      }catch( error ){ console.log( error ); };

      return destination;
};

async function generateReportSheetForSingleOrAllStudents( reportData : Object[], additionalPayload : Object | any ) : Promise<number> {
    // get the current BrowserWindow
    const win : BrowserWindow | null = BrowserWindow.getFocusedWindow();
    // create a new progress bar
    const progressBar = new ProgressBar({
        indeterminate: false,
        text: 'Preparing report for ' + additionalPayload.clazz,
        detail: 'Report sheets generation',
        initialValue: 0,
        maxValue: reportData.length,
        abortOnError : true,
        browserWindow : {
            parent: win || undefined
        }
    });

    currentProgressBar = progressBar;

    for (let i = 0; i < reportData.length; i++){
        var reportObject : Object | any = reportData[i];
        var html = reportObject.html;
        var reportSheetPath = path.join( additionalPayload.rootFolder, reportObject.studentId);
        await pdf.generatePdf(
            {content:html  as string }, 
            {format : 'A4', path: reportSheetPath, printBackground : true}
        );
        if(!progressBar.isCompleted()){ progressBar.value += 1 };
    };

    return reportData.length;
};

ipcMain.handle('upload-scores-single', async function(event, payload){
    if( payload.fileType === 'word' || payload.fileType === 'pdf' ){
        await handleSingleFileWordAndPdfScoreUpload( payload ); return;
    };
    // then it is definitely excel file
    await handleSingleFileExcelScoreUpload( payload ); return;

});

/**
 * payload {
 *      ...payload,
 *      filePaths : [...,...,...]
 * }
 */
ipcMain.handle('upload-scores-multiple', async function(event, payloads){
    // get all the file paths in the payload
    const files : string[] = payloads.filePaths;
    const wordAndPdfFiles = await getAllRegisteredWordAndPdfFiles( files, payloads );
    const excelFiles = getAllExcelFile( files );
    const allReadyFiles = concatenateFiles( wordAndPdfFiles, excelFiles );
    const filePaths : string[] = allReadyFiles;
    
    const absolutePaths = files.filter((file : string) => !file.startsWith('~$')).map((file : string) => path.join(payloads.folderPath, file));

    const valids : Object[] = [];
    const invalids : Object[] = [];

    function getSubjectNameFromFileName( fileName : string ){ return fileName.trim().toLowerCase().substring(0, fileName.lastIndexOf('.'))};

    function getSubjectNameFromAbsolutePath( abs : string ){ 
        return getSubjectNameFromFileName(path.basename(abs).trim()).split(' ').filter((token : string) => token !== '').join('_');
    }

    function isWord( abs : string ){ 
        return abs.substring(abs.lastIndexOf('.') + 1) === 'docx';
    };

    function isPdf( abs : string ){ return abs.substring(abs.lastIndexOf('.') + 1) === 'pdf' };

    function isExcel( abs : string ){ return abs.substring(abs.lastIndexOf('.') + 1) === 'xlsx' };
    
    const studentNos = (await new ConcreteRepository().getAllStudentsByClass( payloads ))
                                    .map((object : Object | any ) =>  object.Student_No );

    for (let i = 0; i < absolutePaths.length; i++ ){
        const subjectObjectOverall : Object | any = {};
        const subjectObjectValue : Object | any = {};
        const absolutePath = absolutePaths[i];
        if ( isWord(absolutePath) || isPdf(absolutePath)){
            const fileType : string = isWord(absolutePath) ? 'word' : 'pdf';
            const subjectName = getSubjectNameFromAbsolutePath( absolutePath );
            const reader = new FileReaderFactory({filePath : absolutePath, fileType : fileType}).createFileReader();
            const fileValidator = await new ValidatorFactory( fileType, reader, studentNos ).createValidator();
            // get the valid and the invalid rows
            const validRows = await fileValidator?.getValidRowObjects('');
            const invalidRows = await fileValidator?.getInvalidRowObject('') as Object[];

            subjectObjectValue.validRows = validRows;
            subjectObjectValue.invalidRows = invalidRows;
            subjectObjectOverall[subjectName] = subjectObjectValue;
            
            if( invalidRows.length === 0){ // then the file contains only valid rows
                // append it to the valids
                valids.push( subjectObjectOverall );
            } else{
                invalids.push( subjectObjectOverall );
            };

        }

        if(isExcel( absolutePath )){
            // create the excel file reader 
            const excelReader = new ExcelReader( absolutePath );
            // create the excel file validator
            const validator = new ExcelFileUploadValidator( studentNos, excelReader );
            // call the score uploader to upload all the subject
            const allSubjectsArray = await validator.getAllPosiibleSheetsObject();

            const invalidsForExcel = getSubjectObjectsWithInvalidRows(allSubjectsArray);
            const validsForExcel = getSubjectObjectWithValidRows( allSubjectsArray );

            // concatenate the valids and invalids of the word, pdf and excels files
            validsForExcel.forEach((validRow : Object ) => valids.push(validRow));
            invalidsForExcel.forEach((invalidRow : Object) => invalids.push(invalidRow));

            const uploadWindow = BrowserWindow.getFocusedWindow() as BrowserWindow;
            currentUploadWindow = uploadWindow;

        };
    }

    if(invalids.length !== 0){
        showErrorPageWithInfoExcel( valids, invalids, payloads); return;
    };

    // This line means that all the subjects score rows are perfect.
    // combine all the subjects both the ones that has only valid rows and the ones that has both to upload their valid rows
    const allSubjectsArray = valids.concat(invalids);

    // get some info from the payload
    let clazz = (payloads.clazz as string).toUpperCase();
    clazz = clazz.substring(0, 3) + ' ' + clazz.charAt(3);

    // create and start a progress bar
    const progress = new ProgressBar({
        text : 'Automatic upload of scores for ' + clazz,
        detail: '',
        maxValue : allSubjectsArray.length,
        indeterminate : false,
        closeOnComplete: false,
        browserWindow: {
            parent : currentUploadWindow,
            modal : true
        }
    });

    // set the handler for the progressbar when it closes
    progress.on('completed', async function(){
        await sleep(1000);
        progress.close();
        await sleep(1000);
        dialog.showMessageBoxSync({
            message : 'Successful automatic upload of scores for ' + clazz + '\n\nNo errors found',
            title : ' Success',
            type: 'info'
        });        
    });

    // get the subjects names in this allSubjectArray 
    for ( let i = 0; i < allSubjectsArray.length; i++ ){
        // get the current object and retrieve the subject name 
        const subjectObject : Object | any  = allSubjectsArray[i];
        const subjectName : string | any  = Object.keys(subjectObject)[0].toLowerCase();
        const validRows = subjectObject[subjectName].validRows;
        const databasePayload = { ...payloads, subject : subjectName };
        // sleep for somet time to avoid database shock
        await sleep(1000);
        await new SingleFileScoreUploader( validRows, databasePayload ).uploadScores();
        if(!progress.isCompleted()){
            progress.detail = 'Uploading scores for ' + expandNeat( subjectName );
            progress.value += 1;
        };
    };

});

async function handleSingleFileWordAndPdfScoreUpload( payload : Object | any ){
    // create a file reader

    const fileSettings = { filePath : payload.filePath, fileType : payload.fileType };
    const reader = new FileReaderFactory( fileSettings ).createFileReader();

    const studentNos = (await new ConcreteRepository().getAllStudentsByClass( payload ))
                                    .map((object : Object | any ) =>  object.Student_No );

    // create the validator
    const fileValidator = await new ValidatorFactory( payload.fileType, reader, studentNos ).createValidator();

    // get the valid and the invalid row objects
    const validRows = await fileValidator?.getValidRowObjects('') as Object[];
    const invalidRows = await fileValidator?.getInvalidRowObject('');
    
    // get the subject name and put it in the payload
    const subjectName = SubjectNameExtractor.getFileNameWithoutExtension( payload.filePath );
    const databasePayload = { ...payload, subject : subjectName };

    const uploadWindow = BrowserWindow.getFocusedWindow() as BrowserWindow;
    currentUploadWindow = uploadWindow;

    if( invalidRows?.length !== 0 ){
        // show the error page
        showErrorPageWithInfo( validRows, invalidRows, databasePayload );
        return;
    }else{
        const clazz = (payload.clazz as string).toUpperCase();
        const progress = new ProgressBar({
            text: 'Automatic upload for ' + clazz.substring(0,3) + ' ' + clazz.charAt(3),
            detail: 'No errors found',
        });
        await new SingleFileScoreUploader( validRows, databasePayload ).uploadScores();
        setTimeout(()=>{
            progress.close();
            dialog.showMessageBoxSync({
                message : 'Successful automatic upload of scores for ' + clazz.substring(0,3) + ' ' + clazz.charAt(3) + '\n\nNo errors found',
                title : ' Success',
                type: 'info'
            });
        }, 5000);
        return;
    };
    
};

async function showErrorPageWithInfo( validRows : Object[] | any, invalidRows : Object[] | undefined, databasePayload : Object | any ){
    const b = new BrowserWindow({
        width : 600,
        height: 600,
        center: true,
        autoHideMenuBar : true,
        minimizable : false,
        maximizable : false,
        parent: BrowserWindow.getFocusedWindow() as BrowserWindow,
        modal: true,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag : true
        }
    });
    nativeTheme.themeSource = 'dark';

    await b.loadURL( getRelativePathOfFile('invalid-rows-display.html'));
    b.on('ready-to-show', function(){ 
        b.show(); 
        b.webContents.send('show-invalid-rows', validRows, invalidRows, databasePayload );
    });
    return 1;
}

async function handleSingleFileExcelScoreUpload( payload : Object | any ){
    // create the excel file reader 
    const excelReader = new ExcelReader( payload.filePath );
    // get the standard student nos
    const studentNos = (await new ConcreteRepository().getAllStudentsByClass( payload ))
                                    .map((object : Object | any ) =>  object.Student_No );
    // create the excel file validator
    const validator = new ExcelFileUploadValidator( studentNos, excelReader );
    // call the score uploader to upload all the subject
    const allSubjectsArray = await validator.getAllPosiibleSheetsObject();

    const invalids = getSubjectObjectsWithInvalidRows(allSubjectsArray);
    const valids = getSubjectObjectWithValidRows( allSubjectsArray );

    const uploadWindow = BrowserWindow.getFocusedWindow() as BrowserWindow;
    currentUploadWindow = uploadWindow;

    console.log(invalids);

    if(invalids.length !== 0){
        showErrorPageWithInfoExcel( valids, invalids, payload); return;
    };

    // this line reached means all subjects are perfect. Now starts a progress bar
    const clazz = (payload.clazz as string).toUpperCase();

    const progress = new ProgressBar({
        text : 'Automatic upload of scores for ' + clazz.substring(0,3) + ' ' + clazz.charAt(3),
        detail : '',
        indeterminate : false,
        closeOnComplete : false,
        maxValue : allSubjectsArray.length,
        browserWindow : {
            parent : currentUploadWindow,
            modal : true
        }
    });

    progress.on('completed', async function(){
        await sleep(1000);
        // close the progress and display a success dialog
        progress.close();
        // wait for 2 second before displaying final message dialog
        await sleep(1000);
        const uploadNo = payload.uploadType === 'single_file_upload' ? 'Single file,' : 'Multiple files in folder,';
        const uploadType = allSubjectsArray.length > 1 ? uploadNo + ' multiple subjects' : uploadNo + ' single subject.';

        dialog.showMessageBoxSync( currentUploadWindow, {
            message: 'Successful upload of scores for ' + clazz + '\n\nUpload type: ' + uploadType,
            title : 'Upload sucess',
            type : 'info',
        }); return;
    });

    for ( let i = 0; i < allSubjectsArray.length; i++ ){
        // get the current object and retrieve the subject name 
        const subjectObject : Object | any  = allSubjectsArray[i];
        const subjectName : string | any  = Object.keys(subjectObject)[0].toLowerCase();
        const validRows = subjectObject[subjectName].validRows;
        const databasePayload = { ...payload, subject : subjectName };
        // sleep to avoid database shock
        await sleep(1000);
        await new SingleFileScoreUploader( validRows, databasePayload ).uploadScores();
        await sleep(1000);
        // update the progress bar 
        if( !progress.isCompleted()){ 
            progress.detail = 'Automatic upload of scores for ' + expandNeat( subjectName );
            progress.value += 1 
        };
    };
};

async function showErrorPageWithInfoExcel( valids : Object[], invalidRows : Object[], payload : Object[]){
    const b = new BrowserWindow({
        width : 600,
        height: 600,
        center: true,
        autoHideMenuBar : true,
        minimizable : false,
        maximizable : false,
        parent: BrowserWindow.getFocusedWindow() as BrowserWindow,
        modal: true,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag : true
        }
    });
    nativeTheme.themeSource = 'dark';

    await b.loadURL( getRelativePathOfFile('invalid-rows-display-excel.html'));
    b.on('ready-to-show', function(){ 
        b.show(); 
        b.webContents.send('show-invalid-rows-excel', valids, invalidRows, payload );
    });
    return 1;
};


function getSubjectObjectsWithInvalidRows( subjects : Object[] ) : object[] {
    const subjectsWithInvalidRows : object[] = [];
    subjects.forEach((subjectObject : object | any) => {
        const subjectName = Object.keys(subjectObject)[0];
        const subjectValue = subjectObject[subjectName];
        const invalidRow : object[]  = subjectValue.invalidRows;
        const validRow : object[] = subjectValue.validRows;
        // it can have invalid rows but must at least gave some valid rows too
        if ( invalidRow.length !== 0 ) { subjectsWithInvalidRows.push(subjectObject)};
    });
    return subjectsWithInvalidRows;
};

function getSubjectObjectWithValidRows( subjects : Object[] ) : Object[] {
    const subjectsWithValidRows : object[] = [];
    subjects.forEach((subjectObject : object | any) => {
        const subjectName = Object.keys(subjectObject)[0];
        const subjectValue = subjectObject[subjectName];
        const invalidRow : object[]  = subjectValue.invalidRows;
        if ( invalidRow.length === 0) { subjectsWithValidRows.push(subjectObject)};
    });
    return subjectsWithValidRows;    
};

ipcMain.handle('update-scores-single-excel', async function(event, submissionArray : Array<Array<Array<Object> | Object>>[]){
    // close the current BrwoserWindow
    BrowserWindow.getFocusedWindow()?.close();
    let  clazz : string = Object(submissionArray[0])[1].clazz as string;
    let uploadTypes : string = Object(submissionArray[0])[1].uploadType as string;
    clazz = clazz.substring(0,3).toUpperCase() + ' ' + clazz.charAt(3);

    // start a progress bar if the number of subject
    const progress = new ProgressBar({
        text : 'Automatic upload of scores for ' + clazz,
        detail: '',
        indeterminate : false,
        maxValue : submissionArray.length,
        closeOnComplete : false,
        browserWindow : {
            parent : currentUploadWindow,
            modal : true
        }
    });

    progress.on('completed', async function(){
        await sleep(1000);
        // close the progress and display a success dialog
        progress.close();
        // wait for 2 second before displaying final message dialog
        await sleep(1000);

        const uploadNo : string = uploadTypes === 'single_file_upload' ? 'Single file,' : 'Multiple files in folder,';
        const uploadType = submissionArray.length > 1 ? uploadNo + ' multiple subjects' : uploadNo + ' single subject.';

        dialog.showMessageBoxSync( currentUploadWindow, {
            message: 'Successful upload of scores for ' + clazz + '\n\nUpload type: ' + uploadType,
            title : 'Upload sucess',
            type : 'info',
        }); return;
    });

    // iterarte over and call the update method of the repository
    for ( let i = 0; i < submissionArray.length; i++ ){
        const readySubject = submissionArray[i];
        const validRowsOfSubject : Array<Object> = readySubject[0];
        const payloadForSubject : Object | any = readySubject[1];

        // call the update function
        await new SingleFileScoreUploader( validRowsOfSubject, payloadForSubject).uploadScores();

        // sleep for some time
        await sleep(1000);

        // update the value of the progress bar
        progress.detail = 'Automatically uploading scores for ' + expandNeat(payloadForSubject.subject);
        if ( !progress.isCompleted()){ 
            progress.value += 1; 
        };
    };
    
});

ipcMain.handle('stop-excel-upload', function(){
    // close the error page window. It is the current showing that would showing at that time
    BrowserWindow.getFocusedWindow()?.close(); return;
});

function sleep( timeInMilliseconds : number ) : Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeInMilliseconds));
};

function expandNeat ( value : string ){
    return value.trim().split('_').map((token => token.charAt(0).toUpperCase() + token.substring(1))).join(' ');
};

ipcMain.handle('folder-path', async function( event, absolutePath, payload ){
    return fs.readdirSync( absolutePath );
});

ipcMain.handle('student-data', function( event ){
    return [studentData, additionalData];
});

ipcMain.handle('academic-years', async function(event){
    // get the academic years from the database.
    const academicYearsArray = await new ConcreteRepository().getAcademicYears();
    BrowserWindow.getFocusedWindow()?.webContents.send('academic-years', academicYearsArray);
    return academicYearsArray;
});

ipcMain.handle('add-academic-year', async function(event, data){
    const done = await new ConcreteRepository().createAcademicYear( data );
    if (!done) { throw new Error('Could not save academic year') };
    const message = { message: 'Successfully added an academic year', code: 200, status : 'OK' };
    const academicYearsArray = await new ConcreteRepository().getAcademicYears();
    BrowserWindow.getFocusedWindow()?.webContents.send('add-academic-year', academicYearsArray );
    return;
});

/**
 * Handlers for 
 */
ipcMain.handle('show', async function(event, payload : any | object ){
    if ( payload.fileType === undefined || payload.fileType === 'local' ){
        // get the file and window settings from the id of the button clicked in the renderer.
        const filenameAndSettings : any | object = FileMapper.mapFileFromButtonId( payload.id );
        const win = new BrowserWindow( filenameAndSettings.windowSettings );
        await new HomePageHandler()
        .showLocalPage(getRelativePathOfFile(filenameAndSettings.filename), win);
        return;
    };

    if( payload.fileType === 'remote' ){
        if (payload.url === undefined ) { throw NoUrlError };
        const win = new BrowserWindow( RemotePageWindowConfig );
        await new HomePageHandler().showRemotePage( payload.url, win );
        return;
    };
    
    throw InvalidFileTypeError;
});

ipcMain.handle('show-dialog', function(event, payload){
    const win : BrowserWindow = BrowserWindow.getFocusedWindow() as BrowserWindow;
    return dialog.showMessageBoxSync( win, {
        message : payload.message,
        title : payload.title,
        type : payload.type
    });
});


/** Handlers for register students */
ipcMain.handle('count-of-students', async function(event, payload){
    const countOfStudents = await (await new ConcreteRepository().getNumberOfStudentsFromAllStudents( payload ));
    return countOfStudents;
});

ipcMain.handle('student-no', function(event, payload : Object | any){
    return StudentNumberGenerator.generateStudentNo(payload.date, payload.department, payload.id);
});

ipcMain.handle('save-student', async function(event, studentObjectLiteral){
    // create a student object from the object literal
    const name : Name = Name.NewInstance(studentObjectLiteral.name);
    const personalDetails : PersonalDetails = PersonalDetails.NewInstance( studentObjectLiteral.personalDetails );
    const schoolDetails : SchoolDetails = SchoolDetails.NewInstance( studentObjectLiteral.schoolDetails );
    const subjects : string[] = String(studentObjectLiteral.subjects).split('#');
    const student : Student = new Student(name, personalDetails, schoolDetails, subjects);

    //construct the data info for the database to save the student
    const data = studentObjectLiteral.data;
    
    //save the student
    const isSuccessful = await new ConcreteRepository().createStudent( data, student );
    return isSuccessful;
});

ipcMain.handle('save-subject', async function(event, payload){
    const classArray = payload.level === 'junior' ? ['jss1', 'jss2', 'jss3'] : ['sss1', 'sss2', 'sss3'];
    const subject = new Subject().setName(payload.subjectName).setLevel(payload.level);

    for (let i = 0; i < classArray.length; i++){
        const data = { year : payload.academicYear, term : payload.academicTerm, clazz : classArray[i], department : payload.department };
        const done = await (await new ConcreteRepository().createSubject( data, subject ));
        if( !done ) { return; }
    };
    return true;
});

ipcMain.handle('level-subject-names', async function(event, data){
    return await new ConcreteRepository().getAllSubjectsNameForYearTermClass( data );
});

ipcMain.handle('all-subjects-object', async function(event, data){
    const subjectObjectArray = await new ConcreteRepository().getAllSubjectObjectsForYearTermLevel( data );
    return subjectObjectArray;
});

ipcMain.handle('all-subject-names', async function(event){
    return await new ConcreteRepository().getAllSubjectNames();
});

ipcMain.handle('students-for-class', async function(event, payload){
    try{
        return await new ConcreteRepository().getAllStudentsByClass( payload ); 
    }catch( error ){ return; }
});

ipcMain.handle('student-scores', async function( event , data ){
    return await new ConcreteRepository().getAllStudentScores( data );
});

ipcMain.handle('show-directory-chooser', function( event ){
    return dialog.showOpenDialogSync({
        properties : ['openDirectory'],
        filters : [{ name : 'PDF files', extensions : ['pdf']}]
    });
});

ipcMain.handle('show-any-folder-chooser', function( event ){
    return dialog.showOpenDialogSync({
        properties : ['openDirectory']
    });
});

ipcMain.handle('show-file-chooser', function( event, file : object | any ){
    return dialog.showOpenDialogSync({
        properties : ['openFile'],
        filters: [ { name : file.desc, extensions : [ file.mediaType ] } ]
    })?.pop() as string;
});

ipcMain.handle('show-file', function( event, file : Object | any ){
    return dialog.showOpenDialogSync({
        properties : ['openFile'],
        filters: [ { name : file.desc, extensions : file.media } ]
    })?.pop() as string;
});

ipcMain.handle('all-or-single-students-data', async function( event, payload ){
    if(payload.studentNo === 'All students in class'){
        return await new ConcreteRepository().getAllStudentsDataForYearTermClass(payload);
    };
    return [await new ConcreteRepository().getStudentDataForYearTermClass(payload)];
});

ipcMain.handle('update-scores-for-class', async function(event, scores, payload){
    const done =  await new ConcreteRepository().updateStudentScoresForYearTermClass( scores, payload );
    if(done){
        return dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow() as BrowserWindow,{
            message : 'Successful upload of student scores',
            title : 'Success',
            type : 'info'
        });
    };
    return;
});

ipcMain.handle('student-page', function(event, student, databaseInfo){
    // create a new window and display the student
    student.clazz = databaseInfo.clazz;
    student.term = databaseInfo.term;
    student.year = databaseInfo.year;

    studentProfileData = student;
    BrowserWindow.getFocusedWindow()?.loadFile(path.join(__dirname,'ui','html','student-profile-page.html')); 

});

ipcMain.handle('student-profile-data', function(event){
    return studentProfileData;
});

ipcMain.handle('update-student-data', async function(event, payload){
    const bool = await new ConcreteRepository().updateStudentDetails( payload );
    if ( bool ){
        dialog.showMessageBoxSync({
            message : 'Changes saved successfully',
            title: 'Successful update',
            type: 'info'
        });
    }
});

ipcMain.handle('update-student-passport-in-class', async function(event, data){
    const bool = await new ConcreteRepository().updateStudentPassport( data );
    if(bool){
        dialog.showMessageBoxSync( BrowserWindow.getFocusedWindow() as BrowserWindow, {
            message : 'Passport updated successfully',
            title: 'Successful update',
            type: 'info'
        });
    }
});

ipcMain.handle('delete-student-from-class', async function(event, data){
    const bool = await new ConcreteRepository().deleteStudentFromClassTable( data );
    if(bool){
        // send to the renderer process that it is done
        BrowserWindow.getFocusedWindow()?.webContents.send('delete-student-done');
        dialog.showMessageBoxSync( BrowserWindow.getFocusedWindow() as BrowserWindow, {
            message : 'Student deleted successfully',
            title: 'Successful update',
            type: 'info'
        });return;
    };
    console.log('something went wrong...')
});

// Handle the showing of the remote page
ipcMain.handle('show-remote-page', function(){
    const width = screen.getPrimaryDisplay().workArea.width;
    const height = screen.getPrimaryDisplay().workArea.height;

    let win = new BrowserWindow({
        width: width,
        height: height,
        autoHideMenuBar: true,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });
    
    win.webContents.loadFile(path.join(__dirname, 'ui', 'html', 'remote-page.html'));
    win.on('ready-to-show', function(){
        win.show();
        win.maximize();
    });

    // create the first browser and add it to the window
    const browser = new Browser('tab1', { width : width, height : height }, win);

    // add the browser to the map
    browserMap.set( browser.getId(), browser );

    win.addBrowserView( browser );

    showingBrowser = browser;

    nativeTheme.themeSource = 'system';
});

ipcMain.handle('show-new-browser', function(event, id){
    // get the screen dimensions
    const width = screen.getPrimaryDisplay().workArea.width;
    const height = screen.getPrimaryDisplay().workArea.height;

    // hide all the previous browsers 
    browserMap.forEach((browser, key) => {
        browser.hide();
    });

    const win = BrowserWindow.getFocusedWindow() as BrowserWindow;

    const newBrowser = new Browser( id, { width : width, height : height}, win);
    // add it to the map
    browserMap.set( newBrowser.getId(), newBrowser );

    win.addBrowserView( newBrowser );

    showingBrowser = newBrowser;

    nativeTheme.themeSource = 'system';
});

ipcMain.handle('show-current-browser', function(event, id){
    const width = screen.getPrimaryDisplay().workArea.width;
    const height = screen.getPrimaryDisplay().workArea.height;

    // hide all other browsers
    browserMap.forEach((browser, key) => {
        browser.hide();
    });

    const currentBrowser : Browser = getBrowserById( id ) as Browser;
    currentBrowser.makeVisible({ width : width, height : height });
    showingBrowser = currentBrowser;
});

ipcMain.handle('remove-current-tab', function(event, id){
    getBrowserById(id)?.hide(); // make it hide
    browserMap.delete(id);      // delete it from the map
    BrowserWindow.getFocusedWindow()?.removeBrowserView( getBrowserById(id) as BrowserView );
    // update the showing tab
    const preceedingTab = 'tab' + ( Number((id as string).split('')[3]) - 1 ) as string;
    showingBrowser = getBrowserById( preceedingTab ) as Browser;
    // check if no more browser showing and then close the window.
    if ( !showingBrowser ){ BrowserWindow.getFocusedWindow()?.close(); };
});

ipcMain.handle('print', function(event, d){
    console.log(d);
    // console.log( getBrowserById(d));
});

ipcMain.handle('go-back', function(){
    // let the showing browser go back
    showingBrowser.webContents.goBack();
});

ipcMain.handle('go-forward', function(){
    // let the showing browser go forward
    showingBrowser.webContents.goForward();
});

ipcMain.handle('reload', function(){
    // let the showing browser reload
    showingBrowser.webContents.reload();
});

ipcMain.handle('continue-upload', function(event, validRows, invalidRows, databasePayload){
    // first close the current window
    BrowserWindow.getFocusedWindow()?.close();
    const clazz = (databasePayload.clazz as string).toUpperCase();

    // create a new progress bar
    const progress = new ProgressBar({
        detail : 'Scores uploading...',
        text: 'Automatic upload of scores for ' + clazz.substring(0,3) + ' ' +  clazz.charAt(3),
        browserWindow:{
            parent: currentUploadWindow,
            modal: true
        }
    });

    new SingleFileScoreUploader( validRows, databasePayload );
    
    setTimeout(() => {
        progress.close();
        // notify the user when all is done and attach to the showing browser window.
        dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow() as BrowserWindow, {
            message: 'Upload completed successfully for this class and subject.',
            title: 'Upload success',
            type: 'info',
        });
    }, 5000);
    return;
});

ipcMain.handle('stop-upload', function(){
    BrowserWindow.getFocusedWindow()?.close();
});

function compress( value : string ) : string {
    value = value.trim();       // first trim the incoming string to sanitize it
    if ( !value.includes(' ') ) { return value; };
    return value.split(' ').filter( entry => entry !== '').join('_');
};

async function filterFileBySubjectRegistration( allFiles : string[], payload : Object ) : Promise<string[]> {
    // get all the subjects registered for this class in this year, term and class
    const registeredSubjects = await new ConcreteRepository().getAllSubjectsNameForYearTermClass( payload );
    // return the list of those files 
    const filtered = allFiles.map((fileName : string) => compress(fileName).toLowerCase())
    .filter((fileName : string) => registeredSubjects.includes( fileName.substring(0, fileName.lastIndexOf('.'))));

    return filtered;
};

async function getAllRegisteredWordAndPdfFiles( files : string[], payload : Object ) : Promise<string[]>{
    return (await filterFileBySubjectRegistration( files, payload ))
                    .filter( (file : string ) => file.endsWith('.docx') || file.endsWith('.pdf') );
};

function getAllExcelFile( files : string[] ) : string[] {
    return files.filter((file : string) => file.endsWith('.xlsx') && !file.startsWith('~$'));
};

function concatenateFiles( wordAndPdfFiles : string[], excelFiles : string[] ) : string[] {
    return wordAndPdfFiles.concat( excelFiles );
};

function getBrowserById( id : string ){
    return browserMap.get( id );
};

/**
 * Returns the relative path of a file given the file name.
 * @param filename string
 */
function getRelativePathOfFile( filename : string ) : string {
    filename = filename.trim();
    return constructRelativePathPrefix([__dirname, 'ui', 'html']) + filename as string;
};

/**
 * 
 * @param tokens string
 * @returns relativefolderpath : string
 */
function constructRelativePathPrefix( tokens: string[]) : string {
    var relativePath : string = (tokens[0] as string).trim(); 
    const osSeparator : string = getPlaformSeparator();
    tokens.filter( token => tokens.indexOf(token) > 0 )
           .forEach( token => relativePath += ( osSeparator + token ) );
    return relativePath + osSeparator;  
};

/**
 * Returns the platform specific file separator.
 * @returns separator : string
 */
function getPlaformSeparator() : string {
    return (path.sep as string) .trim();
};

function getCountInArray( value : any, arr : any[] ) : number {
    let count = 0;
    arr.forEach((entry : any) => {
        if (entry === value) { count += 1 }
        else { count += 0 };
    });
    return count;
};

/**  */
ipcMain.handle('all-ready-subject-names-from-folder-path', async function(event, folderPath : string ){
    
    const allSubjectsFromFiles : string[] = [];

    // list out all the files in the folder
    const files : string[] = fs.readdirSync( folderPath );

    // separate the word, pdf and the special excel files
    const wordAndPdf : string[] = files.filter((file : string) => (file.endsWith('.pdf') || file.endsWith('.docx')) && !file.startsWith('~$'));

    const excels : string[] = files.filter((file : string) => file.endsWith('xlsx') && !file.startsWith('~$'));

    // get the mapped subject represented by this file names
    const readyWordAndPdf : string[] = wordAndPdf.map((file : string) => { 
        return file.toLowerCase().trim().substring(0, file.lastIndexOf('.')).split(' ').filter((token : string) => token !== '').join('_');
    });

    readyWordAndPdf.forEach((readyFile : string, index : number) => allSubjectsFromFiles.push( readyFile ) );

    const readyExcel : string[] = [];

    // get the files in the excel sheets and add it to the allSubjects container
    for ( let i = 0; i < excels.length; i++ ){
        const excelFile = excels[i];
        const absolutePathToExcelFile = path.join( folderPath, excelFile );
        const fileNames : string[] = await new ExcelReader( absolutePathToExcelFile).getSheetNames();
        // get the fileNames ready 
        const readySheetNames = fileNames.map((file : string) => { 
            return file.toLowerCase().trim().split(' ').filter((token : string) => token !== '').join('_');
        });
        
        readySheetNames.forEach((sheetName : string, index : number) => allSubjectsFromFiles.push( sheetName ));
        readySheetNames.forEach((sheetName : string) => readyExcel.push( sheetName ));
    };
    
    return [ readyWordAndPdf, readyExcel ];
    
});

ipcMain.handle('ready-filename-from-path', function( event, filePath ){
    const baseName = path.basename( filePath ).trim().toLowerCase();
    const trimmedBaseName = baseName.substring(0, baseName.lastIndexOf('.'));
    return trimmedBaseName.split(' ').filter((token : string) => token !== '').join('_');
});

ipcMain.handle('excel-sheet-names', async function( event, filePath ){
    return await new ExcelReader( filePath ).getSheetNames();
});

ipcMain.handle('show-page', function( event, filename ){

    // remove all listeners from the default session object.
    session.defaultSession.removeAllListeners('will-download');

    // create a browserview and add it to the window
    const screenWidth = screen.getPrimaryDisplay().bounds.width;
    const screenHeight = screen.getPrimaryDisplay().bounds.height;

    // create a new BrowserWindow window 
    const win = new BrowserWindow({
        center: true,
        show: false,
        autoHideMenuBar: true,
        useContentSize: true,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });

    nativeTheme.themeSource = 'system';
    win.webContents.loadFile( getRelativePathOfFile(filename.trim()));

    win.webContents.on('dom-ready', async function(event){
        win.show();
        win.maximize();
    });

    session.defaultSession.on('will-download', function(event, item){
        console.log('I am working even for this webview...');
        console.log('Trying to download ');
        console.log( item.getTotalBytes() );
    });

});

ipcMain.handle('keep-subject-names', function( event, allSubjectNamesArray : string[], payloads : Object ){
    subjectNames = allSubjectNamesArray;
    payload = payloads;
    return;
});

ipcMain.handle('subject-names-guest-page', function(event){
    return [ subjectNames, payload ];
});

// data contains just year and term and level. the levels are e.g jss1-3 or ss1-3
ipcMain.handle('subjects-and-student-count', async function( event, data ){
    // call the repo to return a response
    const subjectsAndCount =  await new ConcreteRepository().getSubjectsAndCountForLevel( data );
    return subjectsAndCount;
});

// handles the saving of a subject name for reference to always show class broadshett
ipcMain.handle('update-selected-subject-name', function( event, subject_name : string ){
    subjectName = subject_name;
});

// handles the sending of the updated subject name when asked by the guest page.
ipcMain.handle('get-updated-subject-name', function(event){
    return subjectName;
});

ipcMain.handle('student-name', async function( event, payload ){
    return await new ConcreteRepository().getStudentNameArray( payload );
});

ipcMain.handle('update-rendered-class', function( event , newClazz ){
    payload.clazz = newClazz;
});

ipcMain.handle('remove-subject-for-students', async function( event, studentNos, payload){
    // show a dialog box to confirm the user really wants to delete
    const button = dialog.showMessageBoxSync( BrowserWindow.getFocusedWindow() as BrowserWindow, {
        message:"Are you really sure you want to remove the seleted students from this subject?\n\nThis subject records for each selected student will be deleted permanently and therefore makes this action irrevocable!\n\nIf you wish to continue, click on the 'Continue' button below.\n",
        title: '   \nStudents subject management',
        buttons:['Continue', 'Cancel'],
        type:'info',
        noLink: true
    });

    if ( button === 1 ) { return; }
    // start a progress bar 
    const progress = new ProgressBar({
        text: 'Students subject management',
        detail: 'Removing subject for students',
        browserWindow:{
            parent: BrowserWindow.getFocusedWindow() as BrowserWindow,
            modal: true
        }
    });

    // call the repository to delete the subject for the students and update it.
    await new ConcreteRepository().deleteSubjectForStudents( studentNos, payload );

    // stop the progress bar
    await sleep( 2000 );

    progress.close();


});

ipcMain.handle('show-broadsheet-preview', function( event, html){
    const win = new BrowserWindow({
        parent: BrowserWindow.getFocusedWindow() as BrowserWindow,
        show: false,
        autoHideMenuBar:true,
        center: true,
        minimizable: false,
        width: 900,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });

    win.on('ready-to-show', function(){
        win.show();
    });

    win.webContents.loadFile( getRelativePathOfFile('broadsheet.html') );

    
});

ipcMain.handle('print-broadsheet', async function( event, html, payload, completeFilePath ){

    // start a progress bar 
    const progressBar = new ProgressBar({
        text: 'Creating broadsheet...',
        detail: 'Broadsheet generation for ' + payload.subject + ' for ' + ( payload.clazz  as string ).toUpperCase() + ' ...',
        browserWindow:{
            parent: BrowserWindow.getFocusedWindow() as BrowserWindow,
            modal : true
        }
    });

    // write the event handler when the progress bar closes to show a message dialog.
    progressBar.on('aborted', function(){
        dialog.showMessageBoxSync({
            message: payload.subject + ' broadsheet generated for ' + payload.clazz,
            title: '   Suceessful broadsheet generation',
            type: 'info'
        });
    });

    await pdf.generatePdf(
        {content:html  as string }, 
        {format : 'A4', path: completeFilePath, printBackground : true}
    );

    // wait for some time and then close the window after the broadsheet is generated.
    await sleep( 1000 );
    progressBar.close();
});

ipcMain.handle('update-broadsheet-folder-path', function( event, folderPath : string ){
    broadsheetFolderPath = folderPath.trim() as string;
});

ipcMain.handle('get-broadsheet-folder-path', function( event ){
    return broadsheetFolderPath;
});

ipcMain.handle('get-broadsheet-file-path', function (event , payload){
    if ( broadsheetFolderPath === undefined ){
        dialog.showMessageBoxSync({
            message:'No base folder found. Please select a folder in the home page and try again.',
            title:'  Folder path error',
            type: 'error'
        }); return;
    }
    const requiredFolder = path.join( broadsheetFolderPath, payload.year, payload.term, (payload.clazz as string).toUpperCase() );

    if ( !fs.existsSync( requiredFolder )){
        fs.mkdirSync( requiredFolder, { recursive : true });
    }

    const fileName = payload.subject + '_broadsheet.pdf';
    return path.join( requiredFolder, fileName );
});


/**
 * Functions that has to do with the interaction for the school databases.
 */

ipcMain.handle('get-school-email-string', async function( event ){
    return await new ConcreteRepository().getSchoolEmailAddressString();
});

ipcMain.handle('delete-email', async function( event, emailText ){
   // show a dilaog box to ensure the user really wants to delete the email address
   const button : number = dialog.showMessageBoxSync({
       message : 'Are you sure you want to delete this email address?\n\nNote that this implies that the removed email address will not be updated with the school records during backup\n\nIf you wish to delete it anyways, click the continue button below.\n\nHowever if you change your mind, close this dialog or click the cancel button.\n',
       title: '  Email management',
       type: 'info'
   });

   if ( button === 1){ return;  };

   // delete the email and update the email string
   await new ConcreteRepository().deleteSchoolEmail( emailText );

});

ipcMain.handle('update-school-data', async function( event, payload ){
    await new ConcreteRepository().updateSchoolData( payload );
});

ipcMain.handle('get-school-data-from-data-store', function( event ){
    return new ConcreteRepository().getAllSchoolData();
});


// BACKUP! BACKUP!! BACKUP!!!
async function getAllAvailableEmailAddress() : Promise<string[]> {
     const schoolData : Object | any = await new ConcreteRepository().getAllSchoolData();
     return ( schoolData.email as string ).split('#');
}

ipcMain.handle('update-grade-system', async function( event, payload : Map<string, Object> ){
    // the payload is a map with key as grade and with object as the value
    const gradeSystemArray : GradeSystem[] = [];

    payload.forEach((value : Object | any , key : string) => {
        gradeSystemArray.push( new GradeSystem( key, value.lowerScoreRange, value.higherScoreRange, value.remarks ) );
    });

    return await new ConcreteRepository().updateGradingSystem( gradeSystemArray );
});

ipcMain.handle('get-grade-system', async function( event){
    return await new ConcreteRepository().getGradingSystemObjectArray();
});

async function getGradeSystem() : Promise<GradeSystem[]> {
    return await new ConcreteRepository().getGradingSystem();
}

ipcMain.handle('backup-to-mail', async function( event, payload ){

    console.log( payload );

    var destinationZipFile : string = '';

    if ( payload.backupType === 'academic-session-database'){
        const databaseFolderPath : string  = path.join(__dirname, 'datastore', payload.year as string );
        const destinationPath = path.join(__dirname, (payload.year + '.zip') as string );
        // zip the academic session database folder
        await FolderZipper.zipFolderToDestination( databaseFolderPath, destinationPath );
        // update the path to the zipFolder
        destinationZipFile = destinationPath;    
    }

    if( payload.backupType === 'academic-term-database' ){
        console.log( 'Got here' );
        const databaseFolderPath : string  = path.join(__dirname, 'datastore', payload.year, payload.term );
        const destinationPath = path.join(__dirname, (payload.year + '_' + payload.term +  '.zip') as string );
        // zip the academic session database folder
        await FolderZipper.zipFolderToDestination( databaseFolderPath, destinationPath );
        // update the path to the zipFolder
        destinationZipFile = destinationPath;
    }

    if( payload.backupType !== 'academic-session-database' && payload.backupType !== 'academic-term-database' ){
        // else zip the folder in the same directory that the user chooses
        const userFolderPath = payload.path as string;
        console.log( userFolderPath );
        const destinationFolderPath = userFolderPath + '.zip';
        await FolderZipper.zipFolderToDestination( userFolderPath, destinationFolderPath );
        destinationZipFile = destinationFolderPath;
    }

    const emails : string[] =  await getAllAvailableEmailAddress();
    const emailLine = emails.join(', ');

    // update the payload with the path to the eventual zip file
    payload.zipFilePath = destinationZipFile;
    payload.emails = emailLine;

    // console.log("I got here 1");
    // finally send the email to the user
    await sendEmail( payload );
    // console.log("I got here 2");

});

async function sendEmail( payload : Object | any ){

    switch( payload.backupType ){
        case 'academic-session-database': await handleAcademicSessionDatabaseBackup( payload ); return;
        case 'academic-term-database' : await handleAcademicTermDatabaseBackup( payload ); return;
        case 'academic-reportsheet' : await handleAcademicReportSheetBackup( payload ); return;
        case 'academic-broadsheet': await handleAcademicBroadsheetBackup( payload ); return;
        case 'academic-scores' : await handleScoresBackup( payload ); return;
        case 'other-items' : await handleOtherItemsBackup( payload ); return;
        default: throw new Error('Unsupported operation.');
    }
}

function startProgressBar( payload : Object | any ){
    const progress = new ProgressBar({
        text : payload.text,
        detail: payload.detail,
    });

    progress.on('aborted', function(){
        dialog.showMessageBoxSync({
            message: `Successful backup of ${payload.backupType} to registered emails.`,
            title:' Email backup sucess message',
            type: 'info'
        });
    });
    return progress;
}

async function handleAcademicSessionDatabaseBackup( payload : Object | any ){
    // construct the html for the academic session backup
    const html = `<h3 style="color:green;text-align:center"> Academic session database backup for year ${ payload.year } </h3>
    <p style="text-align:justify"> The attachment below is a zip folder containing the database flat file for all classes and for all academic terms. </p>
    <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i>If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
    <p> Thank you. </p>
    <p> <strong>Quatron@springarr.development</strong> </p>`;

    const emailSubject = `${ payload.year } academic session database backup`;
    const text  = `Quatron`;
    const filename = `${ payload.year } Database file`;

    payload.html = html;
    payload.subject = emailSubject;
    payload.text = text;
    payload.filename = filename;

    const progress : ProgressBar = startProgressBar({ text: 'Academic session database email backup', detail: `Backing up academic year ${payload.year} database to registered email addresses...`, backupType : `${payload.year} academic session databse`});

    // send the email with the email service class
    const done = await new EmailSenderService().sendEmail( payload );

    if ( done ){ 
        console.log('done'); 
        // delete the zip folder to clear up memory storage in user's machine
        fs.unlink( payload.zipFilePath , function( error ){
            if ( error ){ console.log( error )};
            console.log( "Deleted successfully");
        });
    };

    progress.close();
}

async function handleAcademicTermDatabaseBackup( payload : Object | any ){
    // construct the html for the academic session backup
    const html = `<h3 style="color:green;text-align:center"> Academic term database backup for ${ payload.year + ' ' + expandNeat( payload.term ) } </h3>
    <p style="text-align:justify"> The attachment below is a zip folder containing the database flat file for all classes for the <strong style="color:midnightblue;text-align:justify"> ${ expandNeat( payload.term ).toLowerCase() }. </strong> </p>
    <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
    <p> Thank you. </p>
    <p> <strong>Quatron@springarr.development</strong> </p>`;

    const emailSubject = `${ payload.year + '_' + payload.term } academic database backup`;
    const text  = `Quatron`;
    const filename = `${ payload.year + '_' + expandNeat( payload.term ) } Database file`;

    payload.html = html;
    payload.subject = emailSubject;
    payload.text = text;
    payload.filename = filename;

    const progress : ProgressBar = startProgressBar({ text: 'Academic term database email backup', detail: `Backing up academic database ${payload.year + '_' + expandNeat( payload.term) } to registered emails...`, backupType : `${payload.year + '_' + expandNeat( payload.term ) } academic database`});

    // send the email with the email service class
    const done = await new EmailSenderService().sendEmail( payload );

    if ( done ){ 
        console.log('done'); 
        // delete the zip folder to clear up memory storage in user's machine
        fs.unlink( payload.zipFilePath , function( error ){
            if ( error ){ console.log( error )};
            console.log( "Deleted successfully");
        });
    };

    progress.close();
}

async function handleAcademicReportSheetBackup( payload : Object | any ){
    // construct the html for the academic session backup
    const html = `<h3 style="color:green;text-align:center"> Academic term report sheets for ${ payload.year + ' ' + expandNeat( payload.term ) } </h3>
    <p style="text-align:justify"> The attachment below is a zip folder containing the academic report sheets for all classes for the <strong style="color:midnightblue;text-align:justify"> ${ expandNeat( payload.term ).toLowerCase() }. </strong> </p>
    <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
    <p> Thank you. </p>
    <p> <strong>Quatron@springarr.development</strong> </p>`;

    const emailSubject = `${ payload.year + '_' + payload.term } academic report sheet backup`;
    const text  = `Quatron`;
    const filename = `${ payload.year + '_' + expandNeat( payload.term ) } Students reports`;

    payload.html = html;
    payload.subject = emailSubject;
    payload.text = text;
    payload.filename = filename;

    const progress : ProgressBar = startProgressBar({ text: 'Academic term report sheet email backup', detail: `Backing up academic term students report for ${payload.year + '_' + expandNeat( payload.term) } to registered emails...`, backupType : `${payload.year + '_' + expandNeat( payload.term ) } academic report sheets`});

    // send the email with the email service class
    const done = await new EmailSenderService().sendEmail( payload );

    if ( done ){ 
        console.log('done'); 
        // delete the zip folder to clear up memory storage in user's machine
        fs.unlink( payload.zipFilePath , function( error ){
            if ( error ){ console.log( error )};
            console.log( "Deleted successfully");
        });
    };

    progress.close();
}

async function handleAcademicBroadsheetBackup( payload : Object | any ){
     // construct the html for the academic session backup
     const html = `<h3 style="color:green;text-align:center"> Academic term broad sheets for ${ payload.year + ' ' + expandNeat( payload.term ) } </h3>
     <p style="text-align:justify"> The attachment below is a zip folder containing the broad sheets for all classes for the <strong style="color:midnightblue;text-align:justify"> ${ expandNeat( payload.term ).toLowerCase() }. </strong> </p>
     <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
     <p> Thank you. </p>
     <p> <strong>Quatron@springarr.development</strong> </p>`;
 
     const emailSubject = `${ payload.year + '_' + payload.term } academic broad sheet backup`;
     const text  = `Quatron`;
     const filename = `${ payload.year + '_' + expandNeat( payload.term ) } Score broadsheets`;
 
     payload.html = html;
     payload.subject = emailSubject;
     payload.text = text;
     payload.filename = filename;
              const progress : ProgressBar = startProgressBar({ text: 'Academic term broad sheet email backup', detail: `Backing up academic term students broad sheets for ${payload.year + '_' + expandNeat( payload.term) } to registered emails...`, backupType : `${payload.year + '_' + expandNeat( payload.term ) } academic broad sheets`});
 
     // send the email with the email service class
     const done = await new EmailSenderService().sendEmail( payload );
 
     if ( done ){ 
         console.log('done'); 
         // delete the zip folder to clear up memory storage in user's machine
         fs.unlink( payload.zipFilePath , function( error ){
             if ( error ){ console.log( error )};
             console.log( "Deleted successfully");
         });
     };
 
}

async function handleScoresBackup( payload : Object | any ){
     // construct the html for the academic session backup             
     const html = `<h3 style="color:green;text-align:center"> Academic scores for ${ payload.year + ' ' + expandNeat( payload.term ) } </h3>
     <p style="text-align:justify"> The attachment below is a zip folder containing the academic scores for all classes for the <strong style="color:midnightblue;text-align:justify"> ${ expandNeat( payload.term ).toLowerCase() }. </strong> </p>
     <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
     <p> Thank you. </p>
     <p> <strong>Quatron@springarr.development</strong> </p>`;
 
     const emailSubject = `${ payload.year + '_' + payload.term } academic score sheet backup`;
     const text  = `Quatron`;
     const filename = `${ payload.year + '_' + expandNeat( payload.term ) } academic scores`;
 
     payload.html = html;
     payload.subject = emailSubject;
     payload.text = text;
     payload.filename = filename;
 
     const progress : ProgressBar = startProgressBar({ text: 'Academic term scores email backup', detail: `Backing up academic term scores for ${payload.year + '_' + expandNeat( payload.term) } to registered emails...`, backupType : `${payload.year + '_' + expandNeat( payload.term ) } academic scores`});
 
     // send the email with the email service class
     const done = await new EmailSenderService().sendEmail( payload );
 
     if ( done ){ 
         console.log('done'); 
         // delete the zip folder to clear up memory storage in user's machine
         fs.unlink( payload.zipFilePath , function( error ){
             if ( error ){ console.log( error )};
             console.log( "Deleted successfully");
         });
     };
 
     progress.close();
}

async function handleOtherItemsBackup ( payload : Object | any ){
     // construct the html for the academic session backup
     const html = `<h3 style="color:green;text-align:center"> ${ payload.description } for ${ payload.year + ' ' + expandNeat( payload.term ) } </h3>
     <p style="text-align:justify"> The attachment below is a zip folder containing the ${ payload.description } for all classes for the <strong style="color:midnightblue;text-align:justify"> ${ expandNeat( payload.term ).toLowerCase() }. </strong> </p>
     <p style="text-align:justify"> You are receiving this message from Quatron because you have registered this email address as a listener to the backup option. <strong><i> If you do not want to receive backup messages and data from Quatron, kindly deregister this address on the application. </i></strong> </p>
     <p> Thank you. </p>
     <p> <strong>Quatron@springarr.development</strong> </p>`;
 
     const emailSubject = `${ payload.year + '_' + payload.term } ${ payload.description }`;
     const text  = `Quatron`;
     const filename = `${ payload.year + '_' + expandNeat( payload.term ) } ${ payload.description }`;
 
     payload.html = html;
     payload.subject = emailSubject;
     payload.text = text;
     payload.filename = filename;
 
     const progress : ProgressBar = startProgressBar({ text: `${ payload.description }`, detail: `Backing up ${ payload.description } for ${payload.year + '_' + expandNeat( payload.term) } to registered emails...`, backupType : `${payload.year + '_' + expandNeat( payload.term ) } ${ payload.description }`});
 
     // send the email with the email service class
     const done = await new EmailSenderService().sendEmail( payload );
 
     if ( done ){ 
         console.log('done'); 
         // delete the zip folder to clear up memory storage in user's machine
         fs.unlink( payload.zipFilePath , function( error ){
             if ( error ){ console.log( error )};
             console.log( "Deleted successfully");
         });
     };
 
     progress.close();
}

ipcMain.handle('save-comments', async function(event, teacherPath : string, principalPath : string){
    await new ConcreteRepository().updateComments( teacherPath, principalPath );
});

ipcMain.handle('get-file-lines', function( event, filePath ){
    const lineString : string = fs.readFileSync( filePath, { encoding : 'utf-8' } ).toString() as string;
    const withoutComment: string[] = lineString.split('@comment');
    return withoutComment.join('').split('\r\n').filter((token : string) => token !== '' && token !== ' ');
});

// console.log( new TeacherComment().loa )
