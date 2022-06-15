export {}

import { ipcRenderer } from "electron"
import jQuery from "jquery"

/** constants */
const $ = jQuery;

/** Functions */
async function populateAcademicYearSelectBox() : Promise<void> {
    const fragment = $(document.createDocumentFragment());
    const academicYearsArray = await getAcademicYears();
    academicYearsArray.forEach( year => {
        const option = $('<option/>', { 'text' : year });
        fragment.append( option );
    });

    $('#select-year').append( fragment );
};

function toggleSelectDepartmentBox() : void {
    $('#select-level').on('change', function(this: HTMLElement, event){
        if ( $(this).val()?.toString().toLowerCase().trim() === 'senior' ){
            $('#department-section').css('display', 'block');
            return;
        };
        $('#department-section').css('display', 'none');
    });
};

function activateAddButton() : void {
    $('#add-subject').on('click', function(event){
        $('#create').css('display','block');
    });
};

async function validateAcademicYear( academicYear : string ) : Promise<boolean> {
    // check that the academic value is valid
    if ( academicYear?.toLowerCase() === 'select year' ){
        await showDialog({
            message : 'Select an academic year',
            title : 'Invalid academic year',
            type : 'error'
        }); return false;
    };
    return true;
};

async function validateSubjectName( subjectName : string ) : Promise<boolean> {

    // check that the subject name is valid
    if ( subjectName.length === 0 ){
        await showDialog({
            message : 'Insert a subject name',
            title : 'Empty subject name',
            type : 'error'
        }); return false;
    };
    return true;
};

async function validateUniqueSubjectNameForYearTermClass ( subjectName : string, data : Object ){
    if ( (await getAllSubjectNamesForYearTermAndClass(data)).includes(subjectName) ){ 
        await showDialog({
            message : 'This subject is already registered for this year and level',
            title : 'Non-unique subject name',
            type : 'error'
        }); return false;
    };
    return true;
};

function isEmpty( object : Object ) : boolean {
    return Object.keys(object).length === 0;
};

async function getAllInputFromDocument() : Promise<Object | any> {
    const academicYear = $('#select-year').val()?.toString().trim();
    const academicTerm = compress($('#select-term').val()?.toString().trim().toLowerCase() as string);
    const level = $('#select-level').val()?.toString().trim().toLowerCase();
    let department = $('#select-department').val()?.toString().trim().toLowerCase();
    const subjectName = compress($('#subject-name').val()?.toString().trim().toLowerCase() as string );

    const validAcademicYear = await validateAcademicYear( academicYear as string );
    const validSubjectName = await validateSubjectName( 
        $('#subject-name').val()?.toString().trim().toLowerCase() as string 
    );

    if( !validAcademicYear || !validSubjectName ) { return {}; };

    const validateUniqueSubjectName = await validateUniqueSubjectNameForYearTermClass( subjectName, { year : academicYear, term : academicTerm, level : level });

    if( !validateUniqueSubjectName ) { return {}; };

    if(level === 'junior') { department = 'none'; };

    return {
        academicYear : academicYear,
        academicTerm : academicTerm,
        level : level,
        department : department,
        subjectName : subjectName
    };
};

function compress( value : string ) : string {
    value = value.trim();       // first trim the incoming string to sanitize it
    if ( !value.includes(' ') ) { return value; };
    return value.split(' ').filter( entry => entry !== '').join('_');
};


/** Functions that invokes the main */
async function getAcademicYears() : Promise<string[]> {
    return await ipcRenderer.invoke('academic-years');
};

async function getAllSubjectNamesForYearTermAndClass( data : Object | any ) : Promise<string[]>{
    data.clazz = 'sss1';
    if (data.level === 'junior') { data.clazz = 'jss1'}
    return await ipcRenderer.invoke('level-subject-names', data );
};

async function getAllSubjectNames() : Promise<string[]>{
    return ipcRenderer.invoke('all-subject-names');
};

async function showDialog( payload : Object | any ) : Promise<number> {
    return await ipcRenderer.invoke('show-dialog', {
        message : payload.message,
        title : payload.title ,
        type : payload.type
    });
};

/** Handlers from the message of the main */


/** Handlers for html handlers  */
document.body.onload = async function (event){
    await populateAcademicYearSelectBox();
    toggleSelectDepartmentBox();
    activateAddButton();
};

$('#create-subject').on('click', async function(event){
    const inputs = await getAllInputFromDocument();
    if( !isEmpty(inputs) ){
        // invoke the mainprocess to save the subject
        const done = await ipcRenderer.invoke('save-subject', inputs);
        if ( done ){
            showDialog({
                message : 'Subject registered successfully',
                title : 'Success',
                type : 'info'
            }); return;
        }; return;
    };
});
