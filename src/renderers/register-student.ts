export {}

import { ipcRenderer, BrowserWindow } from 'electron';
import jQuery from "jquery";

const $ = jQuery;

/** CONSTANT  */
var subjectObjectArray: any;


                                    /** FUNCTIONS  */
function getNameObjectLiteral() : Object | any {
    const nameObjectLiteral : Object | any  = {};
    $('.names').each( function(this : HTMLElement, index : number, element : HTMLElement){
        var currentEle = $(this)
        switch( currentEle.attr('id') ){
            case 'surname' : nameObjectLiteral.surname = currentEle.val()?.toString().trim(); return;
            case 'first-name' : nameObjectLiteral.firstName = currentEle.val()?.toString().trim(); return;
            case 'middle-name' : nameObjectLiteral.middleName  = currentEle.val()?.toString().trim(); return;
        };
    });
    return nameObjectLiteral;
};

function getPersonalDetailsObjectLiteral() : Object | any {
    const personalDetailsObjectLiteral : Object | any = {};
    personalDetailsObjectLiteral.gender = 'none';
    $('.gender-option').each( function(index, element){
        if ( Object(element).checked ){
            personalDetailsObjectLiteral.gender = $( element ).val()?.toString().trim();
        };
    });
    personalDetailsObjectLiteral.dateOfBirth = $('#dob').val()?.toString().trim();
    personalDetailsObjectLiteral.stateOfOrigin = $('#state').val()?.toString().trim();
    return personalDetailsObjectLiteral;
};

async function getSchoolDetailsObjectLiteral() : Promise<Object | any> {
    const clazz : string = $('#select-class').val()?.toString().toLowerCase().trim() as string;
    const department : string = $('#select-department').val()?.toString().toLowerCase().trim() as string;

    //Invoke the Main process to generate a StudentNo for the current student, updating the variable above
    const studentId = await generateNewStudentId();
    const payload = { date: new Date(), department : department, id: studentId };
    const studentNo = await generateStudentNoFromMain( payload );

    return {
        clazz : clazz,
        department : department,
        studentNo : studentNo,
        passport: $('#passport').attr('src'),
        admissionYear : new Date().getFullYear().toString()
    };
}

function getSubjectsArray() : string[] {
    const subjectArray: string[] = [];
    $("input[type='checkbox']").each(function(index, element){
        if(Object(element).checked) {
            const overallParent = element.parentElement?.parentElement; 
            const subject : string = compress($(Object(overallParent)).find('label').text().toLowerCase().trim()) as string;
            subjectArray.push(subject) 
        };
    });
    return subjectArray;
};

function compressSubject( subject : string ){
    return subject.split(' ').filter(token => token !== ' ').join('');
};

function getAllSubjectCompressed(){
    return getSubjectsArray().join('#');
};

function compressClass( clazz : string ) : string {
    return clazz.split(' ').join('');
};

function compress( value : string ) : string {
    value = value.trim();       // first trim the incoming string to sanitize it
    if ( !value.includes(' ') ) { return value; };
    return value.split(' ').filter( entry => entry !== '').join('_');
};

async function getStudentObjectAndSendToMain(){
    const name = getNameObjectLiteral();
    const personalDetails = getPersonalDetailsObjectLiteral();
    const schoolDetails = await getSchoolDetailsObjectLiteral();
    const subjectsString = getAllSubjectCompressed();
    const databaseInfo = {
        year : $('#select-year').val()?.toString().trim(),
        term : compress($('#select-term').val()?.toString().toLowerCase().trim() as string),
        clazz : compressClass(schoolDetails.clazz)
    };

    const studentObjectLiteral = {
        data : databaseInfo,
        name : name,
        personalDetails : personalDetails,
        schoolDetails : schoolDetails,
        subjects : subjectsString
    };
    return studentObjectLiteral;
};

function getClassDatabaseInfo() : Object {
    return {
        year : $('#select-year').val()?.toString().trim(),
        term : compress($('#select-term').val()?.toString().toLowerCase().trim() as string),
        clazz : compressClass($('#select-class').val()?.toString().toLowerCase().trim() as string)
    };
};

async function populateSelectYearBox(): Promise<void>{
    const academicYearsArray = await getAllRegisteredAcademicYears();
    const fragment = $(document.createDocumentFragment());
    academicYearsArray.forEach( year => {
        const option = $('<option />',{ 'text' : year });
        fragment.append( option );
    });
    console.log(fragment)
    $('#select-year').append( fragment );
};

async function initiateSubjectObjectVariable() : Promise<void>{
    const databaseInfo = getClassDatabaseInfo();
    subjectObjectArray = await ipcRenderer.invoke('all-subjects-object', databaseInfo);
    console.log(subjectObjectArray)
};

function expand( value : string ) : string {
    value = value.trim();
    return value.split('_')
    .map( (token : string) => token.charAt(0).toUpperCase() + token.substring(1))
    .join(' ');
}

