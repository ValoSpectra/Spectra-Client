const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  processInputs: (groupId, obsName, leftTeam, rightTeam) => ipcRenderer.send('process-inputs', groupId, obsName, leftTeam, rightTeam),
  replay: () => ipcRenderer.send('replay'),

  setPlayerName: (callback) => ipcRenderer.on('set-player-name', (_event, value) => callback(value))
})