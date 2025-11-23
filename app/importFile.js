import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

function avoidOverwrite(filePath) {
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  let counter = 1;
  let newPath = filePath;
  while (fs.existsSync(newPath)) {
    newPath = path.join(dir, `${base} (${counter})${ext}`);
    counter++;
  }
  return newPath;
}

function addUploadFileListener( win , assetsFolder ) {
  ipcMain.handle( "assets:uploadFile", async ( _, { fileData, fileName, targetFolder } ) => {
    try {
      const destinationFolder = targetFolder ? path.join( assetsFolder, targetFolder ) : assetsFolder;

      if ( !fs.existsSync( destinationFolder ) ) fs.mkdirSync( destinationFolder, { recursive: true } );

      let destinationPath = path.join( destinationFolder, fileName );

      destinationPath = avoidOverwrite( destinationPath );

      const buffer = Buffer.from( fileData );
      fs.writeFileSync( destinationPath, buffer );

      win.webContents.send( "assets:updated" );

      return { ok: true, path: destinationPath };
    } catch ( err ) {
      console.error( "Upload failed:", err );
      return { ok: false, error: err.message };
    }
  } );
}

function addMoveFileListener(win, assetsFolder) {
  ipcMain.handle("assets:moveFile", async (_, { sourcePath, targetFolder }) => {
    try {
      // Resolve absolute source path relative to assetsFolder
      const absSourcePath = path.resolve(assetsFolder, sourcePath);

      // Resolve absolute target folder
      const destinationFolder = targetFolder 
        ? path.resolve(assetsFolder, targetFolder) 
        : assetsFolder;

      if (!fs.existsSync(absSourcePath)) {
        throw new Error(`Source does not exist: ${absSourcePath}`);
      }

      if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
      }

      // Prevent moving a file into the same folder with the same name
      const fileName = path.basename(absSourcePath);
      let destinationPath = path.join(destinationFolder, fileName);
      destinationPath = path.resolve(destinationPath);

      if (absSourcePath === destinationPath) {
        throw new Error("Source and destination paths are the same.");
      }

      destinationPath = avoidOverwrite(destinationPath);

      fs.renameSync(absSourcePath, destinationPath);

      win.webContents.send("assets:updated");

      return { ok: true, path: destinationPath };
    } catch (err) {
      console.error("Move failed:", err);
      return { ok: false, error: err.message };
    }
  });
}


export function importFile( win, assetsFolder ) {
	addUploadFileListener( win, assetsFolder );
	addMoveFileListener( win, assetsFolder );
}
