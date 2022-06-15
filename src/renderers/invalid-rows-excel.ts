
import { ipcRenderer } from "electron";
import jQuery from 'jquery';

const $ = jQuery;

var rvalids : Object[];
var rinvalids : Object[];
var rpayload : Object[];

ipcRenderer.on('show-invalid-rows-excel', function(event, validObjects, invalidObjects : Object[], payload){
    rvalids = validObjects;
    rinvalids = invalidObjects;
    rpayload = payload;
    
    console.log( rinvalids ); //
    console.log(rvalids);//

    const content = $('#content');

    const subjectErrors : JQuery<HTMLElement>[] = [];

    invalidObjects.forEach((object : object | any) =>{
        const subjectHeader = createSubjectHeader( object );
        const subjectErrorDiv = $('<div/>',{});
        subjectErrorDiv.append( subjectHeader );

        const subjectName = Object.keys( object )[0];
        const invalidRows = object[subjectName].invalidRows;

        invalidRows.forEach( (errorObject : Object | any) => {
            subjectErrorDiv.append( getSegmentOfFullError( errorObject ));
        });

        subjectErrors.push( subjectErrorDiv );
    });

    subjectErrors.forEach((subjectError) => content.append(subjectError));

});

function createSubjectHeader( subjectObject : Object | any ) : JQuery<HTMLDivElement> {
    const subjectName = expand(Object.keys(subjectObject)[0]);
    return $('<div/>',{'text' : subjectName, 'class' : 'subject-header'});
};



function getHeaderOfErrorBox( rowNumber : number ) {
    return $('<div/>', {'text': 'Row number : ' + rowNumber, 'class' :'row-number'})
};

function getComponentErrorBox( error : Object | any ) : any[] {
    const allErrors : JQuery<HTMLDivElement>[] | any = [];
    // get the keys of the object
    const keys = Object.keys( error );
    keys.forEach( key => {
        const message = getAppropriateMessageFromKey( key )
        const div = $('<div/>', {'text' : message + ' : ' + error[key], 'class' : 'message'});
        allErrors.push( div );
    });
    return allErrors;
}

function getOverallErrorComponent( error : Object | any ){
    const overall = $('<div/>', {'class' : 'error-container-inner'});
    getComponentErrorBox( error ).forEach( div => {
        overall.append( div );
    });

    return overall;
}

function getSegmentOfFullError( errorObject : Object | any ) : any {
    const con = $('<div/>', {'class' : 'error-segment'});
    con.append( getHeaderOfErrorBox( errorObject.rowNumber ), getOverallErrorComponent( errorObject.error ));
    return con;
};

function expand( value : string ) : string {
    value = value.trim();
    return value.split('_').map((token : string) => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
};

function getAppropriateMessageFromKey( key : string ){
    let message: string = '';
    switch( key ){
        case 'invalidNumberMessage' : message = 'Student No. error'; break;
        case 'invalidCaMessage' : message = 'Ca Score error'; break;
        case 'invalidExamMessage' : message = 'Exam Score error'; break;
    };
    return message;
};


$('#continue').on('click', function(event){
    // We need an array of validRows and the payload for each subject
    const submissionArray : Array<Object>[] = [];

    // submit the valid rows of both the subjects that are faulty and those that are perfect.
    const all = rvalids.concat(rinvalids);
    // walk throught the rvalids and get the validRows and their separate payloads
    all.forEach((validSubject : Object | any) => {
        // get the subject name
        const subjectName = Object.keys(validSubject)[0];
        // get the validRows array for the student records
        const validRows = validSubject[subjectName].validRows ;
        // construct the payload that MUST include the subjectname 
        const payload = { ...rpayload, subject : subjectName };
        // put the validRows and its own payload in an array
        const readySubjectToUpload = [ validRows, payload ];
        // store it in the submissionArray
        submissionArray.push( readySubjectToUpload );
    });

    console.log( submissionArray );
    // invoke the main process to update the score
    ipcRenderer.invoke('update-scores-single-excel', submissionArray);

});

$('#stop').on('click', function(event){
    ipcRenderer.invoke('stop-excel-upload');
});