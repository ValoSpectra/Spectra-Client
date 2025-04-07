require("dotenv").config();

import path from "path";
import { GameEventsService } from "./services/gepService";
import { ConnectorService } from "./services/connectorService";
import { dialog, shell, Tray, Menu } from "electron";
import { AuthTeam } from "./services/connectorService";
import log from "electron-log/main";
import { readFileSync } from "fs";
import {
  FormattingService,
  ISeedingInfo,
  ISeriesInfo,
  ITournamentInfo,
} from "./services/formattingService";
import HotkeyService, { HotkeyType } from "./services/hotkeyService";
import axios from "axios";
import * as semver from "semver";

const { app, BrowserWindow, ipcMain } = require("electron/main");
const storage = require("electron-json-storage");

//check for second instance //KEEP UP HERE
//#region SingleInstanceLock
const lock = app.requestSingleInstanceLock();
if (!lock) {
  //we are the second instance
  app.exit();
} else {
  //we are the first instance
  app.on("second-instance", () => {
    if (win) {
      win.show();
    }
  });
}
//#endregion

let isAuxiliary = false;

let gepService: GameEventsService;
const connService = ConnectorService.getInstance();
const formattingService = FormattingService.getInstance();
let win!: Electron.Main.BrowserWindow;
let tray: Tray | null = null;
let traySetting: boolean = getTraySetting();

const VALORANT_ID = 21640;

log.initialize();
log.errorHandler.startCatching();

const createWindow = () => {
  isAuxiliary = app.commandLine.hasSwitch("auxiliary");
  if (!isAuxiliary) {
    log.info("Starting in Observer Mode");
  } else {
    log.info("Starting in Auxiliary Mode");
  }

  win = new BrowserWindow({
    width: 730, // 1300 for debug console
    height: !isAuxiliary ? 650 : 300,
    backgroundColor: "#303338",
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      webSecurity: true,
    },
    fullscreenable: false,
    titleBarOverlay: true,
    icon: path.join(__dirname, "./assets/icon.ico"),
  });

  ipcMain.on("process-inputs", processInputs);
  ipcMain.on("process-aux-inputs", processAuxInputs);
  ipcMain.on("config-drop", processConfigDrop);
  ipcMain.on("process-log", processLog);
  ipcMain.on("set-tray-setting", setTraySetting);

  win.menuBarVisible = false;

  if (!isAuxiliary) {
    win.loadFile("./src/frontend/index.html");
  } else {
    createTray();
    win.on("minimize", () => {
      if (traySetting) {
        //only hide when setting says so
        win.hide();
      }
    });
    win.loadFile("./src/frontend/auxiliary.html");
  }
};

app.whenReady().then(async () => {
  app.setLoginItemSettings({
    openAtLogin: false,
    enabled: false,
  });

  createWindow();
  const updateAvailable = await updateCheck();
  if (updateAvailable) {
    shell.openExternal(`https://valospectra.com/download`);
    app.quit();
    // return to not init overwolf
    return;
  }

  gepService = new GameEventsService(isAuxiliary);
  overwolfSetup();

  setStatus("Idle");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (isAuxiliary) return;
  const formatted = formattingService.formatRoundData("game_end", -1);
  connService.sendToIngest(formatted);
});

function createTray() {
  tray = new Tray(path.join(__dirname, "./assets/icon.ico"));
  tray.setToolTip("Spectra Client");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        win.show();
      },
    },
    {
      label: "Exit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    win.show();
  });
}

