
import { ipcRenderer } from "electron";
import jQuery  from 'jquery';

const $ = jQuery;

$('#progress').remove();

// functions that invokes the main process
async function getAcademicYearsFromMain() : Promise<string[]> {
    return await ipcRenderer.invoke('academic-years');
};

async function performUploadOfScores(){
    if(getUploadType() === 'single_file_upload'){
        ipcRenderer.invoke('upload-scores-single', getAllSelectBoxData());
        return;
    };
    ipcRenderer.invoke('upload-scores-multiple', await getAllSelectBoxDataForMultipleFileUpload());
};

function showInValidSelectDialog() {
    ipcRenderer.invoke('show-dialog', {
        message : 'Some fields were wrongly selected. \nEnsure that you select the correct options and then try again.\nEnsure that you have selected a file or a folder that contains the student scores to upload and try again.',
        title : 'Selection error',
        type: 'error'
    });
}

async function showDialog( data : object | any ){
    await ipcRenderer.invoke('show-dialog', {
        message : data.message,
        title : data.title,
        type: data.type
    });    
}

// getter functions
function getAcademicYear() : string {
    return $('#select-year').val()?.toString().trim() as string;
};

/**
 * 
 */
function getTerm() : string {
    return compress( $('#select-term').val()?.toString().trim().toLowerCase() as string );
};

function getClass() : string {
    return compressClass( $('#select-class').val()?.toString().trim().toLowerCase() as string );
};

function getUploadType() : string {
    return compress( $('#select-upload-type').val()?.toString().trim().toLowerCase() as string );
};

function getScoreType() : string {
    return compress( $('#select-score-type').val()?.toString().trim().toLowerCase() as string );
};

function getFileType() : string {
    const raw = compress( $('#select-file-type').val()?.toString().trim().toLowerCase() as string );
    return raw.substring(0, raw.indexOf('(') - 1);
};  

function getPath() : string {
    return $('#path').val()?.toString().trim() as string;
};

async function getSubjectPaths() : Promise<string[]> {
    return await ipcRenderer.invoke('folder-path', getPath(), getAllSelectBoxData());
};

function compress( value : string ) : string {
    value = value.trim();       // first trim the incoming string to sanitize it
    if ( !value.includes(' ') ) { return value; };
    return value.split(' ').filter( entry => entry !== '').join('_');
};

function compressClass( clazz : string ) {
    clazz = (clazz as string).trim();       // first trim the incoming string to sanitize it
    if ( !clazz.includes(' ') ) { return clazz; };
    return clazz.split(' ').filter( entry => entry !== '').join('');
};

function getAllSelectBoxData() : Object {
    return {
        year : getAcademicYear(),
        term : getTerm(),
        clazz : getClass(),
        uploadType : getUploadType(),
        scoreType : getScoreType(),
        fileType : getFileType(),
        filePath : getPath()
    };
};

async function getAllSelectBoxDataForMultipleFileUpload() : Promise<Object> {
    return {
        year : getAcademicYear(),
        term : getTerm(),
        clazz : getClass(),
        uploadType : getUploadType(),
        scoreType : getScoreType(),
        fileType : getFileType(),
        folderPath : getPath(),
        filePaths : await getSubjectPaths()
    };
};

function getSelectedFileObject(){
    let fileObject : Object | any = {};

    switch(getFileType()){
        case 'word' : fileObject.desc = 'Word Documents'; fileObject.mediaType = 'docx'; break;
        case 'pdf' : fileObject.desc = 'PDF Documents'; fileObject.mediaType = 'pdf'; break;
        case 'excel' : fileObject.desc = 'Excel Documents'; fileObject.mediaType = 'xlsx'; break;
    };

    return fileObject;
};

function getProgressBar() : HTMLProgressElement {
    return document.getElementById('progress') as HTMLProgressElement;
};

function getProgressValue() {
    return getProgressBar().value;
};

function setMaxProgressValue( maxValue : number ){
    getProgressBar().max = maxValue;
};

async function buttonClickHandlerForSingleFileSelection(){
    const singleFilePath : string =  await ipcRenderer.invoke('show-file-chooser', getSelectedFileObject());
    console.log( singleFilePath )
    $('#path').val( singleFilePath.trim() );
};

async function buttonClickHandlerForMultipleFileSelection(){
    const folderPath : string = (await ipcRenderer.invoke('show-directory-chooser'))[0];
    console.log( folderPath )
    $('#path').val( folderPath.trim() );
};

