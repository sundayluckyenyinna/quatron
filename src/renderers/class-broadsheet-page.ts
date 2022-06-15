
export {}
import { ipcRenderer } from "electron";
import jQuery from 'jquery';

const $ = jQuery;

var selectedCheckBox: string[] = [];

// Getter functions
async function getPayloadFromHost() : Promise<Object> {
    return Object(await ipcRenderer.invoke('subject-names-guest-page'))[1];
}

async function getSubjectNameFromHost() : Promise<string> {
    return await ipcRenderer.invoke('get-updated-subject-name');
}

function getSelectClassBox(){
    return $('#select-class');
}

function getRemoveStudentButton() {
    return $('#remove-student')
}

function getGenerateBroadsheetButton(){
    return $('#generate-broadsheet');
}

function getSelectAllButton(){
    return $('#select-all-button');
}

async function getReadyScores( payload : Object | any ) : Promise<Object[]>{

    // get the student scores
    const scores = await ipcRenderer.invoke('student-scores', payload)

    const readyScores : Object[] = [];

    for ( let i = 0; i < scores.length; i++ ){
        // get the student and student no
        const student = scores[i];
        const studentNo = student.Student_No;
        payload.studentNo = studentNo;

        // get the student name from the main 
        const nameArray = await ipcRenderer.invoke('student-name', payload);
        const names = Object.values( nameArray );

        const fullName : string = names.map((token : string | any) => {
            const name = token.toLowerCase();
            return name.charAt(0).toUpperCase() + name.substring(1);
        }).join(' ');

        // get the student total score
        const totalScore = Number(student.Ca_Score) + Number(student.Exam_Score);

        student.Full_Name = fullName;
        student.Total_Score = totalScore;

        readyScores.push( student );
    }

    return readyScores;
}

function getStudentRecordRow( readyScores : Object[] | any ) {
    const rows = [];
    for ( let i = 0; i < readyScores.length; i++ ){
        const score = readyScores[i];
        const row = getSingleStudentRecordRow( score, i + 1);
        rows.push( row );
    }

    return rows;
}

function getSingleStudentRecordRow( score : Object | any, index : number){
    return $('<tr/>', {'class':'row'}).append($('<td/>', {'class' : 's-no', 'text' : index }))
                                      .append($('<td/>', {'class' : 'student-no', 'text' : score.Student_No }))
                                      .append($('<td/>', {'class' : 'full-name', 'text' : score.Full_Name }))
                                      .append($('<td/>', {'class' : 'ca-score', 'text' : score.Ca_Score }))
                                      .append($('<td/>', {'class' : 'exam-score', 'text' : score.Exam_Score }))
                                      .append($('<td/>', {'class' : 'total-score', 'text' : score.Total_Score }))
                                      .append($('<td/>', {'class' : 'check-column'}).append($('<input/>', {'class' : 'check', 'type' : 'checkbox'})));
}

// A function to display the students scores in the table
async function populateScoreTable() : Promise<void> {
    // get the payload from the host including the 'term', 'year' and 'clazz'
    const payload : Object | any = await getPayloadFromHost();
    const subjectName = await getSubjectNameFromHost();
    payload.subject = subjectName;

    const table = $('#score-table');
    const readyScores = await getReadyScores( payload );
    const allStudentRows = await getStudentRecordRow( readyScores );
    table.append( allStudentRows );
    // set the class and subject
    $('#class').text(expandClass(payload.clazz as string).toUpperCase());
    $('#subject').text( expandSubject(subjectName) );
}

async function print( value : any ) : Promise<void>{
    await ipcRenderer.invoke('print', value);
}

function compress( value : string ){
    value = value.trim().toLowerCase();
    return value.split(' ').filter((token:string) => token !== '').join('_');
}

function expandClass( value : string ){
    value = value.trim().toUpperCase();
    return value.substring(0, 3) + ' ' + value.charAt( 3 );
}

function expandSubject( subject : string ){
    return subject.trim().split('_').map((subjectName : string) => subjectName.charAt(0).toUpperCase() + subjectName.substring(1)).join(' ');
}
// validations
function checkValidSelectedClass() : boolean {
    return ( getSelectClassBox().val()?.toString().trim() as string ) !== 'Select class';
}

