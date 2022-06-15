 export {} 

 import { ipcRenderer } from "electron";
 import jQuery from "jquery";

 const $ = jQuery;

 var index : number;
 var studentRowToRemove: JQuery<HTMLTableRowElement>;

 $('#edit-passport-file').on('change', function(this : HTMLElement, event){
    const file = Object(this as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.readAsDataURL( file );
    reader.onload = function(event){
        const passportCol = $('#student-table').find('tr').eq( index ).find('td').eq(1);
        const studentNo = $('#student-table').find('tr').eq( index ).find('td').eq(2).text().trim();

        passportCol.find('.passport-img').first().attr('src', reader.result as string);
        
        const data = {
            ...getAllSelectBoxData(),
            Student_No : studentNo,
            Passport_Image : reader.result as string
        };

        ipcRenderer.invoke('update-student-passport-in-class', data);
    }
 });

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
        clazz : getClass()
    };
};

function getSurnameLine( surname : string ){
    return $('<div/>', {}).append($('<span/>', {'text': 'Surname'}), $('<span/>', {'text': surname, 'class' : 'surname'}));
};

function getFirstNameLine( firstname : string ){
    return $('<div/>', {}).append($('<span/>', {'text': 'First Name'}), $('<span/>', {'text': firstname, 'class' : 'firstname'}));
};

function getMiddleNameLine ( middlename : string ){
    return $('<div/>', {}).append($('<span/>', {'text': 'Middle Name : '}), $('<span/>', {'text': middlename, 'class' : 'middlename'}));
};

function getDepartmentLine( dept : string ){
    return $('<div/>', {}).append($('<span/>', {'text': 'Department : '}), $('<span/>', {'text': dept, 'class' : 'dept'}));
};

function getGenderLine( gender : string ){
    return $('<div/>', {}).append($('<span/>', {'text': 'Gender : '}), $('<span/>', {'text': gender, 'class' : 'gender'}));    
};

function getFullNameLine( fullname : string ){
    return $('<div/>', {}).append($('<span/>', {'text': 'Fullname : '}), $('<span/>', {'text': fullname, 'class' : 'fullname'}));  
};

function getEditAndViewPassportLine(index : string ){
    return $('<div/>',{'class': 'top-line-btn'}).append($('<button/>',{'text':'Edit passport', 'class':'edit-passport'}).attr('data-index', index), 
    $('<button/>',{'text':'View student', 'class':'view-student'}).attr('data-index', index));
};


function getRemoveStudentLine(index : string){
    return $('<div/>',{'class':'bottom-line-btn'}).append($('<button/>',{'text':'Remove student', 'class':'remove-student'}).attr('data-index', index));
};

function  getDescriptionColumn( data : Object | any ){
    const fullname = [data.Surname, data.First_Name, data.Middle_Name].join(' ');
    
    return $('<div/>',{'class':'desc'}).append( getFullNameLine( fullname ))
                            //   .append( getSurnameLine( data.Surname ))
                            //   .append( getFirstNameLine( data.First_Name ))
                            //   .append( getMiddleNameLine( data.Middle_Name ))
                              .append( getDepartmentLine( data.Department ))
                              .append( getGenderLine( data.Gender ));
}

function getActionColumn( index : string ){
    return $('<div/>',{}).append( getEditAndViewPassportLine(index) )
                        //  .append( getViewStudentLine() )
                         .append( getRemoveStudentLine( index) );
};

function createStudentRow( data : Object | any ) {
    return $('<tr/>',{'class':'row'}).append($('<td/>', { 'text' : data.Serial_No, 'class' : 'sn'}))
                             .append($('<td/>', {'class' : 'passport'}).append($('<img/>', {'class' : 'passport-img'}).attr('src', data.Passport_Image)))
                             .append($('<td/>', { 'text' : data.Student_No, 'class' : 'sn'}))
                             .append($('<td/>', {}).append( getDescriptionColumn( data ) ))
                             .append($('<td/>', {'class':'action-col'}).append( getActionColumn( data.Serial_No )));
}

function attachClickEditButtonHandler(){
    $('.edit-passport').on('click', function(this, event){
        var indes = Number($(this).attr('data-index'));
        index = indes;
        console.log( index );
        $('#edit-passport-file').trigger('click');
    });
};

function attachClickViewStudentHandler(){
    $('.view-student').on('click', function(this, event){
        const index = Number($(this).attr('data-index'))
        const studentNo = $('#student-table').find('tr').eq( index ).find('td').eq(2).text().trim();
        // get the student details and send it to the main process to load the student profile page

        ipcRenderer.invoke('students-for-class', getAllSelectBoxData())
        .then( async (students : Object[] | any[]) => {
            var student = {};
            for (let i = 0; i < students.length; i++){
                if ( students[i].Student_No === studentNo ){ student = students[i]; break; };
            };
            await ipcRenderer.invoke('student-page', student, getAllSelectBoxData() );
        }).catch(error => console.log(error));
    });
}

function attachRemoveStudentHandler() {
    $('.remove-student').on('click', function(this, event){
        const index = Number($(this).attr('data-index'));
        const studentNo = $('#student-table').find('tr').eq( index ).find('td').eq(2).text().trim();
        const rowToRemove = $('#student-table').find('tr').eq( index );
        // send to the main process to remove and listen to the returned for removal from dom
        const data = {
            ...getAllSelectBoxData(),
            Student_No : studentNo,
            // row : rowToRemove
        }
        studentRowToRemove = rowToRemove;
        ipcRenderer.invoke('delete-student-from-class', data);
    });
};

async function getAllStudentsByClass( payload : Object | any) : Promise<Object> {
    return await ipcRenderer.invoke('students-for-class', payload);
};



// The handler when the class selection changes
$('#select-class').on('change', async function(event){
    const studentsData : Object | any  = await getAllStudentsByClass( getAllSelectBoxData() );
    const fragment = $(document.createDocumentFragment());
    for( let i = 0; i < studentsData.length; i++){
        const data = studentsData[i];
        data.Serial_No = i + 1;
        const row = createStudentRow( data );
        fragment.append( row );
    };
    // clear the student-table first
    $('.row').remove();
    
    $('#student-table').append( fragment );

    // add event handlers
    attachClickEditButtonHandler();
    attachClickViewStudentHandler(); 
    attachRemoveStudentHandler();   
});

// Listeners to main
ipcRenderer.on('delete-student-done', function( event){
    studentRowToRemove.remove();
});