// ordinary function that populate the relevant fields
async function populateAcademicYearSelectBox(): Promise<void> {
    const fragment = $( document.createDocumentFragment() );
    (await getAcademicYearsFromMain()).forEach( ( year : string ) => {
        const option = $('<option/>',{ 'text' : year });
        fragment.append( option );
    });
    $('#select-year').append( fragment ); 
};

function validateInputBeforeUpload() : boolean {
    let isValid = true;
    const select = 'select';
    if( getAcademicYear().includes( select )){ isValid = false; };
    if( getTerm().includes( select ) ){ isValid = false; };
    if( getClass().includes( select )){ isValid = false; };
    if( getUploadType().includes( select )){ isValid = false; };
    if( getScoreType().includes( select )){ isValid = false; };
    if( getFileType().includes( select) || getFileType() === "" ){ isValid = false; };
    if( getPath().length === 0 || getPath() === undefined ){ isValid = false; };
    return isValid;
};

function selectFileTypeChangeHandler(){
    $('#select-upload-type').on('change', function(this, event){

        const browse = document.getElementById('browse');

        if( getUploadType() === 'single_file_upload'){
            // remove the option of the folder selection of the file type field.
            $('.folder').css('display', 'none');
            $('.single-file').css('display', 'block');
            browse?.removeEventListener('click', buttonClickHandlerForSingleFileSelection);
            browse?.removeEventListener('click', buttonClickHandlerForMultipleFileSelection);
            browse?.addEventListener('click', buttonClickHandlerForSingleFileSelection); return;
        }

        if( getUploadType() === 'multiple_file_upload'){
            // remove the option of the single files selection of the file type filed
            $('.single-file').css('display', 'none');
            $('.folder').css('display', 'block');
            browse?.removeEventListener('click', buttonClickHandlerForSingleFileSelection);
            browse?.removeEventListener('click', buttonClickHandlerForMultipleFileSelection);
            browse?.addEventListener('click', buttonClickHandlerForMultipleFileSelection);
        }
        return; 
    });
};

async function getAllReadySubjectsNamesFromFolderPath() : Promise<Array<Array<string>>>{
    return await ipcRenderer.invoke('all-ready-subject-names-from-folder-path', getPath());
};

async function getRegisteredSubjects(){
    return await ipcRenderer.invoke('level-subject-names', getAllSelectBoxData());
};

function getUnregisteredSubjects( subjects : string[], registered : string[] ) {
    const unregistered : string[] = [];
    subjects.forEach((subject : string) => {
        if( !registered.includes( subject )) { unregistered.push( subject ) };
    });
    return unregistered;
};

