const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  processInputs: (ingestIp, groupId, obsName, leftTeam, rightTeam, key) => ipcRenderer.send('process-inputs', ingestIp, groupId, obsName, leftTeam, rightTeam, key),
  processConfigDrop: (filePath) => ipcRenderer.send('config-drop', filePath),

  setPlayerName: (callback) => ipcRenderer.on('set-player-name', (_event, value) => callback(value)),
  setInputAllowed: (callback) => ipcRenderer.on('set-input-allowed', (_event, value) => callback(value)),
  loadConfig: (callback) => ipcRenderer.on('load-config', (_event, value) => callback(value)),
  addLogLine: (callback) => ipcRenderer.on('add-log-line', (_event, value) => callback(value)),
  setStatus: (callback) => ipcRenderer.on('set-status', (_event, value) => callback(value)),
  fireConnect: (callback) => ipcRenderer.on('fire-connect', (_event, value) => callback(value)),
})