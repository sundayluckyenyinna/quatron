export {}

import { ipcRenderer } from "electron";
import jQuery from "jquery";

const $ = jQuery;

function getTabGroup(){
  return $('#tabgroup');
};

function getAddTabButton(){
  return $('#add');
}

function getTabById( id : string ){
  const cssId = '#' + id;
  return $(cssId);
}

function getTabSection(){
  return $('#tab-section');
}

function getNumberOfTabs() : number {
  return $('#tabgroup').find('.tab').length;
};

function createNewTab(){
  const id = 'tab' + ( getNumberOfTabs() + 1).toString();
  return $('<div/>', {'class':'tab'}).append( createTextDivOfTab(), createCancelDivOfTab()).attr('id', id);
};

function createTextDivOfTab() {
  return $('<div/>', {'class':'text'}).text('Springarr new tab');
};

function createCancelDivOfTab(){
  return $('<div/>',{'class':'cancel'}).append($('<img/>',{'src':'../img/icons/cancel.png', 'width':'10', 'height':'10'}));
}

function showNewTab( tab : JQuery<HTMLElement> ){
  getTabSection().append( tab );
  // send a message to the main process to hide all the other views and show a new one 
  ipcRenderer.invoke('show-new-browser', tab.attr('id'));
};

function getUrlTextField(){
  return $('#url-text');
};

getAddTabButton().on('click', function(this, event){
  event.stopPropagation();
  showNewTab( createNewTab() )
});

$('body').on('click', '.text', function(this, event){
  event.stopPropagation();
  ipcRenderer.invoke('show-current-browser', $(this).parent().attr('id'));
});

$('body').on('click', '.cancel', function(this, event){
  event.stopPropagation();
  const parentId = $(this).parent().attr('id');
  ipcRenderer.invoke('remove-current-tab', parentId)
  .then(() => {
    $(this).parent().remove();
    $('body .text').trigger('click');
  });
});



// The lower control part of the browser
$('#back').on('click', function(event){
  ipcRenderer.invoke('go-back');
});

$('#forward').on('click', function(event){
  ipcRenderer.invoke('go-forward');
});

$('#reload').on('click', function(event){
  ipcRenderer.invoke('reload');
});

ipcRenderer.on('display-url', function(event, data){
  getUrlTextField().val( data.url as string );
});

ipcRenderer.on('display-title', function(event, data){
  getTabById(data.id).text( data.title )
});