async function implementOnchangeOfClassSelectBox() : Promise<void>{
    $('#select-class').on('change', async function(event){

        // //first clear out everything from the subjects
        $('.subject-section-inner').remove();

        const databaseInfo = getClassDatabaseInfo();
        subjectObjectArray = await ipcRenderer.invoke('all-subjects-object', databaseInfo);
        // create  divs
        const subjectNames = subjectObjectArray.map((object : any) => {
            return object.Subject_Name;
        });

        let i = 0;
        while(i < subjectNames.length){
            const parent1 = $('<div/>',{});
            const first1 = $('<div/>',{}).append($('<input/>',{ 'type':'checkbox'}));
            const second1 = $('<div/>',{'class':'subject-label'}).append($('<label/>',{'text': expand(subjectNames[i])}));
            parent1.addClass('subject-section-inner').append(first1, second1);
            $('#subject-section-left').append(parent1);

            if ((i + 1) >= subjectNames.length) { break; };
            const parent2 = $('<div/>',{});
            const first2 = $('<div/>',{}).append($('<input/>',{ 'type':'checkbox'}));
            const second2 = $('<div/>',{'class':'subject-label'}).append($('<label/>',{'text': expand(subjectNames[i + 1])}));
            parent2.addClass('subject-section-inner').append(first2, second2);
            $('#subject-section-center').append(parent2);
            
            if ((i + 2) >= subjectNames.length) { break; };
            const parent3 = $('<div/>',{});
            const first3 = $('<div/>',{}).append($('<input/>',{ 'type':'checkbox'}));
            const second3 = $('<div/>',{'class':'subject-label'}).append($('<label/>',{'text': expand(subjectNames[i + 2])}));
            parent3.addClass('subject-section-inner').append(first3, second3);
            $('#subject-section-right').append(parent3);

            i = i+3;
        };
         
    });
};

/** fFunctions that invokes the main process */
async function generateStudentNoFromMain( payload : Object ) : Promise<string> {
    return (await ipcRenderer.invoke('student-no', payload));
};

async function getTotalNumberOfStudentsInDatabase(): Promise<number> {
    const payload = { ...getClassDatabaseInfo() };
    return (await ipcRenderer.invoke('count-of-students', payload ));
};

async function generateNewStudentId() : Promise<number> {
    return (await getTotalNumberOfStudentsInDatabase()) + 1;
};

async function saveNewStudent( studentObjectLiteral : Object ) : Promise<Boolean> {
    return (await ipcRenderer.invoke('save-student', studentObjectLiteral));
};

async function getAllRegisteredAcademicYears() : Promise<string[]> {
    return await ipcRenderer.invoke('academic-years');
};

// erroInfo = message and title and type
async function showDialogSync( payload : Object ) : Promise<number> {
    return  await ipcRenderer.invoke('show-dialog', payload);
};

/** Document Element Handlers */
document.body.onload = async function(event){
    await populateSelectYearBox();
    await initiateSubjectObjectVariable();
    await implementOnchangeOfClassSelectBox();
    $('#select-department').attr('disabled','disabled');
};

$('#select-passport-btn').on('click', function(){
    // trigger the file input click handler
    $('#select-passport').trigger('click');
});

$('#select-passport').on('change', function(){
    const imageFile = Object(document.getElementById('select-passport')).files[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(imageFile);
    fileReader.onload = function(event){
        $('#passport').attr('src', fileReader.result as string);
        $('#passport').css('display','block');
    };
});

$('#select-class').on('change', function(event){
    if( $('#select-class').val()?.toString().includes('JSS')){
        //clear everything about the senior department
        $('.j').remove();
        $('.s').remove();
        $('#select-department').append($('<option/>',{'text':'None'}).addClass('j'))
                               .attr('disabled', 'disabled');
        return;
    };
    if ($('#select-class').val()?.toString().includes('SSS')){
        //clear everything about the junior and add back the senior
        $('.j').remove();
        $('.s').remove();
        $('#select-department').append($('<option/>',{'text':'Science'}).addClass('s'))
                               .append($('<option/>',{'text':'Commercial'}).addClass('s'))
                               .append($('<option/>',{'text':'Arts'}).addClass('s'))
                               .removeAttr('disabled');
        return;
    };
});

$('#reset-btn').on('click', function(event){
    event?.preventDefault();
    window.location.reload();
});

$('#form').on('submit', function(){

    getStudentObjectAndSendToMain()
    .then(async studentObjectLiteral => {
        
        if($('#select-class').val()?.toString().trim() === 'Select class'){
            await showDialogSync({
                message : 'Please select a class for the student',
                title : 'Error',
                type : 'error'
            }); return;
        }; 

        const done = await saveNewStudent( studentObjectLiteral );
        return done;
    })
    .then( async success => {
        if ( success ) {
            await showDialogSync({
                message : 'Successful registration of student',
                title : 'Success',
                type : 'info'
            });
            window.location.reload();
            return;
        }
        await showDialogSync({
            message : 'Error while trying to save student.',
            title : 'Error',
            type : 'error'
        });
    })
    .catch(error => console.log('could not save student.'))
    .finally(()=> console.log('Handled'));

    return false;
});


