export {}

import { ipcRenderer } from "electron";
import jQuery from "jquery";

const $ = jQuery;

var clazz : string = '';
var term : string = '';
var year : string = '';

async function getCurrentSelectedStudentData() : Promise<Object>{
    return await ipcRenderer.invoke('student-profile-data')
};

function populatePassportField(){
    getCurrentSelectedStudentData()
    .then( (data : Object | any) => {
        $('#passport').attr('src', data.Passport_Image);
    });
};

function populatePersonalInfo(){
    getCurrentSelectedStudentData()
    .then( (data : Object ) => fillPersonalDetailsTable( data ));
};

function populateSubjectTable(){
    getCurrentSelectedStudentData()
    .then( (data : Object | any) => {
        const subjects = data.Subject;
        const neatSubjectArray = getNeatSubjectArray( subjects );
        fillSubjectTable( neatSubjectArray );
    });
}

function fillPersonalDetailsTable( data : Object | any ){
    $('#surname-input').val( data.Surname );
    $('#firstname-input').val( data.First_Name );    
    $('#middlename-input').val( data.Middle_Name );    
    $('#student-no').text( data.Student_No );    
    $('#dept-input').val( data.Department );    
    $('#class').text( data.Clazz );    
    $('#gender-input').val( data.Gender );    
    $('#marital-input').val( 'Single' );    
    $('#dob-input').val( data.D_O_B );    
    $('#nationality-input').val( 'Nigeria' );    
    $('#state-input').val( data.State_of_Origin );    
};

function fillSubjectTable( neatSubject : string[] ){
    const fragment = $( document.createDocumentFragment() );
    for (let i = 0; i < neatSubject.length; i++){
        const sn = i + 1;
        const subjectName = neatSubject[i];
        const row = $('<tr/>', {'data-index' : i}).append($('<td/>', {'text': sn, 'class':'sn'}))
                                  .append($('<td/>', {'text': subjectName, 'class':'subject'}))
                                  .append($('<td/>', {'class':'sub-action', 'data-index' : i}).append(createRemoveButton(i)));
        fragment.append( row );
    };

    $('#subjects-table').append( fragment );
    // add event listeners
    $('.remove-btn').on('click', async function(this, event){
        const subjects : string[] = getSubjectsArray(((await getCurrentSelectedStudentData()) as any).Subject);

        $(this).parents('tr').remove();
    });

    $('.remove-btn').attr('disabled','true');
};

function getPossibleChangedData(){
    const state = $('#state-input').val()?.toString().trim() as string;
    const gender = $('#gender-input').val()?.toString().toLowerCase().trim() as string;
    const dept = $('#dept-input').val()?.toString().toLowerCase().trim() as string;

    return {
        Student_No : $('#student-no').text(),
        Surname : $('#surname-input').val()?.toString().toUpperCase().trim(),
        First_Name :  $('#firstname-input').val()?.toString().toUpperCase().trim(),
        Middle_Name : $('#middlename-input').val()?.toString().toUpperCase().trim(),
        Department : dept?.charAt(0).toUpperCase() + dept?.substring(1),
        Gender : gender.charAt(0).toUpperCase() + gender.substring(1),
        D_O_B : $('#dob-input').val()?.toString().toUpperCase().trim(),
        State_of_Origin : state.charAt(0).toUpperCase() + state.substring(1)
    }
}

function fillSubjectList( subjects : string[] ){
    const fragment = $(document.createDocumentFragment() );
    subjects.forEach( subject => {
        const option = $('<option/>', {'text' : subject});
        fragment.append( option )
    });
    $('#select-subject').append( fragment );
}

function populateSubjects(){
    getCurrentSelectedStudentData()
    .then((data : Object | any) => {
        ipcRenderer.invoke('level-subject-names', { clazz: data.clazz, term: data.term, year: data.year })
        .then( subjects =>  { 
            clazz = data.clazz;
            term = data.term;
            year = data.year;
            fillSubjectList( getNeatSubjectArray(subjects.join('#'))) 
        });
    });
};

function createRemoveButton( index : number ){
    return $('<button/>',{'text' : 'Remove', 'class' : 'remove-btn', 'data-index' : index});
};

function getNeatSubjectArray( subjects : string ) : string[] {
    return subjects.split('#')
                   .map( subject => splitSubject( subject ));
};

function createNewSubjectRow( subject : string, position : number  ){
    // return $('<tr/>', {}).append($('<td/>',{'text': position, 'class': 'sn'}))
    //                      .append($('<td/>',{'text': subject}))
    return $('<tr/>', {'data-index' : position - 1}).append($('<td/>', {'text': position, 'class':'sn'}))
    .append($('<td/>', {'text': subject, 'class':'subject'}))
    .append($('<td/>', {'class':'sub-action', 'data-index' : position - 1}).append(createRemoveButton(position - 1 )));
}

function getCurrentSubjectList(){
    const list : string[] = [];
    $('#subjects-table').find('.subject').each( function(this, index, element){
        list.push( $(this).text().trim());
    });
    return list;
}

function getDatatabaseInfo(){
    return {
        clazz : clazz,
        term : term,
        year : year
    };
}

function splitSubject( subject : string ) : string {
    return subject.split('_').map( token => token.charAt(0).toUpperCase() + token.substring(1) ).join(' ');
}

function getSubjectsArray( subjects : string ){
    return subjects.split('#');
};

function selectSubjectChangeHandler(){
    $('#select-subject').on('change', async function( this, event ){
        if($(this).val()?.toString().toLowerCase() === 'select a registered subject'){ return; };
        const numOfSubjects : number = $('#subjects-table').find('tr').length;
        if( getCurrentSubjectList().includes($(this).val() as string) ){ 
            await ipcRenderer.invoke('show-dialog', {
                message: 'Student already offering subject',
                title: 'Error',
                type: 'error'
            });
            return; 
        };
        const newSubjectRow = createNewSubjectRow( $(this).val() as string, (numOfSubjects));
        $('#subjects-table').append( newSubjectRow );
    });
}

function saveChangesHandler(){
    $('#save-changes').on('click', function( save ){
        //invoke the main method to save the update
        const subjectString : string = getCurrentSubjectList().map( subject => subject.split(' ').join('_').toLowerCase()).join('#');

        const updatePayload = {
            ...getPossibleChangedData(),
            Subject : subjectString,
            data : getDatatabaseInfo(),
        };

        ipcRenderer.invoke('update-student-data', updatePayload);
    });
}

function editButtonHandler(){
    $('input').attr('disabled','true');
    $('.remove-btn').attr('disabled','true');

    $('#edit-button').on('click', function(this, event){
        if ($(this).text().trim() === 'Edit'){
            $('input').removeAttr('disabled');
            $('.remove-btn').removeAttr('disabled');
            $(this).text('Done'); return;
        }
        $('input').attr('disabled', 'true');
        $('.remove-btn').attr('disabled','true');
        $(this).text('Edit'); return;
    });
}

document.body.onload = function(){
    populatePassportField();
    populatePersonalInfo();
    populateSubjectTable();
    populateSubjects();
    selectSubjectChangeHandler();
    saveChangesHandler();
    editButtonHandler();
}