// value getters
function getClass() : string {
    const clazz = getSelectClassBox().val()?.toString().trim().toLowerCase() as string ;
    return clazz.split(' ').filter((token: string) => token !== '').join('');
}

// THE DOM ELEMENT HANDLERS
function selectClassChangeHandler() {
    getSelectClassBox().on('change', async function( event ){
        const isValidClass = checkValidSelectedClass();
        if ( !isValidClass ){ return; };
        // get the class and tell the main process to update its clazz attribute in the payload
        const clazz = getClass();
        await ipcRenderer.invoke('update-rendered-class', clazz);
        // repopulate the page with the new class. First remove all the rows and clear the students blacklist.
        $('.row').remove();
        await populateScoreTable();
    });
}

// handler to display the remove student and the select all button 
function showRemoveAndSelectAllButtonHandler(){

    // this will be triggered when a check box is actually clicked
    $('body').on('click', '.check', async function( this, event ){

        // get the student number associated with this check box
        const studentNo = $( this ).parent().parent().find('.student-no').text().trim() as string;

        // if it is selected, add it to the array, if not remove it immediately.
        if ( $(this).is(':checked') ){ selectedCheckBox.push( studentNo ); }
        else{
            const newSelectedArray = selectedCheckBox.filter((studentNumber) => studentNumber !==  studentNo );
            selectedCheckBox = newSelectedArray;
        }
        
        // now check if there is at least a selected check box and use it to decide if to show the buttons or not
        if ( selectedCheckBox.length === 0){
            getRemoveStudentButton().css('visibility', 'hidden');
            getSelectAllButton().css('visibility', 'hidden');
        }else{
            getRemoveStudentButton().css('visibility', 'visible');
            getSelectAllButton().css('visibility', 'visible');
        }
    });
}

function removeStudentHandler(){

    getRemoveStudentButton().on('click', async function( event ){
        const studentBlackList : string[] = []
        // get the student numbers of those to be deleted
        $('.check').each(function(this, index, element){
            if( $(this).is(':checked') ){
                const studentNo = $(this).parent().parent().find('.student-no').first().text().trim() as string;
                studentBlackList.push( studentNo );
            }
        });

        const payload : Object | any = await getPayloadFromHost();
        payload.subject = compress(await getSubjectNameFromHost());

        // invoke the main process to delete the subject for this student
        await ipcRenderer.invoke('remove-subject-for-students', studentBlackList, payload );

        // repopulate the table
        $('.row').remove();
        await populateScoreTable();
        // set the text of the button back to 'Selected'
        getSelectAllButton().text('Select all');
        getRemoveStudentButton().css('visibility', 'hidden');
        getSelectAllButton().css('visibility', 'hidden');

        selectedCheckBox.splice(0, selectedCheckBox.length);

    });
}

function selectAllButtonHandler(){
    getSelectAllButton().on('click', async function( this, event ){

        const compressedText = compress( $(this).text().trim() as string );

        // check if the button is on the 'select all mode'
        if( compressedText === 'select_all' ){

            $('.check').each( function(this, index, element ){
                const isChecked = $(this).is(':checked');
                if( !isChecked ){ $(this).trigger('click'); };
            });
            // change the name of the button to 'Deselect all'
            $( this ).text('Deselect all'); return;
        }

        if( compressedText === 'deselect_all' ){
            // then the button is on the 'Deselect all mode'
            $('.check').each( function(this, index, element ){
                if( $(this).is(':checked') ){  $(this).trigger('click');  };
            });
            // change the name of the button back to 'Seelect all'
            $( this ).text('Select all'); return;
        };
        return;
    });
}

function generateReportSheetButtonHandler(){
    getGenerateBroadsheetButton().on('click', async function( event ){
        await ipcRenderer.invoke('show-broadsheet-preview');
    });
}

document.body.onload = async function( event ){

    const hostPayload : Object | any = await getPayloadFromHost();
    if ( hostPayload.level === 'junior' ){
        $('.senior').remove();
    }
    if( hostPayload.level === 'senior' ){
        $('.junior').remove();
    }

   await populateScoreTable();

   //handers
   selectClassChangeHandler();
   removeStudentHandler();
   generateReportSheetButtonHandler();
   showRemoveAndSelectAllButtonHandler();
   selectAllButtonHandler();
};