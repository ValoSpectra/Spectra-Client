import path from "path"
import { GameEventsService } from "./services/gepService";
import { ConnectorService } from "./services/connectorService";
import { dialog } from "electron";
import { AuthTeam } from "./services/connectorService";
import log from 'electron-log';

const { app, BrowserWindow, ipcMain } = require('electron/main')

const gepService = new GameEventsService();
const connService = ConnectorService.getInstance();
let win!: Electron.Main.BrowserWindow;

const VALORANT_ID = 21640;

const createWindow = () => {
  win = new BrowserWindow({
    width: 450,
    height: 650,
    backgroundColor: '#303338',
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js")
    },
    fullscreenable: false,
    titleBarOverlay: true,
    icon: path.join(__dirname, './assets/icon.ico')
  })

  ipcMain.on('process-inputs', processInputs);

  win.menuBarVisible = false;
  win.loadFile('./src/frontend/index.html');
}

app.whenReady().then(() => {
  app.setLoginItemSettings({
    openAtLogin: false,
    enabled: false
  });
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

function processInputs(event: any, ingestIp: string, groupCode: string, obsName: string, leftTeam: AuthTeam, rightTeam: AuthTeam) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents)!;

  if (obsName === "" || groupCode == "") {
    if (leftTeam.name === "" || leftTeam.tricode === "" || leftTeam.url === "") {
      if (rightTeam.name === "" || rightTeam.tricode === "" || rightTeam.url === "") {
        dialog.showMessageBoxSync(win, {
          title: "Spectra Client - Error",
          message: "Please input data into all fields!",
          type: "error"
        });
        return;
      }
    }
  }

  log.info(`Received Observer Name ${obsName}, Group Code ${groupCode}, Left Tricode ${leftTeam.tricode}, Right Tricode ${rightTeam.tricode}`);
  win!.setTitle(`Spectra Client | Attempting to connect...`);
  connService.handleAuthProcess(ingestIp, obsName, groupCode, leftTeam, rightTeam, win);
}

function overwolfSetup() {
  log.info(`Starting Overwolf Setup`);
  gepService.registerWindow(win);
  gepService.registerGame(VALORANT_ID);
}

export function setPlayerName(name: string) {
  win.webContents.send("set-player-name", name);
}