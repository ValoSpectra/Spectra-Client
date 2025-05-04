require("dotenv").config();

import path from "path";
import { GameEventsService } from "./services/gepService";
import { ConnectorService } from "./services/connectorService";
import { dialog, shell, Tray, Menu, Rectangle } from "electron";
import { AuthTeam } from "./services/connectorService";
import log from "electron-log/main";
import { readFileSync } from "fs";
import {
  FormattingService,
  GEPStates,
  GEPStatus,
  ISeedingInfo,
  ISeriesInfo,
  ITournamentInfo,
} from "./services/formattingService";
import HotkeyService, { HotkeyType } from "./services/hotkeyService";
import axios from "axios";
import * as semver from "semver";
// import { installExtension } from "electron-devtools-installer";

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
  app.on("second-instance", (_event: any, cli: any[]) => {
    if (win) {
      win.show();
    }

    for (const arg of cli) {
      if (arg.startsWith("ps-spectra://")) {
        messageBox("Spectra Client - Deeplink", "Deeplink received: " + arg, messageBoxType.INFO);
      }
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

  let iconPath = "";
  if (!isDev()) {
    iconPath = path.join(__dirname, "./frontend/browser/assets/icon.ico");
  } else {
    iconPath = path.join(__dirname, "../build/icon.ico");
  }

  const windowState = isAuxiliary ? { width: 750, height: 320, x: 0, y: 0 } : getWindowState();
  const boundsSettings: { width: number; height: number; x?: number; y?: number } = {
    width: 0,
    height: 0,
  };

  if (!isAuxiliary) {
    boundsSettings.width = clamp(windowState.width, 750, 1920);
    boundsSettings.height = clamp(windowState.height, 650, 1080);
    if (windowState.x != -999999) {
      boundsSettings.x = windowState.x;
      boundsSettings.y = windowState.y;
    }
  } else {
    boundsSettings.width = windowState.width;
    boundsSettings.height = windowState.height;
  }

  win = new BrowserWindow({
    ...boundsSettings,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      webSecurity: true,
      devTools: isDev(),
    },
    resizable: !isAuxiliary,
    fullscreenable: false,
    titleBarOverlay: true,
    icon: iconPath,
    title: "Spectra Client",
    show: false,
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (isAuxiliary) {
    win.setMinimumSize(750, 320);
    win.setMaximumSize(750, 320);
  } else {
    win.setMinimumSize(750, 650);
  }

  win.menuBarVisible = false;

  ipcMain.on("process-inputs", processInputs);
  ipcMain.on("process-aux-inputs", processAuxInputs);
  ipcMain.on("config-drop", processConfigDrop);
  ipcMain.on("process-log", processLog);
  ipcMain.on("set-tray-setting", setTraySetting);
  ipcMain.on("open-external-link", openExternalLink);

  if (!isAuxiliary) {
    if (!isDev()) {
      win.loadFile("./app/frontend/browser/index.html");
    } else {
      win.setAlwaysOnTop(true, "screen-saver");
      win.loadURL("http://localhost:4401");
    }
  } else {
    createTray(iconPath);
    win.on("minimize", () => {
      if (traySetting) {
        win.hide();
      }
    });

    if (!isDev()) {
      win.loadFile("./app/frontend/browser/index.html", {
        hash: "auxiliary",
      });
    } else {
      win.setAlwaysOnTop(true, "screen-saver");
      win.loadURL("http://localhost:4401#auxiliary");
    }
  }

  win.on("resized", storeWindowState);
  win.on("moved", storeWindowState);
  win.on("maximize", storeWindowState);
  win.on("unmaximize", storeWindowState);
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
  deeplinkSetup();

  // if (!isDev()) {
  //   installExtension("ienfalfjdbdpebioblfackkekamfmbnh")
  //     .then((ext: { name: any }) => {
  //       log.info(`Installed extension: ${ext.name}`);
  //     })
  //     .catch((err: any) => {
  //       log.error("Failed to install extension:", err);
  //     });
  // }
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

app.on("web-contents-created", (event: any, contents: any) => {
  contents.on("will-attach-webview", (event: any, webPreferences: any) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;

    // Verify URL being loaded
    // if (!params.src.startsWith("https://example.com/")) {
    event.preventDefault();
    // }
  });

  contents.on("will-navigate", (event: any) => {
    // const parsedUrl = new URL(navigationUrl);

    // if (parsedUrl.origin !== 'https://example.com') {
    event.preventDefault();
    // }
  });
});

function createTray(iconPath: string) {
  tray = new Tray(iconPath);
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
  setSpectraStatus("Connecting", StatusTypes.YELLOW);
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

function processAuxInputs(_event: any, ingestIp: string, name: string) {
  setSpectraStatus("Connecting", StatusTypes.YELLOW);
  connService.handleAuxAuthProcess(ingestIp, name, win);
}

function processConfigDrop(_event: any, filePath: string) {
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

function processLog(_event: any, message: string) {
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

  // Wait to ensure renderer is ready
  setTimeout(() => {
    eventAvailabilityCheck();
  }, 2500);
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

async function eventAvailabilityCheck() {
  try {
    const status: GEPStatus = (
      await axios.get(`https://game-events-status.overwolf.com/${VALORANT_ID}_prod.json`)
    ).data;

    if (status.state == 1) {
      return;
    } else if (status.disabled) {
      win.webContents.send("set-event-status", GEPStates.disabled);
      log.info(`Event availability: disabled`);
      return;
    } else {
      let eventStatus = 1;

      status.features.forEach((feature: any) => {
        if (feature.name === "match_info") {
          eventStatus = feature.state;
        }
      });

      if (isAuxiliary) {
        status.features.forEach((feature: any) => {
          if (feature.name === "me") {
            eventStatus = feature.state > eventStatus ? feature.state : eventStatus;
          }
        });
      }

      win.webContents.send("set-event-status", eventStatus);
      log.info(`Event availability: ${GEPStates[eventStatus]}`);
    }
  } catch (error) {
    log.error("Error fetching event availability:", error);
  }
}

export function setPlayerName(name: string) {
  win.webContents.send("set-player-name", name);
}

export function setInputAllowed(allowed: boolean) {
  win.webContents.send("set-input-allowed", allowed);
}

export enum StatusTypes {
  NEUTRAL = "info",
  RED = "danger",
  YELLOW = "warn",
  GREEN = "success",
}
export function setSpectraStatus(message: string, type: StatusTypes = StatusTypes.NEUTRAL) {
  win.webContents.send("set-spectra-status", { message: message, statusType: type });
  win.setTitle(`Spectra Client | ${message}`);
}

export function setGameStatus(message: string, type: StatusTypes = StatusTypes.NEUTRAL) {
  win.webContents.send("set-game-status", { message: message, statusType: type });
}

export function setLoadingStatus(loading: boolean) {
  win.webContents.send("set-loading-status", loading);
}

export function fireConnect() {
  connService.stopAttempts();
  if (connService.isConnected()) return;
  win.webContents.send("fire-connect");
}

function setTraySetting(_event: any, setting: boolean) {
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

function storeWindowState() {
  if (isAuxiliary) return;
  const bounds = win.getBounds();
  storage.set("windowState", { bounds: bounds }, function (error: any) {
    if (error) log.error(error);
  });
}

function getWindowState(): Rectangle {
  const retrieved = storage.getSync("windowState");
  if (retrieved == null || Object.keys(retrieved).length == 0) {
    return { x: -999999, y: -999999, width: 1300, height: 670 };
  } else {
    return retrieved.bounds;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function isDev() {
  return app.commandLine.hasSwitch("development");
}

function deeplinkSetup() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("ps-spectra", process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient("ps-spectra");
  }
}

export function openDevTools() {
  if (win) {
    win.webContents.openDevTools();
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

function openExternalLink(event: any, link: string) {
  shell.openExternal(link);
}
