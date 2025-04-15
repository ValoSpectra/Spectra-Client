const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  processInputs: (
    ingestIp: any,
    groupId: any,
    obsName: any,
    leftTeam: any,
    rightTeam: any,
    key: any,
    seriesInfo: any,
    seedingInfo: any,
    tournamentInfo: any,
    hotkeys: any,
    timeoutDuration: any,
  ) =>
    ipcRenderer.send(
      "process-inputs",
      ingestIp,
      groupId,
      obsName,
      leftTeam,
      rightTeam,
      key,
      seriesInfo,
      seedingInfo,
      tournamentInfo,
      hotkeys,
      timeoutDuration,
    ),
  processAuxInputs: (ingestIp: any, name: any) =>
    ipcRenderer.send("process-aux-inputs", ingestIp, name),
  processConfigDrop: (filePath: any) => ipcRenderer.send("config-drop", filePath),
  processLog: (toLog: any) => ipcRenderer.send("process-log", toLog),
  setTraySetting: (setting: any) => ipcRenderer.send("set-tray-setting", setting),
  getHeartCategories: () => ipcRenderer.send("get-heart-categories"),

  setPlayerName: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-player-name", (_event: any, value: any) => callback(value)),
  setInputAllowed: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-input-allowed", (_event: any, value: any) => callback(value)),
  loadConfig: (callback: (arg0: any) => any) =>
    ipcRenderer.on("load-config", (_event: any, value: any) => callback(value)),
  addLogLine: (callback: (arg0: any) => any) =>
    ipcRenderer.on("add-log-line", (_event: any, value: any) => callback(value)),
  setStatus: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-status", (_event: any, value: any) => callback(value)),
  setLoadingStatus: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-loading-status", (_event: any, value: boolean) => callback(value)),
  setEventStatus: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-event-status", (_event: any, value: number) => callback(value)),
  fireConnect: (callback: (arg0: any) => any) =>
    ipcRenderer.on("fire-connect", (_event: any, value: any) => callback(value)),
});
