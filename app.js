import { app, BrowserWindow, Menu  } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

import { AppMenu } from './app/appMenu.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
;
	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, 'app', 'preload.js')
		}
	});
	
  const menu = Menu.buildFromTemplate(AppMenu);
  Menu.setApplicationMenu(menu);	

	win.webContents.openDevTools({ mode: 'right' });
  win.loadFile( path.join(
		__dirname, '/index.html'
	));
}

app.whenReady().then( createWindow );

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});