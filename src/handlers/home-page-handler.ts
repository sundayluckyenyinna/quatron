import { BrowserWindow } from 'electron';

/**
 * 
 */
export default class HomePageHandler
{
    /**
     * Show a page of a local url passed inside the given BrowserWindow. It is up to
     * the main process to decide if this Window is a new Window or an already existing 
     * window.
     * @param url 
     * @param win
     */
    async showLocalPage( url: string, win: BrowserWindow ) : Promise<void> {
            win.loadFile(url);
            win.once('ready-to-show', function(){
                HomePageHandler.displayWindow( win );
            });        
    };

    /**
     * 
     * @param url 
     * @param win 
     */
    async showRemotePage( url: string, win: BrowserWindow ) : Promise<void> {
        win.loadURL(url);
        win.once('ready-to-show', function(){
            HomePageHandler.displayWindow( win );
        });
    };

    /**
     * 
     * @param win 
     */
    static displayWindow( win : BrowserWindow ): void {
        win.maximize();
        win.show();
        win.shadow = true;
    };
}


