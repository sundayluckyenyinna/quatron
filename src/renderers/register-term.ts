
export {};

const { ipcRenderer } = require('electron');

/** Import the jquery module */
const $ = require('jquery');

/** A global variable to hold all the academic years. */
let academicYearsArray: string[] = [];


                                    /** FUNCTIONS  */
/**
 * Asynchronous process to populate the document select box with the academic years 
 * from the database.
 */
async function invokePopulateAcademicYearSelectBox() : Promise<void> {
    ipcRenderer.invoke('academic-years');
};

invokePopulateAcademicYearSelectBox();

function populateAcademicSelectBox( academicYears : string[] ) : void {
    const fragment = $(document.createDocumentFragment());
    academicYears.forEach( ( year : any ) => {
        const option = $('<option />', { 'text': year });
        fragment.append( option );
    });
    $('#select-year').append(fragment);
};


function validateAcademicYearInputBeforeAttemptToSave( yearInput : string ) : number {
    if(yearInput.length === 0){ return 300 }
    if( academicYearsArray.includes( yearInput) ){ return 400 };
    return 200;
};

function validateDescriptionBeforeAttemptToSave( description : string ) : boolean {
    if ( description.length === 0) return false;
    return true;
};

// erroInfo = message and title and type
async function showDialogSync( payload : Object ) : Promise<number> {
    return  await ipcRenderer.invoke('show-dialog', payload);
};


function compress( value : string ) : string {
    value = value.trim();       // first trim the incoming string to sanitize it
    if ( !value.includes(' ') ) { return value; };
    return value.split(' ').filter( entry => entry !== '').join('_');
};


                                /** HTML ELEMENTS EVENT HANDLERS */

$('#add-btn').on('click', async function(event: any){
    const statusCode = validateAcademicYearInputBeforeAttemptToSave( $('#year-input').val() );
    const isDescriptionValid = validateDescriptionBeforeAttemptToSave ( $('#desc').val() );

    if ( statusCode === 300 ){
        await showDialogSync({
            message : 'Academic Year cannot be empty',
            title : 'Empty Academic Year',
            type : 'error'
        });
        return;
    };

    if ( statusCode === 400 ){
        const id = showDialogSync({
            message : 'The academic year ' + $('#year-input').val() + ' is already saved',
            title : 'Non-Unique academic year',
            type : 'error'
        });
        return;
    };
    
    if ( !isDescriptionValid ){
        await showDialogSync({
            message : 'Description for the academic year cannot be empty. Enter a description.',
            title : 'Empty description',
            type : 'error'
        });
        return;
    };    

    const year = compress($('#year-input').val()?.toString().trim());
    const description = compress($('#desc').val()?.toString().trim());

    const data = { year : year, description : description };
    ipcRenderer.invoke('add-academic-year', data );
});


                            /** IPC EVENTS AND COMMUNICATION  */

// populate the select box with the academic years invoked.
ipcRenderer.on('academic-years', function(event, academicYears){
    populateAcademicSelectBox( academicYears );
    academicYearsArray = academicYears; 
});

ipcRenderer.on('add-academic-year', async function(event, academicYears){
    const titleOption  = $('<option />', { 'text' : 'All acdemic years' });
    $('#select-year').find('option').remove().end().append( titleOption );
    populateAcademicSelectBox( academicYears );
    await showDialogSync({ 
        message : 'Academic year ' + $('#year-input').val() + ' created successfully ',
        title : 'Success',
        type : 'info'
    });
    academicYearsArray.push($('#year-input').val());
});

