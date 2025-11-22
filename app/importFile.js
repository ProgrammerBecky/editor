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

export function importFile(win, assetsFolder) {
  ipcMain.handle("assets:uploadFile", async (_, { fileData, fileName, targetFolder }) => {
    try {
      const destinationFolder = targetFolder ? path.join(assetsFolder, targetFolder) : assetsFolder;

      if (!fs.existsSync(destinationFolder)) fs.mkdirSync(destinationFolder, { recursive: true });

      let destinationPath = path.join(destinationFolder, fileName);

      destinationPath = avoidOverwrite(destinationPath);

      // fileData is ArrayBuffer, convert to Buffer
      const buffer = Buffer.from(fileData);
      fs.writeFileSync(destinationPath, buffer);

      // Notify renderer
      win.webContents.send("assets:updated");

      return { ok: true, path: destinationPath };
    } catch (err) {
      console.error("Upload failed:", err);
      return { ok: false, error: err.message };
    }
  });

}