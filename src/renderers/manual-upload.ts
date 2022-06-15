export {}

import { ipcRenderer } from "electron";
import jQuery from "jquery";

const $ = jQuery;

/** CONSTANTS */

/** FUNCTIONS */
function getAcademicYear() : string {
    return $('#select-year').val()?.toString().trim() as string;
};

function getTerm() : string {
    return compress( $('#select-term').val()?.toString().trim().toLowerCase() as string );
};

function getClass() : string {
    return compressClass( $('#select-class').val()?.toString().trim().toLowerCase() as string );
};

function getSubject() : string {
    return compress( $('#select-subject').val()?.toString().trim().toLowerCase() as string );
};

function compress( value : string ) : string {
    value = value.trim();       // first trim the incoming string to sanitize it
    if ( !value.includes(' ') ) { return value; };
    return value.split(' ').filter( entry => entry !== '').join('_');
};

function compressClass( clazz : string ) {
    clazz = clazz.trim();       // first trim the incoming string to sanitize it
    if ( !clazz.includes(' ') ) { return clazz; };
    return clazz.split(' ').filter( entry => entry !== '').join('');
};

function expand( value : string ) : string {
    value = value.trim();
    return value.split('_')
    .map(entry => entry.charAt(0).toUpperCase() + entry.substring(1))
    .join(' ');
};

function checkThatOneFieldIsInappropriate() : boolean {
    return ( 
                (getAcademicYear().toLowerCase() === 'select academic year') || 
                (getTerm() === 'select_term') ||
                (getClass() === 'selectclass')
           );
};

function getAllSelectBoxData() : Object {
    return {
        year : getAcademicYear(),
        term : getTerm(),
        clazz : getClass(),
        subject : getSubject()
    };
};

function isStudentOfferSubject( student : Object | any, subject : string ) : boolean {
    //split the student subject to arr
    return ((student.Subject).split('#')).includes( subject );
};

async function displayStudentsInTable( studentsData : Object[] | any[] ) {
    console.log( studentsData );
    const studentScores = await getAllStudentScoresForSubjectForYearTermClass( getAllSelectBoxData() );
    // create a jquery fragment 
    const fragment = $(document.createDocumentFragment());

    // create a row and append subsequent columns
    studentsData.forEach( (student, studentIndex) => {
        // get the student score object
        const score : Object | any = getStudentScoreByStudentNo( student.Student_No, studentScores );

        // create input for the scores
        const caScoreInput = $('<input/>', { 'type':'number', 'class' : 'score-input-column ca_score-input'}).val(score.Ca_Score).attr('disabled', 'true');

        const examScoreInput = $('<input/>', { 'type':'number', 'class' : 'score-input-column exam_score-input'}).val(score.Exam_Score).attr('disabled', 'true');

        const studentRow = $('<tr/>',{}).append($('<td/>', { 'text' : studentIndex + 1, 'class' : 'column'}))
                                 .append($('<td/>', { 'text' : student.Student_No, 'class' : 'column student_no'}))
                                 .append($('<td/>', { 'text' : student.Surname, 'class' : 'column'}))
                                 .append($('<td/>', { 'text' : student.First_Name, 'class' : 'column'}))
                                 .append($('<td/>', { 'text' : student.Middle_Name, 'class' : 'column'}))
                                 .append($('<td/>', { 'class' : 'column ca_score' }).append(caScoreInput))
                                 .append($('<td/>', { 'class' : 'column exam_score' }).append(examScoreInput));

        studentRow.addClass('student-row');
        fragment.append(studentRow);
    });

    $('#score-table').append( fragment );
};

async function changeHandler(){
    $('.student-row').remove();    
    if ( checkThatOneFieldIsInappropriate() ){
        $('#select-subject').find('.subject-option').remove();
        return; 
    };
    const subjectNames : string[] = await ipcRenderer.invoke('level-subject-names', getAllSelectBoxData());
    const prettySubjects = subjectNames.map( subject => expand(subject) );
    // populate the subject select box with the subjects
    populateSubjectSelectBox(prettySubjects);
    // remove all entries and trigger the display student button automatically
    if(getSubject() === 'select_subject'){ return; };
    $('#display-students').trigger('click');
};

