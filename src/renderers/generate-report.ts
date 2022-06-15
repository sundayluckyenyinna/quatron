export {}

import { ipcRenderer } from "electron";
import jQuery from "jquery";

const $ = jQuery;

/**
 * Returns the academic year selected on this document page.
 * @returns academicYear : string
 */
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

function compressMonth ( month : string ) : string {
    month = month.trim();
    if ( month.length === 3 || month.length === 4 )
     { 
         return (month.charAt(0).toUpperCase() + month.substring(1)); 
     };
    return month.charAt(0) + month.substring( 1, 3) + ".";
};

function getMonthOfNextTermBegin() : string {
    return compressMonth( $('#month-next-begin').val() as string );
};

function getYearOfNextTermBegin() : string {
    return $('#year-next-begin').val() as string;
};

function getMonthOfNextTermEnd() : string {
    return compressMonth( $('#month-next-end').val() as string );
};

function getYearOfNextTermEnd() : string {
    return $('#year-next-end').val() as string;
};

function getStudentNumberOrAll() : string {
    return $('#student-nos').val() as string;
};

function getRootFolderPathChosen() : string {
    return $('#root-folder').val()?.toString().trim() as string;
};

function getAllSelectedBoxValues() : Object 
{
    return {
        year : getAcademicYear(),
        term : getTerm(),
        clazz : getClass(),
        studentNo : getStudentNumberOrAll(),
        nextTermBeginMonth : getMonthOfNextTermBegin(),
        nextTermBeginYear : getYearOfNextTermBegin(),
        nextTermEndMonth : getMonthOfNextTermEnd(),
        nextTermEndYear : getYearOfNextTermEnd(),
        rootFolder : getRootFolderPathChosen()
    };
}

async function getAcademicYearArray() : Promise<string[]> {
    return await ipcRenderer.invoke('academic-years');
};

async function populateAcademicYear() : Promise<void> {
    const fragment = $(document.createDocumentFragment());
    await (await getAcademicYearArray()).forEach( year => {
        const option = $('<option/>', { 'text': year });
        fragment.append( option );
    });
    $('#select-year').append( fragment );
};

async function populateYearOfNextTermBegin(){
    const fragment = $(document.createDocumentFragment());
    const academicYears = await getAcademicYearArray();
    const extraYear1 = ( Number(academicYears[ academicYears.length - 1]) + 1 ).toString();
    const extraYear2 = ( Number(academicYears[ academicYears.length - 1]) + 2 ).toString();
    academicYears.push( extraYear1, extraYear2 );
    academicYears.forEach( year => {
        const option = $('<option/>', { 'text': year });
        fragment.append( option );
    });
    $('#year-next-begin').append( fragment );
};

async function populateYearOfNextTermEnd(){
    const fragment = $(document.createDocumentFragment());
    const academicYears = await getAcademicYearArray();
    const extraYear1 = ( Number(academicYears[ academicYears.length - 1]) + 1 ).toString();
    const extraYear2 = ( Number(academicYears[ academicYears.length - 1]) + 2 ).toString();
    academicYears.push( extraYear1, extraYear2 );
    academicYears.forEach( year => {
        const option = $('<option/>', { 'text': year });
        fragment.append( option );
    });
    $('#year-next-end').append( fragment );
};

async function populateYearOfNextTermBeginAndEnd() : Promise<void> {
    await populateYearOfNextTermBegin();
    await populateYearOfNextTermEnd();
};

async function classChangeHandler() : Promise<void> {
    if ( !readyToPopulateStudentNo() ){ return; };
    let studentsInClass : Object[] | any;

    try{
        studentsInClass  = await ipcRenderer.invoke('students-for-class', getAllSelectedBoxValues());
    } catch( error ){ return; }

    const fragment = $(document.createDocumentFragment());

    studentsInClass.forEach( ( student : Object | any  ) => {
        const option = $('<option/>', { 'text': student.Student_No, 'class' : 'student-no-option' });
        fragment.append( option );
    });

    $('.student-no-option').remove();
    fragment.prepend($('<option/>', { 'text' : 'All students in class', 'class' : 'student-no-option'}));
    $('#student-nos').append( fragment );
};

