
export {};

import { ipcRenderer } from "electron";
import jQuery from "jquery";

const $ = jQuery;

async function getSubjectNames() : Promise<string[]> {
    return Object(await ipcRenderer.invoke('subject-names-guest-page'))[0];
}

async function getPayloadFromHostPage() : Promise<Object> {
    return Object( await ipcRenderer.invoke('subject-names-guest-page'))[1];
}

// this function returns an object of the subjects names and the total number of students in a level (e.g Jss1, jss2, jss3 offering the subjects)
async function getSubjectsAndCount() : Promise<Object | any> {
    return await ipcRenderer.invoke('subjects-and-student-count', await getPayloadFromHostPage() );
};

async function populateSubjectsDiv() : Promise<number> {

    const container = $('#subjects');

    const subjects : string[] = await getSubjectNames();

    console.log( subjects )

    const groupedArray : string[][] = groupArrayInNumber( 3, subjects );

    const subjectsAndCounts : Object | any  = await getSubjectsAndCount();

    console.log( groupedArray );
    for ( let i = 0; i < groupedArray.length; i++ ){
        const setForRow : string[] = groupedArray[i];
        const row = getRowOfSubject( setForRow, subjectsAndCounts );
        // append the row to the container
        container.append( row );
    }

    return 1;
}

function getRowOfSubject( subjects : string[], subAndCount : Object | any ){
    const row = $('<div/>', {'class' : 'row', 'css':{'display':'flex','flex-direction':'row'}});
    subjects.forEach((subjectName : string) => {
        const subjectDiv = getSubjectOverallDiv( expandNeat(subjectName), subAndCount[subjectName] );
        row.append( subjectDiv );
    });
    return row;
}

function getSubjectOverallDiv( subjectName : string, numOffering : number){
    return $('<div/>', {'class' : 'overall-subject'}).append( getSubjectNameDiv( subjectName) )
                                                     .append( getSummaryDiv( numOffering ))
                                                     .append( getButtonNavigationAndTrashDiv() );
}

function getSubjectNameDiv( subjectName : string ){
    return $('<div/>', {'text' : subjectName as string, 'class' : 'subject-name'});
}

function getSummaryDiv( numOffering : number ){
    const summaryDiv = $('<div/>', {'class' : 'offering-div'})
                            .append($('<span/>', {'text' : 'Student offering', 'class' : 'offering-span'}))
                            .append($('<span/>', {'text' : numOffering.toString(), 'class' : 'number-span' }));
    
    const natureDiv = $('<div/>', {'text' : 'Type : core'});

    return $('<div/>', {'class' : 'summary-div'}).append( summaryDiv, natureDiv );
}

function getButtonNavigationAndTrashDiv(){
    const button = $('<button/>', {'text' : 'Click to enter this subject', 'class' : 'button-nav'});
    const trash = $('<button/>', {'class' : 'trash'});
    const div = $('<div/>', 'nav-and-trash').append( button );
    return div;
}


// utility function 
function expandNeat( subject : string ) : string{
    subject = subject.trim();
    return subject.split('_').map((token : string) => token.charAt(0).toUpperCase() + token.substring(1)).join(' ');
}

function getNumberFromSubjectName( subjectName : string, object : Object | any  ) : number {
    return object[subjectName];
}

function groupArrayInNumber( num : number , array : any[]){
    const arr = array;
    const n = num;
    const groupedArray = arr.reduce((r,e,i) => (i % n ? r[r.length -1].push(e) : r.push([e])) && r, []);
    return groupedArray;
};

function compress( value : string ) : string{
    value = value.trim().toLowerCase();
    return value.split(' ').filter((token : string) => token !== '').join('_');
};


// handlers
function subjectButtonNavigationClickHandler() {
    $('.button-nav').on('click', function( this, event ){
        const subjectName = compress($(this).parent().parent().find('.subject-name').first().text() as string);
        // send the subject name to the host page with the instruction to open a new page in the webview
        ipcRenderer.sendToHost('open-class-broadsheet', subjectName);
    });
};

document.body.onload = async function(event){

    const done = await populateSubjectsDiv();
    subjectButtonNavigationClickHandler();
    // ipcRenderer.invoke('subjects-and-student-count', {year:'2022', term:'first_term', level:'junior'});
};