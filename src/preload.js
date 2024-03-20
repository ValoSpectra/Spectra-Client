const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  processInputs: (groupId, teamName, playerName) => ipcRenderer.send('process-inputs', groupId, teamName, playerName),
  replay: () => ipcRenderer.send('replay'),

  setPlayerName: (callback) => ipcRenderer.on('set-player-name', (_event, value) => callback(value))
})