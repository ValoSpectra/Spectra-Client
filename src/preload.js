const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  processInputs: (ingestIp, groupId, obsName, leftTeam, rightTeam) => ipcRenderer.send('process-inputs', ingestIp, groupId, obsName, leftTeam, rightTeam),
  processConfigDrop: (filePath) => ipcRenderer.send('config-drop', filePath),
  replay: () => ipcRenderer.send('replay'),

  setPlayerName: (callback) => ipcRenderer.on('set-player-name', (_event, value) => callback(value)),
  setInputAllowed: (callback) => ipcRenderer.on('set-input-allowed', (_event, value) => callback(value)),
  loadConfig: (callback) => ipcRenderer.on('load-config', (_event, value) => callback(value)),
})