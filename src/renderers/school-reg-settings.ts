import { ipcRenderer } from "electron";
import jQuery from 'jquery'
import fs from 'fs';
        
let logo = '';

const $ = jQuery;

  
        getAllSchoolDataFromDataStore().then( data => {
            console.log( data );
            setSchoolName( data.name );
            setSchoolMotto( data.motto );
            setSchoolAddress( data.address );
            setSchoolLogo( data.logo );
            setAllEmail( data.email );
            setAllMobile( data.telephone );
            logo = data.logo;
        });

        // GETTERs And SETTERS
        function getSchoolName () {
            return compressSingly($('#school-name').val()?.toString().trim() as string , ' ')
        }

        function setSchoolName ( name : string ) {
            $('#school-name').val( name );
        }

        function getSchoolMotto() {
            const mottoInput : string  =  $('#school-motto').val()?.toString().trim().toString().toLowerCase() as string;
            return mottoInput.charAt(0).toUpperCase() + mottoInput.substring(1);
        }

        function setSchoolMotto( motto : string ) {
            $('#school-motto').val( motto );
        }

        function getSchoolAddress() {
            return compressSingly( $('#school-address').val()?.toString().trim().toString() as string, ', ');
        }

        function setSchoolAddress( address : string ) {
            $('#school-address').val( address )
        };

        function getSchoolLogo () {
            return logo.toString().trim();
        }

        function setSchoolLogo ( logo : string ){
            $('#school-logo-img').attr('src', logo)
        }

        function getAllEmail() {
            const emails : string[]  = [];
            $('.email-input').each(function(index, element){
                emails.push( $( element ).val()?.toString().trim() as string );
            });
            return emails.join('#');
        }

        function setAllEmail ( emailString : string ) {
            // remove all the email inputs 
            $('.email-input .email-trash').remove();
            // get the arrays of the emails
            const emailArray = emailString.split('#').filter((email) => email !== '');
            const fragment = $( document.createDocumentFragment() );

            emailArray.forEach((email) => {
                const newSection = $('<div/>', { 'class' : 'email-input-inner-container' })
                const input = $('<input/>', { 'class' : 'email-input' });
                input.val( email );
                input.attr('disabled', 'true');
                input.attr('type', 'text');
                const trashButton = $('<button/>', { 'class' : 'email-trash trash', 'text' : 'Trash' });
                const editButton = $('<input/>', { 'class' : 'email-edit edit', 'value' : 'Edit', 'type' :'button' });
                newSection.append( input, editButton, trashButton );
                // append it to the outer section
                fragment.append( newSection );
            });

            $('#email-outer-section').append( fragment );
        }

        function setAllMobile( mobileString : string ){
            // remove all mobile input
            $('.mobile-input .mobile-trash').remove();
            const mobileArray = mobileString.split('#').filter((mobile) => mobile !== '');
            console.log( mobileArray );
            const fragment = $( document.createDocumentFragment() );

            mobileArray.forEach( (mobile) => {
                // create a new email entry section
                const newSection = $('<div/>', { 'class' : 'mobile-input-inner-container' })
                const input = $('<input/>', { 'class' : 'mobile-input' });
                input.attr('type', 'number');
                input.attr('disabled', 'true');
                input.val( mobile );
                const trashButton = $('<button/>', { 'class' : 'mobile-trash', 'text' : 'Trash' });
                const editButton = $('<input/>', { 'class' : 'email-edit edit', 'value' : 'Edit', 'type' :'button' });
                newSection.append( input, editButton, trashButton );
                // append it to the outer section
                fragment.append( newSection );
            });

            $('#mobile-section').append( fragment );
        }

        function getAllMobileNo () {
            const mobiles : string[] = [];
            $('.mobile-input').each(function(index, element){
                mobiles.push( $( element ).val()?.toString().trim() as string );
            });
            return mobiles.join('#');
        }

        function getAllDataForUpdate(){
            return {
                name : getSchoolName(),
                motto : getSchoolMotto(),
                address : getSchoolAddress(),
                logo : getSchoolLogo(),
                email: getAllEmail(),
                telephone : getAllMobileNo()
            }
        }

        function compressSingly( value : string , delimiter : string ) {
            value = value.trim();
            return value.split( delimiter ).filter((token) => token !== '').map((token) => token.charAt(0).toUpperCase() + token.substring(1).toLowerCase()).join( delimiter );
        }

        async function getAllSchoolDataFromDataStore() {
            const datas = await ipcRenderer.invoke('get-school-data-from-data-store');
            return datas;
        };

        // Handler for the addtion of email address
        $('#email-add').on('click', function( event ){
            // create a new email entry section
            const newSection = $('<div/>', { 'class' : 'email-input-inner-container' })
            const input = $('<input/>', { 'class' : 'email-input' });
            input.attr('placeholder', 'Enter email address');
            input.attr('type', 'text');
            input.attr('disabled', 'true');
            const editButton = $('<input/>', { 'class' : 'email-edit edit', 'value' : 'Edit', 'type' :'button' });
            const trashButton = $('<button/>', { 'class' : 'email-trash trash', 'text' : 'Trash' });
            newSection.append( input, editButton, trashButton );
            // append it to the outer section
            $('#email-outer-section').append( newSection );
        });

                // Handler for the addtion of mobile 
        $('#mobile-add').on('click', function( event ){
            // create a new email entry section
            const newSection = $('<div/>', { 'class' : 'mobile-input-inner-container' })
            const input = $('<input/>', { 'class' : 'mobile-input' });
            input.attr('placeholder', 'Enter mobile no.');
            input.attr('type', 'number');
            input.attr('disabled', 'true');
            const editButton = $('<input/>', { 'class' : 'email-edit edit', 'value' : 'Edit', 'type' :'button' });
            const trashButton = $('<button/>', { 'class' : 'mobile-trash', 'text' : 'Trash' });
            newSection.append( input, editButton, trashButton );
            // append it to the outer section
            $('#mobile-section').append( newSection );
        });

        // Handler for the trash of email address
        $('body').on('click', '.trash', async function( event ){
            const button = $( event.target );

            // // get the corresponding email
            // const emailText = button.parent().find('input').val().trim().toString();

            // // tell the main to ensure that the user really wants to delete the email address.
            // await ipcRenderer.invoke('delete-email', emailText);

            // get the parent div of this button and remove it from the dom
            $( event.target ).parent().remove();
        });

        // Handler for the trash of telephone
        $('body').on('click', '.mobile-trash', async function( event ){
            const button = $( event.target );
            // // get the corresponding email
            // const emailText = button.parent().find('input').val().trim().toString();

            // // tell the main to ensure that the user really wants to delete the email address.
            // await ipcRenderer.invoke('delete-email', emailText);

            // // get the parent div of this button and remove it from the dom
            $( event.target ).parent().remove();
        });

        $('#save').on('click', async function( event ){
            const payload = getAllDataForUpdate();
            console.log( payload )
            // update the database of the school with the new data collected. This is a stateless update.
            await ipcRenderer.invoke('update-school-data', payload );
            // console.log( getAllDataForUpdate() );
        });

        $('#school-logo-selector').on('change', function( event ){
            // get the file selected 
            const imageFile = Object(event.target).files[0];
            console.log( imageFile );
            // Read the base64 string of the file
            const fileReader = new FileReader();

            fileReader.onload = function( event ){
                logo = fileReader.result as string;
                $('#school-logo-img').attr('src', logo.toString().trim());
            }

            fileReader.readAsDataURL( imageFile );
        });


