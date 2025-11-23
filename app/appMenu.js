export const AppMenu =
[
	{
		label: 'File',
		submenu: [
			{
        label: 'Refresh',
        accelerator: 'CmdOrCtrl+R',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.reload();
        }
      },		
			{ label: 'New File', accelerator: 'CmdOrCtrl+N', click: () => console.log('New File') },
			{ label: 'Open File', accelerator: 'CmdOrCtrl+O', click: () => console.log('Open File') },
			{ type: 'separator' },
			{ label: 'Exit', accelerator: 'CmdOrCtrl+Q', role: 'quit' }
		]
	},
	{
		label: 'Edit',
		submenu: [
			{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
			{ label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
			{ type: 'separator' },
			{ label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
			{ label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
			{ label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
		]
	}
];