function expandNeat( subject : string ){
    subject = subject.trim();
    return subject.split('_').map((token : string) => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
};

function getDuplicateSubjects( free : string[], insideExcel : string[]){
    const duplicates : string[] = [];
    free.forEach((f : string) => {
        if(insideExcel.includes(f)){ duplicates.push(expandNeat(f))}
    });
    return duplicates;
};

// Verify that the file selected by the user is authentic
async function verifyChoosenFile() : Promise<boolean> {
    // get the path of the selected file and act on it
    if(getUploadType() === 'multiple_file_upload'){
        // ensure that the user actually selected a folder without a dot
        if( getPath().indexOf('.') !== -1 ){
            const data = {
                message : 'The folder selected must not have a dot in its name. \nTry renaming the folder and try again',
                title : 'Invalid folder name',
                type: 'error'
            };
            await showDialog( data ); return false;
        };

       // getting here means that it passes the first test. Now confirm sync of subject names
       // get the names of the subjects represented by the files in the folder. word, pdf or excel.

       if( (await getAllReadySubjectsNamesFromFolderPath()).length === 0 ){
        const data = {
            message : 'The folder selected is empty. This error might also occur if there are no Word, PDF or Excel files in this folder. Expected some Word, PDF or Excel files, but found none. \nPlease insert some Word, PDF or Excel files and try again.',
            title : 'Invalid folder name',
            type: 'error'
        };
        await showDialog( data ); return false;            
       };

       const wordAndPdfs : string [] = Object(await getAllReadySubjectsNamesFromFolderPath())[0];
       const excels : string[] = Object(await getAllReadySubjectsNamesFromFolderPath())[1];

       const subjectNamesFromFolder = wordAndPdfs.concat( excels );
       // ensure that there are no subjects above that is not in the registered subjects
       const registeredSubjects = await getRegisteredSubjects();

       const unregisteredSubjects = getUnregisteredSubjects( subjectNamesFromFolder, registeredSubjects );

       const duplicates = getDuplicateSubjects( wordAndPdfs, excels );

       if( duplicates.length !== 0 ){
        const set = new Set<string>();
        duplicates.forEach((d : string) => set.add(d));

        const singleDuplicates : string[] = [];
        set.forEach((sd : string) => singleDuplicates.push( sd ));

        const duplicateMessage = singleDuplicates.map((duplicate : string) => duplicate + ' is a duplicate. This means that the subject with this name happens to be in an excel file located in the same folder as the file bearing this name.\nThis error can also occur if two or more files share the same name regardless of the spacing between, and around the spellings of their names.').join('\n\n') + '\n\nThere can be only one representation of a subject.';

        const solutionMessage = '\n\n\nPossible solution is to delete either the free file having this name in the selected folder, or delete the excel spreadsheet in one of the excel files in the same folder.';

        await showDialog({
            message : duplicateMessage + solutionMessage,
            title :'  File error',
            type : 'error'
        }); 
        return false;
    }

       if(unregisteredSubjects.length !== 0){
            const unregisteredMessage = unregisteredSubjects.map((fault : string) => expandNeat( fault ) + ' does not represent a registered subject').join('\n\n');

            const solutionMessage = '\n\n\nPossible solutions are as follows:\n\n-->Register all the subjects above\n-->Check that you have not made a typographical error in naming any of the files as the name of a subject. If this is the case, rename the file(s) correctly and try again\n-->Delete the files from the folder to continue.';

            await showDialog({
                message : unregisteredMessage + solutionMessage,
                title :'  File error',
                type : 'error'
            }); 
            return false;
        }

    };

    if ( getUploadType() === 'single_file_upload'){
        // handle for both word and pdf documents
        if( getFileType() === 'word' || getFileType() === 'pdf'){
            // ensure that the file name of the user choice is a valid registered subject
            const filePath = getPath();
            const readyFilePath : string = await ipcRenderer.invoke('ready-filename-from-path', getPath());

            if( readyFilePath.includes('.') || readyFilePath.includes('/') ){
                await showDialog({
                    message : "File name should not contain special characters like '.' or '/' \n\nRename the file and try again. ",
                    title : '   File name error.',
                    type : 'error'
                }); return false;
            };

            const readyFileName : string = await ipcRenderer.invoke('ready-filename-from-path', filePath);
            const registeredSubjects  : string[] = await getRegisteredSubjects();
            if ( !registeredSubjects.includes( readyFileName ) ){
                await showDialog({
                    message : "The name of the file does not map to any registered subjects. \n\nTry renaming the file to the name of a registered subject, or register a subject with this name.",
                    title : '   File name error.',
                    type : 'error'
                }); return false;            
            };

            // if all test are passed as a word or pdf file, retutn true.
            return true;
        }

        // then it must be an excel file. Get the sheet names and the registered subjects
        const registeredSubject : string[] = await getRegisteredSubjects();
        const sheetNames : string[] = await ipcRenderer.invoke('excel-sheet-names', getPath());
        const readySheetNames = sheetNames.map((sheetName : string) => {
            return sheetName.trim().toLowerCase().split(' ').filter((token : string) => token !== '').join('_')
        });
        const unregisteredSubject : string[] = [];
        readySheetNames.forEach((readySheet : string) => {
            if( !registeredSubject.includes( readySheet ) ) { unregisteredSubject.push( readySheet ); };
        });

        if( unregisteredSubject.length !== 0 ){
            const unregisteredMessage = unregisteredSubject.map((token : string) => expandNeat( token ) + ' is not a representation of a registered subject!. \n\nThis implies that the name of the spreadsheet is wrongly spelt. If this is not the case, delete or move the spreadsheet to another location away from the chosen excel file and try again.').join('\n\n\n');
            await showDialog({
                message : unregisteredMessage,
                title : 'File name error',
                type : 'error'
            }); return false;
        }

    }
    // getting here means that it is a single_file_upload. Now test that the subject names are in sync
    return true;
};

// The function to call when the document body loads and is ready.
document.body.onload = async function(){

    await populateAcademicYearSelectBox();
    selectFileTypeChangeHandler();

    // set the handler for the upload button action
    $('#upload').on('click', async function(event){

        const fileOkay = await verifyChoosenFile();
        if ( !fileOkay ){ return; };

        if( !validateInputBeforeUpload()){
            showInValidSelectDialog();
            return;
        };

        performUploadOfScores();
    });
};

ipcRenderer.on('update-max-progress-bar', function( event, value){
    setMaxProgressValue( value );
});

ipcRenderer.on('update-progress', function( event, value){
    getProgressBar().style.visibility = 'visible';
    getProgressBar().value = getProgressValue() + 1;    
});