// functionality for the button to add more grade scheme to the grade table
$('#add-grade').on('click', function( event ){
    // create the inputs
    const gradeTextinput = $('<input/>', {'type':'text'});
    const lowerinput = $('<input/>', {'type':'number'});
    const higherInput = $('<input/>', {'type':'number'});
    const scoreinput = $('<input/>', {'type':'text'});

    const gradeText = $('<td/>', {'class' : 'g'}).append( gradeTextinput);
    const lowerScore = $('<td/>', {'class' : 'ls'}).append(lowerinput);
    const higherScore = $('<td/>', {'class' : 'hs'}).append(higherInput);
    const scoreRemark = $('<td/>', {'class' : 'r'}).append(scoreinput);

    const editBtn = $('<input/>', {'type':'button', 'value':'Edit'});
    const trashBtn = $('<input/>', {'type':'button', 'value':'Trash'});

    const buttonContainer = $('<td/>').append($('<span/>').append( editBtn, trashBtn));
    
    // create the row
    const row = $('<tr>', {'class':'grade-row'}).append( gradeText, lowerScore, higherScore, scoreRemark, buttonContainer );

    // handler for the edit and the trash buttons
    editBtn.on('click', function( this, event){
        if( $( this ).val()?.toString().trim() === 'Edit' ){ 
            [gradeTextinput, lowerinput, higherInput, scoreinput].forEach((input : JQuery<HTMLElement>) => input.removeAttr('disabled'));
            $( this ).val('Done'); return;          // change the text to 'Done'
        }
        // else the text on it must be 'Done'
        [gradeTextinput, lowerinput, higherInput, scoreinput].forEach((input : JQuery<HTMLElement>) => input.attr('disabled','true'));
        $( this ).val('Edit'); return;   
    });

    trashBtn.on('click', function( this, event ){
        row.remove();
    });
    // append it to the table
    $('#grade-table').append( row );

});

