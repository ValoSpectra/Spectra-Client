
require('dotenv').config()
const VERSION = "v0.2.0";
const ALLOW_UPDATE_IGNORE = process.env.ALLOW_UPDATE_IGNORE ? process.env.ALLOW_UPDATE_IGNORE : false;

import path from "path"
import { GameEventsService } from "./services/gepService";
import { ConnectorService } from "./services/connectorService";
import { dialog, shell } from "electron";
import { AuthTeam } from "./services/connectorService";
import log from 'electron-log/main';
import { readFileSync } from "fs";
import axios from "axios";
import * as semver from "semver";
import { FormattingService } from "./services/formattingService";

const { app, BrowserWindow, ipcMain } = require('electron/main')

const gepService = new GameEventsService();
const connService = ConnectorService.getInstance();
const formattingService = FormattingService.getInstance();
let win!: Electron.Main.BrowserWindow;

const VALORANT_ID = 21640;

log.initialize();

const createWindow = () => {
  win = new BrowserWindow({
    width: 730, // 1300 for debug console
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

app.whenReady().then(async () => {
  app.setLoginItemSettings({
    openAtLogin: false,
    enabled: false
  });

  createWindow();

  const versionCheckResult = await versionCheck();
  if (versionCheckResult !== "good" && versionCheckResult !== "unknown" && versionCheckResult !== "ignore") {

    // If the user chooses to (or gets forced to) update, open the latest release page in the browser and quit the app
    shell.openExternal(`https://github.com/ValoSpectra/Spectra-Client/releases/${versionCheckResult}`);
    app.quit();

  } else {

    overwolfSetup();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
        overwolfSetup();
      }
    })

    setStatus("Idle");
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('before-quit', () => {
  const formatted = formattingService.formatRoundData("game_end", gepService.currRoundNumber);
  connService.sendToIngest(formatted);
});

function processInputs(event: any, ingestIp: string, groupCode: string, obsName: string, leftTeam: AuthTeam, rightTeam: AuthTeam, key: string) {
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

  log.info(`Received Observer Name ${obsName}, Group Code ${groupCode}, Key ${key}, Left Tricode ${leftTeam.tricode}, Right Tricode ${rightTeam.tricode}`);
  win!.setTitle(`Spectra Client | Attempting to connect...`);
  connService.handleAuthProcess(ingestIp, obsName, groupCode, leftTeam, rightTeam, key, win);
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

export function setStatus(newStatus: string) {
  win.webContents.send("set-status", newStatus);
}

log.hooks.push((message, transport) => {
  win.webContents.send("set-input-allowed", message);
  return message;
});

export enum messageBoxType {
  ERROR = "error",
  NONE = "none",
  INFO = "info",
  QUESTION = "question",
  WARNING = "warning"
}

export function messageBox(title: string, message: string, type: messageBoxType, buttons: string[] = ["OK"]): number {
  return dialog.showMessageBoxSync(win, {
    title: title,
    message: message,
    type: type,
    buttons: buttons
  });
}

async function versionCheck(): Promise<string | "good" | "ignore" | "unknown"> {
  try {
    const releaseName = (await axios.get('https://api.github.com/repos/ValoSpectra/Spectra-Client/releases')).data[0].name;
    const latestRelease = semver.valid(releaseName);
    const currentRelease = semver.valid(VERSION);

    if (!latestRelease || !currentRelease) {
      messageBox('Spectra Client - Update Check Failed', 'The automatic update check failed - please manually check if a new version of the client is available!', messageBoxType.WARNING);
      log.error('Error checking for latest release, invalid version:', latestRelease, currentRelease);
      return "unknown";
    }

    if (semver.gt(latestRelease, currentRelease)) {
      log.info(`New client version available: ${latestRelease} (current: ${currentRelease})`);

      // If the build has ALLOW_UPDATE_IGNORE set to true, show an "Ignore" button in the message box
      const buttons = ALLOW_UPDATE_IGNORE ? ["Update", "Ignore"] : ["Update"];
      const button = messageBox('Spectra Client - Update Available', `A new version of the Spectra Client is available. Please update to the latest version.`, messageBoxType.WARNING, buttons);
      if (button === 0) {
        return releaseName;
      } else {
        return "ignore";
      }
    } else {
      return "good";
    }

  } catch (error) {
    messageBox('Spectra Client - Update Check Failed', 'The automatic update check failed - please manually check if a new version of the client is available!', messageBoxType.WARNING);
    log.error('Error checking for latest release:', error);
    return "unknown";
  }
}
