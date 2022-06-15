
import { ipcRenderer } from "electron";
import jQuery, { data } from "jquery";

const $ = jQuery;

var rvalidRows : Object[];
var rinvalidRows : Object[];
var rdatabasePayload : Object;


ipcRenderer.on('show-invalid-rows', function(event, validRows: Object[], invalidRows : Object[], databasePayload){
    rvalidRows = validRows;
    rinvalidRows = invalidRows;
    rdatabasePayload = databasePayload;

    const pageDiv = $('<div/>',{'class' : 'error-section'});
    invalidRows.forEach( errorObject => {
        pageDiv.append( getSegmentOfFullError( errorObject ));
    });

    $('#error-component').append( pageDiv );
});

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
    // send a message to the main process o update the continue upload progress
    console.log( rvalidRows, rinvalidRows, rdatabasePayload)
    ipcRenderer.invoke('continue-upload', rvalidRows, rinvalidRows, rdatabasePayload);
});

$('#stop').on('click', function(event){
    // send a message to the main process o update the continue upload progress
    ipcRenderer.invoke('stop-upload');
});