async function displayStudentHandler(){
    try{
        // remove the former rows and redisplay 
        $('.student-row').remove();
        if (checkThatOneFieldIsInappropriate()) { console.log('try again'); return; };
        // if all complete, fetch the students for that subjects and populate the table
        const studentsData = await getAllStudentsForSubjectForYearTermClass( getAllSelectBoxData() );

        // display the students in the table
        await displayStudentsInTable( studentsData );
    } catch (error) {
        console.log( error );
    };
};

function getStudentScoreByStudentNo( studentNo : string, scores : Object[] | any[] ) : Object {
    return scores.filter( score => score.Student_No === studentNo )[0]
};

function populateSubjectSelectBox( subjects : string[] | any[] ){
    $('#select-subject').find('.subject-option').remove();
    const fragment = $( document.createDocumentFragment() );
    subjects.forEach( subject => {
        fragment.append($('<option/>',{'text' : subject}).addClass('subject-option'))
    });
    $('#select-subject').append( fragment );
};

/** Functions that invokes the main process */
async function getAllStudentsForSubjectForYearTermClass ( data : Object | any ) : Promise<Object[]> {
    const studentsArray : Object[] = await getAllStudentsByClass( data );
    const studentsOfferingSubject : Object[] = []
    studentsArray.forEach((object : Object | any) => {
        if ( isStudentOfferSubject( object, data.subject ) ){ 
            studentsOfferingSubject.push( object );
            return; 
        };
    });
    return studentsOfferingSubject;
};

async function getAllStudentScoresForSubjectForYearTermClass ( data : Object | any ) : Promise<Object[]> {
    // data contains subjectname, year, term and clazz
    return await ipcRenderer.invoke('student-scores', data );
};

async function getAllStudentsByClass( data : Object | any ) : Promise<Object[]> {
    return await ipcRenderer.invoke('students-for-class', data);
};

async function populateAcademicYear() {
    const fragment = $(document.createDocumentFragment());
    const years : string[] = await ipcRenderer.invoke('academic-years');
    years.forEach((year : string) => {
        const option = $('<option/>',{'text': year});
        fragment.append( option )
    });
    $('#select-year').append( fragment );
}

/** Handlers for the HTML elements */
populateAcademicYear();

$('#select-year').on('change', async function(event){
    await changeHandler();
});

$('#select-term').on('change', async function(event){
    await changeHandler();
});

$('#select-class').on('change', async function(event){
   await changeHandler();
});

$('#select-subject').on('change', function(event){
    if(getSubject() === 'select_subject'){ 
        $('.student-row').remove();
        return; 
    };
    $('#display-students').trigger('click');
});

$('#display-students').on('click', async function(event){
    await displayStudentHandler();
});

$('#save-changes').on('click', async function(event){
        const scores : Object[] = [];

        $('.student-row').each(function(this, index, element){
        // get the student-no, ca score and exam score in an array
        const row = $(this);
        const student_no = row.find('.student_no').first().text().trim();
        const ca_score = row.find('.ca_score-input').first().val()?.toString().trim();
        const exam_score = row.find('.exam_score-input').first().val()?.toString().trim();
        const studentScore = { Student_No : student_no, Ca_Score : ca_score, Exam_Score : exam_score };
        scores.push( studentScore );

    });
    // send a message to the main to save the records
    const done = await ipcRenderer.invoke('update-scores-for-class', scores, getAllSelectBoxData());
});

$('#edit-ca-score').on('click', function(this, event){
    if ( $(this).text() === 'Edit'){
        $('.ca_score-input').each(function(this,index){ console.log($(this).removeAttr('disabled'))});
        $(this).text('Done').css('background-color', 'green'); return;
    }
    // then the text must be 'Done'
    $('.ca_score-input').attr('disabled', 'false');
    $(this).text('Edit').css('background-color', 'blue'); return;
});

$('#edit-exam-score').on('click', function(this, event){
    if ( $(this).text() === 'Edit'){
        $('.exam_score-input').each(function(this,index){ console.log($(this).removeAttr('disabled'))});
        $(this).text('Done').css('background-color', 'green'); return;
    };
    // then the text must be 'Done' 
    $('.exam_score-input').attr('disabled', 'false');
    $(this).text('Edit').css('background-color', 'blue'); return;
});

