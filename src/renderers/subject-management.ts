export {}

import { ipcRenderer } from 'electron';
import jQuery from 'jquery';

const $ = jQuery;

let folderPath : string;

$('#browse').on('click', async function( event ){
    // tell the main process to open folder
    const paths : string[] = await ipcRenderer.invoke('show-directory-chooser');
    const path = paths[0];

    folderPath = path;
    await ipcRenderer.invoke('update-broadsheet-folder-path', folderPath);

    
    $('#folder-path').css('visibility','visible');
    $('#folder-path').val( folderPath );

});

document.body.onload = async function(){
    const folderPath = await ipcRenderer.invoke('get-broadsheet-folder-path');
    if ( folderPath ){
        $('#folder-path').css('visibility', 'visible');
        $('#folder-path').val( folderPath );
    }
}