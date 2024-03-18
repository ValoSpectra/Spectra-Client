const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  setTrackId: (trackId) => ipcRenderer.send('set-track-id', trackId),
  replay: () => ipcRenderer.send('replay')
})