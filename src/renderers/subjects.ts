
export {}

import { ipcRenderer } from "electron";
import jQuery from "jquery";

const $ = jQuery;

const webView : any = $('#webview');
const webviewDoc : HTMLElement | any= document.getElementById('webview');
var level : string;

// webviewDoc?.addEventListener('dom-ready', function(){
//     webviewDoc.openDevTools();
// });

webviewDoc.addEventListener('ipc-message', async function( event : Object | any  ){
    if ( event.channel = 'open-class-broadsheet'){ 
        await handleOpenClassBroadsheetFromGuestPage( event.args[0] ); return;
    }
});


// handlers from the guest page 
async function handleOpenClassBroadsheetFromGuestPage( subjectName : string | any  ) : Promise<void> {

    // tell the main process to save or update the selected subject and make sure it is done updating it by awaiting the promise invocation.
    await ipcRenderer.invoke('update-selected-subject-name', subjectName );

    // update the src attribute of the webview to the new page solely for that subject.
    webView.attr('src', 'class-broadsheet-page.html');

    console.log( subjectName );
}

function getYear() : string {
    return $('#select-year').val()?.toString().trim() as string;
};

function getTerm() : string {
    return compress($('#select-term').val()?.toString().trim().toLowerCase() as string)
};

function getDataObject() : Object | any {
    return {
        year : getYear(),
        term : getTerm()
    };
};

function getLevel() : string {
    // if ( level === undefined ) { return 'junior'; };
    return level;
}

function compress( value : string ) : string{
    value = value.trim().toLowerCase();
    return value.split(' ').filter((token : string) => token !== '').join('_');
};

// function to populate the junior subjects page with the subjects from database
async function showGuestPage( level : string ){

    const payload : Object | any = getDataObject();
    payload.level = level;
    payload.clazz = level === 'junior' ? 'jss1' : 'sss1';

    // help the guest page to get the subject names to render
    const allSubjectNamesArray : string[] = await ipcRenderer.invoke('level-subject-names', payload);
    
    // send a message to the main process to keep this subjectNames in a variable and wait for it to do so.
    await ipcRenderer.invoke('keep-subject-names', allSubjectNamesArray, payload );

    // now open up the junior subjects page. This page will get the subject names already stored in the main process to render its page
    webView.attr('src', 'junior-subjects.html');

};

function validateCorrectInput() : boolean {
    return ( !getTerm().toLowerCase().includes('select') && !getYear().toLowerCase().includes('select') && level !== undefined );   
}

function validateCorrectInputWithoutLevel() : boolean {
    return ( !getTerm().toLowerCase().includes('select') && !getYear().toLowerCase().includes('select') ); 
}

async function showErrorDialog() : Promise<void> {
    await ipcRenderer.invoke('show-dialog', {
        message : 'Incorrect selection of one of term, session or both\n\nPlease select a valid option',
        title:'   Selection error',
        type: 'error'
    }); return;
}

$('#junior-subjects').on('click', async function( event ){
    if( !validateCorrectInputWithoutLevel() ) { showErrorDialog(); return; };
    // set the level to junior
    level = 'junior';
    await showGuestPage( getLevel() );
});

$('#senior-subjects').on('click', async function( event ){
    if( !validateCorrectInputWithoutLevel() ) { showErrorDialog(); return; };
    // set the level to junior
    level = 'senior';
    await showGuestPage( getLevel() );
});

$('#select-year').on('change', async function( event ){
    if( !validateCorrectInput() ) { return; };
    await showGuestPage( getLevel() );
});

$('#select-term').on('change', async function( event ){
    if( !validateCorrectInput() ) { return; };
    await showGuestPage( getLevel() );
});
