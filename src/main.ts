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
    height: 600,
    backgroundColor: '#303338',
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js")
    },
    fullscreenable: false,
    titleBarOverlay: true,
    icon: path.join(__dirname, './assets/hooj4k.ico')
  })

  ipcMain.on('process-inputs', processInputs);

  win.menuBarVisible = false;
  win.loadFile('./src/frontend/index.html');
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

interface Team {
  name: string,
  tricode: string,
  url: string
}

function processInputs(event: any, groupCode: string, obsName: string, leftTeam: Team, rightTeam: Team) {
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

  console.log(`Received Observer Name ${obsName}, Group Code ${groupCode}, Left Tricode ${leftTeam.tricode}, Right Tricode ${rightTeam.tricode}`);
  win!.setTitle(`Spectra Client | Attempting to connect...`);
  connService.handleAuthProcess(obsName, groupCode, leftTeam, rightTeam, win);
}

function overwolfSetup() {
  console.log(`Starting Overwolf Setup`);
  gepService.registerGame(21640);
}

export function setPlayerName(name: string) {
  win.webContents.send("set-player-name", name);
}