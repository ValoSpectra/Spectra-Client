import path from "path"
import { GameEventsService } from "./services/gepService";
import { ConnectorService } from "./services/connectorService";
import { dialog } from "electron";

const { app, BrowserWindow, ipcMain } = require('electron/main')

const gepService = new GameEventsService();
const connService = ConnectorService.getInstance();
let win!: Electron.Main.BrowserWindow;

const createWindow = () => {
  win = new BrowserWindow({
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

  ipcMain.on('process-inputs', processInputs);
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

function processInputs(event: any, groupId: string, teamName: string, playerName: string) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents)!;

  if (playerName === "" || teamName == "" || groupId == "") {
    dialog.showMessageBoxSync(win, {
      title: "Inhouse Tracker - Error",
      message: "Please input data into all fields!",
      type: "error"
    });
    return;
  }

  console.log(`Received Name ${playerName}, Team ${teamName} and Group Code ${groupId}`);
  win!.setTitle(`Woohoojin Inhouse Tracker | Attempting to connect...`);
  connService.handleAuthProcess(playerName, teamName, groupId, win);
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
  gepService.registerGame(21640);
}

export function setPlayerName(name: string) {
  win.webContents.send("set-player-name", name);
}