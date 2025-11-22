const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: ( channel, data ) => ipcRenderer.send( channel, data ),
  on: ( channel, callback ) => ipcRenderer.on( channel, ( event, ...args ) => callback( ...args ) ),
});

contextBridge.exposeInMainWorld( "assetsAPI", {
  getTree: ( ) => ipcRenderer.invoke( "assets:getTree" ),
  onUpdate: ( callback ) => ipcRenderer.on( "assets:updated", ( _, data ) => callback( data ) ),
  importFile: ( sourcePath, targetFolder ) => ipcRenderer.invoke( "assets:importFile", { sourcePath, targetFolder } ),
  uploadFile: ( fileData, fileName, targetFolder ) => ipcRenderer.invoke( "assets:uploadFile", { fileData, fileName, targetFolder } ),
  moveFile: ( sourcePath, targetFolder ) => ipcRenderer.invoke( "assets:moveFile", { sourcePath, targetFolder } )
} );