function processInputs(
  event: any,
  ingestIp: string,
  groupCode: string,
  obsName: string,
  leftTeam: AuthTeam,
  rightTeam: AuthTeam,
  key: string,
  seriesInfo: ISeriesInfo,
  seedingInfo: ISeedingInfo,
  tournamentInfo: ITournamentInfo,
  hotkeys: any,
  timeoutDuration: number,
) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents)!;

  if (obsName === "" || groupCode == "") {
    if (leftTeam.name === "" || leftTeam.tricode === "" || leftTeam.url === "") {
      if (rightTeam.name === "" || rightTeam.tricode === "" || rightTeam.url === "") {
        messageBox(
          "Spectra Client - Error",
          "Please input data into all fields!",
          messageBoxType.ERROR,
        );
        return;
      }
    }
  }

  if (seriesInfo.mapInfo!.length > 0) {
    let allow = true;
    for (const map of seriesInfo.mapInfo!) {
      if (map.type === "past") {
        if (map.map === "" || map.left.score < 0 || map.right.score < 0) {
          allow = false;
          break;
        }
      } else if (map.type === "present") {
        // All good
      } else if (map.type === "future") {
        if (map.map === "") {
          allow = false;
          break;
        }
      } else if (map.type === "error") {
        allow = false;
        break;
      }
    }

    if (!allow) {
      messageBox(
        "Spectra Client - Error",
        "Please input data into all fields!",
        messageBoxType.ERROR,
      );
      return;
    }
  }

  //regex check hotkeys
  const regex = /^(Ctrl\+|Alt\+|Shift\+)*(\D|F[1-9][0-1]?|\d)$/g;
  if (hotkeys.spikePlanted.match(regex)) {
    HotkeyService.getInstance().setKeyForHotkey(HotkeyType.SPIKE_PLANTED, hotkeys.spikePlanted);
  } else {
    messageBox(
      "Spectra Client - Error",
      "The hotkey for 'Spike planted' is invalid!",
      messageBoxType.ERROR,
    );
    return;
  }
  if (hotkeys.techPause.match(regex)) {
    HotkeyService.getInstance().setKeyForHotkey(HotkeyType.TECH_PAUSE, hotkeys.techPause);
  } else {
    messageBox(
      "Spectra Client - Error",
      "The hotkey for 'Tech pause' is invalid!",
      messageBoxType.ERROR,
    );
    return;
  }
  if (hotkeys.leftTimeout.match(regex)) {
    HotkeyService.getInstance().setKeyForHotkey(HotkeyType.LEFT_TIMEOUT, hotkeys.leftTimeout);
  } else {
    messageBox(
      "Spectra Client - Error",
      "The hotkey for 'Left timeout' is invalid!",
      messageBoxType.ERROR,
    );
    return;
  }
  if (hotkeys.rightTimeout.match(regex)) {
    HotkeyService.getInstance().setKeyForHotkey(HotkeyType.RIGHT_TIMEOUT, hotkeys.rightTimeout);
  } else {
    messageBox(
      "Spectra Client - Error",
      "The hotkey for 'Right timeout' is invalid!",
      messageBoxType.ERROR,
    );
    return;
  }

  log.info(
    `Received Observer Name ${obsName}, Group Code ${groupCode}, Key ${key}, Left Tricode ${leftTeam.tricode}, Right Tricode ${rightTeam.tricode}`,
  );
  win!.setTitle(`Spectra Client | Attempting to connect...`);
  connService.handleAuthProcess(
    ingestIp,
    obsName,
    groupCode,
    leftTeam,
    rightTeam,
    key,
    seriesInfo,
    seedingInfo,
    tournamentInfo,
    timeoutDuration,
    win,
  );
}

function processAuxInputs(event: any, ingestIp: string, name: string) {
  win!.setTitle(`Spectra Client | Attempting to connect...`);
  connService.handleAuxAuthProcess(ingestIp, name, win);
}

function processConfigDrop(event: any, filePath: string) {
  log.info(`Reading config data from ${filePath}`);
  if (!filePath.endsWith(".scg")) {
    messageBox(
      "Spectra Client - Error",
      "Invalid file type! Please drop a .scg file",
      messageBoxType.ERROR,
    );
    log.info(`Aborting config change - invalid file type`);
    return;
  }
  if (connService.isConnected()) {
    messageBox(
      "Spectra Client - Error",
      "Cannot change config while connected!",
      messageBoxType.ERROR,
    );
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

function processLog(event: any, message: string) {
  log.info(message);
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
  gepService.registerOverwolfPackageManager();
}

async function updateCheck(): Promise<boolean> {
  try {
    const releaseName = (
      await axios.get("https://api.github.com/repos/ValoSpectra/Spectra-Client/releases")
    ).data[0].name;

    const latestRelease = semver.valid(releaseName);
    const currentRelease = semver.valid(app.getVersion());

    if (!latestRelease || !currentRelease) {
      messageBox(
        "Spectra Client - Update Check Failed",
        "The automatic update check failed - please manually check if a new version of the client is available!",
        messageBoxType.WARNING,
      );
      log.error(
        "Error checking for latest release, invalid version:",
        latestRelease,
        currentRelease,
      );
      return false;
    }

    if (semver.gt(latestRelease, currentRelease)) {
      log.info(`New client version available: ${latestRelease} (current: ${currentRelease})`);
      const button = messageBox(
        "Spectra Client - Update Available",
        `A new version of the Spectra Client is available. Please update to the latest version.`,
        messageBoxType.WARNING,
        ["Update"],
      );

      if (button === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      log.info(`Running latest client version: ${currentRelease}`);
      return false;
    }
  } catch (error) {
    messageBox(
      "Spectra Client - Update Check Failed",
      "The automatic update check failed - please manually check if a new version of the client is available!",
      messageBoxType.WARNING,
    );
    log.error("Error checking for latest release:", error);
    return false;
  }
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

export function fireConnect() {
  connService.stopAttempts();
  if (connService.isConnected()) return;
  win.webContents.send("fire-connect");
}

function setTraySetting(event: any, setting: boolean) {
  traySetting = setting;
  storage.set("traySetting", { traySetting: traySetting }, function (error: any) {
    if (error) log.error(error);
  });
}

function getTraySetting() {
  const retrieved = storage.getSync("traySetting");
  if (retrieved == null || Object.keys(retrieved).length == 0) {
    //default value
    return true;
  } else {
    log.debug(`Retrieved tray setting: ${retrieved.traySetting}`);
    return retrieved.traySetting;
  }
}

export enum messageBoxType {
  ERROR = "error",
  NONE = "none",
  INFO = "info",
  QUESTION = "question",
  WARNING = "warning",
}

export function messageBox(
  title: string,
  message: string,
  type: messageBoxType,
  buttons: string[] = ["OK"],
): number {
  return dialog.showMessageBoxSync(win, {
    title: title,
    message: message,
    type: type,
    buttons: buttons,
  });
}