$('#grade-save').on('click', async function( this, event ){
    const gradeMap : Map<string, Object> = new Map();

    $('.grade-row').each(function(this, index, element){
        const grade : string = $( this).find('.g').find('input').val()?.toString().trim() as string ;
        const lowerScore = $( this).find('.ls').find('input').val()?.toString().trim();
        const higherScore = $( this).find('.hs').find('input').val()?.toString().trim();
        const remarks = $( this).find('.r').find('input').val()?.toString().trim();

        const payload : Object = {
            grade : grade,
            lowerScoreRange : Number(lowerScore),
            higherScoreRange : Number(higherScore),
            remarks : remarks
        };

        gradeMap.set( grade , payload );
    });

    await ipcRenderer.invoke('update-grade-system', gradeMap);
});





       // by default, all inputs should be disabled from editing, until the edit button is clicked
       $('input').attr('disabled', 'true');
       $('input[type=button]').removeAttr('disabled');

       $('body').on('click', '.edit', function( event ){
            const buttonPressed = $( event.target );
            buttonPressed.parent().find('input').removeAttr('disabled');
            if( (buttonPressed.val() as string).trim() === 'Edit' ){
                buttonPressed.parent().find('input').removeAttr('disabled');
                buttonPressed.val('Done');
            }
            else{
                buttonPressed.parent().find('input[type=text], input[type=number]').attr('disabled', 'true');
                buttonPressed.val('Edit');
            }
            return;
       });


function addGradeElement( gradeObject : Object | any ){
    // create the inputs
    const gradeTextinput = $('<input/>', {'type':'text', 'value' : gradeObject.Grade as string });
    const lowerinput = $('<input/>', {'type':'number', 'value' : gradeObject.Lower_Score_Range });
    const higherInput = $('<input/>', {'type':'number', 'value' : gradeObject.Higher_Score_Range });
    const scoreinput = $('<input/>', {'type':'text', 'value' : gradeObject.Remarks });

    const gradeText = $('<td/>', {'class' : 'g'}).append( gradeTextinput);
    const lowerScore = $('<td/>', {'class' : 'ls'}).append(lowerinput);
    const higherScore = $('<td/>', {'class' : 'hs'}).append(higherInput);
    const scoreRemark = $('<td/>', {'class' : 'r'}).append(scoreinput);

    const editBtn = $('<input/>', {'type':'button', 'value':'Edit'});
    const trashBtn = $('<input/>', {'type':'button', 'value':'Trash'});

    const buttonContainer = $('<td/>').append($('<span/>').append( editBtn, trashBtn));
    
    // create the row
    const row = $('<tr>', {'class':'grade-row'}).append( gradeText, lowerScore, higherScore, scoreRemark, buttonContainer );

    // handler for the edit and the trash buttons
    editBtn.on('click', function( this, event){
        if( $( this ).val()?.toString().trim() === 'Edit' ){ 
            [gradeTextinput, lowerinput, higherInput, scoreinput].forEach((input : JQuery<HTMLElement>) => input.removeAttr('disabled'));
            $( this ).val('Done'); return;          // change the text to 'Done'
        }
        // else the text on it must be 'Done'
        [gradeTextinput, lowerinput, higherInput, scoreinput].forEach((input : JQuery<HTMLElement>) => input.attr('disabled','true'));
        $( this ).val('Edit'); return;   
    });

    trashBtn.on('click', function( this, event ){
        row.remove();
    });
    // append it to the table
    $('#grade-table').append( row );

}

// populate the academic grade system.
async function populateAcademicGradeSystem() {
    // get the grade system object from the database
    const gradeObjectArray : Object[] = await ipcRenderer.invoke('get-grade-system');

    for( const gradeObject of gradeObjectArray ){
        addGradeElement( gradeObject );
    }
}

$('.domain-edit').on('click', function( this, event ){
    if( $( this ).val()?.toString().trim() === 'Edit'){
        const d = $( this ).parent().parent().find('input[type=number]').first().removeAttr('disabled');
        $( this ).val('Done'); return;
    }
    $( this ).parent().parent().find('input[type=number]').first().attr('disabled', 'true');
    $( this ).val('Edit'); return;
});

