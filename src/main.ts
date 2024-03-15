import path from "path"
import { GameEventsService } from "./services/gepService";

const { app, BrowserWindow, ipcMain } = require('electron/main')

let TRACK_ID = null;
const gepService = new GameEventsService();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    backgroundColor: '#303338',
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js")
    },
    fullscreenable: false,
    titleBarOverlay: true
  })

  ipcMain.on('set-track-id', handleTrackSet)

  win.menuBarVisible = false;
  win.loadFile('./src/index.html')
}

app.whenReady().then(() => {
  createWindow();
  overwolfSetup();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      overwolfSetup();
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

function handleTrackSet(event: any, trackId: string) {
  console.log(`Received Track ID ${trackId}`);
  TRACK_ID = trackId;

  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win!.setTitle(`Woohoojin Inhouse Tracker | ${trackId}`);
}

function overwolfSetup() {
  console.log(`Starting Overwolf Setup`);
  gepService.registerGames([
    21640 // VALORANT
  ]);
}