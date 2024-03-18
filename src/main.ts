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

  ipcMain.on('set-track-id', handleTrackSet);
  ipcMain.on('replay', replay);

  win.menuBarVisible = false;
  win.loadFile('./src/index.html');
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
  gepService.setTrackId(TRACK_ID);
}

function replay() {
  gepService.processGameEvent({
    gameId: 21640,
    feature: 'match_info',
    category: 'match_info',
    key: 'kill_feed',
    value: '{"attacker":"Quincy","victim":"deftonesenjoyer","is_attacker_teammate":true,"is_victim_teammate":false,"weapon":"TX_Hud_Knife_Standard_S","ult":"","assist1":"","assist2":"","assist3":"","assist4":"","headshot":false}'
  });
}

function overwolfSetup() {
  console.log(`Starting Overwolf Setup`);
  gepService.registerGames([
    21640 // VALORANT
  ]);
  
}