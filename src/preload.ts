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
    sponsorInfo: any,
    watermarkInfo: any,
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
      sponsorInfo,
      watermarkInfo,
    ),
  processAuxInputs: (ingestIp: any, name: any) =>
    ipcRenderer.send("process-aux-inputs", ingestIp, name),
  processLog: (toLog: any) => ipcRenderer.send("process-log", toLog),
  setTraySetting: (setting: any) => ipcRenderer.send("set-tray-setting", setting),
  openExternalLink: (link: string) => ipcRenderer.send("open-external-link", link),
  setStartupSettings: (enabled: boolean, startMinimized: boolean) =>
    ipcRenderer.send("set-startup-settings", enabled, startMinimized),

  setPlayerName: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-player-name", (_event: any, value: any) => callback(value)),
  setInputAllowed: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-input-allowed", (_event: any, value: any) => callback(value)),
  onSpectraStatusChange: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-spectra-status", (_event: any, value: any) => callback(value)),
  onGameStatusChange: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-game-status", (_event: any, value: any) => callback(value)),
  setLoadingStatus: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-loading-status", (_event: any, value: boolean) => callback(value)),
  setEventStatus: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-event-status", (_event: any, value: number) => callback(value)),
  fireConnect: (callback: (arg0: any) => any) =>
    ipcRenderer.on("fire-connect", (_event: any, value: any) => callback(value)),
  onDiscordInfo: (callback: (arg0: any) => any) =>
    ipcRenderer.on("set-discord-info", (_event: any, value: any) => callback(value)),
  // Close confirmation flow
  onConfirmClose: (callback: () => any) =>
    ipcRenderer.on("confirm-close", () => callback()),
  confirmCloseDecision: (confirm: boolean) =>
    ipcRenderer.send("confirmed-close", confirm),
});
