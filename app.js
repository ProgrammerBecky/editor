import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

import { readDirectoryTree } from "./app/readDirectoryTree.js";
import { setupFileWatcher } from "./app/fileWatcher.js";
import { AppMenu } from './app/appMenu.js';
import { importFile } from './app/importFile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __assetsFolder = `${__dirname}\\assets`;

function setupFileBrowser() {
  ipcMain.handle('assets:getTree', () => {
    return readDirectoryTree(__assetsFolder);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'app', 'preload.js')
    }
  });

  setupFileBrowser();
  importFile(win, __assetsFolder); 
  setupFileWatcher(win, __assetsFolder);

  const menu = Menu.buildFromTemplate(AppMenu);
  Menu.setApplicationMenu(menu);

  win.webContents.openDevTools({ mode: 'right' });
  win.loadFile(path.join(__dirname, '/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
