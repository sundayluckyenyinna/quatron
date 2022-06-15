
export {}
import { ipcRenderer } from "electron";
import jQuery from 'jquery';

const $ = jQuery;


// Getter functions
async function getPayloadFromHost() : Promise<Object> {
    return Object(await ipcRenderer.invoke('subject-names-guest-page'))[1];
}

async function getSubjectNameFromHost() : Promise<string> {
    return await ipcRenderer.invoke('get-updated-subject-name');
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
                                      .append($('<td/>', {'class' : 'total-score', 'text' : score.Total_Score }));
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

async function print( value : any ){
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

function printHandler(){

    $('#print').on('click', async function( this, event ){
        // get the folder path
        const subjectName = await getSubjectNameFromHost();
        const payload : Object | any = await getPayloadFromHost();
        payload.subject = expandSubject( subjectName );

        const pathFile = await ipcRenderer.invoke('get-broadsheet-file-path', payload);

        $(this).css('display', 'none');

        const html = document.documentElement.outerHTML;
        await ipcRenderer.invoke('print-broadsheet', html, payload, pathFile);
    });
}

document.body.onload = async function( event ){
   await populateScoreTable();
   printHandler();
   const payload = await getPayloadFromHost();
   console.log( payload )
   console.log( await getSubjectNameFromHost() )
};