function validateAllSelectBoxInput() : boolean {
    //console.log( Object.values(getAllSelectedBoxValues() ));
   return !( Object.values( getAllSelectedBoxValues()).join('').indexOf('select') !== -1 || // i.e
                Object.values(getAllSelectedBoxValues()).includes('--Student No--') ||
                Object.values( getAllSelectedBoxValues()).join('').indexOf('Sel') !== -1 ); 
};

function readyToPopulateStudentNo() : boolean {
    return ( getClass() !== 'selectclass'
            && getAcademicYear() !== 'Select year' 
            && getTerm() !=='select_term' );
};

/**
 * 
 * Functions that invokes the main method
 */
async function showDirectoryChooser() : Promise<void>{
    const directoryPathArray : string[]  = await ipcRenderer.invoke('show-directory-chooser');
    if ( directoryPathArray ){ $('#root-folder').val( directoryPathArray[0] as string ); };
    console.log( directoryPathArray[0] );
    return;
};

async function showDialog( payload : Object ){
    return await ipcRenderer.invoke('show-dialog', payload);
};

async function getSingleOrAllStudentDataForReportSheetForYearTermClass() : Promise<Object[]> {
    // includes all details, all subject scores in an array
    return await ipcRenderer.invoke('all-or-single-students-data', getAllSelectedBoxValues());
};

/**
 * HTML handlers
 */

/** The background code to run as the document loads  */
document.body.onload = async function( event ){
    // populate the academic year
    await populateAcademicYear();
    // populate the year of next term begins and end
    await populateYearOfNextTermBeginAndEnd();
    // disable the generate button until a folder is choosen
};

// chnage handler for the class selection 
$('#select-class').on('change', async function(this : HTMLElement , event){
    if( !readyToPopulateStudentNo() ){ return; };
    const selectedClass = (this as HTMLSelectElement).value.trim();
    if ( selectedClass.includes('Select class')) { $('.student-no-option').remove(); return; };
    // handle the change in class by repopulating the student-nos field
    try{
        await classChangeHandler();
    } catch( erorr ){ return; }
});

$('#select-year').on('change', async function( event ){
    if( readyToPopulateStudentNo() ){ 
        $('.student-no-option').remove();

        try{
            await classChangeHandler();
        } catch( erorr ){ console.log('This is the error here'); return; }
    };
    return;
});

$('#select-term').on('change', async function( event ){
    if( readyToPopulateStudentNo() ){ 
        $('.student-no-option').remove()
        try{
            await classChangeHandler();
        } catch( erorr ){ return; }
    };
    return;
});

$('#browse-button').on('click', async function(event){
    console.log( readyToPopulateStudentNo() );
    await showDirectoryChooser();
});

$('#generate-report-button').on('click', async function(event){
    if( !validateAllSelectBoxInput() ){
        showDialog({
            message: 'Some selections are invalid.',
            title: 'Invalid selection(s)',
            type: 'error'
        }); return;
    };

    if ( $('#root-folder').val()?.toString().trim().length === 0 ){
        showDialog({ 
            message : 'Please select a root folder to store all report sheets',
            title : 'Unspecified root folder',
            type : 'error'
        }); return;
    }; 
    // send the request to the main process for the processing of the report sheets
    const payload = await getSingleOrAllStudentDataForReportSheetForYearTermClass();
    await ipcRenderer.invoke('all-or-single-students-report', payload, getAllSelectedBoxValues());
});


$('#merge-report-button').on('click', async function(event){
    // verify that the folder path is not empty
    if ( getRootFolderPathChosen().trim().length === 0 ){
        await showDialog({
            message : 'The folder path cannot be empty. Browse and select a folder that contains all the report sheets to be merged.',
            title : ' Folder path error',
            type : 'error'
        }); return;
    }
    ipcRenderer.invoke('merge-reports', getAllSelectedBoxValues());
});

/** Handler for message from the main process */
ipcRenderer.on('merge-report-done', function(event, destination){
    showDialog({
        message: 'Message: All report sheets successfully merged!\n\nDestination: ' + destination,
        title : 'Success',
        type: 'info'
    }); return;
});
