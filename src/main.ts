require('dotenv').config()
import path from "path"
import { GameEventsService } from "./services/gepService";
import { ConnectorService } from "./services/connectorService";
import { dialog } from "electron";
import { AuthTeam } from "./services/connectorService";
import log from 'electron-log/main';
import { readFileSync } from "fs";

const { app, BrowserWindow, ipcMain } = require('electron/main')

const gepService = new GameEventsService();
const connService = ConnectorService.getInstance();
let win!: Electron.Main.BrowserWindow;

const VALORANT_ID = 21640;

log.initialize();

const createWindow = () => {
  win = new BrowserWindow({
    width: 450,
    height: 650,
    backgroundColor: '#303338',
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      webSecurity: true
    },
    fullscreenable: false,
    titleBarOverlay: true,
    icon: path.join(__dirname, './assets/icon.ico')
  })

  ipcMain.on('process-inputs', processInputs);
  ipcMain.on('config-drop', processConfigDrop);

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
        messageBox("Spectra Client - Error", "Please input data into all fields!", messageBoxType.ERROR);
        return;
      }
    }
  }

  log.info(`Received Observer Name ${obsName}, Group Code ${groupCode}, Left Tricode ${leftTeam.tricode}, Right Tricode ${rightTeam.tricode}`);
  win!.setTitle(`Spectra Client | Attempting to connect...`);
  connService.handleAuthProcess(ingestIp, obsName, groupCode, leftTeam, rightTeam, win);
}

function processConfigDrop(event: any, filePath: string) {
  log.info(`Reading config data from ${filePath}`);
  if (!filePath.endsWith(".scg")) {
    messageBox("Spectra Client - Error", "Invalid file type! Please drop a .scg file", messageBoxType.ERROR);
    log.info(`Aborting config change - invalid file type`);
    return;
  }
  if (connService.connected) {
    messageBox("Spectra Client - Error", "Cannot change config while connected!", messageBoxType.ERROR);
    log.info(`Aborting config change - connected`);
    return;
  }
  try {

    const data = JSON.parse(readFileSync(filePath).toString());
    if (validateSpectraConfig(data)) {
      win.webContents.send("load-config", data);
    } else {
      messageBox("Spectra Client - Error", "Invalid Spectra Config!", messageBoxType.ERROR);
      log.info(`Aborting config change - invalid config`);
      return;
    }

  } catch (e) {
    messageBox("Spectra Client - Error", "Could not parse Spectra Config!", messageBoxType.ERROR);
    log.error(`Error reading config file: ${e}`);
    return;
  }

}

function validateSpectraConfig(data: any) {
  if (!data.groupCode) return false;
  if (!data.ingestIp) return false;
  if (!data.leftTeam) return false;
  if (!data.rightTeam) return false;

  return true;
}

function overwolfSetup() {
  log.info(`Starting Overwolf Setup`);
  gepService.registerWindow(win);
  gepService.registerGame(VALORANT_ID);
}

export function setPlayerName(name: string) {
  win.webContents.send("set-player-name", name);
}

export function setInputAllowed(allowed: boolean) {
  win.webContents.send("set-input-allowed", allowed);
}

enum messageBoxType {
  ERROR = "error",
  NONE = "none",
  INFO = "info",
  QUESTION = "question",
  WARNING = "warning"
}

function messageBox(title: string, message: string, type: messageBoxType) {
  dialog.showMessageBoxSync(win, {
    title: title,
    message: message,
    type: type
  });
}