$('.color').each( function( this, index, element ){
    $( this ).removeAttr('disabled');
});

populateAcademicGradeSystem();

function getNoFileChoosenError() : Object{
    return {
        message : 'Cannot save empty file. Select a file to continue. Click the Browse button below to continue.',
        title : '  File selection error',
        type: 'error'
    };
}

function getInvalidFileExtensionError() : Object {
    return {
        message : 'Cannot process file choosen. The file extension is not compatible with the required types.\n\nThe required types are PDF(.pdf), Word(.docx) or Text(.txt)',
        title : '  Invalid file extension error',
        type: 'error'
    };
}

// Function to validate the input before submission
 async function validateCommentInput() : Promise<boolean> {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const teacherCommentInput : string = $('#teacher-input').val()?.toString().trim() as string;
    const principalCommentInput : string = $('#principal-input').val()?.toString().trim() as string;
    
    const teacherCommentFileExtension : string = teacherCommentInput.substring( teacherCommentInput.lastIndexOf('.'));
    const principalCommentFileExtension : string = principalCommentInput.substring( principalCommentInput.lastIndexOf('.'));

    let isValid : boolean = true;
    if( teacherCommentInput.length === 0 ){
        await ipcRenderer.invoke('show-dialog', getNoFileChoosenError()); 
        isValid = false; return false;
    }
    if( principalCommentInput.length === 0 ) {
        await ipcRenderer.invoke('show-dialog', getNoFileChoosenError()); 
        isValid = false; return false; 
    }
    if( !validExtensions.includes( teacherCommentFileExtension ) 
        || !validExtensions.includes( principalCommentFileExtension )){
            await ipcRenderer.invoke('show-dialog', getInvalidFileExtensionError());
            isValid = false;
        }
    return isValid;
}


// function to validate the appropriacy of the file before submission to the main process
async function validateFileAppropriate( who : string, commentPath : string ) : Promise<boolean> {
    let allRight : boolean = true;

    // call the main process to return all the lines of the file
    const lines : string[] = await ipcRenderer.invoke('get-file-lines', commentPath);
    const invalidLines : number[] = [];

    for( let i = 0; i < lines.length; i++ ){
        const line = lines[i];
        const lineNumber = i;
        if( !line.startsWith('@comment') ){ invalidLines.push( lineNumber ); };
    }

    if( invalidLines.length > 0 ){
        await ipcRenderer.invoke('show-dialog', {
            message : 'Some lines of the selected files for the ' + who + 'comments ' +  'are not well formatted. Each new line of comment must start with the " @comment" annotation!\n\nThe invalid lines are: ' + invalidLines.join(', ') + `\nAdd the '@comment' annotation on each of these faulty lines and try again.`,
            title: '  Invalid formatting of file.',
            type : 'error'
        }); 
        allRight = false; return false; 
    };

    return allRight;
}

/**
 * Sections for the academic report sheet commenting
 */
// Functions for the browse button
$('.browse').on('click', async function( this, event ){
    const file = { desc : 'Files', media : ['pdf', 'docx', 'txt'] };
    // call the ipcRenderer to show the directoryt choose 
    const selectedFolder : string =  await ipcRenderer.invoke('show-file', file );
    //display on the input element
    $( this ).parent().parent().find('input[type=text]').first().val( selectedFolder );
});

$('.comment-save').on('click', async function( this, event ){

    const teacherCommentInput : string = $('#teacher-input').val()?.toString().trim() as string;
    const principalCommentInput : string = $('#principal-input').val()?.toString().trim() as string;

    // send to the main process to save the data in the database.
    // const done : boolean =  await validateCommentInput();
    // const appropriateTeacher : boolean = await validateFileAppropriate('teacher', teacherCommentInput);
    // const appropriatePrincipal : boolean = await validateFileAppropriate('principal', principalCommentInput);

    // tell the main process to get all the lines 
    const teacherLines : string[] = await ipcRenderer.invoke('get-file-lines', teacherCommentInput);
    const principalLines : string[] = await ipcRenderer.invoke('get-file-lines', principalCommentInput);


    // tell the main process to send to the database
    await ipcRenderer.invoke('save-comments', teacherLines.join('#'), principalLines.join('#'));
    return;
});


$('#color-save').on('click', function( event ){
    const colors : string[] = [$('#first-color').val()?.toString().trim() as string, $('#second-color').val()?.toString().trim() as string, $('#third-color').val()?.toString().trim() as string];
    console.log( colors.join('&') );
});
