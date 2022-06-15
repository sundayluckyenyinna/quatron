
export{}

import { ipcRenderer } from "electron";
import jQuery from 'jquery';

const $ = jQuery;


// Getters 
function getSelectYearAcademicTermDatabaseBackup(){
    return $('#select-year-database');
}

function getSelectTermAcademicTermDatabaseBackup(){
    return $('#select-term-database');
}

function getAcademicTermDatabaseBackupButton() {
    return $('#academic-term-database-backup');
}

function getSelectYearAcademicSessionDatabaseBackup(){
    return $('#select-year-session-database');
}

function getAcademicSessionDatabaseBackupButton(){
    return $('#academic-session-database-backup');
}

function getSelectYearReportsheetBackup() {
    return $('#select-year-reportsheet-backup');
}

function getSelectTermReportsheetBackup() {
    return $('#select-term-reportsheet-backup');
}

function getReportsheetInput() {
    return $('#reportsheet-input');
}

function getSelectYearBroadsheetBackup(){
    return $('#select-year-broadsheet-backup');
}

function getSelectTermBroadsheetBackup(){
    return $('#select-term-broadsheet-backup');
}

function getBroadsheetInput(){
    return $('#broadsheet-input');
}

function getSelectYearScoreBackup(){
    return $('#select-year-score-backup');
}

function getSelectTermScoreBackup(){
    return $('#select-term-score-backup');
}

function getScoreInput(){
    return $('#scores-input');
}

function getSelectYearOtherItemBackup(){
    return $('#select-year-other-backup');
}

function getSelectTermOtherItemBackup(){
    return $('#select-term-other-backup');
}

function getOtherItemInput(){
    return $('#other-input');
}

function getOtherDescription(){
    return $('#other-desc');
}

// function 

// This function returns all the possible school email addresses.
async function getSchoolEmailAddresses() : Promise<string[]> {
    // tell the main process to give the string for all the addresses
    const emailString : string  = await ipcRenderer.invoke('get-school-email-string'); 
    return emailString.split('#');
}

// utility functions 
function compress ( value : string ) : string {
    value = value.toLowerCase();
    return value.split(' ').filter((token : string) => token !== '').join('_');
}

// returns the data object that will be used by the main process to back-up academic database to the email
function getAcademicTermBackupData() : Object  {
    return {
        year : getSelectYearAcademicTermDatabaseBackup().val()?.toString() as string,
        term : compress(getSelectTermAcademicTermDatabaseBackup().val()?.toString() as string),
        backupType: 'academic-term-database'
    };
}

function getAcademicSessionBackupData() : Object {
    return {
        year : getSelectYearAcademicSessionDatabaseBackup().val()?.toString() as string,
        backupType: 'academic-session-database'
    };
}

function getAcademicReportBackupData() : Object {
    return {
        year : getSelectYearReportsheetBackup().val()?.toString(),
        term : compress(getSelectTermReportsheetBackup().val()?.toString() as string),
        path : getReportsheetInput().val()?.toString(),
        backupType: 'academic-reportsheet'
    };
}

function getAcademicBroadsheetBackupData() : Object {
    return {
        year : getSelectYearBroadsheetBackup().val()?.toString().trim() as string,
        term : compress(getSelectTermBroadsheetBackup().val()?.toString().trim() as string),
        path : getBroadsheetInput().val()?.toString().trim() as string,
        backupType : 'academic-broadsheet'
    };
}

function getAcademicScoresBackupData() : Object {
    return {
        year : getSelectYearScoreBackup().val()?.toString().trim() as string,
        term : compress( getSelectTermScoreBackup().val()?.toString().trim() as string ),
        path : getScoreInput().val()?.toString().trim() as string,
        backupType : 'academic-scores'
    };
}

function getOtherItemsBackupData() : Object {
    const description : string = getOtherDescription().val()?.toString().trim() as string;
    return {
        year : getSelectTermOtherItemBackup().val()?.toString().trim() as string,
        term : compress( getSelectTermOtherItemBackup().val()?.toString().trim() as string ),
        path : getOtherItemInput().val()?.toString().trim() as string,
        description : description.charAt(0).toUpperCase() + description,
        backupType : 'other-items'
    };
}

$('#academic-term-database-backup').on('click', async function( event ){
    // TODO
    // await ipcRenderer.invoke('backup-academic-term-database', getAcademicTermBackupData());
    await ipcRenderer.invoke('backup-to-mail', getAcademicTermBackupData() );
    return;
});

$('#academic-session-database-backup').on('click', async function( event ){
    await ipcRenderer.invoke('backup-to-mail', getAcademicSessionBackupData());
});

$('#academic-report-backup').on('click', async function( event ){
    // TODO
    await ipcRenderer.invoke('backup-to-mail', getAcademicReportBackupData());
});

$('#backup-broadsheet').on('click', async function( event ){
    //TODO
    await ipcRenderer.invoke('backup-to-mail', getAcademicBroadsheetBackupData());
});

$('#backup-scores').on('click', async function( event ){
    // TODO
    await ipcRenderer.invoke('backup-to-mail', getAcademicScoresBackupData());
});

$('#backup-other-items').on('click', async function( event ){
    // TODO
    await ipcRenderer.invoke('backup-to-mail', getOtherItemsBackupData());
});


$('.browse').on('click', async function( this, event ){
    // await the main process to get the path of the selected folder
    const folderPath : string = Object(await ipcRenderer.invoke('show-any-folder-chooser'))[0];
    
    // populate the input box beside it.
    const input = $( this ).parent().parent().find('input[type=text]').first();
    input.val( folderPath );
});

// populate all the select box for academic years

async function populateAllSelectedBox() {

    const academicYears : string[] = await ipcRenderer.invoke('academic-years');

    $('.select-year').each( function( this, index, element ){

        const selectBox = $( this );
    
    
        const fragment = $( document.createDocumentFragment() );
    
        academicYears.forEach((year : string) => {
            const option = $('<option/>',{ 'text': year });
            fragment.append( option );
        });
    
        selectBox.append( fragment );
    
    });
}

document.body.onload = async function () {
    await populateAllSelectedBox();
}