import { BrowserView, ipcMain, WebContents, BrowserWindow, webContents } from 'electron';
import path from 'path';

export default class Browser extends BrowserView
{
    private id : string;
    private static defaultUrl = 'https://www.google.com/';
    private window : BrowserWindow | undefined;

    constructor( id : string, bounds : Object,  window : BrowserWindow | undefined = undefined){
        super({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: path.join(__dirname, 'preload.js')
            }
        });
        
        this.setAutoResize({
            width : true,
            height: true,
            horizontal: true,
            vertical : true
        });

        this.id = id;
        this.window = window;

        this.webContents.loadURL( Browser.defaultUrl );

        this.webContents.on('will-navigate', function(this : WebContents, event, url){
            window?.webContents.send('display-url', { id: id, url : url });
        }).on('did-navigate', async function(this : WebContents, event, url){
            window?.webContents.send('display-url', {id : id, url : url });
        }).on('did-fail-load', function(event, errorCode, errorDesc, validatedUrl){
            // implement logic for failing to load
        });

        this.webContents.session.on('will-download', function(event, item, webContents){
            // implement logic for download
        });

        this.setBounds({x: 0, y: 80, width: 1366, height: 728 - 80});
        this.makeVisible( bounds );
    }

    getId = () => {
        return this.id;
    }

    setId = ( id : string ) => {
        this.id = id;
    }

    makeVisible = ( bounds : object | any ) => {
        this.setBounds({ x: 0, y : 80, width : bounds.width, height : bounds.height});
    }

    hide = () => {
        this.setBounds({ x: 0, y: 0, width: 0, height: 0});
    };

}