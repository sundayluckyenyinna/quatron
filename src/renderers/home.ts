export {};

/** Import the ipcRenderer module */
import { ipcRenderer } from "electron";
import jQuery from "jquery";

/** Import the jquery module */
const $ = jQuery

$('.page-navigator').on('click', function(this: HTMLButtonElement) {
    
    /** construct a payload for the main process handler */
    const payload = { 
        id: $(this).attr('id'), 
        fileType: $(this).attr('data-filetype'),
        url: $(this).attr('data-url')
    };

    /** Invoke an event in the main process to map the button's id to the page to be shown */
    ipcRenderer.invoke('show', payload);

});

$('#internet').on('click', function(this, event){
    ipcRenderer.invoke('show-remote-page');
});

$('#backup').on('click', function( this, event ){
    ipcRenderer.invoke('show-page', 'back-up-page.html');
});

$('#view-all-subjects').on('click', function( event ){
    ipcRenderer.invoke('show-page', 'subjects.html');
});

$('#register-settings').on('click', function( event ){
    ipcRenderer.invoke('show-page', 'school-registration-settings.html');
});

$('#help').on('click', function( event ){
    window.location.reload();
});